import { validationResult } from 'express-validator';
import { ApIError } from '../utils/api-error.js';

export const validate = (req, res, next) => {
    const errors = validationResult(req);

    if(errors.isEmpty()) {
        return next()
    }

    const extractedErrors = [];
    errors.array().map((arr) => extractedErrors.push({
        [arr.path]: arr.msg
    }))

    console.log(extractedErrors);

    throw new ApIError(422, "Received data is not valid", extractedErrors)
}