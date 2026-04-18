import jwt from 'jsonwebtoken';
import User from './auth.model.js';
import ErrorResponse from '../../utils/errorResponse.js';

const generateToken = (id, role) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }
  return jwt.sign({ userId: id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

export const registerUser = async (userData) => {
  const { name, email, password, role } = userData;

  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new ErrorResponse('User already exists', 400);
  }

  let username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
  
  // Ensure basic username is valid
  if (username.length < 3) username = 'user' + Math.floor(Math.random() * 1000);

  // Check for collision and append random if needed
  const usernameTaken = await User.findOne({ username });
  if (usernameTaken) {
    username += Math.floor(Math.random() * 9000 + 1000);
  }

  const user = await User.create({ name, email, password, role, username });

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    username: user.username,
    role: user.role,
    token: generateToken(user._id, user.role),
  };
};

export const loginUser = async (email, password) => {
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    throw new ErrorResponse('Invalid email or password', 401);
  }

  // Retroactive username generation for legacy users
  if (!user.username) {
    let baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    if (baseUsername.length < 3) baseUsername = 'user' + Math.floor(Math.random() * 1000);
    
    // Safety check for collisions
    const collision = await User.findOne({ username: baseUsername });
    user.username = collision ? (baseUsername + Math.floor(Math.random() * 900) + 100) : baseUsername;
    await user.save();
  }

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    username: user.username,
    role: user.role,
    token: generateToken(user._id, user.role),
  };
};
