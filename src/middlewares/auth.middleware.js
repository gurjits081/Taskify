import { asyncHandler } from '../utils/async-handler.js';
import { ApIError } from '../utils/api-error.js';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

export const isLoggedIn = asyncHandler(async (req, res, next) => {
  let token = req.cookies?.token;

  if (!token && req.headers.authorization) {
    token = req.headers.authorization.replace('Bearer', '').trim();
  }

  if (!token) {
    return res.status(401).json(new ApIError(401, 'Authorizationr required. Please login.'));
  }
  const decode = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

  const user = await User.findById(decode._id);

  if (!user) {
    return res.status(404).json(new ApIError(404, 'User not found'));
  }

  req.user = user;
  next();
});
