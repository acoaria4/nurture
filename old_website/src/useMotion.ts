import { useEffect, type RefObject } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

export function useMotion(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const media = gsap.matchMedia();
    let disposed = false;
    const refresh = () => { if (!disposed) ScrollTrigger.refresh(); };
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const lenis = new Lenis({ lerp: 0.085, smoothWheel: true, anchors: { offset: -82 } });
      const tick = (time: number) => lenis.raf(time * 1000);
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      const context = gsap.context(() => {
        gsap.from('.hero-word', { y: 70, duration: 1.2, stagger: 0.12, ease: 'power4.out' });
        gsap.from('.hero-support', { y: 20, duration: 1, stagger: 0.1, ease: 'power3.out', delay: 0.25 });
        gsap.from('.hero-image', { scale: 1.045, duration: 1.7, ease: 'power3.out' });
        gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach(element => {
          gsap.from(element, { y: 34, opacity: 0, duration: 0.85, ease: 'power3.out', scrollTrigger: { trigger: element, start: 'top 92%', once: true } });
        });
        gsap.utils.toArray<HTMLElement>('[data-word-reveal]').forEach(heading => {
          gsap.from(heading.querySelectorAll('.word-inner'), { yPercent: 105, duration: 0.9, stagger: 0.045, ease: 'power4.out', scrollTrigger: { trigger: heading, start: 'top 92%', once: true } });
        });
        gsap.to('.ritual-image', { yPercent: -7, ease: 'none', scrollTrigger: { trigger: '#ritual', start: 'top bottom', end: 'bottom top', scrub: 1 } });
      }, root);
      return () => { context.revert(); lenis.destroy(); gsap.ticker.remove(tick); };
    });
    document.fonts.ready.then(refresh);
    window.addEventListener('load', refresh);
    return () => { disposed = true; media.revert(); window.removeEventListener('load', refresh); };
  }, [root]);
}
