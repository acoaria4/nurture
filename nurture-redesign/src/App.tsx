import { useRef } from 'react';
import Navigation from './components/Navigation';
import ProductGallery from './components/ProductGallery';
import { Arrow, Heading, SectionLabel } from './components/Typography';
import { imageDisclosure, navigation, product, questions } from './content/product';
import { useMotion } from './useMotion';

export default function App() {
  const root = useRef<HTMLDivElement>(null);
  useMotion(root);
  return <div className="site" ref={root} id="top">
    <a className="skip-link" href="#main">Skip to content</a>
    <Navigation />
    <main id="main" tabIndex={-1}>
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-topline"><p>Everyday Nutrition for Every Woman</p><p><span className="status-dot" />A product in the making</p></div>
        <h1 id="hero-title" className="hero-word" aria-label="Nurture Everyday">nurture<span className="hero-edition" aria-hidden="true">everyday</span></h1>
        <div className="hero-copy">
          <p className="hero-statement">A little care.<br /><em>Every day.</em></p>
          <p className="hero-description">An everyday nutrition concept.<br />A small space in the day, just for you.</p>
          <a className="text-link hero-cta" href="#object">Explore the concept <Arrow /></a>
        </div>
        <div className="hero-product"><img src={product.media.hero} srcSet={`${product.media.heroSmall} 600w, ${product.media.hero} 1000w`} sizes="(max-width: 759px) 62vw, 38vw" width="1000" height="1686" alt="Nurture Everyday concept: a cream nutrition tin with a gold lid and botanical artwork" fetchPriority="high" /></div>
        <span className="hero-side-note" aria-hidden="true">A study in everyday care — 01</span>
        <div className="hero-baseline"><span>Nurture Everyday <span className="baseline-divider">/</span> by TRAYN Nutrition</span><span>400g on concept artwork <span className="baseline-divider">/</span> CGI packaging study</span><a href="#intention" aria-label="Scroll to the intention"><span className="scroll-label">Scroll to discover</span><span aria-hidden="true">↓</span></a></div>
      </section>

      <section className="intention section-pad" id="intention" aria-labelledby="intention-title">
        <SectionLabel number="01">The intention</SectionLabel>
        <div className="intention-heading"><Heading id="intention-title" text="For the person behind it all." className="display-heading" /><span className="aside-note">The many things you do.<br />The one person you are.</span></div>
        <div className="intention-grid">
          <div className="intention-copy" data-reveal><p className="intro-copy">The everyday deserves<br />its own kind of care.</p><p>Days are full. Of things to do, people to be there for, and moments that move too quickly. Nurture begins with a simple thought: make a little room for yourself.</p><p>Everyday nutrition for every woman. That is the idea at the heart of Nurture Everyday.</p><a className="text-link" href="#object">Meet Nurture <Arrow /></a></div>
          <figure className="intention-image" data-reveal><div className="image-frame"><img src={product.media.morning} alt="Generated campaign study of a woman taking a quiet moment by a sunlit kitchen window" width="1440" height="960" loading="lazy" /></div><figcaption><span>A moment, just for you.</span><span>Campaign concept</span></figcaption></figure>
        </div>
      </section>

      <section className="object section-pad" id="object" aria-labelledby="object-title">
        <SectionLabel number="02">The object</SectionLabel>
        <div className="object-grid">
          <div className="object-copy"><p className="small-label">Introducing Nurture Everyday</p><h2 className="display-heading" id="object-title" data-reveal>Care, with<br />a quiet<br /><em>presence.</em></h2><p>A cream canvas. A warm gold finish. Botanical artwork that gives an everyday object a character of its own.</p><p>Explore the packaging concept from four perspectives.</p><dl className="object-specs"><div><dt>Identity</dt><dd>{product.name}</dd></div><div><dt>By</dt><dd>{product.brand}</dd></div><div><dt>Pack concept</dt><dd>{product.packWeight} as pictured</dd></div><div><dt>Stage</dt><dd>In development</dd></div></dl><p className="fine-print">Concept visuals. Final artwork and packaging may change.</p></div>
          <ProductGallery />
        </div>
      </section>

      <section className="details section-pad" id="details" aria-labelledby="details-title">
        <SectionLabel number="03">A closer look</SectionLabel>
        <div className="details-heading"><h2 className="display-heading" id="details-title" data-reveal>Small details.<br /><em>A whole feeling.</em></h2><p>From the first glance to the final finish,<br />a visual language of everyday care.</p></div>
        <div className="details-grid">
          <figure className="detail-gold" data-reveal><div className="detail-image"><img src={product.media.detail} width="1200" height="1500" alt="CGI detail of the Nurture concept's warm gold lid and rolled edge" loading="lazy" /></div><figcaption><span className="detail-number">I.</span><div><h3>A little warmth.</h3><p>The gold lid and foil-toned band frame the cream label. A considered contrast, from top to base.</p></div></figcaption></figure>
          <figure className="detail-artwork" data-reveal><div className="detail-image"><img src={product.media.artwork} width="900" height="1083" alt="Close-up CGI view of the botanical linework and woman's profile on the Nurture label" loading="lazy" /></div><figcaption><span className="detail-number">II.</span><div><h3>A human touch.</h3><p>Fine botanical lines and a woman's profile give the concept its distinctive identity.</p></div></figcaption></figure>
        </div>
      </section>

      <section className="campaign" aria-label="Nurture campaign concept">
        <div className="campaign-frame"><img className="campaign-image" src={product.media.campaign} srcSet={`${product.media.campaignSmall} 640w, ${product.media.campaignMedium} 1000w, ${product.media.campaign} 1672w`} sizes="100vw" width="1672" height="941" alt="Generated campaign concept of Nurture Everyday on pale stone beside green foliage and white blossoms" loading="lazy" /><div className="campaign-caption"><p>A place in<br /><em>your everyday.</em></p><span>Nurture Everyday / Campaign study</span></div></div>
        <div className="campaign-credit"><span>A vision of the everyday.</span><span>AI-generated campaign concept</span></div>
      </section>

      <section className="development section-pad" id="development" aria-labelledby="development-title">
        <SectionLabel number="04">In the making</SectionLabel>
        <div className="development-grid"><div className="development-intro"><p className="small-label"><span className="status-dot" />Concept, becoming.</p><h2 className="display-heading" id="development-title" data-reveal>Good things<br />take <em>care.</em></h2><p>This is the beginning of Nurture Everyday. An introduction to the idea and the object, as the final product takes shape.</p><p>We will share the formulation, product details, and launch plans here when they are ready.</p><span className="development-note">Currently in development</span></div><div className="faq-list">{questions.map((item, index) => <details className="faq" key={item.question}><summary><span className="faq-index">0{index + 1}</span><span>{item.question}</span><span className="faq-plus" aria-hidden="true">+</span></summary><div className="faq-answer"><p>{item.answer}</p></div></details>)}</div></div>
      </section>

      <section className="closing section-pad" aria-label="The Nurture vision">
        <div className="closing-top"><span className="small-label">The Nurture vision</span><a className="text-link" href="#object">Take another look <Arrow diagonal /></a></div>
        <Heading text="To feel strong. To live well. Every day." className="closing-statement" />
        <div className="closing-bottom"><p>Everyday Nutrition<br />for Every Woman.</p><span className="closing-signature">nurture everyday</span></div>
      </section>
    </main>
    <footer className="footer">
      <div className="footer-top"><a className="footer-brand" href="#top" aria-label="TRAYN Nutrition — back to top"><span className="trayn-symbol" /><span className="trayn-wordmark" /></a><p>Nurture Everyday.<br />A concept by TRAYN Nutrition.</p><nav aria-label="Footer navigation">{navigation.map(link => <a href={link.href} key={link.href}>{link.label}</a>)}<a href="#development">In the making</a></nav><a className="back-top" href="#top">Back to top <span aria-hidden="true">↑</span></a></div>
      <details className="image-disclosure"><summary>About the concept images <span aria-hidden="true">+</span></summary><p>{imageDisclosure}</p></details>
      <div className="footer-baseline"><span>© TRAYN Nutrition</span><span>Product concept · Not yet available for purchase</span><span>Made with care.</span></div>
    </footer>
  </div>;
}


