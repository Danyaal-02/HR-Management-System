/**
 * Safely parse a numeric setting, falling back to a default value if invalid
 * @param {any} val Value to parse
 * @param {number} defaultValue Fallback value
 * @returns {number} Parsed float or default
 */
export const parseNumericSetting = (val, defaultValue) => {
  if (val === undefined || val === null || val === '') return defaultValue;
  const parsed = parseFloat(val);
  return isNaN(parsed) ? defaultValue : parsed;
};

/**
 * Compute salary details (Basic, HRA, Standard Allowance, Performance Bonus, LTA, Fixed Allowance, PF)
 * @param {number|string} monthWageStr Base monthly salary
 * @param {object} customSettings Custom percentages/values
 * @returns {object} Computed salary breakdown
 */
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
