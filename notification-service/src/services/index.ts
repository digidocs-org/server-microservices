import nodemailer from 'nodemailer';
import { EmailOptions } from 'notification-service/types';
import { Templates } from '@digidocs/guardian';
import ejs, { render } from 'ejs';
import key from 'src/digidocs-gsuite-credentials.json'

export const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    type: "OAuth2",
    user: process.env.NODEMAILER_EMAIL,
    serviceClient: key.client_id,
    privateKey: key.private_key
  }
});

const renderTemplate = (templateType: Templates, data: any) => {
  const renderedTemplate = ejs.renderFile<string>(
    `${__dirname}/../views/${templateType}.ejs`,
    data
  );

  return renderedTemplate;
};

const mailOptions = (options: EmailOptions, template: string) => {
  return {
    from: process.env.NODEMAILER_EMAIL!,
    to: options.clientEmail,
    subject: options.subject,
    html: template,
    attachments: options.attachments
  }
}

export const sendEmailToClient = async (options: EmailOptions) => {
  return new Promise(async (resolve, reject) => {
    try {
      await transporter.verify()
      const template = await renderTemplate(options.templateType, options.data)
      await transporter.sendMail(mailOptions(options, template))
      resolve(true)
    } catch (error) {
      console.log(error)
      resolve(false)
    }
  })
};
