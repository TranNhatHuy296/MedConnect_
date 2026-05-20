const cron = require('node-cron');

const { Op } = require('sequelize');
const {
  User,
  Patient,
  Prescription,
  Medicine,
  MedicineSchedule,
  MedicationLog,
} = require('../models');
const notificationService = require('./notificationService');
const emailService = require('./emailService');

// ============================================================
// Tiện ích: lấy giờ hiện tại dạng HH:mm
// ============================================================
const getCurrentTime = () => {
  const now = new Date();
  return {
    hours: now.getHours(),
    minutes: now.getMinutes(),
    dateStr: now.toISOString().split('T')[0],
    now,
  };
};

// Chuyển TIME string "HH:mm:ss" thành tổng số phút trong ngày
const timeToMinutes = (timeStr) => {
  const parts = timeStr.split(':');
  return parseInt(parts[0]) * 60 + parseInt(parts[1]);
};

// Format thời gian đẹp
const formatTime = (timeStr) => {
  const parts = timeStr.split(':');
  return `${parts[0]}:${parts[1]}`;
};

const formatDateTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// ============================================================
// JOB 1: Kiểm tra lịch uống thuốc mỗi phút
// - Nếu đến giờ uống (± notify_minutes_before), tạo medication_log + gửi thông báo
// ============================================================
const checkMedicineReminders = async () => {
  try {
    const { hours, minutes, dateStr } = getCurrentTime();
    const currentMinutes = hours * 60 + minutes;

    // Lấy tất cả đơn thuốc active
    const prescriptions = await Prescription.findAll({
      where: { status: 'active' },
      include: [
        {
          model: Patient,
          as: 'patient',
          include: [{ model: User, as: 'user' }],
        },
        {
          model: User,
          as: 'doctor',
        },
        {
          model: Medicine,
          as: 'medicines',
          include: [{ model: MedicineSchedule, as: 'schedules' }],
        },
      ],
    });

    for (const prescription of prescriptions) {
      // Kiểm tra đơn thuốc còn trong thời hạn
      if (prescription.end_date && prescription.end_date < dateStr) continue;
      if (prescription.start_date > dateStr) continue;

      const patient = prescription.patient;
      if (!patient || !patient.user) continue;

      const patientUser = patient.user;
      const notifyBefore = prescription.notify_minutes_before || 15;

      for (const medicine of prescription.medicines) {
        for (const schedule of medicine.schedules) {
          const scheduleMinutes = timeToMinutes(schedule.time);
          const diff = scheduleMinutes - currentMinutes;

          // Chỉ thông báo khi đúng thời điểm (diff == notifyBefore)
          // Vì job chạy mỗi phút nên check chính xác
          if (diff !== notifyBefore && diff !== 0) continue;

          // Kiểm tra đã có medication_log cho ngày hôm nay + schedule này chưa
          const existingLog = await MedicationLog.findOne({
            where: {
              medicine_schedule_id: schedule.id,
              patient_id: patient.id,
              scheduled_date: dateStr,
            },
          });

          // Tạo medication_log nếu chưa có (khi diff == notifyBefore hoặc 0)
          if (!existingLog) {
            await MedicationLog.create({
              medicine_schedule_id: schedule.id,
              patient_id: patient.id,
              scheduled_date: dateStr,
              scheduled_time: schedule.time,
              status: 'pending',
            });
          }

          // Gửi thông báo nhắc nhở
          const title = `Nhắc uống thuốc: ${medicine.name}`;
          const message = `Đến giờ uống ${medicine.name} (${medicine.dosage} ${medicine.unit}) lúc ${formatTime(schedule.time)}`;

          // Tạo notification in-app cho bệnh nhân
          await notificationService.createNotification({
            userId: patientUser.id,
            type: 'reminder',
            title,
            message,
            channel: 'in_app',
            prescriptionId: prescription.id,
            medicineId: medicine.id,
            patientId: patient.id,
          });

          // Gửi email nếu bật
          if (prescription.notification_email && patientUser.email) {
            const html = emailService.reminderTemplate({
              patientName: patient.full_name,
              medicineName: medicine.name,
              dosage: medicine.dosage,
              unit: medicine.unit,
              scheduledTime: formatTime(schedule.time),
            });

            const result = await emailService.sendEmail(
              patientUser.email,
              `[MedConnect] ${title}`,
              html
            );

            // Tạo notification email
            await notificationService.createNotification({
              userId: patientUser.id,
              type: 'reminder',
              title,
              message,
              channel: 'email',
              sendStatus: result.success ? 'sent' : 'failed',
              prescriptionId: prescription.id,
              medicineId: medicine.id,
              patientId: patient.id,
            });
          }
        }
      }
    }
  } catch (error) {
    console.error('[Scheduler] Loi Job 1 - checkMedicineReminders:', error.message);
  }
};

// ============================================================
// JOB 2: Kiểm tra medication_logs quá giờ chưa confirm (mỗi 5 phút)
// - Cập nhật status thành 'missed'
// - Gửi cảnh báo cho bác sĩ + bệnh nhân
// ============================================================
const checkMissedMedications = async () => {
  try {
    const { dateStr, now } = getCurrentTime();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    // Tìm các log pending đã quá giờ 30 phút
    const pendingLogs = await MedicationLog.findAll({
      where: {
        scheduled_date: dateStr,
        status: 'pending',
      },
      include: [
        {
          model: MedicineSchedule,
          as: 'schedule',
          include: [
            {
              model: Medicine,
              as: 'medicine',
              include: [
                {
                  model: Prescription,
                  as: 'prescription',
                  include: [
                    { model: User, as: 'doctor' },
                    {
                      model: Patient,
                      as: 'patient',
                      include: [{ model: User, as: 'user' }],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          model: Patient,
          as: 'patient',
          include: [{ model: User, as: 'user' }],
        },
      ],
    });

    for (const log of pendingLogs) {
      const scheduleMinutes = timeToMinutes(log.scheduled_time);
      // Quá 30 phút kể từ giờ uống thì đánh dấu missed
      if (currentMinutes - scheduleMinutes < 30) continue;

      // Cập nhật trạng thái
      await log.update({ status: 'missed' });

      const medicine = log.schedule?.medicine;
      const prescription = medicine?.prescription;
      if (!prescription) continue;

      const patient = prescription.patient;
      const doctor = prescription.doctor;
      if (!patient) continue;

      const title = `Bỏ lỡ uống thuốc: ${medicine.name}`;
      const message = `${patient.full_name} đã bỏ lỡ liều ${medicine.name} (${medicine.dosage} ${medicine.unit}) lúc ${formatTime(log.scheduled_time)}`;

      // Thông báo cho bệnh nhân (in-app)
      if (patient.user) {
        await notificationService.createNotification({
          userId: patient.user.id,
          type: 'missed',
          title,
          message: `Bạn đã bỏ lỡ liều ${medicine.name} lúc ${formatTime(log.scheduled_time)}. Vui lòng liên hệ bác sĩ.`,
          channel: 'in_app',
          prescriptionId: prescription.id,
          medicineId: medicine.id,
          patientId: patient.id,
        });

        // Gửi email cảnh báo cho bệnh nhân
        if (prescription.notification_email && patient.user.email) {
          const html = emailService.missedTemplate({
            recipientName: patient.full_name,
            patientName: patient.full_name,
            medicineName: medicine.name,
            dosage: medicine.dosage,
            unit: medicine.unit,
            scheduledTime: formatTime(log.scheduled_time),
            isDoctor: false,
          });
          await emailService.sendEmail(patient.user.email, `[MedConnect] ${title}`, html);
        }
      }

      // Thông báo cho bác sĩ
      if (doctor && prescription.notify_doctor_on_miss) {
        await notificationService.createNotification({
          userId: doctor.id,
          type: 'missed',
          title,
          message,
          channel: 'in_app',
          prescriptionId: prescription.id,
          medicineId: medicine.id,
          patientId: patient.id,
        });

        // Gửi email cho bác sĩ
        if (doctor.email) {
          const html = emailService.missedTemplate({
            recipientName: doctor.full_name,
            patientName: patient.full_name,
            medicineName: medicine.name,
            dosage: medicine.dosage,
            unit: medicine.unit,
            scheduledTime: formatTime(log.scheduled_time),
            isDoctor: true,
          });
          await emailService.sendEmail(doctor.email, `[MedConnect] ${title}`, html);
        }
      }
    }
  } catch (error) {
    console.error('[Scheduler] Loi Job 2 - checkMissedMedications:', error.message);
  }
};

// ============================================================
// JOB 3: Kiểm tra đơn thuốc sắp hết hạn (chạy mỗi ngày lúc 8:00)
// - Gửi thông báo cho bác sĩ nếu đơn thuốc hết hạn trong 3 ngày tới
// ============================================================
const checkExpiringPrescriptions = async () => {
  try {
    const today = new Date();
    const threeDaysLater = new Date(today);
    threeDaysLater.setDate(threeDaysLater.getDate() + 3);

    const todayStr = today.toISOString().split('T')[0];
    const threeDaysStr = threeDaysLater.toISOString().split('T')[0];

    const prescriptions = await Prescription.findAll({
      where: {
        status: 'active',
        end_date: {
          [Op.between]: [todayStr, threeDaysStr],
        },
      },
      include: [
        { model: User, as: 'doctor' },
        { model: Patient, as: 'patient' },
      ],
    });

    for (const prescription of prescriptions) {
      const doctor = prescription.doctor;
      const patient = prescription.patient;
      if (!doctor || !patient) continue;

      const endDate = new Date(prescription.end_date);
      const daysLeft = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));

      const title = `Đơn thuốc #${prescription.id} sắp hết hạn`;
      const message = `Đơn thuốc của bệnh nhân ${patient.full_name} sẽ hết hạn vào ${prescription.end_date} (còn ${daysLeft} ngày).`;

      // Thông báo in-app cho bác sĩ
      await notificationService.createNotification({
        userId: doctor.id,
        type: 'expiring',
        title,
        message,
        channel: 'in_app',
        prescriptionId: prescription.id,
        patientId: patient.id,
      });

      // Gửi email cho bác sĩ
      if (doctor.email) {
        const html = emailService.expiringTemplate({
          doctorName: doctor.full_name,
          patientName: patient.full_name,
          prescriptionId: prescription.id,
          endDate: prescription.end_date,
          daysLeft,
        });
        await emailService.sendEmail(doctor.email, `[MedConnect] ${title}`, html);
      }
    }
  } catch (error) {
    console.error('[Scheduler] Loi Job 3 - checkExpiringPrescriptions:', error.message);
  }
};

// ============================================================
// JOB 4: Retry nhắc lại (mỗi 10 phút)
// - Nếu bệnh nhân chưa xác nhận sau lần nhắc đầu, gửi lại tối đa max_reminders lần
// ============================================================
const retryReminders = async () => {
  try {
    const { dateStr } = getCurrentTime();
    const currentMinutes = new Date().getHours() * 60 + new Date().getMinutes();

    // Tìm các log pending đã được nhắc nhưng chưa confirm
    const pendingLogs = await MedicationLog.findAll({
      where: {
        scheduled_date: dateStr,
        status: 'pending',
      },
      include: [
        {
          model: MedicineSchedule,
          as: 'schedule',
          include: [
            {
              model: Medicine,
              as: 'medicine',
              include: [
                {
                  model: Prescription,
                  as: 'prescription',
                  include: [
                    {
                      model: Patient,
                      as: 'patient',
                      include: [{ model: User, as: 'user' }],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    for (const log of pendingLogs) {
      const scheduleMinutes = timeToMinutes(log.scheduled_time);
      // Chỉ retry những log đã quá giờ uống (đã được nhắc lần đầu)
      if (currentMinutes <= scheduleMinutes) continue;
      // Không retry nếu đã quá 30 phút (sẽ bị missed bởi Job 2)
      if (currentMinutes - scheduleMinutes >= 30) continue;

      const medicine = log.schedule?.medicine;
      const prescription = medicine?.prescription;
      if (!prescription) continue;

      const patient = prescription.patient;
      if (!patient || !patient.user) continue;

      const maxReminders = prescription.max_reminders || 3;

      // Đếm số lần đã nhắc (đếm notification reminder cho user + medicine + ngày hôm nay)
      const { Notification } = require('../models');
      const reminderCount = await Notification.count({
        where: {
          user_id: patient.user.id,
          type: 'reminder',
          medicine_id: medicine.id,
          channel: 'in_app',
          createdAt: {
            [Op.gte]: new Date(dateStr),
          },
        },
      });

      if (reminderCount >= maxReminders) continue;

      const title = `Nhắc lại: Uống thuốc ${medicine.name}`;
      const message = `Bạn chưa xác nhận uống ${medicine.name} (${medicine.dosage} ${medicine.unit}) lúc ${formatTime(log.scheduled_time)}. Đây là lần nhắc thứ ${reminderCount + 1}/${maxReminders}.`;

      // Gửi notification in-app
      await notificationService.createNotification({
        userId: patient.user.id,
        type: 'reminder',
        title,
        message,
        channel: 'in_app',
        prescriptionId: prescription.id,
        medicineId: medicine.id,
        patientId: patient.id,
      });

      // Gửi email nếu bật
      if (prescription.notification_email && patient.user.email) {
        const html = emailService.reminderTemplate({
          patientName: patient.full_name,
          medicineName: medicine.name,
          dosage: medicine.dosage,
          unit: medicine.unit,
          scheduledTime: formatTime(log.scheduled_time),
        });
        await emailService.sendEmail(
          patient.user.email,
          `[MedConnect] ${title}`,
          html
        );
      }
    }
  } catch (error) {
    console.error('[Scheduler] Loi Job 4 - retryReminders:', error.message);
  }
};

// ============================================================
// Khởi động tất cả cron jobs
// ============================================================
const startAllJobs = () => {
  // Job 1: Mỗi phút - kiểm tra lịch nhắc uống thuốc
  cron.schedule('* * * * *', () => {
    console.log('[Scheduler] Job 1: Kiểm tra lịch nhắc uống thuốc...');
    checkMedicineReminders();
  });

  // Job 2: Mỗi 5 phút - kiểm tra thuốc bị bỏ lỡ
  cron.schedule('*/5 * * * *', () => {
    console.log('[Scheduler] Job 2: Kiểm tra thuốc bị bỏ lỡ...');
    checkMissedMedications();
  });

  // Job 3: Mỗi ngày lúc 8:00 - kiểm tra đơn thuốc sắp hết hạn
  cron.schedule('0 8 * * *', () => {
    console.log('[Scheduler] Job 3: Kiểm tra đơn thuốc sắp hết hạn...');
    checkExpiringPrescriptions();
  });

  // Job 4: Mỗi 10 phút - retry nhắc lại
  cron.schedule('*/10 * * * *', () => {
    console.log('[Scheduler] Job 4: Retry nhắc lại...');
    retryReminders();
  });

  console.log('[Scheduler] Đã khởi động tất cả cron jobs');
};

module.exports = {
  startAllJobs,
  checkMedicineReminders,
  checkMissedMedications,
  checkExpiringPrescriptions,
  retryReminders,
};
