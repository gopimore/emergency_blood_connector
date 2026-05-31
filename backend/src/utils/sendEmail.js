import transporter from '../config/nodemailer.js';
import logger from '../config/logger.js';

const sendEmail = async ({ to, subject, html, text }) => {
  await transporter.sendMail({
    from: `"Emergency Blood Connector" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
    text,
  });
  logger.info(`Email sent to ${to}`);
};

export default sendEmail;
