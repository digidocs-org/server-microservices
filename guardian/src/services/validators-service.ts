import { body as reqBody, header } from 'express-validator';

export const headerValidators = (...headers: string[]) => {
    const validatorArray = [];
    for (let i = 0; i < headers?.length; i++) {
        validatorArray.push(
            header(headers[i])
                .not()
                .isEmpty()
                .withMessage(`${headers[i]} is required!!!`)
        );
    }
    return validatorArray;
};

export const bodyValidators = (...body: string[]) => {
    let validatorArray = [];
    for (let i = 0; i < body?.length; i++) {
        validatorArray.push(
            reqBody(body[i]).not().isEmpty().withMessage(`${body[i]} is required!!!`)
        );
    }
    return validatorArray;
};

export const queryValidators = (...query: string[]) => {
    const validatorArray = [];
    for (let i = 0; i < query?.length; i++) {
        validatorArray.push(
            header(query[i])
                .not()
                .isEmpty()
                .withMessage(`${query[i]} is required!!!`)
        );
    }
    return validatorArray;
};