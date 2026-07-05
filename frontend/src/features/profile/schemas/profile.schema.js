import { z } from 'zod';

export const salarySchema = z.object({
  wage: z.coerce.number().min(0),
  workingDays: z.coerce.number().min(0),
  workingHours: z.coerce.number().min(0),
  basicPct: z.coerce.number().min(0),
  hraPct: z.coerce.number().min(0),
  stdAllowance: z.coerce.number().min(0),
  perfBonusPct: z.coerce.number().min(0),
  ltaPct: z.coerce.number().min(0),
  pfRate: z.coerce.number().min(0),
  profTax: z.coerce.number().min(0),
});

export const privateInfoSchema = z.object({
  dob: z.string().optional(),
  address: z.string().optional(),
  nationality: z.string().optional(),
  personalEmail: z.union([z.literal(''), z.string().email('Invalid email')]).optional(),
  gender: z.string().optional(),
  maritalStatus: z.string().optional(),
  joiningDate: z.string().optional(),
  accountNumber: z.string().optional(),
  bankName: z.string().optional(),
  ifscCode: z.string().optional(),
  panNo: z.string().optional(),
  uanNo: z.string().optional(),
  empCode: z.string().optional(),
});
