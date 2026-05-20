import { z } from 'zod';

const MAX_TITLE = 100;
const MIN_DESC = 10;
const MAX_DESC = 2000;
const MAX_CONTACT = 200;

// eslint-disable-next-line @typescript-eslint/naming-convention
export const reportPayloadSchema = z.object({
  type: z.enum(['bug', 'enhancement']),
  title: z.string().min(1).max(MAX_TITLE),
  description: z.string().min(MIN_DESC).max(MAX_DESC),
  contact: z.string().max(MAX_CONTACT).optional(),
  turnstileToken: z.string().min(1),
  gameState: z.unknown(),
});

export type ReportPayload = z.infer<typeof reportPayloadSchema>;
