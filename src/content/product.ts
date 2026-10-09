import { type LaunchData } from './launch';
export const product = {
  id: 'nurture-everyday',
  name: 'Nurture Everyday',
  brand: 'TRAYN Nutrition',
  stage: 'concept' as const,
  positioning: 'Everyday Nutrition for Every Woman',
  packWeight: '400g',
  tagline: 'To Feel Strong. To Live Well. Every Day.',
  media: {
    hero: './media/hero.webp',
    heroSmall: './media/hero-small.webp',
    detail: './media/lid-detail.webp',
    artwork: './media/artwork-detail.webp',
  },
  gallery: [
    { id: 'angle', label: 'The silhouette', source: './media/hero.webp', alt: 'Three-quarter CGI view of the Nurture Everyday cream tin and gold lid', caption: 'A familiar shape. A considered presence.', note: 'Three-quarter view', cutout: true },
    { id: 'front', label: 'The artwork', source: './media/front-cutout.webp', alt: 'Front CGI view of the Nurture Everyday botanical packaging artwork', caption: 'Everyday care, written into the details.', note: 'Front view', cutout: true },
    { id: 'open', label: 'The inside', source: './media/open-lid.webp', alt: 'CGI concept tin with the lid lifted, showing an empty interior', caption: 'A closer look at the packaging concept.', note: 'Open-lid study · contents not shown', cutout: false },
    { id: 'top', label: 'The finishing touch', source: './media/top.webp', alt: 'Top CGI view of the circular gold lid on the concept tin', caption: 'A quiet contrast of cream and gold.', note: 'Top view', cutout: false },
  ],
  // Launch-only information. Null means unconfirmed; do not render guesses.
  commerce: { price: null, currency: null, checkoutUrl: null, inventory: null } as LaunchData['commerce'],
  variants: [] as LaunchData['variants'],
  specifications: [] as LaunchData['specifications'],
  testimonials: [] as LaunchData['testimonials'],
};

export const navigation = [
  { href: '#intention', label: 'The intention' },
  { href: '#object', label: 'The object' },
  { href: '#details', label: 'The details' },
];

export const questions = [
  { question: 'What is Nurture Everyday?', answer: 'A nutrition product concept by TRAYN Nutrition, built around the idea of everyday care for women. The supplied packaging describes it as “Everyday Nutrition for Every Woman.” This is an introduction to the vision and packaging design; the final product is still in development.' },
  { question: 'Can I buy it yet?', answer: 'Nurture Everyday is not available to purchase through this website. A launch date, price, and ordering details will be shared when they are confirmed.' },
  { question: 'What will be inside?', answer: 'The final formulation, complete ingredients, allergens, and nutrition information have not yet been confirmed. The concept artwork is a design reference. Final product information will be published with the approved label.' },
  { question: 'Is this the final packaging?', answer: 'These are CGI packaging studies. The reference artwork shows a 400g tin, but final artwork and packaging dimensions may change. The images do not show a manufactured product.' },
  { question: 'How can I keep up with the launch?', answer: 'Return to this website for confirmed product information. An email signup will be introduced once a launch update service and its privacy information are in place.' },
];

export const imageDisclosure = 'All product views on this page are CGI packaging concepts derived from the supplied artwork. They do not show a manufactured product. Final packaging, formulation and approved product information may change.';
