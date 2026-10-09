import { useEffect, useRef, useState } from 'react';
import { navigation } from '../content/product';
import { Arrow } from './Typography';

export default function Navigation() {
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const element = dialog.current!;
    if (!open) { if (element.open) element.close(); return; }
    element.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onClose = () => setOpen(false);
    element.addEventListener('close', onClose);
    return () => {
      element.removeEventListener('close', onClose);
      document.body.style.overflow = previous;
      if (element.open) element.close();
      trigger.current?.focus({ preventScroll: true });
    };
  }, [open]);
  useEffect(() => {
    const query = matchMedia('(min-width: 760px)');
    const closeOnDesktop = () => { if (query.matches) setOpen(false); };
    query.addEventListener('change', closeOnDesktop);
    return () => query.removeEventListener('change', closeOnDesktop);
  }, []);
  return <>
    <header className="site-header">
      <a href="#top" className="brand" aria-label="Nurture Everyday home">nurture<span className="brand-note">by TRAYN Nutrition</span></a>
      <nav className="desktop-nav" aria-label="Main navigation">{navigation.map(link => <a key={link.href} href={link.href}>{link.label}</a>)}</nav>
      <a className="header-link" href="#development">In the making <Arrow diagonal /></a>
      <button ref={trigger} className="menu-toggle" type="button" aria-label="Open navigation" aria-controls="mobile-navigation" aria-expanded={open} onClick={() => setOpen(true)}>Menu <span aria-hidden="true">+</span></button>
    </header>
    <dialog ref={dialog} className="menu-dialog" id="mobile-navigation" aria-labelledby="menu-title" data-lenis-prevent onClick={event => { if (event.target === dialog.current) setOpen(false); }}>
      <div className="menu-top"><span id="menu-title">Explore Nurture</span><button type="button" className="circle-control" onClick={() => setOpen(false)} aria-label="Close navigation">×</button></div>
      <nav aria-label="Mobile navigation">{[...navigation, { href: '#development', label: 'In the making' }].map((link, index) => <a key={link.href} href={link.href} onClick={() => setOpen(false)}><span className="menu-number">0{index + 1}</span>{link.label}<Arrow diagonal /></a>)}</nav>
      <p className="menu-foot">Everyday Nutrition for Every Woman.<br />A concept by TRAYN Nutrition.</p>
    </dialog>
  </>;
}
