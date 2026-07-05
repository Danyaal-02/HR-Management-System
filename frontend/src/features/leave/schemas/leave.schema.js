import { z } from 'zod';

export const leaveSchema = z.object({
  type: z.string().min(1, 'Type is required'),
  startDate: z.string().min(1, 'Please select a start date.'),
  endDate: z.string().min(1, 'Please select an end date.'),
  remarks: z.string().min(1, 'Please provide a reason for leave.')
}).refine((data) => {
  if (data.startDate && data.endDate) {
    return new Date(data.startDate) <= new Date(data.endDate);
  }
  return true;
}, {
  message: "End date must be after start date.",
  path: ["endDate"],
});
