import { z } from 'zod';

export const znunyTicketMirrorSchema = z.object({
  id: z.string().min(1),
  tn: z.string().min(1),
  title: z.string(),
  customerId: z.string().optional().nullable(),
  customerUserLogin: z.string().optional().nullable(),
  queue: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  priority: z.string().optional().nullable(),
  owner: z.string().optional().nullable(),
  service: z.string().optional().nullable(),
  circuitRef: z.string().optional().nullable(),
  createdTime: z.string().optional().nullable(),
  closedTime: z.string().optional().nullable(),
  lastSyncAt: z.string()
});

export type ZnunyTicketMirrorDTO = z.infer<typeof znunyTicketMirrorSchema>;
