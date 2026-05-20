const { Resend } = require('resend');


// ============================================================
// Cấu hình Resend API
// ============================================================
const resend = new Resend(process.env.RESEND_API_KEY);

// ============================================================
// Layout chung cho tất cả email
// ============================================================
const baseLayout = (content) => `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MedConnect</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f7fa;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f7fa;padding:20px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1e88e5 0%,#1565c0 100%);padding:28px 40px;text-align:center;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <div style="display:inline-block;background-color:rgba(255,255,255,0.2);border-radius:50%;width:48px;height:48px;line-height:48px;text-align:center;margin-bottom:8px;">
                      <span style="font-size:24px;color:#ffffff;">+</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <h1 style="color:#ffffff;margin:0;font-size:26px;font-weight:700;letter-spacing:1px;">MedConnect</h1>
                    <p style="color:rgba(255,255,255,0.85);margin:4px 0 0;font-size:13px;">Hệ thống quản lý đơn thuốc thông minh</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #e8edf2;">
              <p style="margin:0;font-size:12px;color:#8898a8;">Bạn nhận được email này từ hệ thống MedConnect.</p>
              <p style="margin:4px 0 0;font-size:12px;color:#8898a8;">Vui lòng không trả lời email này. Mọi thắc mắc liên hệ hotro@medconnect.vn</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// ============================================================
// Các icon / badge style cho từng loại thông báo
// ============================================================
const typeBadge = {
  reminder: { color: '#1e88e5', bg: '#e3f2fd', icon: '&#128276;', label: 'Nhắc nhở' },
  confirmation: { color: '#43a047', bg: '#e8f5e9', icon: '&#9989;', label: 'Xác nhận' },
  missed: { color: '#e53935', bg: '#ffebee', icon: '&#9888;', label: 'Cảnh báo' },
  expiring: { color: '#fb8c00', bg: '#fff3e0', icon: '&#128197;', label: 'Sắp hết hạn' },
  updated: { color: '#8e24aa', bg: '#f3e5f5', icon: '&#128221;', label: 'Cập nhật' },
  channel_error: { color: '#757575', bg: '#f5f5f5', icon: '&#9888;', label: 'Lỗi gửi' },
};

const makeBadgeHtml = (type) => {
  const b = typeBadge[type] || typeBadge.reminder;
  return `<span style="display:inline-block;background:${b.bg};color:${b.color};padding:4px 14px;border-radius:20px;font-size:13px;font-weight:600;">${b.icon} ${b.label}</span>`;
};

// ============================================================
// Template: Nhắc nhở uống thuốc
// ============================================================
const reminderTemplate = ({ patientName, medicineName, dosage, unit, scheduledTime }) => {
  return baseLayout(`
    <div style="text-align:center;margin-bottom:20px;">
      ${makeBadgeHtml('reminder')}
    </div>
    <h2 style="color:#1a2b3c;margin:0 0 8px;font-size:20px;text-align:center;">Đã đến giờ uống thuốc!</h2>
    <p style="color:#5a6b7c;text-align:center;margin:0 0 24px;font-size:14px;">Xin chào <strong>${patientName}</strong>, bạn có lịch uống thuốc cần thực hiện.</p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:10px;padding:20px;border:1px solid #e8edf2;">
      <tr>
        <td style="padding:8px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #e8edf2;">
                <span style="color:#8898a8;font-size:13px;">Tên thuốc</span><br/>
                <span style="color:#1a2b3c;font-size:16px;font-weight:600;">${medicineName}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #e8edf2;">
                <span style="color:#8898a8;font-size:13px;">Liều lượng</span><br/>
                <span style="color:#1a2b3c;font-size:16px;font-weight:600;">${dosage} ${unit}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:10px 0;">
                <span style="color:#8898a8;font-size:13px;">Giờ uống</span><br/>
                <span style="color:#1e88e5;font-size:20px;font-weight:700;">${scheduledTime}</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <div style="text-align:center;margin-top:24px;">
      <p style="color:#5a6b7c;font-size:14px;margin:0;">Vui lòng uống thuốc đúng giờ và xác nhận trên ứng dụng MedConnect.</p>
    </div>
  `);
};

// ============================================================
// Template: Xác nhận đã uống thuốc (gửi cho bác sĩ)
// ============================================================
const confirmationTemplate = ({ doctorName, patientName, medicineName, dosage, unit, takenAt }) => {
  return baseLayout(`
    <div style="text-align:center;margin-bottom:20px;">
      ${makeBadgeHtml('confirmation')}
    </div>
    <h2 style="color:#1a2b3c;margin:0 0 8px;font-size:20px;text-align:center;">Bệnh nhân đã uống thuốc</h2>
    <p style="color:#5a6b7c;text-align:center;margin:0 0 24px;font-size:14px;">Xin chào BS. <strong>${doctorName}</strong>,</p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#e8f5e9;border-radius:10px;padding:20px;border:1px solid #c8e6c9;">
      <tr>
        <td style="padding:8px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:8px 0;border-bottom:1px solid #c8e6c9;">
                <span style="color:#66bb6a;font-size:13px;">Bệnh nhân</span><br/>
                <span style="color:#1a2b3c;font-size:16px;font-weight:600;">${patientName}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 0;border-bottom:1px solid #c8e6c9;">
                <span style="color:#66bb6a;font-size:13px;">Thuốc</span><br/>
                <span style="color:#1a2b3c;font-size:16px;font-weight:600;">${medicineName} - ${dosage} ${unit}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 0;">
                <span style="color:#66bb6a;font-size:13px;">Thời gian xác nhận</span><br/>
                <span style="color:#43a047;font-size:16px;font-weight:700;">${takenAt}</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `);
};

// ============================================================
// Template: Cảnh báo bỏ lỡ thuốc
// ============================================================
const missedTemplate = ({ recipientName, patientName, medicineName, dosage, unit, scheduledTime, isDoctor }) => {
  const greeting = isDoctor ? `BS. ${recipientName}` : recipientName;
  const intro = isDoctor
    ? `Bệnh nhân <strong>${patientName}</strong> đã bỏ lỡ liều thuốc theo lịch.`
    : `Bạn đã bỏ lỡ liều thuốc theo lịch. Vui lòng liên hệ bác sĩ nếu cần hỗ trợ.`;

  return baseLayout(`
    <div style="text-align:center;margin-bottom:20px;">
      ${makeBadgeHtml('missed')}
    </div>
    <h2 style="color:#e53935;margin:0 0 8px;font-size:20px;text-align:center;">Cảnh báo: Bỏ lỡ uống thuốc!</h2>
    <p style="color:#5a6b7c;text-align:center;margin:0 0 24px;font-size:14px;">Xin chào <strong>${greeting}</strong>, ${intro}</p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffebee;border-radius:10px;padding:20px;border:1px solid #ffcdd2;">
      <tr>
        <td style="padding:8px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            ${isDoctor ? `<tr><td style="padding:8px 0;border-bottom:1px solid #ffcdd2;">
              <span style="color:#e57373;font-size:13px;">Bệnh nhân</span><br/>
              <span style="color:#1a2b3c;font-size:16px;font-weight:600;">${patientName}</span>
            </td></tr>` : ''}
            <tr>
              <td style="padding:8px 0;border-bottom:1px solid #ffcdd2;">
                <span style="color:#e57373;font-size:13px;">Thuốc</span><br/>
                <span style="color:#1a2b3c;font-size:16px;font-weight:600;">${medicineName} - ${dosage} ${unit}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 0;">
                <span style="color:#e57373;font-size:13px;">Giờ uống đã lỡ</span><br/>
                <span style="color:#e53935;font-size:18px;font-weight:700;">${scheduledTime}</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `);
};

// ============================================================
// Template: Đơn thuốc sắp hết hạn
// ============================================================
const expiringTemplate = ({ doctorName, patientName, prescriptionId, endDate, daysLeft }) => {
  return baseLayout(`
    <div style="text-align:center;margin-bottom:20px;">
      ${makeBadgeHtml('expiring')}
    </div>
    <h2 style="color:#fb8c00;margin:0 0 8px;font-size:20px;text-align:center;">Đơn thuốc sắp hết hạn</h2>
    <p style="color:#5a6b7c;text-align:center;margin:0 0 24px;font-size:14px;">Xin chào BS. <strong>${doctorName}</strong>,</p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fff3e0;border-radius:10px;padding:20px;border:1px solid #ffe0b2;">
      <tr>
        <td style="padding:8px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:8px 0;border-bottom:1px solid #ffe0b2;">
                <span style="color:#ffa726;font-size:13px;">Bệnh nhân</span><br/>
                <span style="color:#1a2b3c;font-size:16px;font-weight:600;">${patientName}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 0;border-bottom:1px solid #ffe0b2;">
                <span style="color:#ffa726;font-size:13px;">Mã đơn thuốc</span><br/>
                <span style="color:#1a2b3c;font-size:16px;font-weight:600;">#${prescriptionId}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 0;">
                <span style="color:#ffa726;font-size:13px;">Ngày hết hạn</span><br/>
                <span style="color:#fb8c00;font-size:18px;font-weight:700;">${endDate}</span>
                <span style="color:#e65100;font-size:14px;"> (còn ${daysLeft} ngày)</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <div style="text-align:center;margin-top:24px;">
      <p style="color:#5a6b7c;font-size:14px;margin:0;">Vui lòng xem xét và gia hạn hoặc cập nhật đơn thuốc khi cần.</p>
    </div>
  `);
};

// ============================================================
// Template: Đơn thuốc được cập nhật
// ============================================================
const updatedTemplate = ({ patientName, prescriptionId, doctorName, updatedFields }) => {
  return baseLayout(`
    <div style="text-align:center;margin-bottom:20px;">
      ${makeBadgeHtml('updated')}
    </div>
    <h2 style="color:#8e24aa;margin:0 0 8px;font-size:20px;text-align:center;">Đơn thuốc đã được cập nhật</h2>
    <p style="color:#5a6b7c;text-align:center;margin:0 0 24px;font-size:14px;">Xin chào <strong>${patientName}</strong>, bác sĩ <strong>${doctorName}</strong> đã cập nhật đơn thuốc của bạn.</p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3e5f5;border-radius:10px;padding:20px;border:1px solid #ce93d8;">
      <tr>
        <td style="padding:8px 16px;">
          <p style="color:#8e24aa;font-size:13px;margin:0 0 8px;">Mã đơn thuốc: <strong>#${prescriptionId}</strong></p>
          <p style="color:#1a2b3c;font-size:14px;margin:0;">${updatedFields || 'Thông tin đơn thuốc đã được chỉnh sửa. Vui lòng kiểm tra lại trên ứng dụng.'}</p>
        </td>
      </tr>
    </table>
  `);
};

// ============================================================
// Template: Lỗi kênh gửi
// ============================================================
const channelErrorTemplate = ({ adminName, errorDetails, channel, timestamp }) => {
  return baseLayout(`
    <div style="text-align:center;margin-bottom:20px;">
      ${makeBadgeHtml('channel_error')}
    </div>
    <h2 style="color:#757575;margin:0 0 8px;font-size:20px;text-align:center;">Lỗi gửi thông báo</h2>
    <p style="color:#5a6b7c;text-align:center;margin:0 0 24px;font-size:14px;">Hệ thống gặp lỗi khi gửi thông báo qua kênh <strong>${channel}</strong>.</p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;border-radius:10px;padding:20px;border:1px solid #e0e0e0;">
      <tr>
        <td style="padding:8px 16px;">
          <p style="color:#757575;font-size:13px;margin:0 0 4px;">Thời gian: <strong>${timestamp}</strong></p>
          <p style="color:#e53935;font-size:14px;margin:0;">Chi tiết lỗi: ${errorDetails}</p>
        </td>
      </tr>
    </table>
  `);
};

// ============================================================
// Hàm gửi email chính
// ============================================================
const sendEmail = async (to, subject, htmlContent) => {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('[EmailService] Chưa cấu hình RESEND_API_KEY, bỏ qua gửi email.');
      return { success: false, error: 'Resend API key chưa được cấu hình' };
    }

    const { data, error } = await resend.emails.send({
      from: `${process.env.MAIL_FROM_NAME || 'MedConnect'} <${process.env.MAIL_FROM_ADDRESS || 'noreply@qlhtt.io.vn'}>`,
      to: [to],
      subject: subject,
      html: htmlContent,
    });

    if (error) {
      throw new Error(error.message || JSON.stringify(error));
    }

    console.log(`[EmailService] Đã gửi email tới ${to} - id: ${data.id}`);
    return { success: true, messageId: data.id };
  } catch (error) {
    console.error(`[EmailService] Lỗi gửi email tới ${to}:`, error.message);

    // Tạo notification lỗi kênh gửi (lazy require để tránh circular dependency)
    try {
      const { Notification } = require('../models');
      await Notification.create({
        user_id: 1, // admin / system user
        type: 'channel_error',
        title: 'Lỗi gửi email',
        message: `Không thể gửi email tới ${to}. Lỗi: ${error.message}`,
        channel: 'in_app',
        send_status: 'sent',
      });
    } catch (logErr) {
      console.error('[EmailService] Không thể ghi log lỗi:', logErr.message);
    }

    return { success: false, error: error.message };
  }
};

// ============================================================
// Template: Chào mừng bệnh nhân (tài khoản được bác sĩ tạo)
// ============================================================
const welcomeTemplate = ({ patientName, email, password, doctorName }) => {
  return baseLayout(`
    <div style="text-align:center;margin-bottom:20px;">
      <span style="display:inline-block;background:#e3f2fd;color:#1e88e5;padding:4px 14px;border-radius:20px;font-size:13px;font-weight:600;">&#128075; Chào mừng</span>
    </div>
    <h2 style="color:#1a2b3c;margin:0 0 8px;font-size:20px;text-align:center;">Tài khoản của bạn đã được tạo!</h2>
    <p style="color:#5a6b7c;text-align:center;margin:0 0 24px;font-size:14px;">Xin chào <strong>${patientName}</strong>, bác sĩ <strong>${doctorName}</strong> đã tạo tài khoản MedConnect cho bạn.</p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:10px;padding:20px;border:1px solid #e8edf2;">
      <tr>
        <td style="padding:8px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #e8edf2;">
                <span style="color:#8898a8;font-size:13px;">Email đăng nhập</span><br/>
                <span style="color:#1a2b3c;font-size:16px;font-weight:600;">${email}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:10px 0;">
                <span style="color:#8898a8;font-size:13px;">Mật khẩu</span><br/>
                <span style="color:#e53935;font-size:18px;font-weight:700;">${password}</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <div style="text-align:center;margin-top:24px;">
      <a href="http://localhost:3000/login" style="display:inline-block;background:linear-gradient(135deg,#1e88e5 0%,#1565c0 100%);color:#ffffff;text-decoration:none;padding:12px 32px;border-radius:8px;font-size:15px;font-weight:600;">Đăng nhập ngay</a>
    </div>

    <div style="text-align:center;margin-top:16px;">
      <p style="color:#e53935;font-size:13px;margin:0;font-weight:500;">Vui lòng đăng nhập và đổi mật khẩu ngay để bảo mật tài khoản.</p>
    </div>
  `);
};

const resetPasswordTemplate = ({ userName, email, newPassword }) => {
  return baseLayout(`
    <h2 style="color:#1e293b;font-size:22px;margin:0 0 16px;font-weight:600;">Mật khẩu mới của bạn</h2>
    <p style="color:#475569;font-size:15px;line-height:1.6;margin:0 0 20px;">
      Chào <strong>${userName}</strong>,<br>
      Bạn đã yêu cầu đặt lại mật khẩu. Đây là thông tin đăng nhập mới:
    </p>
    <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:20px;margin:20px 0;">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="padding:6px 0;color:#64748b;font-size:14px;width:120px;">Email:</td>
          <td style="padding:6px 0;color:#1e293b;font-size:14px;font-weight:600;">${email}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:#64748b;font-size:14px;">Mật khẩu mới:</td>
          <td style="padding:6px 0;color:#1e293b;font-size:16px;font-weight:700;letter-spacing:1px;">${newPassword}</td>
        </tr>
      </table>
    </div>
    <div style="text-align:center;margin:24px 0;">
      <a href="http://localhost:3000/login" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:12px 32px;border-radius:8px;font-size:15px;font-weight:600;">Đăng nhập ngay</a>
    </div>
    <p style="color:#e53935;font-size:13px;margin:0;font-weight:500;">Vui lòng đổi mật khẩu ngay sau khi đăng nhập để bảo mật tài khoản.</p>
  `);
};

module.exports = {
  sendEmail,
  reminderTemplate,
  confirmationTemplate,
  missedTemplate,
  expiringTemplate,
  updatedTemplate,
  channelErrorTemplate,
  welcomeTemplate,
  resetPasswordTemplate,
};
