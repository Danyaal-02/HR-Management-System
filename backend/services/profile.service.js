import { findById, updateUser } from '../db/user.js';
import {
  getProfileByUserId,
  createOrUpdateProfile,
  getSkillsByUserId,
  setSkillsByUserId,
  getCertificationsByUserId,
  setCertificationsByUserId,
  getSalaryByUserId,
  createOrUpdateSalary,
} from '../db/profile.js';
import { getEmployeesWithTodayStatus } from '../db/attendance.js';
import { calculateSalaryDetails } from '../utils/salary.util.js';
import { getLocalDateString } from '../utils/date.util.js';
import { PROFILE_MESSAGES } from '../constants/messages.js';

export const getProfileService = async (targetUserId, requestUserId, requestUserRole) => {
  if (requestUserRole !== 'admin' && requestUserId !== targetUserId) {
    const err = new Error(PROFILE_MESSAGES.ACCESS_DENIED_VIEW);
    err.status = 403;
    throw err;
  }

  const user = await findById(targetUserId);
  if (!user) {
    const err = new Error(PROFILE_MESSAGES.USER_NOT_FOUND);
    err.status = 404;
    throw err;
  }

  const profile = await getProfileByUserId(targetUserId);
  const skills = await getSkillsByUserId(targetUserId);
  const certifications = await getCertificationsByUserId(targetUserId);

  let salary = null;
  if (requestUserRole === 'admin') {
    const dbSalary = await getSalaryByUserId(targetUserId);
    if (dbSalary) {
      salary = calculateSalaryDetails(dbSalary.month_wage, dbSalary);
    }
  }

  const { password, email_verification_token, email_verification_expires, ...safeUser } = user;

  return {
    user: safeUser,
    profile,
    skills,
    certifications,
    salary,
  };
};

export const updateProfileService = async (targetUserId, requestUserId, requestUserRole, data, files) => {
  if (requestUserRole !== 'admin' && requestUserId !== targetUserId) {
    const err = new Error(PROFILE_MESSAGES.ACCESS_DENIED_EDIT);
    err.status = 403;
    throw err;
  }

  const user = await findById(targetUserId);
  if (!user) {
    const err = new Error(PROFILE_MESSAGES.USER_NOT_FOUND);
    err.status = 404;
    throw err;
  }

  const {
    first_name, last_name, phone, address, department, designation, date_of_joining,
    dob, residing_address, nationality, personal_email, gender, marital_status, about, interests_hobbies,
    account_number, bank_name, ifsc_code, pan_no, uan_no,
    skills, certifications
  } = data;

  const userUpdates = {};
  if (requestUserRole === 'admin') {
    if (first_name) userUpdates.first_name = first_name;
    if (last_name) userUpdates.last_name = last_name;
    if (phone) userUpdates.phone = phone;
    if (address) userUpdates.address = address;
    if (department) userUpdates.department = department;
    if (designation) userUpdates.designation = designation;
    if (date_of_joining) userUpdates.date_of_joining = date_of_joining;
  } else {
    if (phone) userUpdates.phone = phone;
    if (address) userUpdates.address = address;
  }

  if (files && files['profile_picture']) {
    userUpdates.profile_picture = files['profile_picture'][0].path;
  }

  if (Object.keys(userUpdates).length > 0) {
    await updateUser(targetUserId, userUpdates);
  }

  const profileUpdates = {};
  if (requestUserRole === 'admin') {
    if (dob) profileUpdates.dob = dob;
    if (residing_address) profileUpdates.residing_address = residing_address;
    if (nationality) profileUpdates.nationality = nationality;
    if (personal_email) profileUpdates.personal_email = personal_email;
    if (gender) profileUpdates.gender = gender;
    if (marital_status) profileUpdates.marital_status = marital_status;
    if (about) profileUpdates.about = about;
    if (interests_hobbies) profileUpdates.interests_hobbies = interests_hobbies;
    if (account_number) profileUpdates.account_number = account_number;
    if (bank_name) profileUpdates.bank_name = bank_name;
    if (ifsc_code) profileUpdates.ifsc_code = ifsc_code;
    if (pan_no) profileUpdates.pan_no = pan_no;
    if (uan_no) profileUpdates.uan_no = uan_no;
  } else {
    if (residing_address) profileUpdates.residing_address = residing_address;
    if (personal_email) profileUpdates.personal_email = personal_email;
    if (about) profileUpdates.about = about;
    if (interests_hobbies) profileUpdates.interests_hobbies = interests_hobbies;
  }

  if (files && files['resume']) {
    profileUpdates.resume = files['resume'][0].path;
  }

  if (Object.keys(profileUpdates).length > 0) {
    await createOrUpdateProfile(targetUserId, profileUpdates);
  }

  if (skills) {
    let skillsArray = skills;
    if (typeof skills === 'string') {
      try {
        skillsArray = JSON.parse(skills);
      } catch (e) {
        skillsArray = skills.split(',').map((s) => s.trim());
      }
    }
    await setSkillsByUserId(targetUserId, skillsArray);
  }

  if (certifications) {
    let certsArray = certifications;
    if (typeof certifications === 'string') {
      try {
        certsArray = JSON.parse(certifications);
      } catch (e) {
        certsArray = certifications.split(',').map((c) => c.trim());
      }
    }
    await setCertificationsByUserId(targetUserId, certsArray);
  }

  return true;
};

export const updateSalaryService = async (targetUserId, data) => {
  const user = await findById(targetUserId);
  if (!user) {
    const err = new Error(PROFILE_MESSAGES.USER_NOT_FOUND);
    err.status = 404;
    throw err;
  }

  const {
    month_wage, working_days,
    basic_salary_type, basic_salary_value,
    hra_type, hra_value, standard_allowance,
    performance_bonus_type, performance_bonus_value,
    lta_type, lta_value, pf_rate, prof_tax,
  } = data;

  if (month_wage === undefined) {
    const err = new Error(PROFILE_MESSAGES.MONTH_WAGE_REQUIRED);
    err.status = 400;
    throw err;
  }

  const computed = calculateSalaryDetails(month_wage, {
    basic_salary_type, basic_salary_value,
    hra_type, hra_value, standard_allowance,
    performance_bonus_type, performance_bonus_value,
    lta_type, lta_value, pf_rate, prof_tax,
  });

  await createOrUpdateSalary(targetUserId, {
    month_wage: computed.month_wage,
    yearly_wage: computed.yearly_wage,
    working_days: working_days || 5,
    basic_salary_type: computed.basic_salary_type,
    basic_salary_value: computed.basic_salary_value,
    hra_type: computed.hra_type,
    hra_value: computed.hra_value,
    standard_allowance: computed.standard_allowance,
    performance_bonus_type: computed.performance_bonus_type,
    performance_bonus_value: computed.performance_bonus_value,
    lta_type: computed.lta_type,
    lta_value: computed.lta_value,
    fixed_allowance: computed.fixed_allowance,
    pf_rate: computed.pf_rate,
    prof_tax: computed.prof_tax,
  });

  return computed;
};

export const getDashboardEmployeesService = async (page, limit, search) => {
  const today = getLocalDateString();
  const offset = (page - 1) * limit;

  const { rows, total } = await getEmployeesWithTodayStatus(today, { search, limit, offset });

  const data = rows.map((emp) => {
    let work_status = 'absent';
    if (emp.today_status === 'present' || emp.today_status === 'half-day') {
      work_status = 'present';
    } else if (emp.today_status === 'leave') {
      work_status = 'leave';
    }

    return {
      id: emp.id,
      employee_id: emp.employee_id,
      first_name: emp.first_name,
      last_name: emp.last_name,
      email: emp.email,
      role: emp.role,
      phone: emp.phone,
      department: emp.department,
      designation: emp.designation,
      date_of_joining: emp.date_of_joining,
      profile_picture: emp.profile_picture,
      work_status,
      check_in: emp.check_in,
      check_out: emp.check_out,
    };
  });

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};
