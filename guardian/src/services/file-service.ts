import { PDFDocument } from 'pdf-lib';
import fetch from 'node-fetch';
import fs from 'fs/promises'
import { dirname as getDirName } from 'path'

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



export const writeFile = async (path: string, contents: any, type: BufferEncoding) => {
    try {
        await fs.mkdir(getDirName(path), { recursive: true })
        await fs.writeFile(path, contents, type)
    } catch (error) {
        throw error
    }
}

export const deleteFile = async (path: string) => {
    try {
        await fs.rmdir(getDirName(path), { recursive: true })
    } catch (error) {
        throw error
    }

}

// writeFile('temp/sample.txt', "this is me", (err) => err)
// deleteFile('temp', (err) => console.log(err))