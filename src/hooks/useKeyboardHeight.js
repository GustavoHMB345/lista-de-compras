import { useEffect, useState } from 'react';
import { Keyboard } from 'react-native';

export function useKeyboardHeight() {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const onShow = (e) => setKeyboardHeight(e?.endCoordinates?.height || 0);
    const onHide = () => setKeyboardHeight(0);
    const s = Keyboard.addListener('keyboardDidShow', onShow);
    const h = Keyboard.addListener('keyboardDidHide', onHide);
    return () => {
      s.remove();
      h.remove();
    };
  }, []);

  return keyboardHeight;
}
