import { APIResponse } from '../utils/api-response.js';

const healthCheck = (req, res, next) => {
    res.status(200).json(new APIResponse(200, {message: "Server is running!"}))
}

export { healthCheck }