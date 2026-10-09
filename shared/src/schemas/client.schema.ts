import { z } from 'zod';

export const clientSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2, 'Nome do cliente é obrigatório'),
  isVip: z.boolean().default(false),
  economicGroup: z.string().optional().nullable(),
  managerName: z.string().optional().nullable(),
  gnName: z.string().optional().nullable(),
  sankhyaCode: z.string().optional().nullable(),
  description: z.string().optional().nullable()
});

export type ClientDTO = z.infer<typeof clientSchema>;
