import jwt from 'jsonwebtoken';
import { findById } from '../db/user.js';
import { AUTH_MESSAGES } from '../constants/messages.js';

// Protect routes — requires valid JWT
export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: AUTH_MESSAGES.NOT_AUTHORIZED_NO_TOKEN });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: AUTH_MESSAGES.USER_NOT_FOUND });
    }

    const { password, ...userWithoutPassword } = user;
    req.user = userWithoutPassword;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: AUTH_MESSAGES.NOT_AUTHORIZED_INVALID_TOKEN });
  }
};

// Allow only specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: AUTH_MESSAGES.ROLE_NOT_AUTHORIZED(req.user.role),
      });
    }
    next();
  };
};
