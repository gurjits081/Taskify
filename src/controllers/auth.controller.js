import { asyncHandler } from '../utils/async-handler.js';
import User from '../models/user.model.js'
import { ApIError } from '../utils/api-error.js'
import {APIResponse} from '../utils/api-response.js'

const registerUser = asyncHandler(async (req, res) => {
  const { email, username, password, fullName, role } = req.body;

  //check if user is already existed
  const existingUser = await User.findOne({ email });

  if(existingUser) {
    return res.status(400).json(new ApIError(400, "Email already in use"))
  }

  const newUser = await User.create({
    email,
    username,
    password,
    fullName,
    role
  })

  if(!newUser) {
    return res.status(400).json(new ApIError(400, "User not registered"))
  }

  // generate verification token
  const { hashedToken, unHashedToken, tokenExpiry } = newUser.generateTemporaryToken();
  newUser.emailVerificationToken = hashedToken;
  newUser.emailVerificationExpiry = tokenExpiry;
  await newUser.save({validateBeforeSave: false});

  


  // fetch saved user without password
  const userWithoutPassword = await User.findById(newUser._id).select('-password');

  res.status(200).json(new APIResponse(200, userWithoutPassword, "User registered successfully"));

});

const loginUser = asyncHandler(async(req, res) => {
    const { email, password} = req.body;

    const user = await User.findOne({ email });

    if(!user){
      res.status(400).json(new ApIError(400, "Invalid email or password"))
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password);
    if(!isPasswordCorrect) {
      res.status(400).json(new ApIError(400, "Invalid email or password"))
    }

   
    const token = await user.generateAccessToken();
    
    const cookiePtions = {
      httpOnly: true,
      sameSite: "strict",
      secure: false,
      maxAge: 1000 * 60 * 60 * 24
    }

    res.cookie("token", token, cookiePtions);

    const userData = {
      id: user._id,
      name: user.name,
      role: user.role
    }

    res.status(200).json(new APIResponse(200, userData, 'Login Successful'));
})

const logoutUser = asyncHandler(async(req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: 'Strict',
    secure: false,
    expires: new Date(0),
  });

  res.status(200).json(new APIResponse(200, "Logout Successful"))
})



export { registerUser, loginUser, logoutUser };
