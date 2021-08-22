import { PDFDocument } from 'pdf-lib';
import fetch from 'node-fetch';

export const checkForBase64String = (str: string) =>
    Buffer.from(str, 'base64').toString('base64') === str;

export const checkForBuffer = (data: any) => Buffer.isBuffer(data);

export const checkForPdf = (data: any) => {
    const buff = checkForBuffer(data) ? data : Buffer.from(data);
    return buff.lastIndexOf('%PDF-') === 0 && buff.lastIndexOf('%%EOF') > -1;
};

export const checkForProtectedPdf = async (data: any) => {
    const buff = checkForBuffer(data) ? data : Buffer.from(data);
    try {
        await PDFDocument.load(buff);
        return false;
    } catch (error) {
        return true;
    }
};


export const fetchData = (documentUrl: string) =>
    fetch(documentUrl)
        .then((data) => data.buffer())
        .catch((err) => Promise.reject(err));