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

  let user;
  let attempts = 0;
  const maxAttempts = 5;

  while (attempts < maxAttempts) {
    try {
      user = await User.create({ name, email, password, role, username });
      break; // Success
    } catch (error) {
      if (error.code === 11000 && (error.message.includes('username') || JSON.stringify(error.keyValue).includes('username'))) {
        attempts++;
        // Append fresh 4-digit random suffix
        username = username.replace(/\d{4}$/, '') + (Math.floor(Math.random() * 9000) + 1000);
        if (attempts === maxAttempts) throw new ErrorResponse('Failed to generate unique username. Please try again.', 500);
      } else {
        throw error;
      }
    }
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

export const loginUser = async (email, password) => {
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    throw new ErrorResponse('Invalid email or password', 401);
  }

  // Retroactive username generation for legacy users
  if (!user.username) {
    let baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    if (baseUsername.length < 3) baseUsername = 'user' + Math.floor(Math.random() * 1000);
    
    // Atomic attempt to claim username
    let attempts = 0;
    while (attempts < 5) {
      let candidate = attempts === 0 ? baseUsername : `${baseUsername}${Math.floor(Math.random() * 9000) + 1000}`;
      try {
        const updated = await User.findOneAndUpdate(
          { _id: user._id, username: { $exists: false } },
          { $set: { username: candidate } },
          { new: true, runValidators: true }
        );
        if (updated) {
          user.username = candidate;
          break;
        }
      } catch (error) {
        if (error.code === 11000) {
          attempts++;
        } else {
          throw error;
        }
      }
    }
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
