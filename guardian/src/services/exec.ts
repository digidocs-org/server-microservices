import { promisify } from 'util'

export const exec = promisify(require('child_process').exec);
export const convertToString = (data: any) => JSON.stringify(data);