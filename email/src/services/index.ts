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

export const sendEmailToClient = async (options: EmailOptions) => {
    try {
        const mailTransporter = promisify(transporter.sendMail)
        await mailTransporter(options)
    } catch (error) {
        throw error
    }
};