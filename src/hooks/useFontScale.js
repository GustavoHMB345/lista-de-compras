import { useEffect, useState } from 'react';
import { Dimensions } from 'react-native';

function calcFactor() {
  const { width } = Dimensions.get('window');
  return Math.min(1.2, Math.max(0.9, width / 390));
}

export default function useFontScale() {
  const [fs, setFs] = useState(calcFactor());

  useEffect(() => {
    const onChange = () => setFs(calcFactor());
    const sub = Dimensions.addEventListener?.('change', onChange);
    return () => {
      if (sub && typeof sub.remove === 'function') sub.remove();
      else if (Dimensions.removeEventListener) Dimensions.removeEventListener('change', onChange);
    };
  }, []);

  return fs;
}
