import nodemailer from 'nodemailer';
import { EmailOptions } from 'email-service/types';
import { promisify } from 'util';

export const transporter = nodemailer.createTransport({
  host: 'smtp.zoho.in',
  port: 465,
  secure: true,
  auth: {
    user: process.env.NODEMAILER_EMAIL,
    pass: process.env.NODEMAILER_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export const sendEmailToClient = (options: EmailOptions) => {
  if (options.clientEmail) {
    return transporter.sendMail(
      {
        from: process.env.NODEMAILER_EMAIL!,
        to: options.clientEmail,
        subject: options.subject,
        text: options.body,
      },
      (err, info) => {
        if (err) {
          throw err;
        } else {
          return true;
        }
      }
    );
  } else {
    console.log(options);
  }
};
