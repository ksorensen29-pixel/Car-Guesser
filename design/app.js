const silhouetteImg = document.getElementById('silhouetteImg');
const emailInput = document.getElementById('emailInput');
const guestBtn = document.getElementById('guestBtn');
const signInBtn = document.getElementById('signInBtn');

// Small, tasteful entry animation sequence
window.addEventListener('load', () => {
  setTimeout(() => document.body.classList.add('loaded'), 60);
  // gentle silhouette wobble
  if (silhouetteImg) {
    silhouetteImg.animate([
      { transform: 'translateY(12px) rotate(-1.5deg)' },
      { transform: 'translateY(0px) rotate(1.5deg)' },
      { transform: 'translateY(12px) rotate(-1.5deg)' }
    ], { duration: 4200, iterations: Infinity, easing: 'ease-in-out' });
  }
  loadRandomSilhouette();
});

// Parallax subtle mouse movement for atmosphere layers (non-invasive)
if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches === false) {
  const atmosphere = document.querySelector('.atmosphere');
  const sheen = document.querySelector('.pattern-sheen');
  const flLeft = document.querySelector('.flare.left');
  const flRight = document.querySelector('.flare.right');
  let raf = null;
  window.addEventListener('pointermove', (e) => {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const cx = window.innerWidth/2; const cy = window.innerHeight/2;
      const dx = (e.clientX - cx) / cx; const dy = (e.clientY - cy) / cy;
      if (atmosphere) atmosphere.style.transform = `translate(${dx*6}px, ${dy*6}px)`;
      if (sheen) sheen.style.transform = `translate(${dx*20}px, ${dy*8}px) rotate(-12deg)`;
      if (flLeft) flLeft.style.transform = `translate(${dx*10}px, ${dy*6}px)`;
      if (flRight) flRight.style.transform = `translate(${dx*-8}px, ${dy*-6}px)`;
    });
  }, { passive: true });
}

// load a random silhouette image from the photos folder (visual only)
function loadRandomSilhouette() {
  const imgs = [];
  for (let i = 1; i <= 31; i++) imgs.push(i + '.jpeg');
  // pick a random filename and assign
  const pick = imgs[Math.floor(Math.random() * imgs.length)];
  if (silhouetteImg) {
    silhouetteImg.classList.remove('show');
    silhouetteImg.setAttribute('aria-busy', 'true');
    // Determine correct photos path depending on document location.
    const photosPath = window.location.pathname.includes('/design/') ? '../ScriptMats/photos' : 'ScriptMats/photos';
    silhouetteImg.src = `${photosPath}/${pick}`;
    silhouetteImg.onload = () => { silhouetteImg.classList.add('show'); silhouetteImg.removeAttribute('aria-busy'); };
    silhouetteImg.onerror = () => {
      // try the alternate path if initial fails
      const alt = photosPath.startsWith('..') ? 'ScriptMats/photos' : '../ScriptMats/photos';
      silhouetteImg.src = `${alt}/${pick}`;
    };
  }
}
// toggle reveal on click/tap (visual only)
if (silhouetteImg) {
  silhouetteImg.addEventListener('click', () => {
    silhouetteImg.classList.toggle('revealed');
  });
  // keyboard accessible: space or enter toggles reveal
  silhouetteImg.tabIndex = 0;
  silhouetteImg.setAttribute('role', 'button');
  silhouetteImg.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      silhouetteImg.classList.toggle('revealed');
    }
  });
}

// If user typed in the main email, mirror into popup when it opens
document.addEventListener('click', (e) => {
  const target = e.target;
  if (target && (target.id === 'guestBtn' || target.id === 'signInBtn')) {
    const popupEmail = document.getElementById('popupEmail');
    if (popupEmail && emailInput && emailInput.value.trim()) popupEmail.value = emailInput.value.trim();
  }
});

// graceful fallback: if existing global function exists, call it
if (window.saveGuestEmail && typeof window.saveGuestEmail === 'function' && guestBtn) {
  guestBtn.addEventListener('click', () => window.saveGuestEmail());
}

// tiny keyboard shortcut: press "G" to trigger guest button
window.addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() === 'g' && guestBtn) {
    guestBtn.focus();
    guestBtn.click();
  }
});