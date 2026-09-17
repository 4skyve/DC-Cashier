"use client";

import { useEffect, useRef, useState } from "react";

type AnimateOnScrollProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
};

export function AnimateOnScroll({
  children,
  className = "",
  delay = 0,
  y = 24,
}: AnimateOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    let done = false;
    const show = () => {
      if (done) return;
      done = true;
      setVisible(true);
    };

    const fallback = setTimeout(show, 1000);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          show();
          observer.unobserve(node);
        }
      },
      { threshold: 0.05 }
    );

    observer.observe(node);

    return () => {
      clearTimeout(fallback);
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out will-change-transform ${className} ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      style={{
        transitionDelay: `${delay}ms`,
        transform: visible ? "translateY(0)" : `translateY(${y}px)`,
      }}
    >
      {children}
    </div>
  );
}