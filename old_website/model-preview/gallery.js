import { createIcons, ArrowUpRight, Download, X } from 'lucide';

const photos = [
  ['front', 'Front', new URL('../assets/product-photos/v2/nurture-front-v2.png', import.meta.url).href],
  ['three-quarter', 'Three Quarter', new URL('../assets/product-photos/v2/nurture-three-quarter-v2.png', import.meta.url).href],
  ['back', 'Back', new URL('../assets/product-photos/v2/nurture-back-v2.png', import.meta.url).href],
  ['side', 'Side', new URL('../assets/product-photos/v2/nurture-side-v2.png', import.meta.url).href],
  ['top', 'Top', new URL('../assets/product-photos/v2/nurture-top-v2.png', import.meta.url).href],
  ['open-lid', 'Open Lid', new URL('../assets/product-photos/v2/nurture-open-lid-v2.png', import.meta.url).href],
  ['lid-detail', 'Lid Detail', new URL('../assets/product-photos/v2/nurture-lid-detail-v2.png', import.meta.url).href],
  ['front-transparent', 'Front Cutout', new URL('../assets/product-photos/v2/nurture-front-transparent-v2.png', import.meta.url).href],
  ['angle-transparent', 'Angled Cutout', new URL('../assets/product-photos/v2/nurture-angle-transparent-v2.png', import.meta.url).href],
];

const grid = document.querySelector('#photo-grid');
const dialog = document.querySelector('#photo-dialog');
const dialogImage = document.querySelector('#dialog-image');
const dialogDownload = document.querySelector('#dialog-download');

for (const [id, title, url] of photos) {
  const figure = document.createElement('figure');
  figure.className = 'photo-item';
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `photo-open${id.includes('transparent') ? ' cutout' : ''}`;
  button.setAttribute('aria-label', `View ${title.toLowerCase()} photo`);
  const img = document.createElement('img');
  img.src = url;
  img.alt = `Nurture Everyday concept: ${title.toLowerCase()}`;
  img.width = 1600;
  img.height = 2000;
  img.loading = id === 'front' || id === 'three-quarter' ? 'eager' : 'lazy';
  button.append(img);
  button.addEventListener('click', () => {
    document.querySelector('#dialog-title').textContent = title;
    dialogImage.src = url;
    dialogImage.alt = img.alt;
    dialogDownload.href = url;
    dialogDownload.download = `nurture-${id}-v2.png`;
    dialog.showModal();
  });
  const caption = document.createElement('figcaption');
  const label = document.createElement('span');
  label.textContent = title;
  const download = document.createElement('a');
  download.href = url;
  download.download = `nurture-${id}-v2.png`;
  download.className = 'photo-download';
  download.setAttribute('aria-label', `Download ${title.toLowerCase()} photo`);
  download.title = `Download ${title.toLowerCase()}`;
  const icon = document.createElement('i');
  icon.setAttribute('data-lucide', 'download');
  download.append(icon);
  caption.append(label, download);
  figure.append(button, caption);
  grid.append(figure);
}

document.querySelector('#dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => {
  if (event.target !== dialog) return;
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
});
createIcons({ icons: { ArrowUpRight, Download, X } });
