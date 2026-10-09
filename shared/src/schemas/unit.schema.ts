import { z } from 'zod';

export const unitSchema = z.object({
  id: z.string().min(1),
  clientId: z.string().min(1),
  name: z.string().min(2, 'Nome da unidade é obrigatório'),
  intraCode: z.string().optional().nullable(),
  sankhyaCode: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  businessHours: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  environment: z.string().optional().nullable(),
  dependencies: z.string().optional().nullable(),
  isActive: z.boolean().default(true)
});

export type UnitDTO = z.infer<typeof unitSchema>;
