import { supabase } from '../supabase';

export const api = {
  // Auth
  async login(email: string, password: string) {
    if (!supabase) return { error: 'Supabase not configured' } as const;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error } as const;
  },
  async register(email: string, password: string) {
    if (!supabase) return { error: 'Supabase not configured' } as const;
    const { data, error } = await supabase.auth.signUp({ email, password });
    return { data, error } as const;
  },

  // Lists
  async getLists(familyId: string) {
    if (!supabase) return { data: [], error: null } as const;
    const { data, error } = await supabase
      .from('lists')
      .select('id, name, family_id, created_by, completed_at, created_at')
      .eq('family_id', familyId)
      .order('created_at', { ascending: false });
    return { data, error } as const;
  },

  async addList(familyId: string, name: string, userId: string) {
    if (!supabase) return { error: 'Supabase not configured' } as const;
    const { data, error } = await supabase
      .from('lists')
      .insert({ family_id: familyId, name, created_by: userId })
      .select('*')
      .single();
    return { data, error } as const;
  },

  async addItem(
    listId: string,
    item: { name: string; category?: string; qty?: number; unit?: string; price?: number },
  ) {
    if (!supabase) return { error: 'Supabase not configured' } as const;
    const { data, error } = await supabase
      .from('list_items')
      .insert({ list_id: listId, ...item })
      .select('*')
      .single();
    return { data, error } as const;
  },

  async togglePurchased(itemId: string, isPurchased: boolean) {
    if (!supabase) return { error: 'Supabase not configured' } as const;
    const patch: any = { is_purchased: isPurchased };
    if (isPurchased) patch.purchased_at = new Date().toISOString();
    const { data, error } = await supabase
      .from('list_items')
      .update(patch)
      .eq('id', itemId)
      .select('*')
      .single();
    return { data, error } as const;
  },

  async addSnapshot(itemId: string, unitPrice: number, totalPrice?: number) {
    if (!supabase) return { error: 'Supabase not configured' } as const;
    const payload = { list_item_id: itemId, unit_price: unitPrice, total_price: totalPrice };
    const { data, error } = await supabase
      .from('item_price_snapshots')
      .insert(payload)
      .select('*')
      .single();
    return { data, error } as const;
  },
};
