import { asyncHandler } from '../utils/async-handler.js';
import User from '../models/user.model.js';
import { ApIError } from '../utils/api-error.js';
import { APIResponse } from '../utils/api-response.js';
import { sendMail, emailVerificationMailGenContent } from '../utils/mail.js';

const registerUser = asyncHandler(async (req, res) => {
  const { email, username, password, fullName, role } = req.body;

  //check if user is already existed
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return res.status(400).json(new ApIError(400, 'Email already in use'));
  }

  const newUser = await User.create({
    email,
    username,
    password,
    fullName,
    role,
  });

  if (!newUser) {
    return res.status(400).json(new ApIError(400, 'User not registered'));
  }

  // generate verification token
  const { hashedToken, unHashedToken, tokenExpiry } = newUser.generateTemporaryToken();
  newUser.emailVerificationToken = hashedToken;
  newUser.emailVerificationExpiry = tokenExpiry;
  await newUser.save({ validateBeforeSave: false });

  // generate verification URL
  const verificationURL = `${process.env.BASE_URL}/api/v1/users/verify/${hashedToken}`;

  // send verification email
  sendMail({
    email: newUser.email,
    subject: 'Please verify your email address',
    mailGenContent: emailVerificationMailGenContent(newUser.username, verificationURL),
  });

  // fetch saved user without password
  const userWithoutPassword = await User.findById(newUser._id).select('-password');

  res.status(200).json(new APIResponse(200, userWithoutPassword, 'User registered successfully'));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    res.status(400).json(new ApIError(400, 'Invalid email or password'));
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
    res.status(400).json(new ApIError(400, 'Invalid email or password'));
  }

  const token = await user.generateAccessToken();

  const cookiePtions = {
    httpOnly: true,
    sameSite: 'strict',
    secure: false,
    maxAge: 1000 * 60 * 60 * 24,
  };

  res.cookie('token', token, cookiePtions);

  const userData = {
    id: user._id,
    name: user.name,
    role: user.role,
  };

  res.status(200).json(new APIResponse(200, userData, 'Login Successful'));
});

const logoutUser = asyncHandler(async (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: 'Strict',
    secure: false,
    expires: new Date(0),
  });

  res.status(200).json(new APIResponse(200, 'Logout Successful'));
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;

  const user = await User.findOne({ emailVerificationToken: token });

  if (!user || user.emailVerificationExpiry < Date.now()) {
    return res.status(400).json(new ApIError(400, 'Invalid Token'));
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpiry = undefined;
  await user.save({ validateBeforeSave: false });

  res.status(200).json(new APIResponse(200, 'User verified successfully'));
});

const resendEmailVerification = asyncHandler(async (req, res) => {
  const { email } = req.user;

  // user validate
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json(new ApIError(400, "User doesn't exist"));
  }
  // check already verified email
   if (user.isEmailVerified) {
     return res.status(400).json(new ApIError(400, 'Email already verified'));
   }

  // generate verification token
  const { hashedToken, unHashedToken, tokenExpiry } = user.generateTemporaryToken();
  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = tokenExpiry;
  await user.save({ validateBeforeSave: false });

  // generate verification URL
  const verificationURL = `${process.env.BASE_URL}/api/v1/users/verify/${hashedToken}`;

  // send verification email
  sendMail({
    email: user.email,
    subject: 'Please verify your email address',
    mailGenContent: emailVerificationMailGenContent(user.username, verificationURL),
  });

  res.status(200).json(new APIResponse(200, 'Email sent successfully'));
});

export { registerUser, loginUser, logoutUser, verifyEmail, resendEmailVerification };
