import nodemailer from 'nodemailer';
import { EmailOptions } from 'notification-service/types';
import { Templates } from '@digidocs/guardian';
import ejs from 'ejs';

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

const renderTemplate = (templateType: Templates, data: any) => {
  const renderedTemplate = ejs.renderFile<string>(
    `${__dirname}/../views/${templateType}.ejs`,
    data
  );

  return renderedTemplate;
};

export const sendEmailToClient = async (options: EmailOptions) => {
  if (options.clientEmail) {
    if (options.templateType) {
      const renderedTemplate = await renderTemplate(
        options.templateType,
        options.data
      );

      return transporter.sendMail(
        {
          from: process.env.NODEMAILER_EMAIL!,
          to: options.clientEmail,
          subject: options.subject,
          html: renderedTemplate,
        },
        (err, info) => {
          if (err) {
            throw err;
          } else {
            return true;
          }
        }
      );
    }
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
