/**
 * useCountdown.js — Temporizador robusto basado en "deadline".
 * ------------------------------------------------------------
 * Problema típico: un setInterval que hace `t - 1` cada segundo se
 * desfasa cuando el navegador estrangula la pestaña (móviles, pestaña
 * en segundo plano) o cuando el render 3D bloquea el hilo principal.
 *
 * Solución: guardar el instante de término (deadline) y calcular
 * `restante = deadline - ahora` en cada tick. Aunque un tick se retrase,
 * el tiempo mostrado siempre es exacto.
 *
 * Pausa: al pausar se congela el restante; al reanudar se crea un
 * deadline nuevo con ese restante.
 */
import { useEffect, useRef, useState, useCallback } from 'react';

export function useCountdown({ durationS, running, paused = false, onExpire }) {
  const [msLeft, setMsLeft] = useState(durationS * 1000);
  const deadlineRef = useRef(null);
  const remainingRef = useRef(durationS * 1000); // valor autoritativo
  const expireRef = useRef(onExpire);
  expireRef.current = onExpire; // evita re-suscribir el efecto si cambia el callback

  // Reinicia el reloj (nueva partida)
  const reset = useCallback(() => {
    remainingRef.current = durationS * 1000;
    deadlineRef.current = null;
    setMsLeft(durationS * 1000);
  }, [durationS]);

  useEffect(() => {
    if (!running || paused) {
      // Congela el restante actual
      if (deadlineRef.current) {
        remainingRef.current = Math.max(0, deadlineRef.current - performance.now());
        deadlineRef.current = null;
      }
      return;
    }
    deadlineRef.current = performance.now() + remainingRef.current;

    // 250 ms basta para un display en segundos y es barato en móviles
    const id = setInterval(() => {
      const left = Math.max(0, deadlineRef.current - performance.now());
      remainingRef.current = left;
      setMsLeft(left);
      if (left <= 0) {
        clearInterval(id);
        deadlineRef.current = null;
        expireRef.current?.();
      }
    }, 250);

    return () => clearInterval(id);
  }, [running, paused]);

  return {
    secondsLeft: Math.ceil(msLeft / 1000),
    progress: msLeft / (durationS * 1000), // 1 → 0, para la barra del HUD
    getSecondsLeft: () => Math.ceil(remainingRef.current / 1000), // lectura sin re-render
    reset,
  };
}
