import bcrypt from 'bcrypt';
import {
  createUser, findByEmail, findByEmployeeId, findById,
  updateUser, generateEmployeeId, findByVerificationToken,
} from '../db/user.js';
import { createCompany } from '../db/company.js';
import { generateToken } from '../utils/generateToken.js';
import { sendVerificationEmail, sendEmployeeWelcomeEmail } from '../utils/sendMail.js';
import { generateTempPassword } from '../utils/password.util.js';
import { generateVerificationToken } from '../utils/token.util.js';
import { AUTH_MESSAGES } from '../constants/messages.js';

export const signupService = async ({ company_name, first_name, last_name, email, phone, password }) => {
  const existingEmail = await findByEmail(email);
  if (existingEmail) {
    const err = new Error(AUTH_MESSAGES.EMAIL_REGISTERED);
    err.status = 409;
    throw err;
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

  return {
    id: newUser.id,
    employee_id: newUser.employee_id,
    email: newUser.email,
    role: newUser.role,
  };
};

export const verifyEmailService = async (token) => {
  const user = await findByVerificationToken(token);
  if (!user) {
    const err = new Error(AUTH_MESSAGES.INVALID_VERIFY_TOKEN);
    err.status = 400;
    throw err;
  }

  await updateUser(user.id, {
    is_email_verified: 1,
    email_verification_token: null,
    email_verification_expires: null,
  });

  return true;
};

export const loginService = async (login_id, password) => {
  let user = await findByEmployeeId(login_id);
  if (!user) user = await findByEmail(login_id);

  if (!user) {
    const err = new Error(AUTH_MESSAGES.INVALID_CREDENTIALS);
    err.status = 401;
    throw err;
  }

  if (!user.is_email_verified) {
    const err = new Error(AUTH_MESSAGES.EMAIL_VERIFY_PENDING);
    err.status = 403;
    throw err;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const err = new Error(AUTH_MESSAGES.INVALID_CREDENTIALS);
    err.status = 401;
    throw err;
  }

  const token = generateToken({ id: user.id, role: user.role });
  const { password: _, email_verification_token: __, email_verification_expires: ___, ...safeUser } = user;

  return { ...safeUser, must_change_password: !user.is_password_changed, token };
};

export const createEmployeeService = async ({ first_name, last_name, email, phone, department, designation, date_of_joining }) => {
  const existingEmail = await findByEmail(email);
  if (existingEmail) {
    const err = new Error(AUTH_MESSAGES.EMAIL_REGISTERED);
    err.status = 409;
    throw err;
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

  return {
    id: newUser.id, employee_id: newUser.employee_id,
    email: newUser.email, role: newUser.role,
  };
};

export const changePasswordService = async (userId, current_password, new_password) => {
  const user = await findById(userId);

  if (!user) {
    const err = new Error(AUTH_MESSAGES.USER_NOT_FOUND);
    err.status = 404;
    throw err;
  }

  const isMatch = await bcrypt.compare(current_password, user.password);
  if (!isMatch) {
    const err = new Error(AUTH_MESSAGES.PASSWORD_INCORRECT);
    err.status = 401;
    throw err;
  }

  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(new_password, salt);

  await updateUser(user.id, { password: hashedPassword, is_password_changed: 1 });
  
  return true;
};
