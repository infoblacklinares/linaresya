"use client";
import { useEffect, useRef, useState } from "react";

export default function AnimatedCounter({
  value,
  duration = 1200,
}: {
  value: number;
  duration?: number;
}) {
  const [display, setDisplay] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (started.current || value === 0) return;
    started.current = true;

    const startTime = performance.now();

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.floor(eased * value));
      if (progress < 1) requestAnimationFrame(tick);
      else setDisplay(value);
    }

    requestAnimationFrame(tick);
  }, [value, duration]);

  return <>{display.toLocaleString("es-CL")}</>;
}
