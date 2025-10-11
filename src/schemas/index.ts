import { z } from 'zod';

export const ListInsertSchema = z.object({
  family_id: z.string().uuid(),
  name: z.string().min(1).max(120),
  created_by: z.string().uuid(),
});

export const ListUpdateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(120).optional(),
  completed_at: z.string().datetime().optional(),
  updated_at: z.string().datetime(), // optimistic token
});

export const ItemInsertSchema = z.object({
  list_id: z.string().uuid(),
  name: z.string().min(1).max(120),
  category: z.string().max(60).optional(),
  qty: z.number().nonnegative().optional(),
  unit: z.string().max(20).optional(),
  price: z.number().nonnegative().optional(),
});

export const ItemUpdateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(120).optional(),
  category: z.string().max(60).optional(),
  qty: z.number().nonnegative().optional(),
  unit: z.string().max(20).optional(),
  price: z.number().nonnegative().optional(),
  is_purchased: z.boolean().optional(),
  purchased_at: z.string().datetime().optional(),
  updated_at: z.string().datetime(),
});

export const SnapshotInsertSchema = z.object({
  list_item_id: z.string().uuid(),
  unit_price: z.number().nonnegative(),
  total_price: z.number().nonnegative().optional(),
});

export type ListInsert = z.infer<typeof ListInsertSchema>;
export type ListUpdate = z.infer<typeof ListUpdateSchema>;
export type ItemInsert = z.infer<typeof ItemInsertSchema>;
export type ItemUpdate = z.infer<typeof ItemUpdateSchema>;
export type SnapshotInsert = z.infer<typeof SnapshotInsertSchema>;
