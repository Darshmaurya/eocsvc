/* ===============================
   script.js - accessibility + UI
   =============================== */

/* Utility: query */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

/* ---------------------------
   Accessibility toolbar
   --------------------------- */
function setZoom(level) {
  document.documentElement.style.fontSize = `${level}%`;
}
let zoomLevel = 100;
window.zoomIn = () => { zoomLevel = Math.min(150, zoomLevel + 10); setZoom(zoomLevel); };
window.zoomOut = () => { zoomLevel = Math.max(80, zoomLevel - 10); setZoom(zoomLevel); };

window.toggleContrast = () => {
  document.body.classList.toggle('high-contrast');
};
window.toggleGrayscale = () => {
  document.body.classList.toggle('grayscale');
};

document.addEventListener('DOMContentLoaded', () => {
  // language selector placeholder (keeps semantics)
  const langSelect = document.getElementById('languageSelect');
  if(langSelect){
    langSelect.addEventListener('change', (e) => {
      // here you could add language toggle behaviour.
      // we keep it safe: show a small toast (screen-reader friendly)
      const lang = e.target.value;
      // visually unobtrusive announcement
      const announcer = document.getElementById('a11y-announcer');
      if(announcer){ announcer.textContent = lang === 'hi' ? 'भाषा हिंदी चुनी गई' : 'Language set to English'; }
    });
  }

  /* ---------------------------
     Scroll reveal for cards
     --------------------------- */
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if(e.isIntersecting) e.target.classList.add('visible');
    });
  }, {threshold:0.18});

  // apply to cards and hero sections
  $$(' .card, .team-grid .card, .card, .gallery-grid img, .event-card').forEach(el => {
    observer.observe(el);
    // prepare initial style for some elements (if not already)
    el.style.transition = 'transform 0.6s ease, opacity 0.6s ease';
    el.style.transform = 'translateY(18px)';
    el.style.opacity = '0';
  });

  // reveal on load for hero
  const hero = document.querySelector('.hero');
  if(hero){ hero.style.opacity = '1'; hero.style.transform='none'; }

  // make observer reveal by toggling visible class
  const revealChecker = () => {
    $$(' .card, .team-grid .card, .gallery-grid img, .event-card').forEach(el => {
      const rect = el.getBoundingClientRect();
      if(rect.top < window.innerHeight * 0.85) {
        el.style.transform='translateY(0)'; el.style.opacity='1';
      }
    });
  };
  window.addEventListener('scroll', revealChecker);
  window.addEventListener('load', revealChecker);

  /* ---------------------------
     Lightbox (gallery)
     --------------------------- */
  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox'; lightbox.setAttribute('role','dialog');
  const lightboxImg = document.createElement('img');
  lightbox.appendChild(lightboxImg);
  document.body.appendChild(lightbox);
  lightbox.addEventListener('click', () => lightbox.style.display = 'none');

  $$('.gallery-grid img').forEach(img => {
    img.addEventListener('click', (e) => {
      lightboxImg.src = img.src;
      lightbox.style.display = 'flex';
      lightbox.focus();
    });
    img.setAttribute('tabindex','0');
    img.addEventListener('keydown', (ev) => {
      if(ev.key === 'Enter' || ev.key === ' ') img.click();
    });
  });

  /* ---------------------------
     Contact form UX enhancement
     --------------------------- */
  const contactForm = document.querySelector('form[data-form="contact"]');
  if(contactForm){
    contactForm.addEventListener('submit', (ev) => {
      // Graceful UX: show message and allow normal submit to Formspree
      ev.preventDefault();
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      submitBtn.disabled = true; submitBtn.textContent = 'Sending...';
      const data = new FormData(contactForm);
      // Send to Formspree via fetch to provide immediate UX
      fetch(contactForm.action, {
        method: 'POST',
        body: data,
        headers: { 'Accept':'application/json' }
      }).then(resp => {
        if(resp.ok) {
          submitBtn.textContent = 'Sent ✓';
          contactForm.reset();
          setTimeout(()=>{ submitBtn.disabled=false; submitBtn.textContent='Send Message'; }, 1800);
        } else {
          return resp.json().then(json => Promise.reject(json));
        }
      }).catch(err => {
        alert('There was a problem sending your message. Please try again or email eocsvc.du@gmail.com');
        submitBtn.disabled=false; submitBtn.textContent='Send Message';
      });
    });
  }

});
