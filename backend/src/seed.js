require('dotenv').config();
const path = require('path');
const XLSX = require('xlsx');
const bcrypt = require('bcryptjs');
const { sequelize, User, Patient, Prescription, Medicine, MedicineSchedule, MedicationLog, Notification, DrugReference } = require('./models');

const DATASET_PATH = path.join(__dirname, '../../documents/Database/dataset.xlsx');

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('Database connected');

    // Sync all tables (force recreate)
    await sequelize.sync({ force: true });
    console.log('Tables created');

    // ── 1. Seed Drug References from Excel ──
    console.log('Seeding drug references from dataset.xlsx...');
    const workbook = XLSX.readFile(DATASET_PATH);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    const drugs = [];
    for (const row of rows) {
      drugs.push({
        drug_code: row['ID'],
        name: row['Tên thuốc'],
        disease: row['Bệnh'],
        description: row['Thông tin thuốc'] || '',
        warning: row['Cảnh báo'] || '',
        contraindications: row['Thuốc không dùng chung'] || '',
      });
    }
    await DrugReference.bulkCreate(drugs);
    console.log(`Seeded ${drugs.length} drug references`);

    // ── 2. Seed Users ──
    console.log('Seeding users...');
    const hashedPassword = await bcrypt.hash('123456', 10);

    const doctor1 = await User.create({
      full_name: 'BS. Trần Minh Khoa',
      email: 'doctor@medconnect.vn',
      password: hashedPassword,
      phone: '0901234567',
      role: 'doctor',
      department: 'Nội tiết',
      hospital: 'Bệnh viện Đa khoa TP.HCM',
      license_number: 'BS-2024-001',
    }, { hooks: false });

    const doctor2 = await User.create({
      full_name: 'BS. Nguyễn Thị Mai',
      email: 'doctor2@medconnect.vn',
      password: hashedPassword,
      phone: '0907654321',
      role: 'doctor',
      department: 'Tim mạch',
      hospital: 'Bệnh viện Chợ Rẫy',
      license_number: 'BS-2024-002',
    }, { hooks: false });

    const patientUser1 = await User.create({
      full_name: 'Nguyễn Văn An',
      email: 'patient@medconnect.vn',
      password: hashedPassword,
      phone: '0912345678',
      role: 'patient',
    }, { hooks: false });

    const patientUser2 = await User.create({
      full_name: 'Lê Thị Bích',
      email: 'patient2@medconnect.vn',
      password: hashedPassword,
      phone: '0923456789',
      role: 'patient',
    }, { hooks: false });

    const patientUser3 = await User.create({
      full_name: 'Phạm Văn Cường',
      email: 'patient3@medconnect.vn',
      password: hashedPassword,
      phone: '0934567890',
      role: 'patient',
    }, { hooks: false });

    console.log('Seeded 5 users (2 doctors, 3 patients)');

    // ── 3. Seed Patients ──
    console.log('Seeding patients...');
    const p1 = await Patient.create({
      doctor_id: doctor1.id,
      user_id: patientUser1.id,
      full_name: 'Nguyễn Thị Hoa',
      date_of_birth: '1968-03-15',
      gender: 'female',
      phone: '0912345678',
      address: '123 Nguyễn Huệ, Q.1, TP.HCM',
      diagnosis: 'Tiểu đường type 2, Huyết áp cao',
      notes: 'Bệnh nhân cần theo dõi đường huyết và huyết áp hàng ngày',
    });

    const p2 = await Patient.create({
      doctor_id: doctor1.id,
      user_id: patientUser2.id,
      full_name: 'Trần Văn Bình',
      date_of_birth: '1954-07-22',
      gender: 'male',
      phone: '0923456789',
      address: '456 Lê Lợi, Q.3, TP.HCM',
      diagnosis: 'Huyết áp cao, Gout mãn tính',
      notes: 'Bệnh nhân lớn tuổi, cần theo dõi sát chức năng thận',
    });

    const p3 = await Patient.create({
      doctor_id: doctor1.id,
      user_id: patientUser3.id,
      full_name: 'Lê Minh Tuấn',
      date_of_birth: '1981-11-05',
      gender: 'male',
      phone: '0934567890',
      address: '789 Võ Văn Tần, Q.3, TP.HCM',
      diagnosis: 'Parkinson giai đoạn đầu',
      notes: 'Cần theo dõi tác dụng phụ buồn ngủ',
    });

    const p4 = await Patient.create({
      doctor_id: doctor1.id,
      full_name: 'Phạm Thị Lan',
      date_of_birth: '1961-05-18',
      gender: 'female',
      phone: '0945678901',
      address: '321 Hai Bà Trưng, Q.1, TP.HCM',
      diagnosis: 'Tiểu đường type 2',
      notes: 'Đang kiểm soát tốt, tái khám mỗi tháng',
    });

    const p5 = await Patient.create({
      doctor_id: doctor1.id,
      full_name: 'Hoàng Văn Nam',
      date_of_birth: '1973-09-30',
      gender: 'male',
      phone: '0956789012',
      address: '654 Điện Biên Phủ, Bình Thạnh, TP.HCM',
      diagnosis: 'Alzheimer giai đoạn nhẹ',
      notes: 'Người thân cần giám sát uống thuốc',
    });

    const p6 = await Patient.create({
      doctor_id: doctor2.id,
      full_name: 'Vũ Thị Mai',
      date_of_birth: '1988-12-25',
      gender: 'female',
      phone: '0967890123',
      address: '987 Cách Mạng Tháng 8, Q.10, TP.HCM',
      diagnosis: 'Viêm khớp dạng thấp',
      notes: 'Cần xét nghiệm máu định kỳ',
    });

    console.log('Seeded 6 patients');

    // ── 4. Seed Prescriptions + Medicines + Schedules ──
    console.log('Seeding prescriptions...');

    // Đơn thuốc 1: Bà Hoa - Tiểu đường + Huyết áp
    const rx1 = await Prescription.create({
      doctor_id: doctor1.id,
      patient_id: p1.id,
      start_date: '2026-03-15',
      end_date: '2026-04-15',
      status: 'active',
      notes: 'Kiểm soát đường huyết và huyết áp. Tái khám sau 1 tháng.',
      notification_email: true,
      notify_minutes_before: 15,
      max_reminders: 3,
      notify_doctor_on_confirm: true,
      notify_doctor_on_miss: true,
    });

    const med1a = await Medicine.create({
      prescription_id: rx1.id,
      name: 'Metformin',
      dosage: '500',
      unit: 'mg',
      frequency: 2,
    });
    await MedicineSchedule.bulkCreate([
      { medicine_id: med1a.id, time: '08:00:00', label: 'morning' },
      { medicine_id: med1a.id, time: '20:00:00', label: 'evening' },
    ]);

    const med1b = await Medicine.create({
      prescription_id: rx1.id,
      name: 'Glipizide',
      dosage: '5',
      unit: 'mg',
      frequency: 1,
    });
    await MedicineSchedule.bulkCreate([
      { medicine_id: med1b.id, time: '07:30:00', label: 'morning' },
    ]);

    const med1c = await Medicine.create({
      prescription_id: rx1.id,
      name: 'Amlodipine',
      dosage: '5',
      unit: 'mg',
      frequency: 1,
    });
    await MedicineSchedule.bulkCreate([
      { medicine_id: med1c.id, time: '08:00:00', label: 'morning' },
    ]);

    // Đơn thuốc 2: Ông Bình - Huyết áp
    const rx2 = await Prescription.create({
      doctor_id: doctor1.id,
      patient_id: p2.id,
      start_date: '2026-03-20',
      end_date: '2026-04-20',
      status: 'active',
      notes: 'Theo dõi huyết áp mỗi ngày. Hạn chế muối.',
      notification_email: true,
      notify_minutes_before: 10,
      max_reminders: 2,
    });

    const med2a = await Medicine.create({
      prescription_id: rx2.id,
      name: 'Valsartan',
      dosage: '80',
      unit: 'mg',
      frequency: 1,
    });
    await MedicineSchedule.bulkCreate([
      { medicine_id: med2a.id, time: '07:00:00', label: 'morning' },
    ]);

    const med2b = await Medicine.create({
      prescription_id: rx2.id,
      name: 'Bisoprolol',
      dosage: '5',
      unit: 'mg',
      frequency: 1,
    });
    await MedicineSchedule.bulkCreate([
      { medicine_id: med2b.id, time: '07:00:00', label: 'morning' },
    ]);

    // Đơn thuốc 3: Anh Tuấn - Parkinson
    const rx3 = await Prescription.create({
      doctor_id: doctor1.id,
      patient_id: p3.id,
      start_date: '2026-03-10',
      end_date: '2026-06-10',
      status: 'active',
      notes: 'Parkinson giai đoạn đầu. Theo dõi tác dụng phụ.',
      notification_email: true,
      notify_minutes_before: 15,
      max_reminders: 3,
    });

    const med3a = await Medicine.create({
      prescription_id: rx3.id,
      name: 'Levodopa',
      dosage: '250',
      unit: 'mg',
      frequency: 3,
    });
    await MedicineSchedule.bulkCreate([
      { medicine_id: med3a.id, time: '07:00:00', label: 'morning' },
      { medicine_id: med3a.id, time: '13:00:00', label: 'noon' },
      { medicine_id: med3a.id, time: '19:00:00', label: 'evening' },
    ]);

    const med3b = await Medicine.create({
      prescription_id: rx3.id,
      name: 'Carbidopa',
      dosage: '25',
      unit: 'mg',
      frequency: 3,
    });
    await MedicineSchedule.bulkCreate([
      { medicine_id: med3b.id, time: '07:00:00', label: 'morning' },
      { medicine_id: med3b.id, time: '13:00:00', label: 'noon' },
      { medicine_id: med3b.id, time: '19:00:00', label: 'evening' },
    ]);

    // Đơn thuốc 4: Bà Lan - Tiểu đường
    const rx4 = await Prescription.create({
      doctor_id: doctor1.id,
      patient_id: p4.id,
      start_date: '2026-03-25',
      end_date: '2026-04-25',
      status: 'active',
      notes: 'Kiểm soát đường huyết ổn định.',
      notification_email: true,
    });

    const med4a = await Medicine.create({
      prescription_id: rx4.id,
      name: 'Sitagliptin',
      dosage: '100',
      unit: 'mg',
      frequency: 1,
    });
    await MedicineSchedule.bulkCreate([
      { medicine_id: med4a.id, time: '08:00:00', label: 'morning' },
    ]);

    // Đơn thuốc 5: Ông Nam - Alzheimer
    const rx5 = await Prescription.create({
      doctor_id: doctor1.id,
      patient_id: p5.id,
      start_date: '2026-03-01',
      end_date: '2026-06-01',
      status: 'active',
      notes: 'Alzheimer giai đoạn nhẹ. Người thân cần giám sát.',
      notification_email: true,
      notify_minutes_before: 30,
      max_reminders: 3,
    });

    const med5a = await Medicine.create({
      prescription_id: rx5.id,
      name: 'Donepezil',
      dosage: '5',
      unit: 'mg',
      frequency: 1,
    });
    await MedicineSchedule.bulkCreate([
      { medicine_id: med5a.id, time: '21:00:00', label: 'evening' },
    ]);

    // Đơn thuốc 6: Chị Mai - Viêm khớp (bác sĩ 2)
    const rx6 = await Prescription.create({
      doctor_id: doctor2.id,
      patient_id: p6.id,
      start_date: '2026-03-18',
      end_date: '2026-05-18',
      status: 'active',
      notes: 'Viêm khớp dạng thấp. Xét nghiệm máu mỗi tháng.',
      notification_email: true,
    });

    const med6a = await Medicine.create({
      prescription_id: rx6.id,
      name: 'Hydroxychloroquine',
      dosage: '200',
      unit: 'mg',
      frequency: 2,
    });
    await MedicineSchedule.bulkCreate([
      { medicine_id: med6a.id, time: '08:00:00', label: 'morning' },
      { medicine_id: med6a.id, time: '20:00:00', label: 'evening' },
    ]);

    const med6b = await Medicine.create({
      prescription_id: rx6.id,
      name: 'Celecoxib',
      dosage: '200',
      unit: 'mg',
      frequency: 1,
    });
    await MedicineSchedule.bulkCreate([
      { medicine_id: med6b.id, time: '12:00:00', label: 'noon' },
    ]);

    console.log('Seeded 6 prescriptions with medicines and schedules');

    // ── 5. Seed Medication Logs (sample for today) ──
    console.log('Seeding medication logs...');
    const today = new Date().toISOString().split('T')[0];

    // Bà Hoa - đã uống sáng, chưa uống tối
    await MedicationLog.bulkCreate([
      { medicine_schedule_id: 1, patient_id: p1.id, scheduled_date: today, scheduled_time: '08:00:00', status: 'taken', taken_at: new Date(), confirmed_by: 'app' },
      { medicine_schedule_id: 2, patient_id: p1.id, scheduled_date: today, scheduled_time: '20:00:00', status: 'pending' },
      { medicine_schedule_id: 3, patient_id: p1.id, scheduled_date: today, scheduled_time: '07:30:00', status: 'taken', taken_at: new Date(), confirmed_by: 'app' },
      { medicine_schedule_id: 4, patient_id: p1.id, scheduled_date: today, scheduled_time: '08:00:00', status: 'taken', taken_at: new Date(), confirmed_by: 'app' },
    ]);

    // Ông Bình - bỏ lỡ sáng
    await MedicationLog.bulkCreate([
      { medicine_schedule_id: 5, patient_id: p2.id, scheduled_date: today, scheduled_time: '07:00:00', status: 'missed' },
      { medicine_schedule_id: 6, patient_id: p2.id, scheduled_date: today, scheduled_time: '07:00:00', status: 'missed' },
    ]);

    // Anh Tuấn - uống sáng, chưa uống trưa/tối
    await MedicationLog.bulkCreate([
      { medicine_schedule_id: 7, patient_id: p3.id, scheduled_date: today, scheduled_time: '07:00:00', status: 'taken', taken_at: new Date(), confirmed_by: 'app' },
      { medicine_schedule_id: 8, patient_id: p3.id, scheduled_date: today, scheduled_time: '13:00:00', status: 'pending' },
      { medicine_schedule_id: 9, patient_id: p3.id, scheduled_date: today, scheduled_time: '19:00:00', status: 'pending' },
      { medicine_schedule_id: 10, patient_id: p3.id, scheduled_date: today, scheduled_time: '07:00:00', status: 'taken', taken_at: new Date(), confirmed_by: 'app' },
      { medicine_schedule_id: 11, patient_id: p3.id, scheduled_date: today, scheduled_time: '13:00:00', status: 'pending' },
      { medicine_schedule_id: 12, patient_id: p3.id, scheduled_date: today, scheduled_time: '19:00:00', status: 'pending' },
    ]);

    console.log('Seeded medication logs');

    // ── 6. Seed Notifications ──
    console.log('Seeding notifications...');
    await Notification.bulkCreate([
      {
        user_id: doctor1.id,
        type: 'missed',
        title: 'Bệnh nhân bỏ lỡ thuốc',
        message: 'Trần Văn Bình đã bỏ lỡ liều Valsartan 80mg lúc 07:00 sáng nay.',
        channel: 'in_app',
        send_status: 'sent',
        is_read: false,
        prescription_id: rx2.id,
        patient_id: p2.id,
      },
      {
        user_id: doctor1.id,
        type: 'confirmation',
        title: 'Xác nhận uống thuốc',
        message: 'Nguyễn Thị Hoa đã xác nhận uống Metformin 500mg lúc 08:00.',
        channel: 'in_app',
        send_status: 'sent',
        is_read: false,
        prescription_id: rx1.id,
        patient_id: p1.id,
      },
      {
        user_id: doctor1.id,
        type: 'expiring',
        title: 'Đơn thuốc sắp hết hạn',
        message: 'Đơn thuốc của Nguyễn Thị Hoa sẽ hết hạn vào 15/04/2026. Vui lòng xem xét gia hạn.',
        channel: 'in_app',
        send_status: 'sent',
        is_read: true,
        prescription_id: rx1.id,
        patient_id: p1.id,
      },
      {
        user_id: patientUser1.id,
        type: 'reminder',
        title: 'Nhắc uống thuốc',
        message: 'Đến giờ uống Metformin 500mg (1 viên). Uống sau bữa ăn tối.',
        channel: 'email',
        send_status: 'sent',
        is_read: false,
        prescription_id: rx1.id,
      },
      {
        user_id: patientUser1.id,
        type: 'updated',
        title: 'Đơn thuốc được cập nhật',
        message: 'Bác sĩ Trần Minh Khoa đã cập nhật đơn thuốc của bạn. Vui lòng kiểm tra lại lịch uống.',
        channel: 'in_app',
        send_status: 'sent',
        is_read: true,
        prescription_id: rx1.id,
      },
    ]);

    console.log('Seeded 5 notifications');

    console.log('\n========================================');
    console.log('SEED COMPLETED SUCCESSFULLY!');
    console.log('========================================');
    console.log('\nTài khoản đăng nhập:');
    console.log('  Bác sĩ:     doctor@medconnect.vn  / 123456');
    console.log('  Bác sĩ 2:   doctor2@medconnect.vn / 123456');
    console.log('  Bệnh nhân:  patient@medconnect.vn / 123456');
    console.log('  Bệnh nhân 2: patient2@medconnect.vn / 123456');
    console.log('  Bệnh nhân 3: patient3@medconnect.vn / 123456');
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

seed();
