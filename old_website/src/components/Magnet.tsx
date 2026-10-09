import { useEffect, useRef, type ReactNode } from 'react';
import { gsap } from 'gsap';

// Adapted from React Bits Magnet (MIT + Commons Clause): https://reactbits.dev/animations/magnet
// Scoped pointer events and quickTo avoid a React render for every pointer move.
export default function Magnet({ children, className = '' }: { children: ReactNode; className?: string }) {
  const wrapper = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference) and (pointer: fine)', () => {
      const element = wrapper.current!;
      const target = inner.current!;
      const xTo = gsap.quickTo(target, 'x', { duration: 0.45, ease: 'power3.out' });
      const yTo = gsap.quickTo(target, 'y', { duration: 0.45, ease: 'power3.out' });
      const move = (event: PointerEvent) => {
        const rect = element.getBoundingClientRect();
        xTo((event.clientX - rect.left - rect.width / 2) * 0.14);
        yTo((event.clientY - rect.top - rect.height / 2) * 0.14);
      };
      const reset = () => { xTo(0); yTo(0); };
      element.addEventListener('pointermove', move);
      element.addEventListener('pointerleave', reset);
      window.addEventListener('blur', reset);
      return () => {
        element.removeEventListener('pointermove', move);
        element.removeEventListener('pointerleave', reset);
        window.removeEventListener('blur', reset);
        xTo.tween.kill(); yTo.tween.kill();
        gsap.set(target, { clearProps: 'transform' });
      };
    });
    return () => media.revert();
  }, []);
  return <div ref={wrapper} className={`magnet ${className}`}><div ref={inner}>{children}</div></div>;
}
