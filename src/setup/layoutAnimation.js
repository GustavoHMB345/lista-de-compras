import { Platform, UIManager } from 'react-native';

// Enable LayoutAnimation on Android only for the old architecture.
// In the New Architecture (Fabric), this call is a no-op and logs a warning.
try {
  // nativeFabricUIManager is defined when Fabric is enabled
  const isFabric = Boolean(global?.nativeFabricUIManager);
  if (Platform.OS === 'android' && !isFabric && UIManager?.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
} catch (_) {
  // Ignore
}
