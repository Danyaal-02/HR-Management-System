import { useState, useEffect } from 'react'
import { useMyAttendance } from '../../../hooks/useAttendanceApi'
import './tabs.css'

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

function SalaryInfoTab({ employee, onUpdate, readOnly = false }) {
  const [wage, setWage] = useState(employee?.salary?.wage || 50000)
  const [workingDays, setWorkingDays] = useState(
    employee?.salary?.workingDays || 5
  )
  const [workingHours, setWorkingHours] = useState(
    employee?.salary?.workingHours || 40
  )

  // Percentages / Configuration values
  const [basicPct, setBasicPct] = useState(50) // 50% of Wage
  const [hraPct, setHraPct] = useState(50) // 50% of Basic
  const [stdAllowance, setStdAllowance] = useState(4167) // Fixed
  const [perfBonusPct, setPerfBonusPct] = useState(8.33) // 8.33% of Wage
  const [ltaPct, setLtaPct] = useState(8.33) // 8.33% of Wage
  // eslint-disable-next-line no-unused-vars
  const [pfRate, setPfRate] = useState(12) // 12% of Basic
  const [profTax, setProfTax] = useState(200) // Fixed 200

  // Editing state
  const [isEditing, setIsEditing] = useState(false)

  // Payslip generation state
  const [payslipMonth, setPayslipMonth] = useState(9) // October
  const [payslipYear, setPayslipYear] = useState(2025)

  // Build date range for the selected payslip month
  const startDate = `${payslipYear}-${String(payslipMonth + 1).padStart(2, '0')}-01`
  const lastDay = new Date(payslipYear, payslipMonth + 1, 0).getDate()
  const endDate = `${payslipYear}-${String(payslipMonth + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

  // Fetch attendance data for the selected month (employee's own stats)
  const { data: attendanceData } = useMyAttendance(
    { startDate, endDate },
    { enabled: !!employee }
  )

  const summary = attendanceData?.summary
  const stats = summary
    ? {
        presentDays: summary.days_present || 0,
        leaveDays: summary.days_leave || 0,
        totalWorkingDays: summary.total_working_days || 30,
        payableDays: (summary.days_present || 0) + (summary.days_leave || 0),
      }
    : { presentDays: 0, leaveDays: 0, totalWorkingDays: 30, payableDays: 30 }
  const payableDays = stats.payableDays
  const grossSalaryPayable = Math.round((wage / 30) * payableDays)

  // Calculations
  const basicSalary = Math.round((wage * basicPct) / 100)
  const hra = Math.round((basicSalary * hraPct) / 100)
  const performanceBonus = Math.round((wage * perfBonusPct) / 100)
  const lta = Math.round((wage * ltaPct) / 100)
  const totalOthers = basicSalary + hra + stdAllowance + performanceBonus + lta
  const fixedAllowance = wage - totalOthers

  const employerPF = Math.round((basicSalary * pfRate) / 100)
  const employeePF = Math.round((basicSalary * pfRate) / 100)

  useEffect(() => {
    if (employee?.salary) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setWage(employee.salary.wage || 50000)
      setWorkingDays(employee.salary.workingDays || 5)
      setWorkingHours(employee.salary.workingHours || 40)
    }
  }, [employee])

  const handleSave = () => {
    onUpdate({
      salary: {
        wage,
        workingDays,
        workingHours,
        basic: basicSalary,
        hra,
        standardAllowance: stdAllowance,
        performanceBonus,
        leaveTravelAllowance: lta,
        fixedAllowance,
      },
    })
    setIsEditing(false)
  }

  const handleCancel = () => {
    if (employee?.salary) {
      setWage(employee.salary.wage || 50000)
      setWorkingDays(employee.salary.workingDays || 5)
      setWorkingHours(employee.salary.workingHours || 40)
    }
    setIsEditing(false)
  }

  return (
    <div className="profile-tab-content salary-tab">
      {!readOnly && (
        <div className="salary-tab__header-actions">
          {isEditing ? (
            <>
              <button
                type="button"
                className="tab-action-btn tab-action-btn--save"
                onClick={handleSave}
              >
                Save Structure
              </button>
              <button
                type="button"
                className="tab-action-btn tab-action-btn--cancel"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              type="button"
              className="tab-action-btn tab-action-btn--edit"
              onClick={() => setIsEditing(true)}
            >
              Edit Salary Details
            </button>
          )}
        </div>
      )}

      {/* Salary Overview Card */}
      <div className="salary-summary-card">
        <div className="salary-summary-card__field">
          <label htmlFor="salary-wage-input">Monthly Wage (Base)</label>
          {isEditing && !readOnly ? (
            <input
              id="salary-wage-input"
              type="number"
              value={wage}
              onChange={(e) => setWage(Number(e.target.value))}
              className="salary-summary-card__input"
            />
          ) : (
            <span className="salary-summary-card__value">
              ₹ {wage.toLocaleString()} / Month
            </span>
          )}
        </div>

        <div className="salary-summary-card__field">
          <label>Yearly Wage</label>
          <span className="salary-summary-card__value">
            ₹ {(wage * 12).toLocaleString()} / Year
          </span>
        </div>

        <div className="salary-summary-card__field">
          <label htmlFor="salary-days-input">No. of working days</label>
          {isEditing && !readOnly ? (
            <input
              id="salary-days-input"
              type="number"
              value={workingDays}
              onChange={(e) => setWorkingDays(Number(e.target.value))}
              className="salary-summary-card__input"
            />
          ) : (
            <span className="salary-summary-card__value">
              {workingDays} Days / Week
            </span>
          )}
        </div>

        <div className="salary-summary-card__field">
          <label htmlFor="salary-hours-input">Working Hours</label>
          {isEditing && !readOnly ? (
            <input
              id="salary-hours-input"
              type="number"
              value={workingHours}
              onChange={(e) => setWorkingHours(Number(e.target.value))}
              className="salary-summary-card__input"
            />
          ) : (
            <span className="salary-summary-card__value">
              {workingHours} Hrs / Week
            </span>
          )}
        </div>
      </div>

      <div className="salary-tables-container">
        {/* Salary Components Table */}
        <div className="salary-table-section">
          <h3>Salary Components</h3>
          <table className="salary-table" id="salary-components-table">
            <thead>
              <tr>
                <th>Component</th>
                <th>Monthly Amount</th>
                <th>Calculation Formula / %</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="salary-table__name">Basic Salary</td>
                <td>₹ {basicSalary.toLocaleString()}</td>
                <td>
                  {isEditing && !readOnly ? (
                    <div className="salary-edit-cell">
                      <input
                        type="number"
                        value={basicPct}
                        onChange={(e) => setBasicPct(Number(e.target.value))}
                        step="1"
                      />
                      % of Wage
                    </div>
                  ) : (
                    `Defined Basic: ${basicPct}% of monthly wage`
                  )}
                </td>
              </tr>
              <tr>
                <td className="salary-table__name">
                  House Rent Allowance (HRA)
                </td>
                <td>₹ {hra.toLocaleString()}</td>
                <td>
                  {isEditing && !readOnly ? (
                    <div className="salary-edit-cell">
                      <input
                        type="number"
                        value={hraPct}
                        onChange={(e) => setHraPct(Number(e.target.value))}
                        step="1"
                      />
                      % of Basic
                    </div>
                  ) : (
                    `HRA provided to employees: ${hraPct}% of basic salary`
                  )}
                </td>
              </tr>
              <tr>
                <td className="salary-table__name">Standard Allowance</td>
                <td>₹ {stdAllowance.toLocaleString()}</td>
                <td>
                  {isEditing && !readOnly ? (
                    <div className="salary-edit-cell">
                      ₹
                      <input
                        type="number"
                        value={stdAllowance}
                        onChange={(e) =>
                          setStdAllowance(Number(e.target.value))
                        }
                      />
                    </div>
                  ) : (
                    `A predetermined, fixed monthly amount`
                  )}
                </td>
              </tr>
              <tr>
                <td className="salary-table__name">Performance Bonus</td>
                <td>₹ {performanceBonus.toLocaleString()}</td>
                <td>
                  {isEditing && !readOnly ? (
                    <div className="salary-edit-cell">
                      <input
                        type="number"
                        value={perfBonusPct}
                        onChange={(e) =>
                          setPerfBonusPct(Number(e.target.value))
                        }
                        step="0.01"
                      />
                      % of Wage
                    </div>
                  ) : (
                    `Variable amount: ${perfBonusPct}% of monthly wage`
                  )}
                </td>
              </tr>
              <tr>
                <td className="salary-table__name">
                  Leave Travel Allowance (LTA)
                </td>
                <td>₹ {lta.toLocaleString()}</td>
                <td>
                  {isEditing && !readOnly ? (
                    <div className="salary-edit-cell">
                      <input
                        type="number"
                        value={ltaPct}
                        onChange={(e) => setLtaPct(Number(e.target.value))}
                        step="0.01"
                      />
                      % of Wage
                    </div>
                  ) : (
                    `LTA paid to employee: ${ltaPct}% of monthly wage`
                  )}
                </td>
              </tr>
              <tr className="salary-table__fixed-row">
                <td className="salary-table__name">Fixed Allowance</td>
                <td className={fixedAllowance < 0 ? 'text-error' : ''}>
                  ₹ {fixedAllowance.toLocaleString()}
                </td>
                <td>
                  {fixedAllowance < 0 ? (
                    <span className="text-error font-semibold">
                      Error: Pct exceeds monthly wage!
                    </span>
                  ) : (
                    'Remaining amount (Wage - total of other components)'
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="salary-sidebar-sections">
          {/* Provident Fund Section */}
          <div className="salary-sidebar-card">
            <h3>Provident Fund (PF) Contribution</h3>
            <div className="salary-sidebar-field">
              <span>Employee Share ({pfRate}%)</span>
              <span className="salary-sidebar-value">
                ₹ {employeePF.toLocaleString()} / month
              </span>
            </div>
            <div className="salary-sidebar-field">
              <span>Employer Share ({pfRate}%)</span>
              <span className="salary-sidebar-value">
                ₹ {employerPF.toLocaleString()} / month
              </span>
            </div>
            <p className="salary-sidebar-note">
              PF is calculated based on the basic salary
            </p>
          </div>

          {/* Tax Deductions Section */}
          <div className="salary-sidebar-card">
            <h3>Tax Deductions</h3>
            <div className="salary-sidebar-field">
              <span>Professional Tax</span>
              {isEditing && !readOnly ? (
                <div className="salary-edit-cell">
                  ₹
                  <input
                    type="number"
                    value={profTax}
                    onChange={(e) => setProfTax(Number(e.target.value))}
                  />
                </div>
              ) : (
                <span className="salary-sidebar-value">
                  ₹ {profTax.toLocaleString()} / month
                </span>
              )}
            </div>
            <p className="salary-sidebar-note">
              Professional Tax deducted from the gross salary
            </p>
          </div>
        </div>
      </div>

      {/* Payslip Generation Section */}
      <div className="salary-payslip-section">
        <h3 className="salary-payslip-title">Payslip Generation</h3>
        <div className="salary-payslip-card">
          <div className="salary-payslip-controls">
            <div className="salary-payslip-field">
              <label htmlFor="payslip-month">Select Month</label>
              <select
                id="payslip-month"
                value={payslipMonth}
                onChange={(e) => setPayslipMonth(Number(e.target.value))}
                className="salary-payslip-select"
              >
                {MONTHS.map((m, i) => (
                  <option key={i} value={i}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div className="salary-payslip-field">
              <label htmlFor="payslip-year">Select Year</label>
              <select
                id="payslip-year"
                value={payslipYear}
                onChange={(e) => setPayslipYear(Number(e.target.value))}
                className="salary-payslip-select"
              >
                {[2024, 2025, 2026].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="salary-payslip-stats">
            <div className="payslip-stat">
              <span className="payslip-stat__label">Total Working Days</span>
              <span className="payslip-stat__val">
                {stats.totalWorkingDays} Days
              </span>
            </div>
            <div className="payslip-stat">
              <span className="payslip-stat__label">Days Present</span>
              <span className="payslip-stat__val">
                {stats.presentDays} Days
              </span>
            </div>
            <div className="payslip-stat">
              <span className="payslip-stat__label">Approved Leaves</span>
              <span className="payslip-stat__val">{stats.leaveDays} Days</span>
            </div>
            <div className="payslip-stat payslip-stat--highlight">
              <span className="payslip-stat__label">Total Payable Days</span>
              <span className="payslip-stat__val">{payableDays} Days</span>
            </div>
          </div>

          <div className="salary-payslip-divider"></div>

          <div className="salary-payslip-summary">
            <div className="payslip-summary-row">
              <span>Base Monthly Wage</span>
              <span className="font-semibold">₹ {wage.toLocaleString()}</span>
            </div>
            <div className="payslip-summary-row">
              <span>Deductions (Unpaid Leaves / Absences)</span>
              <span className="text-error font-semibold">
                - ₹{' '}
                {Math.max(
                  0,
                  Math.round((wage / 30) * (30 - payableDays))
                ).toLocaleString()}
              </span>
            </div>
            <div className="payslip-summary-row payslip-summary-row--total">
              <span>Gross Salary Payable</span>
              <span className="payslip-total-amount">
                ₹ {grossSalaryPayable.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SalaryInfoTab
