// ============ IMAGE LOADING ============
document.querySelectorAll('img').forEach(img => {
  if (img.complete) {
    img.classList.add('loaded');
  } else {
    img.addEventListener('load', () => img.classList.add('loaded'));
    img.addEventListener('error', () => {
      img.classList.add('loaded');
      // Fallback générique cohérent avec le thème mode
      img.src = 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80';
    });
  }
});

// ============ NAVIGATION SCROLL ============
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  if (window.scrollY > 60) nav.classList.add('scrolled');
  else nav.classList.remove('scrolled');
});

// ============ MOBILE MENU ============
const menuToggle = document.getElementById('menuToggle');
const mobileMenu = document.getElementById('mobileMenu');
const mobileClose = document.getElementById('mobileClose');

menuToggle.addEventListener('click', () => mobileMenu.classList.add('open'));
mobileClose.addEventListener('click', () => mobileMenu.classList.remove('open'));
mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => mobileMenu.classList.remove('open'));
});

// ============ HERO PARALLAX ============
const heroBg = document.getElementById('heroBg');
window.addEventListener('scroll', () => {
  const scrolled = window.scrollY;
  if (scrolled < window.innerHeight) {
    heroBg.style.transform = `translateY(${scrolled * 0.4}px) scale(1.1)`;
  }
});

// ============ SECTION REVEAL ============
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -80px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ============ STATS COUNTER ============
const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseInt(el.dataset.target);
      const duration = 2000;
      const start = performance.now();
      
      const animate = (now) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(target * easeOut);
        el.textContent = current.toLocaleString('fr-FR');
        if (progress < 1) requestAnimationFrame(animate);
        else el.textContent = target.toLocaleString('fr-FR');
      };
      requestAnimationFrame(animate);
      statObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-number').forEach(el => statObserver.observe(el));

// ============ GALLERY DRAG & SWIPE ============
const galleryTrack = document.getElementById('galleryTrack');
let isDown = false;
let startX;
let scrollLeft;
let hasDragged = false;
let dragDistance = 0;

function startDrag(e) {
  isDown = true;
  hasDragged = false;
  dragDistance = 0;
  galleryTrack.classList.add('dragging');
  const pageX = e.touches ? e.touches[0].pageX : e.pageX;
  startX = pageX - galleryTrack.offsetLeft;
  scrollLeft = galleryTrack.scrollLeft;
}

function endDrag() {
  isDown = false;
  galleryTrack.classList.remove('dragging');
  setTimeout(() => { hasDragged = false; }, 50);
}

function drag(e) {
  if (!isDown) return;
  e.preventDefault();
  const pageX = e.touches ? e.touches[0].pageX : e.pageX;
  const x = pageX - galleryTrack.offsetLeft;
  const walk = (x - startX) * 1.8;
  dragDistance = Math.abs(walk);
  if (dragDistance > 8) hasDragged = true;
  galleryTrack.scrollLeft = scrollLeft - walk;
}

galleryTrack.addEventListener('mousedown', startDrag);
galleryTrack.addEventListener('mouseleave', endDrag);
galleryTrack.addEventListener('mouseup', endDrag);
galleryTrack.addEventListener('mousemove', drag);
galleryTrack.addEventListener('touchstart', startDrag, { passive: true });
galleryTrack.addEventListener('touchend', endDrag);
galleryTrack.addEventListener('touchmove', drag, { passive: false });

const galleryItems = galleryTrack.querySelectorAll('.gallery-item');
const itemWidth = 395;

document.getElementById('galleryPrev').addEventListener('click', () => {
  galleryTrack.scrollBy({ left: -itemWidth * 2, behavior: 'smooth' });
});
document.getElementById('galleryNext').addEventListener('click', () => {
  galleryTrack.scrollBy({ left: itemWidth * 2, behavior: 'smooth' });
});

// ============ LIGHTBOX ============
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxPrev = document.getElementById('lightboxPrev');
const lightboxNext = document.getElementById('lightboxNext');
const lightboxCounter = document.getElementById('lightboxCounter');
let currentLightboxIndex = 0;
const galleryImages = Array.from(galleryItems).map(item => item.querySelector('img').src);

function openLightbox(index) {
  currentLightboxIndex = index;
  updateLightbox();
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
}

function updateLightbox() {
  lightboxImg.src = galleryImages[currentLightboxIndex];
  lightboxCounter.textContent = `${String(currentLightboxIndex + 1).padStart(2, '0')} / ${String(galleryImages.length).padStart(2, '0')}`;
}

function lightboxNextImg() {
  currentLightboxIndex = (currentLightboxIndex + 1) % galleryImages.length;
  updateLightbox();
}

function lightboxPrevImg() {
  currentLightboxIndex = (currentLightboxIndex - 1 + galleryImages.length) % galleryImages.length;
  updateLightbox();
}

galleryItems.forEach((item, index) => {
  item.addEventListener('click', (e) => {
    if (hasDragged) { e.preventDefault(); e.stopPropagation(); return; }
    openLightbox(index);
  });
});

lightboxClose.addEventListener('click', closeLightbox);
lightboxNext.addEventListener('click', lightboxNextImg);
lightboxPrev.addEventListener('click', lightboxPrevImg);
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});

document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('active')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowRight') lightboxNextImg();
  if (e.key === 'ArrowLeft') lightboxPrevImg();
});

// ============ FORMS & TOAST ============
const contactForm = document.getElementById('contactForm');
const toast = document.getElementById('toast');
const toastMsg = document.getElementById('toastMsg');

function showToast(msg) {
  toastMsg.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 4000);
}

contactForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = contactForm.name.value;
  showToast(`Merci ${name.split(' ')[0]} ! Votre message a bien été envoyé.`);
  contactForm.reset();
});

document.getElementById('newsletterForm').addEventListener('submit', (e) => {
  e.preventDefault();
  showToast('Inscription réussie ! Bienvenue dans la famille MARIE BIASHARA.');
  e.target.reset();
});

// ============ SMOOTH SCROLL ============
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// ============ COLLECTION & PRODUCT CLICKS ============
document.querySelectorAll('.collection-card').forEach(card => {
  card.addEventListener('click', () => {
    const name = card.querySelector('h3').textContent;
    showToast(`Découvrez notre collection : ${name}`);
  });
});

document.querySelectorAll('.product-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const name = btn.closest('.product-card').querySelector('.product-name').textContent;
    showToast(`Détails du produit : ${name}`);
  });
});

document.querySelectorAll('.product-card').forEach(card => {
  card.addEventListener('click', (e) => {
    if (e.target.classList.contains('product-btn') || e.target.closest('.product-wishlist') || e.target.closest('.product-btn')) return;
    const name = card.querySelector('.product-name').textContent;
    showToast(`Découvrez : ${name}`);
  });
});