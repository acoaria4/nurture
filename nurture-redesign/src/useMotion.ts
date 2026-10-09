import { useEffect, type RefObject } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

export function useMotion(root: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const context = gsap.context(() => {
        const intro = gsap.timeline({ defaults: { ease: 'power3.out' } });
        intro.from('.hero-word', { y: 32, opacity: .35, duration: 1.15 })
          .from('.hero-product', { y: 36, rotation: -3, duration: 1.3 }, .08)
          .from('.hero-copy > *', { y: 20, opacity: .45, stagger: .1, duration: .8 }, .25);
        gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach(element => {
          gsap.from(element, { y: 28, duration: .95, scrollTrigger: { trigger: element, start: 'top 92%', once: true } });
        });
        gsap.utils.toArray<HTMLElement>('[data-word-reveal]').forEach(element => {
          gsap.from(element.querySelectorAll('.word-inner'), { yPercent: 105, duration: .9, stagger: .045, ease: 'power3.out', scrollTrigger: { trigger: element, start: 'top 90%', once: true } });
        });
        gsap.fromTo('.campaign-image', { yPercent: -4 }, { yPercent: 4, ease: 'none', scrollTrigger: { trigger: '.campaign', start: 'top bottom', end: 'bottom top', scrub: .7 } });
      }, root);
      return () => context.revert();
    });
    // Lenis is restricted to fine-pointer desktop devices. Native touch scrolling
    // keeps the mobile composition immediate and avoids a second scroll engine.
    media.add('(prefers-reduced-motion: no-preference) and (pointer: fine) and (min-width: 900px)', () => {
      const lenis = new Lenis({ duration: 1.05, smoothWheel: true, syncTouch: false });
      lenis.on('scroll', ScrollTrigger.update);
      const tick = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(tick);
      // Own in-page links so a native hash jump cannot race the Lenis animation.
      const element = root.current!;
      const onAnchor = (event: MouseEvent) => {
        if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
        const link = (event.target as Element).closest<HTMLAnchorElement>('a[href^="#"]');
        const hash = link?.getAttribute('href');
        if (!hash || hash === '#') return;
        const destination = document.getElementById(decodeURIComponent(hash.slice(1)));
        if (!destination) return;
        event.preventDefault();
        history.pushState(null, '', hash);
        const offset = Number.parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
        const top = destination.getBoundingClientRect().top + window.scrollY - offset;
        lenis.scrollTo(top, { onComplete: () => { if (destination.id === 'main') destination.focus({ preventScroll: true }); } });
      };
      element.addEventListener('click', onAnchor);
      return () => { element.removeEventListener('click', onAnchor); gsap.ticker.remove(tick); lenis.destroy(); };
    });
    let cancelled = false;
    const refresh = () => { if (!cancelled) ScrollTrigger.refresh(); };
    document.fonts.ready.then(refresh);
    window.addEventListener('load', refresh);
    return () => { cancelled = true; window.removeEventListener('load', refresh); media.revert(); };
  }, [root]);
}



