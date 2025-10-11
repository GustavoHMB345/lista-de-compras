import { supabase } from './supabase';

export function subscribeListsByFamily(familyId: string, onChange: (evt: any) => void) {
  if (!supabase) return { unsubscribe() {} };
  const channel = supabase
    .channel(`lists_${familyId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'lists', filter: `family_id=eq.${familyId}` },
      onChange,
    )
    .subscribe();
  return {
    unsubscribe() {
      channel.unsubscribe();
    },
  };
}

export function subscribeItemsByList(listId: string, onChange: (evt: any) => void) {
  if (!supabase) return { unsubscribe() {} };
  const channel = supabase
    .channel(`items_${listId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'list_items', filter: `list_id=eq.${listId}` },
      onChange,
    )
    .subscribe();
  return {
    unsubscribe() {
      channel.unsubscribe();
    },
  };
}

export function subscribeSnapshotsByItem(itemId: string, onChange: (evt: any) => void) {
  if (!supabase) return { unsubscribe() {} };
  const channel = supabase
    .channel(`snap_${itemId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'item_price_snapshots',
        filter: `list_item_id=eq.${itemId}`,
      },
      onChange,
    )
    .subscribe();
  return {
    unsubscribe() {
      channel.unsubscribe();
    },
  };
}
