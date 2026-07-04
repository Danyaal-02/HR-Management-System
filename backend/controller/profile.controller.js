import { findById, updateUser, findAllUsers } from '../db/user.js';
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
import { PROFILE_MESSAGES, COMMON_MESSAGES } from '../constants/messages.js';

const parseNumericSetting = (val, defaultValue) => {
  if (val === undefined || val === null || val === '') return defaultValue;
  const parsed = parseFloat(val);
  return isNaN(parsed) ? defaultValue : parsed;
};

// Helper to compute salary components based on monthly wage
export const calculateSalaryDetails = (monthWageStr, customSettings = {}) => {
  const month_wage = parseFloat(monthWageStr) || 0.00;
  const yearly_wage = month_wage * 12;

  const basic_salary_type = customSettings.basic_salary_type || 'percent';
  const basic_salary_value = parseNumericSetting(customSettings.basic_salary_value, 50.00);

  const hra_type = customSettings.hra_type || 'percent';
  const hra_value = parseNumericSetting(customSettings.hra_value, 50.00);

  const standard_allowance = parseNumericSetting(customSettings.standard_allowance, 4167.00);

  const performance_bonus_type = customSettings.performance_bonus_type || 'percent';
  const performance_bonus_value = parseNumericSetting(customSettings.performance_bonus_value, 8.33);

  const lta_type = customSettings.lta_type || 'percent';
  const lta_value = parseNumericSetting(customSettings.lta_value, 8.33);

  const pf_rate = parseNumericSetting(customSettings.pf_rate, 12.00);
  const prof_tax = parseNumericSetting(customSettings.prof_tax, 200.00);

  // 1. Calculate Basic
  let basic = 0;
  if (basic_salary_type === 'percent') {
    basic = month_wage * (basic_salary_value / 100);
  } else {
    basic = basic_salary_value;
  }

  // 2. Calculate HRA (Percent is of Basic, not Month Wage)
  let hra = 0;
  if (hra_type === 'percent') {
    hra = basic * (hra_value / 100);
  } else {
    hra = hra_value;
  }

  // 3. Calculate Performance Bonus
  let bonus = 0;
  if (performance_bonus_type === 'percent') {
    bonus = month_wage * (performance_bonus_value / 100);
  } else {
    bonus = performance_bonus_value;
  }

  // 4. Calculate LTA
  let lta = 0;
  if (lta_type === 'percent') {
    lta = month_wage * (lta_value / 100);
  } else {
    lta = lta_value;
  }

  // 5. Fixed Allowance = Month Wage - (Basic + HRA + Standard Allowance + Performance Bonus + LTA)
  const totalAllowances = basic + hra + standard_allowance + bonus + lta;
  const fixed_allowance = Math.max(0, month_wage - totalAllowances);

  // 6. PF Calculations
  const employee_pf = basic * (pf_rate / 100);
  const employer_pf = basic * (pf_rate / 100);

  return {
    month_wage,
    yearly_wage,
    basic_salary_type,
    basic_salary_value,
    hra_type,
    hra_value,
    standard_allowance,
    performance_bonus_type,
    performance_bonus_value,
    lta_type,
    lta_value,
    fixed_allowance,
    pf_rate,
    prof_tax,
    calculated: {
      basic,
      hra,
      standard_allowance,
      performance_bonus: bonus,
      lta,
      fixed_allowance,
      employee_pf,
      employer_pf,
      prof_tax
    }
  };
};

// @desc    Get profile for self or any employee
// @route   GET /api/profile/:userId
export const getProfile = async (req, res) => {
  try {
    const targetUserId = parseInt(req.params.userId);
    const requestUserId = req.user.id;
    const requestUserRole = req.user.role;

    // Authorization check: Regular employee can only view their own profile
    if (requestUserRole !== 'admin' && requestUserId !== targetUserId) {
      return res.status(403).json({
        success: false,
        message: PROFILE_MESSAGES.ACCESS_DENIED_VIEW,
      });
    }

    const user = await findById(targetUserId);
    if (!user) {
      return res.status(404).json({ success: false, message: PROFILE_MESSAGES.USER_NOT_FOUND });
    }

    const profile = await getProfileByUserId(targetUserId);
    const skills = await getSkillsByUserId(targetUserId);
    const certifications = await getCertificationsByUserId(targetUserId);

    // Only fetch salary details if request user is Admin
    let salary = null;
    if (requestUserRole === 'admin') {
      const dbSalary = await getSalaryByUserId(targetUserId);
      if (dbSalary) {
        salary = calculateSalaryDetails(dbSalary.month_wage, dbSalary);
      }
    }

    const { password, email_verification_token, email_verification_expires, ...safeUser } = user;

    return res.status(200).json({
      success: true,
      data: {
        user: safeUser,
        profile,
        skills,
        certifications,
        salary,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error.message);
    return res.status(500).json({ success: false, message: COMMON_MESSAGES.INTERNAL_SERVER_ERROR });
  }
};

// @desc    Update employee profile (Private Info, Hobbies, Skills, Certifications, Files)
// @route   PUT /api/profile/:userId
export const updateProfile = async (req, res) => {
  try {
    const targetUserId = parseInt(req.params.userId);
    const requestUserId = req.user.id;
    const requestUserRole = req.user.role;

    // Authorization check: Regular employee can only update their own profile
    if (requestUserRole !== 'admin' && requestUserId !== targetUserId) {
      return res.status(403).json({
        success: false,
        message: PROFILE_MESSAGES.ACCESS_DENIED_EDIT,
      });
    }

    const user = await findById(targetUserId);
    if (!user) {
      return res.status(404).json({ success: false, message: PROFILE_MESSAGES.USER_NOT_FOUND });
    }

    // Extracted payload fields
    const {
      first_name, last_name, phone, address, department, designation, date_of_joining, // Users table
      dob, residing_address, nationality, personal_email, gender, marital_status, about, interests_hobbies, // Profiles table
      account_number, bank_name, ifsc_code, pan_no, uan_no, // Bank details
      skills, certifications // Arrays
    } = req.body;

    // 1. Update Users Table (Fields allowed depending on Role)
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
      // Employees can update their own phone and address
      if (phone) userUpdates.phone = phone;
      if (address) userUpdates.address = address;
    }

    // Handle Cloudinary profile picture upload
    if (req.files && req.files['profile_picture']) {
      userUpdates.profile_picture = req.files['profile_picture'][0].path;
    }

    if (Object.keys(userUpdates).length > 0) {
      await updateUser(targetUserId, userUpdates);
    }

    // 2. Update Employee Profiles Table (Fields allowed depending on Role)
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
      // Employees can only edit non-sensitive fields
      if (residing_address) profileUpdates.residing_address = residing_address;
      if (personal_email) profileUpdates.personal_email = personal_email;
      if (about) profileUpdates.about = about;
      if (interests_hobbies) profileUpdates.interests_hobbies = interests_hobbies;
    }

    // Handle Cloudinary resume upload
    if (req.files && req.files['resume']) {
      profileUpdates.resume = req.files['resume'][0].path;
    }

    if (Object.keys(profileUpdates).length > 0) {
      await createOrUpdateProfile(targetUserId, profileUpdates);
    }

    // 3. Update Skills (parsed from JSON string or received as array)
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

    // 4. Update Certifications
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

    return res.status(200).json({
      success: true,
      message: PROFILE_MESSAGES.PROFILE_UPDATED,
    });
  } catch (error) {
    console.error('Update profile error:', error.message);
    return res.status(500).json({ success: false, message: COMMON_MESSAGES.INTERNAL_SERVER_ERROR });
  }
};

// @desc    Update employee salary details (Admin only)
// @route   PUT /api/profile/salary/:userId
export const updateSalary = async (req, res) => {
  try {
    const targetUserId = parseInt(req.params.userId);

    const user = await findById(targetUserId);
    if (!user) {
      return res.status(404).json({ success: false, message: PROFILE_MESSAGES.USER_NOT_FOUND });
    }

    const {
      month_wage,
      working_days,
      basic_salary_type,
      basic_salary_value,
      hra_type,
      hra_value,
      standard_allowance,
      performance_bonus_type,
      performance_bonus_value,
      lta_type,
      lta_value,
      pf_rate,
      prof_tax,
    } = req.body;

    if (month_wage === undefined) {
      return res.status(400).json({ success: false, message: PROFILE_MESSAGES.MONTH_WAGE_REQUIRED });
    }

    const computed = calculateSalaryDetails(month_wage, {
      basic_salary_type,
      basic_salary_value,
      hra_type,
      hra_value,
      standard_allowance,
      performance_bonus_type,
      performance_bonus_value,
      lta_type,
      lta_value,
      pf_rate,
      prof_tax,
    });

    // Save to database
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

    return res.status(200).json({
      success: true,
      message: PROFILE_MESSAGES.SALARY_UPDATED,
      data: computed,
    });
  } catch (error) {
    console.error('Update salary error:', error.message);
    return res.status(500).json({ success: false, message: COMMON_MESSAGES.INTERNAL_SERVER_ERROR });
  }
};

// @desc    Get list of employees for Landing Dashboard
// @route   GET /api/profile/list
export const getDashboardEmployees = async (req, res) => {
  try {
    const users = await findAllUsers();

    // Mapping users to include a default/mock attendance status indicator
    // (Green dot: present, Airplane icon: leave, Yellow dot: absent)
    const data = users.map((user) => {
      return {
        id: user.id,
        employee_id: user.employee_id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        department: user.department,
        designation: user.designation,
        date_of_joining: user.date_of_joining,
        profile_picture: user.profile_picture,
        // Mock attendance/work status for now:
        // Will be updated when Attendance/Leave tables are fully integrated
        work_status: 'absent' // Default work_status
      };
    });

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Get employees list error:', error.message);
    return res.status(500).json({ success: false, message: COMMON_MESSAGES.INTERNAL_SERVER_ERROR });
  }
};
