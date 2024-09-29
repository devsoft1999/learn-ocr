const Tesseract = require('tesseract.js');

// อ่านข้อความจากรูปภาพ
Tesseract.recognize(
  'resources/demo.jpg',
  'tha',  // สำหรับภาษาไทย
  {
    logger: m => console.log(m)  // ใช้สำหรับแสดงผล log
  }
).then(({ data: { text } }) => {
  const appointmentDetails = extractAppointmentDetails(text);
  console.log(appointmentDetails);
});

// ฟังก์ชันสำหรับดึงวันที่นัด
function extractDate(text) {
  const start = text.indexOf("วันทีนัด ");  // หาตำแหน่งของคำว่า "วันทีนัด"
  if (start !== -1) {
    // ตัดข้อความตั้งแต่ "วันทีนัด" ไปถึงเวลานัด
    let dateText = text.slice(start + "วันทีนัด :".length).trim();
    return dateText.split("เวลา")[0].trim(); // ตัดข้อความหลังจาก "เวลา"
  }
  return "ไม่พบวันที่นัด";
}

// ฟังก์ชันเพื่อจัดรูปแบบเวลา
function formatTime(timeString) {
  if (timeString && timeString.length === 4) {
    return timeString.slice(0, 2) + ':' + timeString.slice(2); // เพิ่ม ":" ระหว่างชั่วโมงกับนาที
  }
  return "รูปแบบเวลาไม่ถูกต้อง";
}

// ฟังก์ชันหลักเพื่อดึงรายละเอียดการนัดหมาย
function extractAppointmentDetails(text) {
  // ทำความสะอาดข้อความ OCR เพื่อลบอักขระพิเศษที่ไม่จำเป็น
  const cleanedText = text.replace(/[^\w\s\.\u0E00-\u0E7F]/g, '');

  // ดึงข้อมูลจุดประสงค์การนัด
  const purposePattern = /นัดมาเพื่อ\s*(.*?)\n/;
  const purposeMatch = cleanedText.match(purposePattern);
  
  // ดึงวันที่และเวลานัด
  const dateAndTime = extractDate(cleanedText).split("เวลา");
  const appointmentDate = dateAndTime[0].trim();  // วันที่นัด
  const appointmentTime = dateAndTime[1] ? formatTime(dateAndTime[1].split("น.")[0].trim()) : "ไม่พบเวลา";  // เวลานัด

  // จุดประสงค์การนัด
  const appointmentPurpose = purposeMatch ? purposeMatch[1].trim() : "ไม่พบจุดประสงค์";

  return {
    date: appointmentDate,
    time: appointmentTime,
    purpose: appointmentPurpose
  };
}
