import Axios from 'axios';

export const apiAdapter = (baseURL: string) => {
    return Axios.create({
        baseURL
    })
}