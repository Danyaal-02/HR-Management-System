import bcrypt from 'bcrypt';
import {
  createUser, findByEmail, findByEmployeeId, findById,
  updateUser, generateEmployeeId, generateTempPassword,
  generateVerificationToken, findByVerificationToken,
} from '../db/user.js';
import { createCompany } from '../db/company.js';
import { generateToken } from '../utils/generateToken.js';
import { sendVerificationEmail, sendEmployeeWelcomeEmail } from '../utils/sendMail.js';
import { AUTH_MESSAGES, COMMON_MESSAGES } from '../constants/messages.js';

// POST /api/auth/signup — Admin self-registers
export const signup = async (req, res) => {
  try {
    const { company_name, first_name, last_name, email, phone, password } = req.body;

    const existingEmail = await findByEmail(email);
    if (existingEmail) {
      return res.status(409).json({ success: false, message: AUTH_MESSAGES.EMAIL_REGISTERED });
    }

    const date_of_joining = new Date().toISOString().split('T')[0];
    const employee_id = await generateEmployeeId(first_name, last_name, date_of_joining);

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const verificationToken = generateVerificationToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const newUser = await createUser({
      employee_id, first_name, last_name, email,
      password: hashedPassword, role: 'admin', phone, date_of_joining,
      is_password_changed: 1,
      email_verification_token: verificationToken,
      email_verification_expires: verificationExpires,
    });

    await createCompany({
      company_name, logo: null, created_by: newUser.id,
    });

    await sendVerificationEmail(email, first_name, verificationToken);

    return res.status(201).json({
      success: true,
      message: AUTH_MESSAGES.ACCOUNT_CREATED_VERIFY,
      data: {
        id: newUser.id,
        employee_id: newUser.employee_id,
        email: newUser.email,
        role: newUser.role,
        verification_token: verificationToken,
      },
    });
  } catch (error) {
    console.error('Signup error:', error.message);
    return res.status(500).json({ success: false, message: COMMON_MESSAGES.INTERNAL_SERVER_ERROR });
  }
};

// GET /api/auth/verify-email/:token
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const user = await findByVerificationToken(token);
    if (!user) {
      return res.status(400).json({ success: false, message: AUTH_MESSAGES.INVALID_VERIFY_TOKEN });
    }

    await updateUser(user.id, {
      is_email_verified: 1,
      email_verification_token: null,
      email_verification_expires: null,
    });

    return res.status(200).json({ success: true, message: AUTH_MESSAGES.EMAIL_VERIFIED });
  } catch (error) {
    console.error('Verify email error:', error.message);
    return res.status(500).json({ success: false, message: COMMON_MESSAGES.INTERNAL_SERVER_ERROR });
  }
};

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { login_id, password } = req.body;

    let user = await findByEmployeeId(login_id);
    if (!user) user = await findByEmail(login_id);

    if (!user) {
      return res.status(401).json({ success: false, message: AUTH_MESSAGES.INVALID_CREDENTIALS });
    }

    if (!user.is_email_verified) {
      return res.status(403).json({ success: false, message: AUTH_MESSAGES.EMAIL_VERIFY_PENDING });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: AUTH_MESSAGES.INVALID_CREDENTIALS });
    }

    const token = generateToken({ id: user.id, role: user.role });
    const { password: _, email_verification_token: __, email_verification_expires: ___, ...safeUser } = user;

    return res.status(200).json({
      success: true,
      message: AUTH_MESSAGES.LOGIN_SUCCESS,
      data: { ...safeUser, must_change_password: !user.is_password_changed, token },
    });
  } catch (error) {
    console.error('Login error:', error.message);
    return res.status(500).json({ success: false, message: COMMON_MESSAGES.INTERNAL_SERVER_ERROR });
  }
};

// POST /api/auth/create-employee — Admin only
export const createEmployee = async (req, res) => {
  try {
    const { first_name, last_name, email, phone, department, designation, date_of_joining } = req.body;

    const existingEmail = await findByEmail(email);
    if (existingEmail) {
      return res.status(409).json({ success: false, message: AUTH_MESSAGES.EMAIL_REGISTERED });
    }

    const employee_id = await generateEmployeeId(first_name, last_name, date_of_joining);
    const tempPassword = generateTempPassword();

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(tempPassword, salt);

    const verificationToken = generateVerificationToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const newUser = await createUser({
      employee_id, first_name, last_name, email,
      password: hashedPassword, role: 'employee', phone, department, designation, date_of_joining,
      email_verification_token: verificationToken,
      email_verification_expires: verificationExpires,
    });

    await sendEmployeeWelcomeEmail(email, first_name, employee_id, tempPassword, verificationToken);

    return res.status(201).json({
      success: true,
      message: AUTH_MESSAGES.EMPLOYEE_CREATED,
      data: {
        id: newUser.id, employee_id: newUser.employee_id,
        email: newUser.email, role: newUser.role,
        temp_password: tempPassword,
        verification_token: verificationToken,
      },
    });
  } catch (error) {
    console.error('Create employee error:', error.message);
    return res.status(500).json({ success: false, message: COMMON_MESSAGES.INTERNAL_SERVER_ERROR });
  }
};

// PUT /api/auth/change-password — Logged-in user
export const changePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    const user = await findById(req.user.id);

    if (!user) return res.status(404).json({ success: false, message: AUTH_MESSAGES.USER_NOT_FOUND });

    const isMatch = await bcrypt.compare(current_password, user.password);
    if (!isMatch) return res.status(401).json({ success: false, message: AUTH_MESSAGES.PASSWORD_INCORRECT });

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(new_password, salt);

    await updateUser(user.id, { password: hashedPassword, is_password_changed: 1 });

    return res.status(200).json({ success: true, message: AUTH_MESSAGES.PASSWORD_CHANGED });
  } catch (error) {
    console.error('Change password error:', error.message);
    return res.status(500).json({ success: false, message: COMMON_MESSAGES.INTERNAL_SERVER_ERROR });
  }
};
