import { z } from 'zod';

export const circuitSchema = z.object({
  id: z.string().min(1),
  unitId: z.string().min(1),
  operator: z.string().min(1, 'Operadora é obrigatória'),
  technology: z.string().optional().nullable(),
  speedMbps: z.number().optional().nullable(),
  circuitId: z.string().optional().nullable(),
  contractId: z.string().optional().nullable(),
  lpIp: z.string().optional().nullable(),
  lpVpn: z.string().optional().nullable(),
  isPrimary: z.boolean().default(false),
  notes: z.string().optional().nullable()
});

export type CircuitDTO = z.infer<typeof circuitSchema>;
