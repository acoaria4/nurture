import { Fragment, lazy, Suspense, useEffect, useRef, useState, type CSSProperties } from 'react';
import { ArrowUpRight, ArrowRight, ArrowDown, ArrowLeft, ShoppingBag, Menu, Minus, Plus, Check, ZoomIn, Sun, Moon, Leaf, Heart, Zap, Sparkles, Bone, Rotate3d, Trash2, ChevronDown } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { campaign, campaignSmall, campaignMedium, morning, photos, poster } from './assets';
import content from '../assets/product-content.placeholders.json';
import symbol from '../assets/web/trayn-symbol.webp';
import wordmark from '../assets/web/trayn-wordmark.webp';
import Magnet from './components/Magnet';
import Dialog from './components/Dialog';
import { useMotion } from './useMotion';

const ProductScene = lazy(() => import('./components/ProductScene'));
const MAX_QUANTITY = 12;
const BAG_KEY = 'nurture-bag-v1';
const chapters = [
  { name: 'The intention', title: 'For every woman.', copy: 'For the many things you do. And the person behind them all. Everyday nutrition, with you at the centre.' },
  { name: 'The details', title: 'Care, in every detail.', copy: 'A warm gold lid. A botanical illustration. A 400g tin with its own quiet presence in your everyday.' },
  { name: 'The everyday', title: 'A moment that is yours.', copy: 'Not another thing to do. A little space for yourself, within the day you already have.' },
];
const nutrients = [
  { name: 'Protein', detail: 'Listed on the pack', icon: Leaf },
  { name: 'Calcium + Vitamin D', detail: 'Listed on the pack', icon: Bone },
  { name: 'Iron', detail: 'Listed on the pack', icon: Zap },
  { name: 'B Vitamins + Biotin', detail: 'Listed on the pack', icon: Sparkles },
  { name: 'Antioxidants + Minerals', detail: 'Listed on the pack', icon: Heart },
];
const faqs = [
  { question: 'What is Nurture Everyday?', answer: 'Nurture Everyday is a nutrition product by TRAYN Nutrition. The supplied packaging describes it as "Everyday Nutrition for Every Woman." The final formulation, approved claims and suitability information are still pending.' },
  { question: 'How much is in the tin?', answer: 'The supplied pack artwork shows a net weight of 400g. Serving size and the number of servings per tin will be confirmed with the final label.' },
  { question: 'How do I prepare it?', answer: '[Serving instructions pending] Mixing liquid, serving amount and frequency have not yet been supplied. Follow the final approved label when these are available.' },
  { question: 'What are the ingredients and allergens?', answer: '[Ingredients and allergens pending] The full ingredient list, nutrient quantities and allergen declaration must be confirmed before use. The categories shown here are transcribed from the supplied pack artwork.' },
  { question: 'Is it suitable for me?', answer: 'Suitability information is pending. We cannot yet confirm suitability for pregnancy, breastfeeding, children, medical conditions or dietary restrictions. Check the final label and speak with a qualified healthcare professional about individual suitability.' },
  { question: 'When can I order, and how does delivery work?', answer: '[Price, checkout, shipping and returns pending] This is a concept preview. You can keep items in a local bag, but no orders or payments are taken here.' },
];
const policies: Record<string, { title: string; text: string }> = {
  shipping: { title: 'Shipping & returns', text: '[Shipping and returns pending] Delivery areas, dispatch times, delivery charges, cancellation rules and return eligibility will be added once confirmed. No orders are accepted in this preview.' },
  privacy: { title: 'Privacy', text: 'This preview uses browser storage for your bag and appearance preference. No account, payment or personal information is collected by this page. A launch privacy policy is pending. Clear your bag or browser storage to remove the saved preference.' },
  terms: { title: 'Terms', text: 'Concept preview only. Product information, price and commercial terms are not final. Images include AI-generated campaign concepts and CGI product renders, not photographs of a manufactured product. No purchase contract is created and no payment is taken.' },
  assets: { title: 'About these images', text: 'TRAYN brand marks and the original Nurture packaging reference were supplied by the brand. Campaign and lifestyle images are AI-generated creative concepts. The product gallery and live 3D tin are CGI concepts based on the supplied artwork. The lifestyle model is not a customer or endorser. Final artwork, dimensions and product details require approval.' },
};

function storedQuantity() {
  try {
    const value = Number(localStorage.getItem(BAG_KEY) || 0);
    return Number.isInteger(value) ? Math.max(0, Math.min(MAX_QUANTITY, value)) : 0;
  } catch { return 0; }
}

function WordHeading({ text, className = '' }: { text: string; className?: string }) {
  return <h2 className={className} data-word-reveal aria-label={text}>{text.split(' ').map((word, index) => <Fragment key={`${word}-${index}`}><span className="word-mask" aria-hidden="true"><span className="word-inner">{word}</span></span>{' '}</Fragment>)}</h2>;
}

function Quantity({ value, onChange, label = 'Quantity' }: { value: number; onChange: (value: number) => void; label?: string }) {
  return <div className="quantity" role="group" aria-label={label}>
    <button className="icon-button" aria-label={`Decrease ${label.toLowerCase()}`} title="Decrease quantity" disabled={value <= 1} onClick={() => onChange(value - 1)}><Minus size={16} /></button>
    <output aria-live="polite">{value}</output>
    <button className="icon-button" aria-label={`Increase ${label.toLowerCase()}`} title="Increase quantity" disabled={value >= MAX_QUANTITY} onClick={() => onChange(value + 1)}><Plus size={16} /></button>
  </div>;
}

function Story() {
  const section = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const [near, setNear] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(entries => { if (entries[0].isIntersecting) { setNear(true); observer.disconnect(); } }, { rootMargin: '500px' });
    observer.observe(section.current!);
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const trigger = ScrollTrigger.create({ trigger: section.current, start: 'top top+=80', end: 'bottom bottom-=80', onUpdate: self => {
        progress.current = self.progress;
        const next = Math.min(2, Math.floor(self.progress * 3));
        if (next !== activeRef.current) { activeRef.current = next; setActive(next); }
      } });
      return () => trigger.kill();
    });
    return () => { observer.disconnect(); media.revert(); };
  }, []);
  const select = (index: number) => {
    activeRef.current = index; setActive(index); progress.current = index === 2 ? 1 : index * 0.36;
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const top = section.current!.getBoundingClientRect().top + window.scrollY - 80;
      const range = section.current!.offsetHeight - window.innerHeight + 160;
      window.scrollTo({ top: top + range * (index === 0 ? 0.02 : index === 1 ? 0.49 : 0.96), behavior: 'instant' });
    }
  };
  return <section ref={section} className="story" id="inside" aria-label="The Nurture product story">
    <div className="story-sticky">
      <div className="story-ghost" aria-hidden="true">Everyday</div>
      <div className="story-copy">
        <p className="eyebrow">A closer look</p>
        <h2>Goodness,<br />{' '}from every<br />{' '}<em>angle.</em></h2>
        <div className="chapter-content" key={active}><span className="small-label">{chapters[active].name}</span><h3>{chapters[active].title}</h3><p>{chapters[active].copy}</p></div>
        <div className="chapter-nav" role="group" aria-label="Product story chapters">{chapters.map((chapter, index) => <button key={chapter.name} aria-label={chapter.name} title={chapter.name} aria-pressed={index === active} onClick={() => select(index)}><span />{chapter.name}</button>)}</div>
      </div>
      <div className="scene-space">{near ? <Suspense fallback={<img src={poster} alt="Nurture Everyday concept tin" className="scene-poster" />}><ProductScene progress={progress} /></Suspense> : <img src={poster} alt="Nurture Everyday concept tin" className="scene-poster" />}</div>
      <div className="story-caption"><span>NURTURE EVERYDAY</span><span>400g / Concept packaging</span></div>
    </div>
  </section>;
}

export default function App() {
  const root = useRef<HTMLDivElement>(null);
  useMotion(root);
  const [menuOpen, setMenuOpen] = useState(false);
  const [bagOpen, setBagOpen] = useState(false);
  const [bagQuantity, setBagQuantity] = useState(storedQuantity);
  const [quantity, setQuantity] = useState(1);
  const [photo, setPhoto] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [detailTab, setDetailTab] = useState('Overview');
  const [policy, setPolicy] = useState<string | null>(null);
  const [toast, setToast] = useState('');
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const stored = localStorage.getItem('nurture-theme');
      if (stored === 'dark' || stored === 'light') return stored;
    } catch { /* Use system appearance when storage is unavailable. */ }
    return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem('nurture-theme', theme); } catch { /* Storage may be unavailable in private contexts. */ }
  }, [theme]);
  useEffect(() => {
    try { localStorage.setItem(BAG_KEY, String(bagQuantity)); } catch { /* Keep the bag usable without persistent storage. */ }
  }, [bagQuantity]);
  useEffect(() => {
    const storage = (event: StorageEvent) => { if (event.key === BAG_KEY) setBagQuantity(storedQuantity()); };
    window.addEventListener('storage', storage);
    return () => { window.removeEventListener('storage', storage); clearTimeout(toastTimer.current); };
  }, []);
  useEffect(() => {
    if (!lightbox) return;
    const keys = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') { event.preventDefault(); setPhoto(value => (value + 1) % photos.length); }
      if (event.key === 'ArrowLeft') { event.preventDefault(); setPhoto(value => (value + photos.length - 1) % photos.length); }
    };
    window.addEventListener('keydown', keys);
    return () => window.removeEventListener('keydown', keys);
  }, [lightbox]);
  const addToBag = () => {
    const next = Math.min(MAX_QUANTITY, bagQuantity + quantity);
    setBagQuantity(next); setBagOpen(true);
    setToast(next === bagQuantity ? 'Your bag already has the maximum of 12 tins.' : 'Nurture Everyday added to your bag.');
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 3500);
  };
  const links = [{ href: '#inside', text: 'The story' }, { href: '#formula', text: 'On the label' }, { href: '#ritual', text: 'The everyday' }, { href: '#questions', text: 'Questions' }];
  const markStyle = { '--symbol': `url("${symbol}")`, '--wordmark': `url("${wordmark}")` } as CSSProperties;

  return <div className="site" ref={root}>
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="header">
      <a href="#" className="brand" style={markStyle} aria-label="TRAYN Nutrition home"><span className="brand-symbol" /><span className="brand-wordmark" /><span className="brand-divider" /><span className="brand-range">Nurture</span></a>
      <nav className="desktop-nav" aria-label="Main navigation">{links.map(link => <a key={link.href} href={link.href}>{link.text}</a>)}</nav>
      <div className="header-actions">
        <button className="icon-button theme-button" aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} appearance`} title={`Switch to ${theme === 'light' ? 'dark' : 'light'} appearance`} onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>{theme === 'light' ? <Moon size={19} /> : <Sun size={19} />}</button>
        <button className="bag-button" aria-label={`Open bag, ${bagQuantity} ${bagQuantity === 1 ? 'item' : 'items'}`} title="Your bag" onClick={() => setBagOpen(true)}><ShoppingBag size={20} /><span className="bag-label">Bag</span><span className="bag-count">{bagQuantity}</span></button>
        <button className="icon-button mobile-menu-button" aria-label="Open navigation" title="Menu" onClick={() => setMenuOpen(true)}><Menu size={22} /></button>
      </div>
    </header>

    <main id="main">
      <section className="hero" aria-labelledby="hero-title">
        <img className="hero-image" src={campaign} srcSet={`${campaignSmall} 640w, ${campaignMedium} 1000w, ${campaign} 1672w`} sizes="100vw" alt="Nurture Everyday gold-lidded nutrition tin surrounded by green foliage and white blossoms" fetchPriority="high" />
        <div className="hero-content">
          <p className="eyebrow hero-support">Everyday nutrition for every woman</p>
          <h1 id="hero-title" aria-label="Nurture Everyday"><span className="hero-line"><span className="hero-word">Nurture</span></span><span className="hero-line"><span className="hero-word"><em>Everyday.</em></span></span></h1>
          <p className="hero-description hero-support">To feel strong.<br />To live well. Every day.</p>
          <div className="hero-support"><Magnet><a className="button button-primary" href="#product">Discover Nurture <ArrowUpRight size={19} /></a></Magnet></div>
          <p className="hero-footnote hero-support">A little care, made part of your everyday.</p>
        </div>
        <a className="hero-scroll" href="#intention" aria-label="Discover the Nurture story"><ArrowDown size={18} /><span>A moment for you</span></a>
        <span className="hero-pack">BY TRAYN NUTRITION / 400g</span>
      </section>

      <section className="intention section-pad" id="intention">
        <p className="eyebrow">Life asks a lot of you.</p>
        <WordHeading text="Leave a little room for yourself." />
        <div className="intention-bottom" data-reveal><p>Between the things you do for everyone else,<br className="desktop-break" /> there is a moment that belongs to you.</p><a className="text-link" href="#inside">Meet your everyday <ArrowDown size={17} /></a></div>
      </section>

      <Story />

      <section className="formula section-pad" id="formula">
        <div className="section-top"><p className="eyebrow" data-reveal>On the label</p><WordHeading text="A thoughtful combination." /><p className="section-intro" data-reveal>The nutrient categories featured on the<br className="desktop-break" /> Nurture Everyday pack.</p></div>
        <div className="nutrient-list">{nutrients.map(({ name, detail, icon: Icon }) => <article className="nutrient" key={name} data-reveal><Icon size={29} strokeWidth={1.2} /><h3>{name}</h3><p>{detail}</p></article>)}</div>
        <div className="formula-bottom"><p>Pack artwork reference only. Quantities, final formulation and benefit claims are pending approval.</p><a className="text-link" href="#product" onClick={() => setDetailTab('Nutrition')}>See product details <ArrowUpRight size={17} /></a></div>
      </section>

      <section className="ritual" id="ritual">
        <figure className="ritual-media"><img className="ritual-image" src={morning} alt="Editorial concept: a woman taking a quiet morning moment by a sunlit kitchen window" loading="lazy" /><figcaption>Every day, a little space for you.</figcaption></figure>
        <div className="ritual-copy"><p className="eyebrow" data-reveal>The everyday, reimagined</p><WordHeading text="Your day. Your pace. Your moment." /><p data-reveal>Before the world gets busy.<br />Between one thing and the next.<br />Whenever you choose yourself.</p><div className="ritual-signoff" data-reveal><span>Nurture the everyday.</span><a href="#product" className="circle-link" aria-label="Discover Nurture Everyday"><ArrowUpRight size={24} /></a></div></div>
      </section>

      <section className="product section-pad" id="product" aria-labelledby="product-title">
        <div className="product-gallery">
          <div className="gallery-main"><button className="gallery-zoom" aria-label={`Enlarge ${photos[photo].name.toLowerCase()} product image`} onClick={() => setLightbox(true)}><img src={photos[photo].src} alt={photos[photo].alt} loading="lazy" key={photo} /><span className="zoom-symbol"><ZoomIn size={20} /></span></button><span className="gallery-counter">{String(photo + 1).padStart(2, '0')} / {String(photos.length).padStart(2, '0')}</span><div className="gallery-arrows"><button className="icon-button" aria-label="Previous product image" title="Previous image" onClick={() => setPhoto((photo + photos.length - 1) % photos.length)}><ArrowLeft size={18} /></button><button className="icon-button" aria-label="Next product image" title="Next image" onClick={() => setPhoto((photo + 1) % photos.length)}><ArrowRight size={18} /></button></div></div>
          <div className="gallery-thumbnails" role="group" aria-label="Product image views">{photos.map((image, index) => <button key={image.name} aria-label={`${image.name} view`} aria-pressed={index === photo} onClick={() => setPhoto(index)}><img src={image.src} alt="" loading="lazy" /><span>{image.name}</span></button>)}</div>
          <div className="gallery-caption"><span>CGI product concepts</span><a className="text-link" href="#inside"><Rotate3d size={16} /> Explore the tin</a></div>
        </div>
        <div className="product-info">
          <p className="eyebrow">By TRAYN Nutrition</p>
          <h2 id="product-title">Nurture<br /><em>Everyday.</em></h2>
          <p className="product-subtitle">Everyday nutrition for every woman.</p>
          <div className="product-price"><span>{content.placeholderDisplay.price}</span><span className="small-label">400g NET WEIGHT</span></div>
          <div className="variant"><span className="small-label">PACK SIZE</span><button aria-pressed="true" className="pack-option">400g tin <Check size={15} /></button></div>
          <p className="flavour-note">{content.placeholderDisplay.flavours}</p>
          <div className="purchase-row"><Quantity value={quantity} onChange={setQuantity} /><button className="button button-primary" onClick={addToBag}>Add to bag <ShoppingBag size={18} /></button></div>
          <p className="preview-disclosure">Concept preview. Checkout is not yet available.</p>
          <button className="text-link shipping-link" onClick={() => setPolicy('shipping')}>Shipping & returns <ArrowUpRight size={15} /></button>
          <div className="product-tabs" role="tablist" aria-label="Product information">{['Overview', 'Nutrition', 'Ingredients'].map(tab => <button role="tab" key={tab} id={`tab-${tab}`} aria-selected={detailTab === tab} aria-controls="product-panel" tabIndex={detailTab === tab ? 0 : -1} onClick={() => setDetailTab(tab)} onKeyDown={event => {
            const tabs = ['Overview', 'Nutrition', 'Ingredients'];
            let next: string | undefined;
            if (event.key === 'ArrowRight') next = tabs[(tabs.indexOf(tab) + 1) % 3];
            if (event.key === 'ArrowLeft') next = tabs[(tabs.indexOf(tab) + 2) % 3];
            if (event.key === 'Home') next = tabs[0];
            if (event.key === 'End') next = tabs[2];
            if (next) { event.preventDefault(); setDetailTab(next); document.getElementById(`tab-${next}`)?.focus(); }
          }}>{tab}</button>)}</div>
          <div className="product-panel" role="tabpanel" id="product-panel" aria-labelledby={`tab-${detailTab}`} tabIndex={0}>
            {detailTab === 'Overview' && <><p>A 400g tin of Nurture Everyday, from TRAYN Nutrition. The supplied artwork names protein, calcium, vitamin D, iron, B vitamins, biotin, antioxidants and minerals.</p><p className="pending-note">{content.placeholderDisplay.servingInstructions}</p></>}
            {detailTab === 'Nutrition' && <><p>{content.placeholderDisplay.nutrition}</p><p>Serving size, energy and nutrient amounts will be added from the final approved label. No nutritional values are inferred from the concept artwork.</p></>}
            {detailTab === 'Ingredients' && <><p>{content.placeholderDisplay.ingredientsAndAllergens}</p><p>The complete ingredient list and allergen declaration are not yet supplied. Dietary suitability cannot be confirmed from the reference image.</p></>}
          </div>
        </div>
      </section>

      <section className="questions section-pad" id="questions"><div className="questions-heading"><p className="eyebrow" data-reveal>A little clarity</p><WordHeading text="Good questions. Thoughtful answers." /><p data-reveal>What we know, and what is still<br className="desktop-break" /> being confirmed.</p></div><div className="faq-list">{faqs.map(faq => <details key={faq.question}><summary>{faq.question}<ChevronDown size={20} /></summary><div><p>{faq.answer}</p></div></details>)}</div></section>

      <section className="closing section-pad"><p className="eyebrow" data-reveal>For the person behind it all.</p><WordHeading text="Nurture your everyday." /><Magnet><a href="#product" className="button button-primary">Make a little room for you <ArrowUpRight size={19} /></a></Magnet><span className="closing-flower" style={markStyle} aria-hidden="true" /></section>
    </main>

    <footer className="footer"><div className="footer-top"><a href="#" className="footer-nurture">Nurture<span>EVERYDAY BY TRAYN NUTRITION</span></a><p>To feel strong.<br />To live well. Every day.</p><nav aria-label="Footer navigation"><a href="#product">The product</a><a href="#questions">Questions</a><button onClick={() => setPolicy('shipping')}>Shipping & returns</button></nav></div><div className="footer-bottom"><span>&copy; {new Date().getFullYear()} TRAYN Nutrition</span><div><button onClick={() => setPolicy('privacy')}>Privacy</button><button onClick={() => setPolicy('terms')}>Terms</button><button onClick={() => setPolicy('assets')}>Image credits</button></div><span>Concept preview / Not for sale</span></div></footer>

    <Dialog open={menuOpen} onClose={() => setMenuOpen(false)} title="Explore Nurture" className="menu-dialog"><nav aria-label="Mobile navigation">{links.concat({ href: '#product', text: 'Discover Nurture' }).map(link => <a href={link.href} key={link.href} onClick={() => setMenuOpen(false)}>{link.text}<ArrowUpRight size={24} /></a>)}</nav><p>Everyday nutrition for every woman.</p></Dialog>
    <Dialog open={bagOpen} onClose={() => setBagOpen(false)} title={`Your bag (${bagQuantity})`} className="bag-dialog">
      {bagQuantity > 0 ? <><div className="bag-item"><img src={photos[1].src} alt="Nurture Everyday tin" /><div><p className="small-label">TRAYN NUTRITION</p><h3>Nurture Everyday</h3><p>400g tin</p><span>{content.placeholderDisplay.price}</span><Quantity value={bagQuantity} onChange={setBagQuantity} label="Bag quantity" /></div><button className="icon-button" aria-label="Remove Nurture Everyday from bag" title="Remove item" onClick={() => setBagQuantity(0)}><Trash2 size={18} /></button></div><div className="bag-summary"><div><span>Subtotal</span><span>{content.placeholderDisplay.price}</span></div><p>Shipping and taxes pending confirmation.</p><button className="button button-primary" disabled title="Checkout is pending">Checkout pending <ArrowRight size={18} /></button><p className="preview-disclosure">No orders or payments are taken in this preview.</p><button className="text-link" onClick={() => setBagOpen(false)}>Continue exploring <ArrowRight size={17} /></button></div></> : <div className="empty-bag"><ShoppingBag size={42} strokeWidth={1} /><h3>A little care starts here.</h3><p>Your bag is waiting for its everyday.</p><a className="button button-primary" href="#product" onClick={() => setBagOpen(false)}>Discover Nurture <ArrowUpRight size={18} /></a></div>}
    </Dialog>
    <Dialog open={lightbox} onClose={() => setLightbox(false)} title={`${photos[photo].name} / Nurture Everyday`} className="image-dialog"><div className="lightbox-image"><img src={photos[photo].src} alt={photos[photo].alt} /><button className="icon-button lightbox-prev" aria-label="Previous enlarged image" onClick={() => setPhoto((photo + photos.length - 1) % photos.length)}><ArrowLeft size={24} /></button><button className="icon-button lightbox-next" aria-label="Next enlarged image" onClick={() => setPhoto((photo + 1) % photos.length)}><ArrowRight size={24} /></button></div><p>{photo + 1} / {photos.length} &middot; CGI concept packaging</p></Dialog>
    <Dialog open={policy !== null} onClose={() => setPolicy(null)} title={policy ? policies[policy].title : 'Information'} className="policy-dialog"><p>{policy ? policies[policy].text : ''}</p></Dialog>
    <div className={`toast ${toast ? 'is-visible' : ''}`} role="status" aria-live="polite">{toast && <><Check size={18} /><span>{toast}</span></>}</div>
  </div>;
}
