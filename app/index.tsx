import type { Href } from 'expo-router';
import { Redirect, useRootNavigationState } from 'expo-router';

export default function IndexRedirect() {
  const rootNavigation = useRootNavigationState();
  if (!rootNavigation?.key) return null; // Aguarda Root Layout montar
  return <Redirect href={'/splash' as Href} />;
}
