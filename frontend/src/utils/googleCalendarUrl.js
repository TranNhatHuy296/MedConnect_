// Helper sinh URL "Add to Google Calendar" cho lịch uống thuốc.
// Mỗi medicine + schedule (giờ uống) → 1 event RECURRING DAILY trong khoảng startDate → endDate.
// Dùng google.com/calendar/render?action=TEMPLATE — không cần OAuth.

const pad = (n) => String(n).padStart(2, '0');

// Format datetime cho Google Calendar: YYYYMMDDTHHmmss (local time, không Z)
const formatLocalDateTime = (date) => {
  return (
    date.getFullYear().toString() +
    pad(date.getMonth() + 1) +
    pad(date.getDate()) +
    'T' +
    pad(date.getHours()) +
    pad(date.getMinutes()) +
    '00'
  );
};

// Format date YYYYMMDD cho UNTIL của RRULE
const formatDateOnly = (date) => {
  return (
    date.getFullYear().toString() +
    pad(date.getMonth() + 1) +
    pad(date.getDate())
  );
};

/**
 * Sinh 1 URL Google Calendar cho 1 schedule (giờ uống) của 1 medicine.
 *
 * @param {Object} params
 * @param {string} params.medicineName
 * @param {string|number} params.dosage
 * @param {string} params.unit
 * @param {string} params.scheduleTime - "HH:mm"
 * @param {string} params.startDate - "YYYY-MM-DD"
 * @param {string} params.endDate - "YYYY-MM-DD"
 * @param {string} [params.patientName]
 * @param {string} [params.notes]
 * @returns {string} URL mở Google Calendar với event điền sẵn
 */
export const buildGoogleCalendarUrl = ({
  medicineName,
  dosage,
  unit,
  scheduleTime,
  startDate,
  endDate,
  patientName,
  notes,
}) => {
  if (!medicineName || !scheduleTime || !startDate || !endDate) return null;

  const [hh, mm] = scheduleTime.split(':').map(Number);
  const start = new Date(startDate);
  start.setHours(hh, mm, 0, 0);

  // Mỗi liều uống thuốc kéo dài 15 phút (event duration)
  const end = new Date(start.getTime() + 15 * 60 * 1000);

  // UNTIL phải >= ngày kết thúc, set 23:59:59 cho chắc
  const untilDate = new Date(endDate);
  untilDate.setHours(23, 59, 59, 0);
  const untilStr = formatDateOnly(untilDate) + 'T235959Z';

  const dates = `${formatLocalDateTime(start)}/${formatLocalDateTime(end)}`;
  const rrule = `RRULE:FREQ=DAILY;UNTIL=${untilStr}`;

  const title = `Uống thuốc: ${medicineName}${dosage ? ` (${dosage} ${unit || ''})`.trim() + ')' : ''}`
    .replace('))', ')');

  const detailLines = [
    patientName ? `Bệnh nhân: ${patientName}` : null,
    `Thuốc: ${medicineName}`,
    dosage ? `Liều: ${dosage} ${unit || ''}`.trim() : null,
    `Giờ uống: ${scheduleTime}`,
    notes ? `Ghi chú: ${notes}` : null,
    '',
    'Tạo bởi MedConnect',
  ].filter(Boolean);

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates,
    details: detailLines.join('\n'),
    recur: rrule,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

/**
 * Sinh danh sách URL từ form đơn thuốc (mảng medications + start/end date).
 * Mỗi schedule trong mỗi medicine → 1 URL.
 *
 * @param {Object} prescription - { start_date, end_date, medicines: [{ name, dosage, unit, schedules: [{time}] }] }
 * @param {string} [patientName]
 * @returns {string[]} Mảng URL
 */
export const buildUrlsForPrescription = (prescription, patientName) => {
  if (!prescription || !prescription.medicines) return [];
  const urls = [];
  for (const med of prescription.medicines) {
    const schedules = med.schedules || [];
    for (const sch of schedules) {
      const url = buildGoogleCalendarUrl({
        medicineName: med.name,
        dosage: med.dosage,
        unit: med.unit,
        scheduleTime: sch.time,
        startDate: prescription.start_date,
        endDate: prescription.end_date,
        patientName,
        notes: prescription.notes,
      });
      if (url) urls.push(url);
    }
  }
  return urls;
};

/**
 * Mở lần lượt nhiều URL Google Calendar trong các tab mới.
 * PHẢI được gọi trong user gesture (vd onClick / submit handler) để browser không block popup.
 *
 * @param {string[]} urls
 * @returns {{opened: number, blocked: number}}
 */
export const openCalendarUrls = (urls) => {
  let opened = 0;
  let blocked = 0;
  for (const url of urls) {
    const win = window.open(url, '_blank', 'noopener,noreferrer');
    if (win) opened += 1;
    else blocked += 1;
  }
  return { opened, blocked };
};
