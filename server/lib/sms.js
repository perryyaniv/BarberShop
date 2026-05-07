async function sendViaTwilio(to, body) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;

  if (!accountSid || !authToken || !from) {
    console.error('Twilio credentials not configured');
    return { success: false, error: 'SMS provider not configured' };
  }

  const twilio = require('twilio');
  const client = twilio(accountSid, authToken);

  try {
    await client.messages.create({ body, from, to });
    return { success: true };
  } catch (err) {
    console.error('Twilio error:', err);
    return { success: false, error: String(err) };
  }
}

async function sendSms(to, body) {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[SMS DEV] To: ${to}\n${body}`);
    return { success: true };
  }
  return sendViaTwilio(to, body);
}

function formatOtpMessage(code, locale) {
  if (locale === 'he') {
    return `קוד האימות שלך הוא: ${code}\nהקוד בתוקף למשך 5 דקות.`;
  }
  return `Your verification code is: ${code}\nValid for 5 minutes.`;
}

function formatReminderMessage(customerName, serviceName, date, time, locale) {
  if (locale === 'he') {
    return `שלום ${customerName},\nתזכורת: יש לך תור ל${serviceName} בתאריך ${date} בשעה ${time}.\nלביטול, פנה אלינו.`;
  }
  return `Hello ${customerName},\nReminder: You have an appointment for ${serviceName} on ${date} at ${time}.\nTo cancel, please contact us.`;
}

module.exports = { sendSms, formatOtpMessage, formatReminderMessage };
