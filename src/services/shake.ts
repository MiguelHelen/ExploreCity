/**
 * Detector de agitada do ExploreCity.
 * Usa o acelerômetro do celular para perceber quando o usuário balança o aparelho.
 *
 * Como funciona: o acelerômetro mede a aceleração em 3 direções (x, y, z), em "g".
 * Com o celular parado, a soma das três dá cerca de 1 g (a gravidade).
 * Quando o aparelho é balançado, esse valor sobe bastante.
 * Se passar do limite, consideramos uma agitada.
 */

import { useFocusEffect } from 'expo-router';
import { Accelerometer } from 'expo-sensors';
import { useCallback, useRef, useState } from 'react';

// Quanto maior o número, mais forte precisa ser a agitada.
// Se estiver sensível demais, aumente (ex.: 2.2). Se não detectar, diminua (ex.: 1.5).
export const SHAKE_THRESHOLD_G = 1.8;

// Tempo mínimo entre duas agitadas, para uma agitada não valer por várias.
export const SHAKE_COOLDOWN_MS = 1500;

// De quanto em quanto tempo o sensor é lido (em milissegundos).
const UPDATE_INTERVAL_MS = 100;

/**
 * Hook que escuta o acelerômetro enquanto a tela está aberta.
 * - onShake: função chamada a cada agitada detectada.
 * - devolve "available" (o aparelho tem o sensor?) e "magnitude" (força atual do movimento).
 */
export function useShake(onShake: () => void) {
  const [available, setAvailable] = useState<boolean | null>(null); // null = verificando
  const [magnitude, setMagnitude] = useState(1);

  // Guardamos a função mais recente sem precisar reiniciar o sensor a cada mudança.
  const onShakeRef = useRef(onShake);
  onShakeRef.current = onShake;

  const lastShake = useRef(0);

  // useFocusEffect liga o sensor quando a tela aparece e desliga quando ela sai.
  useFocusEffect(
    useCallback(() => {
      let subscription: { remove: () => void } | null = null;
      let cancelled = false;

      (async () => {
        const isAvailable = await Accelerometer.isAvailableAsync();
        if (cancelled) return;
        setAvailable(isAvailable);
        if (!isAvailable) return;

        Accelerometer.setUpdateInterval(UPDATE_INTERVAL_MS);
        subscription = Accelerometer.addListener(({ x, y, z }) => {
          // Força total do movimento, juntando as 3 direções.
          const force = Math.sqrt(x * x + y * y + z * z);
          setMagnitude(Math.round(force * 10) / 10);

          const now = Date.now();
          if (force > SHAKE_THRESHOLD_G && now - lastShake.current > SHAKE_COOLDOWN_MS) {
            lastShake.current = now;
            onShakeRef.current();
          }
        });
      })();

      return () => {
        cancelled = true;
        subscription?.remove();
      };
    }, [])
  );

  return { available, magnitude };
}