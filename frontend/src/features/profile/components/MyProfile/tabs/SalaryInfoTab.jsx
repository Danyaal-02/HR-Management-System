import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMyAttendance } from '../../../../../features/attendance'
import { salarySchema } from '../../../schemas/profile.schema'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function SalaryInfoTab({ employee, onUpdate, readOnly = false }) {
  const [isEditing, setIsEditing] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(salarySchema),
    defaultValues: {
      wage: employee?.salary?.wage || 50000,
      workingDays: employee?.salary?.workingDays || 5,
      workingHours: employee?.salary?.workingHours || 40,
      basicPct: 50,
      hraPct: 50,
      stdAllowance: 4167,
      perfBonusPct: 8.33,
      ltaPct: 8.33,
      pfRate: 12,
      profTax: 200,
    },
  })

  // Watch values for live calculations
  const formValues = watch()
  const wage = formValues.wage || 0
  const workingDays = formValues.workingDays || 0
  const workingHours = formValues.workingHours || 0
  const basicPct = formValues.basicPct || 0
  const hraPct = formValues.hraPct || 0
  const stdAllowance = formValues.stdAllowance || 0
  const perfBonusPct = formValues.perfBonusPct || 0
  const ltaPct = formValues.ltaPct || 0
  const pfRate = formValues.pfRate || 0
  const profTax = formValues.profTax || 0

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
        totalWorkingDays: summary.total_working_days || lastDay,
        payableDays: (summary.days_present || 0) + (summary.days_leave || 0),
      }
    : { presentDays: 0, leaveDays: 0, totalWorkingDays: lastDay, payableDays: lastDay }
  
  const payableDays = stats.payableDays
  const deductions = Math.max(0, Math.round((wage / lastDay) * (lastDay - payableDays)))
  const grossSalaryPayable = wage - deductions

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
      reset({
        ...formValues,
        wage: employee.salary.wage || 50000,
        workingDays: employee.salary.workingDays || 5,
        workingHours: employee.salary.workingHours || 40,
      })
    }
  }, [employee, reset])

  const onSubmit = (data) => {
    onUpdate({
      salary: {
        wage: data.wage,
        workingDays: data.workingDays,
        workingHours: data.workingHours,
        basic: Math.round((data.wage * data.basicPct) / 100),
        hra: Math.round((Math.round((data.wage * data.basicPct) / 100) * data.hraPct) / 100),
        standardAllowance: data.stdAllowance,
        performanceBonus: Math.round((data.wage * data.perfBonusPct) / 100),
        leaveTravelAllowance: Math.round((data.wage * data.ltaPct) / 100),
        fixedAllowance: data.wage - (Math.round((data.wage * data.basicPct) / 100) + Math.round((Math.round((data.wage * data.basicPct) / 100) * data.hraPct) / 100) + data.stdAllowance + Math.round((data.wage * data.perfBonusPct) / 100) + Math.round((data.wage * data.ltaPct) / 100)),
      },
    })
    setIsEditing(false)
  }

  const handleCancel = () => {
    reset({
      ...formValues,
      wage: employee?.salary?.wage || 50000,
      workingDays: employee?.salary?.workingDays || 5,
      workingHours: employee?.salary?.workingHours || 40,
    })
    setIsEditing(false)
  }

  return (
    <form className="animate-tab-fade-in pt-4 flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
      {!readOnly && (
        <div className="flex justify-end mb-5 gap-2">
          {isEditing ? (
            <>
              <button
                type="submit"
                className="px-4 py-2 text-[0.85rem] font-semibold rounded-sm transition-all duration-200 bg-status-success text-white hover:opacity-90"
              >
                Save Structure
              </button>
              <button
                type="button"
                className="px-4 py-2 text-[0.85rem] font-semibold rounded-sm transition-all duration-200 bg-transparent text-text-secondary border border-border-color hover:text-text-primary hover:bg-white/5 ml-2"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              type="button"
              className="px-4 py-2 text-[0.85rem] font-semibold rounded-sm transition-all duration-200 bg-primary-purple/10 text-text-link border border-primary-purple/20 hover:bg-gradient-primary hover:text-white hover:border-transparent"
              onClick={() => setIsEditing(true)}
            >
              Edit Salary Details
            </button>
          )}
        </div>
      )}

      {/* Salary Overview Card */}
      <div className="bg-bg-card border border-border-color rounded-lg p-6 grid grid-cols-4 max-md:grid-cols-2 gap-5 mb-6">
        <div className="flex flex-col justify-center">
          <label className="text-[0.75rem] font-bold text-text-muted uppercase tracking-[0.5px]" htmlFor="salary-wage-input">Monthly Wage (Base)</label>
          {isEditing && !readOnly ? (
            <input
              id="salary-wage-input"
              type="number"
              {...register('wage')}
              className="bg-bg-input border border-border-color rounded-md text-text-primary px-3 py-1.5 text-base font-semibold mt-1 max-w-[150px] focus:border-primary-purple focus:outline-none"
            />
          ) : (
            <span className="text-[1.15rem] font-bold text-text-primary mt-1.5">
              ₹ {wage.toLocaleString()} / Month
            </span>
          )}
        </div>

        <div className="flex flex-col justify-center">
          <label className="text-[0.75rem] font-bold text-text-muted uppercase tracking-[0.5px]">Yearly Wage</label>
          <span className="text-[1.15rem] font-bold text-text-primary mt-1.5">
            ₹ {(wage * 12).toLocaleString()} / Year
          </span>
        </div>

        <div className="flex flex-col justify-center">
          <label className="text-[0.75rem] font-bold text-text-muted uppercase tracking-[0.5px]" htmlFor="salary-days-input">No. of working days</label>
          {isEditing && !readOnly ? (
            <input
              id="salary-days-input"
              type="number"
              {...register('workingDays')}
              className="bg-bg-input border border-border-color rounded-md text-text-primary px-3 py-1.5 text-base font-semibold mt-1 max-w-[150px] focus:border-primary-purple focus:outline-none"
            />
          ) : (
            <span className="text-[1.15rem] font-bold text-text-primary mt-1.5">
              {workingDays} Days / Week
            </span>
          )}
        </div>

        <div className="flex flex-col justify-center">
          <label className="text-[0.75rem] font-bold text-text-muted uppercase tracking-[0.5px]" htmlFor="salary-hours-input">Working Hours</label>
          {isEditing && !readOnly ? (
            <input
              id="salary-hours-input"
              type="number"
              {...register('workingHours')}
              className="bg-bg-input border border-border-color rounded-md text-text-primary px-3 py-1.5 text-base font-semibold mt-1 max-w-[150px] focus:border-primary-purple focus:outline-none"
            />
          ) : (
            <span className="text-[1.15rem] font-bold text-text-primary mt-1.5">
              {workingHours} Hrs / Week
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-[2fr_1fr] max-lg:grid-cols-1 gap-6 items-start">
        {/* Salary Components Table */}
        <div className="bg-bg-card border border-border-color rounded-lg p-6">
          <h3 className="text-[1.1rem] font-semibold text-text-primary mb-4">Salary Components</h3>
          <table className="w-full border-collapse" id="salary-components-table">
            <thead>
              <tr>
                <th className="text-left text-[0.78rem] font-bold text-text-muted uppercase px-4 py-3 border-b border-border-color">Component</th>
                <th className="text-left text-[0.78rem] font-bold text-text-muted uppercase px-4 py-3 border-b border-border-color">Monthly Amount</th>
                <th className="text-left text-[0.78rem] font-bold text-text-muted uppercase px-4 py-3 border-b border-border-color">Calculation Formula / %</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-semibold px-4 py-4 border-b border-white/3 text-[0.9rem] text-text-primary">Basic Salary</td>
                <td className="px-4 py-4 border-b border-white/3 text-[0.9rem] text-text-primary">₹ {basicSalary.toLocaleString()}</td>
                <td className="px-4 py-4 border-b border-white/3 text-[0.9rem] text-text-primary">
                  {isEditing && !readOnly ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        {...register('basicPct')}
                        step="1"
                        className="bg-bg-input border border-border-color rounded-sm text-text-primary w-[70px] px-2 py-1 text-[0.85rem] text-center focus:border-primary-purple focus:outline-none"
                      />
                      % of Wage
                    </div>
                  ) : (
                    `Defined Basic: ${basicPct}% of monthly wage`
                  )}
                </td>
              </tr>
              <tr>
                <td className="font-semibold px-4 py-4 border-b border-white/3 text-[0.9rem] text-text-primary">
                  House Rent Allowance (HRA)
                </td>
                <td className="px-4 py-4 border-b border-white/3 text-[0.9rem] text-text-primary">₹ {hra.toLocaleString()}</td>
                <td className="px-4 py-4 border-b border-white/3 text-[0.9rem] text-text-primary">
                  {isEditing && !readOnly ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        {...register('hraPct')}
                        step="1"
                        className="bg-bg-input border border-border-color rounded-sm text-text-primary w-[70px] px-2 py-1 text-[0.85rem] text-center focus:border-primary-purple focus:outline-none"
                      />
                      % of Basic
                    </div>
                  ) : (
                    `HRA provided to employees: ${hraPct}% of basic salary`
                  )}
                </td>
              </tr>
              <tr>
                <td className="font-semibold px-4 py-4 border-b border-white/3 text-[0.9rem] text-text-primary">Standard Allowance</td>
                <td className="px-4 py-4 border-b border-white/3 text-[0.9rem] text-text-primary">₹ {stdAllowance.toLocaleString()}</td>
                <td className="px-4 py-4 border-b border-white/3 text-[0.9rem] text-text-primary">
                  {isEditing && !readOnly ? (
                    <div className="flex items-center gap-2">
                      ₹
                      <input
                        type="number"
                        {...register('stdAllowance')}
                        className="bg-bg-input border border-border-color rounded-sm text-text-primary w-[70px] px-2 py-1 text-[0.85rem] text-center focus:border-primary-purple focus:outline-none"
                      />
                    </div>
                  ) : (
                    `A predetermined, fixed monthly amount`
                  )}
                </td>
              </tr>
              <tr>
                <td className="font-semibold px-4 py-4 border-b border-white/3 text-[0.9rem] text-text-primary">Performance Bonus</td>
                <td className="px-4 py-4 border-b border-white/3 text-[0.9rem] text-text-primary">₹ {performanceBonus.toLocaleString()}</td>
                <td className="px-4 py-4 border-b border-white/3 text-[0.9rem] text-text-primary">
                  {isEditing && !readOnly ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        {...register('perfBonusPct')}
                        step="0.01"
                        className="bg-bg-input border border-border-color rounded-sm text-text-primary w-[70px] px-2 py-1 text-[0.85rem] text-center focus:border-primary-purple focus:outline-none"
                      />
                      % of Wage
                    </div>
                  ) : (
                    `Variable amount: ${perfBonusPct}% of monthly wage`
                  )}
                </td>
              </tr>
              <tr>
                <td className="font-semibold px-4 py-4 border-b border-white/3 text-[0.9rem] text-text-primary">
                  Leave Travel Allowance (LTA)
                </td>
                <td className="px-4 py-4 border-b border-white/3 text-[0.9rem] text-text-primary">₹ {lta.toLocaleString()}</td>
                <td className="px-4 py-4 border-b border-white/3 text-[0.9rem] text-text-primary">
                  {isEditing && !readOnly ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        {...register('ltaPct')}
                        step="0.01"
                        className="bg-bg-input border border-border-color rounded-sm text-text-primary w-[70px] px-2 py-1 text-[0.85rem] text-center focus:border-primary-purple focus:outline-none"
                      />
                      % of Wage
                    </div>
                  ) : (
                    `LTA paid to employee: ${ltaPct}% of monthly wage`
                  )}
                </td>
              </tr>
              <tr className="bg-primary-purple/3">
                <td className="font-semibold px-4 py-4 border-b border-white/3 text-[0.9rem] text-text-primary">Fixed Allowance</td>
                <td className={`px-4 py-4 border-b border-white/3 text-[0.9rem] ${fixedAllowance < 0 ? 'text-status-error font-semibold' : 'text-text-primary'}`}>
                  ₹ {fixedAllowance.toLocaleString()}
                </td>
                <td className="px-4 py-4 border-b border-white/3 text-[0.9rem] text-text-primary">
                  {fixedAllowance < 0 ? (
                    <span className="text-status-error font-semibold">
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

        <div className="flex flex-col gap-6">
          {/* Provident Fund Section */}
          <div className="bg-bg-card border border-border-color rounded-lg p-6">
            <h3 className="text-base font-semibold text-text-primary mb-4 border-b border-white/5 pb-2">Provident Fund (PF) Contribution</h3>
            <div className="flex justify-between items-center mb-3 text-[0.88rem] text-text-secondary">
              <span>Employee Share ({pfRate}%)</span>
              <span className="font-bold text-text-primary">
                ₹ {employeePF.toLocaleString()} / month
              </span>
            </div>
            <div className="flex justify-between items-center mb-3 text-[0.88rem] text-text-secondary">
              <span>Employer Share ({pfRate}%)</span>
              <span className="font-bold text-text-primary">
                ₹ {employerPF.toLocaleString()} / month
              </span>
            </div>
            <p className="text-[0.72rem] text-text-muted italic mt-3">
              PF is calculated based on the basic salary
            </p>
          </div>

          {/* Tax Deductions Section */}
          <div className="bg-bg-card border border-border-color rounded-lg p-6">
            <h3 className="text-base font-semibold text-text-primary mb-4 border-b border-white/5 pb-2">Tax Deductions</h3>
            <div className="flex justify-between items-center mb-3 text-[0.88rem] text-text-secondary">
              <span>Professional Tax</span>
              {isEditing && !readOnly ? (
                <div className="flex items-center gap-2">
                  ₹
                  <input
                    type="number"
                    {...register('profTax')}
                    className="bg-bg-input border border-border-color rounded-sm text-text-primary w-[70px] px-2 py-1 text-[0.85rem] text-center focus:border-primary-purple focus:outline-none"
                  />
                </div>
              ) : (
                <span className="font-bold text-text-primary">
                  ₹ {profTax.toLocaleString()} / month
                </span>
              )}
            </div>
            <p className="text-[0.72rem] text-text-muted italic mt-3">
              Professional Tax deducted from the gross salary
            </p>
          </div>
        </div>
      </div>

      {/* Payslip Generation Section */}
      <div className="mt-8 border-t border-border-color pt-6">
        <h3 className="text-[1.1rem] text-text-primary mb-4 font-semibold">Payslip Generation</h3>
        <div className="bg-bg-card border border-border-color rounded-lg p-6">
          <div className="flex gap-4 mb-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.75rem] font-bold text-text-muted uppercase tracking-[0.5px]" htmlFor="payslip-month">Select Month</label>
              <select
                id="payslip-month"
                value={payslipMonth}
                onChange={(e) => setPayslipMonth(Number(e.target.value))}
                className="bg-bg-input border border-border-color text-text-primary px-3 py-2 rounded-sm text-[0.88rem] font-medium cursor-pointer min-width-[140px] focus:border-primary-purple focus:outline-none"
              >
                {MONTHS.map((m, i) => (
                  <option key={i} value={i}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.75rem] font-bold text-text-muted uppercase tracking-[0.5px]" htmlFor="payslip-year">Select Year</label>
              <select
                id="payslip-year"
                value={payslipYear}
                onChange={(e) => setPayslipYear(Number(e.target.value))}
                className="bg-bg-input border border-border-color text-text-primary px-3 py-2 rounded-sm text-[0.88rem] font-medium cursor-pointer min-width-[140px] focus:border-primary-purple focus:outline-none"
              >
                {[2024, 2025, 2026].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-4 max-md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white/2 border border-border-color rounded-md p-4 flex flex-col items-center text-center">
              <span className="text-[0.78rem] text-text-secondary mb-1">Total Working Days</span>
              <span className="text-[1.1rem] font-bold text-text-primary">
                {stats.totalWorkingDays} Days
              </span>
            </div>
            <div className="bg-white/2 border border-border-color rounded-md p-4 flex flex-col items-center text-center">
              <span className="text-[0.78rem] text-text-secondary mb-1">Days Present</span>
              <span className="text-[1.1rem] font-bold text-text-primary">
                {stats.presentDays} Days
              </span>
            </div>
            <div className="bg-white/2 border border-border-color rounded-md p-4 flex flex-col items-center text-center">
              <span className="text-[0.78rem] text-text-secondary mb-1">Approved Leaves</span>
              <span className="text-[1.1rem] font-bold text-text-primary">{stats.leaveDays} Days</span>
            </div>
            <div className="bg-primary-purple/6 border-primary-purple/30 rounded-md border p-4 flex flex-col items-center text-center">
              <span className="text-[0.78rem] text-text-secondary mb-1">Total Payable Days</span>
              <span className="text-[1.1rem] font-bold text-primary-purple">{payableDays} Days</span>
            </div>
          </div>

          <div className="h-[1px] bg-border-color mb-6"></div>

          <div className="flex flex-col gap-3 max-w-[500px]">
            <div className="flex justify-between text-[0.9rem] text-text-secondary">
              <span>Base Monthly Wage</span>
              <span className="font-semibold text-text-primary">₹ {wage.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[0.9rem] text-text-secondary">
              <span>Deductions (Unpaid Leaves / Absences)</span>
              <span className="text-status-error font-semibold">
                - ₹ {deductions.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-[1.1rem] text-text-primary border-t border-dashed border-border-color pt-3 mt-1 font-bold">
              <span>Gross Salary Payable</span>
              <span className="text-status-success">
                ₹ {grossSalaryPayable.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}

export default SalaryInfoTab
