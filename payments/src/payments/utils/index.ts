import crypto from 'crypto'

export const encrypt = (data: any, workingKey: string) => {
    var m = crypto.createHash('md5');
    m.update(workingKey);
    var key = m.digest().slice(0, 16);
    var iv = '\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f';
    var cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
    var encoded = cipher.update(data, 'utf8', 'hex');
    encoded += cipher.final('hex');
    return encoded;
}

export const decrypt = (data: any, workingKey: string) => {
    var m = crypto.createHash('md5');
    m.update(workingKey)
    var key = m.digest().slice(0, 16);
    var iv = '\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f';
    var decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
    var decoded = decipher.update(data, 'hex', 'utf8');
    decoded += decipher.final('utf8');
    return decoded;
}

export const parseToQueryParam = (data: any) => {
    let query = ""
    for (const key in data) {
        query += `&${key}=${encodeURIComponent(data[key])}`
    }
    return query.slice(1, query.length)
}