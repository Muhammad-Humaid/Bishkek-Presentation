/**
 * BISHKEK, KYRGYZSTAN — Clean Modern Presentation Script
 */

document.addEventListener('DOMContentLoaded', () => {
  const state = {
    currentSlide: 1,
    totalSlides: 11,
    mode: 'presentation', // 'presentation' | 'scroll'
  };

  // DOM Elements
  const slides = Array.from(document.querySelectorAll('.slide'));
  const slideCurr = document.getElementById('slide-curr');
  const slideTotal = document.getElementById('slide-total');
  const progressBar = document.getElementById('deck-progress-bar');
  const barSlideTitle = document.getElementById('bar-slide-title');
  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');
  const btnStart = document.getElementById('btn-start');
  const btnOverviewTrigger = document.getElementById('btn-overview-trigger');
  const btnRestart = document.getElementById('btn-restart');
  const btnReadStory = document.getElementById('btn-read-story');
  const btnModePresentation = document.getElementById('btn-mode-presentation');
  const btnModeScroll = document.getElementById('btn-mode-scroll');
  const btnToggleGrid = document.getElementById('btn-toggle-grid');
  const btnCloseDrawer = document.getElementById('btn-close-drawer');
  const slideDrawer = document.getElementById('slide-drawer');
  const drawerOverlay = document.getElementById('drawer-overlay');
  const drawerList = document.getElementById('drawer-list');
  const btnToggleFullscreen = document.getElementById('btn-toggle-fullscreen');
  const navBrand = document.getElementById('nav-brand');

  // ==========================================
  // NAVIGATION LOGIC
  // ==========================================
  function goToSlide(slideIndex) {
    if (slideIndex < 1) slideIndex = 1;
    if (slideIndex > state.totalSlides) slideIndex = state.totalSlides;

    state.currentSlide = slideIndex;

    if (state.mode === 'presentation') {
      slides.forEach((slide) => {
        const idx = parseInt(slide.dataset.slideIndex, 10);
        if (idx === slideIndex) {
          slide.classList.add('active');
          if (barSlideTitle) {
            barSlideTitle.textContent = slide.dataset.slideTitle || `Slide ${idx}`;
          }
        } else {
          slide.classList.remove('active');
        }
      });
    } else {
      const target = document.getElementById(`slide-${slideIndex}`);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }

    // Update Counter & Progress
    const padded = String(slideIndex).padStart(2, '0');
    if (slideCurr) slideCurr.textContent = padded;
    if (progressBar) {
      const pct = (slideIndex / state.totalSlides) * 100;
      progressBar.style.width = `${pct}%`;
    }

    // Prev / Next button states
    if (btnPrev) btnPrev.disabled = (slideIndex === 1);
    if (btnNext) btnNext.disabled = (slideIndex === state.totalSlides);

    // Update Drawer Active State
    document.querySelectorAll('.drawer-item').forEach((item) => {
      const iIdx = parseInt(item.dataset.slideNum, 10);
      item.classList.toggle('active', iIdx === slideIndex);
    });
  }

  function nextSlide() {
    if (state.currentSlide < state.totalSlides) {
      goToSlide(state.currentSlide + 1);
    }
  }

  function prevSlide() {
    if (state.currentSlide > 1) {
      goToSlide(state.currentSlide - 1);
    }
  }

  // Event Listeners for Nav Controls
  if (btnPrev) btnPrev.addEventListener('click', prevSlide);
  if (btnNext) btnNext.addEventListener('click', nextSlide);
  if (btnStart) btnStart.addEventListener('click', () => goToSlide(2));
  if (btnRestart) btnRestart.addEventListener('click', () => goToSlide(1));
  if (navBrand) navBrand.addEventListener('click', () => goToSlide(1));

  // Keyboard Shortcuts
  document.addEventListener('keydown', (e) => {
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

    switch (e.key) {
      case 'ArrowRight':
      case 'PageDown':
      case ' ':
        e.preventDefault();
        nextSlide();
        break;
      case 'ArrowLeft':
      case 'PageUp':
        e.preventDefault();
        prevSlide();
        break;
      case 'Home':
        e.preventDefault();
        goToSlide(1);
        break;
      case 'End':
        e.preventDefault();
        goToSlide(state.totalSlides);
        break;
      case 'f':
      case 'F':
        toggleFullscreen();
        break;
      case 'o':
      case 'O':
        toggleDrawer();
        break;
      case 'Escape':
        closeDrawer();
        break;
    }
  });

  // Mobile / Touch Swipes
  let touchStartX = 0;
  let touchEndX = 0;
  document.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  document.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    if (touchEndX < touchStartX - 50) nextSlide();
    if (touchEndX > touchStartX + 50) prevSlide();
  }, { passive: true });

  // ==========================================
  // VIEW MODE SWITCHER (DECK VS STORY)
  // ==========================================
  function updateStoryScroll() {
    if (state.mode !== 'scroll') return;

    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = docHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)) : 0;

    // Lock horizontal progress line to current scroll position
    if (progressBar) {
      progressBar.style.width = `${scrollPercent}%`;
    }

    // Update active slide counter based on scroll position
    let currentIdx = 1;
    slides.forEach((slide) => {
      const rect = slide.getBoundingClientRect();
      if (rect.top <= window.innerHeight * 0.45) {
        currentIdx = parseInt(slide.dataset.slideIndex, 10);
      }
    });

    state.currentSlide = currentIdx;
    if (slideCurr) slideCurr.textContent = String(currentIdx).padStart(2, '0');
    if (barSlideTitle) {
      const activeSlide = document.getElementById(`slide-${currentIdx}`);
      barSlideTitle.textContent = activeSlide?.dataset.slideTitle || `Slide ${currentIdx}`;
    }

    // Update drawer item highlight
    document.querySelectorAll('.drawer-item').forEach((item) => {
      const iIdx = parseInt(item.dataset.slideNum, 10);
      item.classList.toggle('active', iIdx === currentIdx);
    });
  }

  // Scroll listener for Story mode
  window.addEventListener('scroll', updateStoryScroll, { passive: true });

  function setMode(newMode) {
    state.mode = newMode;
    document.body.classList.remove('mode-presentation', 'mode-scroll');
    document.body.classList.add(`mode-${newMode}`);

    if (newMode === 'presentation') {
      btnModePresentation?.classList.add('active');
      btnModeScroll?.classList.remove('active');
      goToSlide(state.currentSlide);
    } else {
      btnModePresentation?.classList.remove('active');
      btnModeScroll?.classList.add('active');
      
      // Immediately lock horizontal line to scroll position
      updateStoryScroll();

      const target = document.getElementById(`slide-${state.currentSlide}`);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }

  if (btnModePresentation) btnModePresentation.addEventListener('click', () => setMode('presentation'));
  if (btnModeScroll) btnModeScroll.addEventListener('click', () => setMode('scroll'));
  if (btnReadStory) btnReadStory.addEventListener('click', () => setMode('scroll'));

  // ==========================================
  // SLIDE DRAWER / INDEX
  // ==========================================
  function buildDrawer() {
    if (!drawerList) return;
    drawerList.innerHTML = '';

    slides.forEach((slide) => {
      const idx = slide.dataset.slideIndex;
      const title = slide.dataset.slideTitle || `Slide ${idx}`;

      const item = document.createElement('div');
      item.className = `drawer-item ${parseInt(idx, 10) === state.currentSlide ? 'active' : ''}`;
      item.dataset.slideNum = idx;
      item.innerHTML = `
        <span class="drawer-num">${String(idx).padStart(2, '0')}</span>
        <span class="drawer-title">${title}</span>
      `;

      item.addEventListener('click', () => {
        goToSlide(parseInt(idx, 10));
        closeDrawer();
      });

      drawerList.appendChild(item);
    });
  }

  function toggleDrawer() {
    if (slideDrawer?.classList.contains('open')) {
      closeDrawer();
    } else {
      openDrawer();
    }
  }

  function openDrawer() {
    buildDrawer();
    slideDrawer?.classList.add('open');
    drawerOverlay?.classList.add('open');
  }

  function closeDrawer() {
    slideDrawer?.classList.remove('open');
    drawerOverlay?.classList.remove('open');
  }

  if (btnToggleGrid) btnToggleGrid.addEventListener('click', toggleDrawer);
  if (btnOverviewTrigger) btnOverviewTrigger.addEventListener('click', openDrawer);
  if (btnCloseDrawer) btnCloseDrawer.addEventListener('click', closeDrawer);
  if (drawerOverlay) drawerOverlay.addEventListener('click', closeDrawer);

  // Fullscreen
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
    }
  }
  if (btnToggleFullscreen) btnToggleFullscreen.addEventListener('click', toggleFullscreen);

  // ==========================================
  // BISHKEK LIVE CLOCK (UTC+6)
  // ==========================================
  const bishkekTimeEl = document.getElementById('bishkek-time');
  function updateBishkekClock() {
    if (!bishkekTimeEl) return;
    const now = new Date();
    const bishkekTime = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Bishkek',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(now);
    bishkekTimeEl.textContent = bishkekTime;
  }
  updateBishkekClock();
  setInterval(updateBishkekClock, 1000);

  // Initialize First Slide
  goToSlide(1);
});
