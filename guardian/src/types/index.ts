export interface IUploadOptions {
    mime: string
    data: Buffer
    length: number
    name: string
    key: string
}

export interface IUploadResponse {
    name: string,
    key: string
}