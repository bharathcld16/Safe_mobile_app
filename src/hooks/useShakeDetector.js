import { useEffect, useRef, useCallback } from 'react';
import { Accelerometer } from 'expo-sensors';

const SHAKE_THRESHOLD = 1.8;   // g-force delta to count as a shake
const SHAKE_WINDOW_MS = 2000;  // window to count 5 shakes
const REQUIRED_SHAKES = 5;

export default function useShakeDetector(onShake, enabled = true) {
  const shakeCount = useRef(0);
  const lastMag = useRef(0);
  const windowTimer = useRef(null);
  const subscription = useRef(null);

  const reset = useCallback(() => {
    shakeCount.current = 0;
    clearTimeout(windowTimer.current);
  }, []);

  useEffect(() => {
    if (!enabled) {
      subscription.current?.remove();
      return;
    }

    Accelerometer.setUpdateInterval(100);
    subscription.current = Accelerometer.addListener(({ x, y, z }) => {
      const mag = Math.sqrt(x * x + y * y + z * z);
      const delta = Math.abs(mag - lastMag.current);
      lastMag.current = mag;

      if (delta > SHAKE_THRESHOLD) {
        shakeCount.current += 1;

        if (shakeCount.current === 1) {
          // Start window timer
          windowTimer.current = setTimeout(reset, SHAKE_WINDOW_MS);
        }

        if (shakeCount.current >= REQUIRED_SHAKES) {
          reset();
          onShake();
        }
      }
    });

    return () => {
      subscription.current?.remove();
      clearTimeout(windowTimer.current);
    };
  }, [enabled, onShake, reset]);
}
