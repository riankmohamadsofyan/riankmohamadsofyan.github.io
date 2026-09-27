/**
 * RIAN KRISTIANI MOHAMAD SOFYAN — FINANCE PORTFOLIO ENGINE
 * Ambient Canvas Nodes, 3D Tilt Glare, Live Fin-Dashboard Simulator,
 * Portrait Mode Switcher, and Toast Notifications.
 */

document.addEventListener('DOMContentLoaded', () => {

  // ========================================================================
  // ========================================================================
  // 1. FULLSCREEN 360° CINEMATIC BACKGROUND ENGINE (WHOLE WEBSITE)
  // ========================================================================
  const TOTAL_FRAMES = 300;
  const canvas = document.getElementById('ambientCanvas');
  const ctx = canvas ? canvas.getContext('2d', { alpha: false }) : null;

  // UI Controller DOM Elements
  const toggleBgModeBtn = document.getElementById('toggleBgModeBtn');
  const bgModeText = document.getElementById('bgModeText');
  const heroGestureHint = document.getElementById('heroGestureHint');
  const btnAutoRotateMini = document.getElementById('btnAutoRotateMini');
  const autoRotateIconMini = document.getElementById('autoRotateIconMini');
  const autoRotateLabelMini = document.getElementById('autoRotateLabelMini');

  // Background display mode ('seamless' or 'cover')
  let bgMode = localStorage.getItem('porto_bg_mode') || 'seamless';
  if (bgModeText) bgModeText.textContent = bgMode === 'cover' ? 'BG: Cover' : 'BG: Seamless';

  const images = new Array(TOTAL_FRAMES + 1);
  let loadedCount = 0;

  // Silky smooth LERP interpolation state (starts facing front: 0.5)
  let currentProgress = 0.5;
  let targetProgress = 0.5;
  let lastRenderedIndex = -1;
  const LERP_SPEED = 0.085;

  // Mouse coordinates for 3D parallax
  let mouseX = 0;
  let mouseY = 0;
  let currentParallaxX = 0;
  let currentParallaxY = 0;

  // Frame URL generator
  const getFrameUrl = (index) => `assets/background/ezgif-frame-${String(index).padStart(3, '0')}.jpg`;

  // High-DPI canvas configuration (limited to 2 for mobile GPU efficiency)
  let dpr = 1;
  let viewWidth = 0;
  let viewHeight = 0;

  function resizeCanvas() {
    if (!canvas || !ctx) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    viewWidth = window.innerWidth;
    viewHeight = window.innerHeight;

    canvas.width = Math.round(viewWidth * dpr);
    canvas.height = Math.round(viewHeight * dpr);

    canvas.style.width = `${viewWidth}px`;
    canvas.style.height = `${viewHeight}px`;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    if (lastRenderedIndex >= 1 && images[lastRenderedIndex]) {
      drawFrame(images[lastRenderedIndex]);
    }
  }

  // Offscreen canvas for fast, high-performance edge feathering
  let featherCanvas = null;
  let featherCtx = null;

  function getFeatheredImage(img, w, h) {
    if (!featherCanvas) {
      featherCanvas = document.createElement('canvas');
      featherCtx = featherCanvas.getContext('2d');
    }
    if (featherCanvas.width !== w || featherCanvas.height !== h) {
      featherCanvas.width = w;
      featherCanvas.height = h;
    }

    featherCtx.clearRect(0, 0, w, h);
    featherCtx.drawImage(img, 0, 0, w, h);

    // Feather the left and right borders smoothly so there are zero hard box lines
    featherCtx.globalCompositeOperation = 'destination-in';
    const featherWidth = Math.min(100, Math.round(w * 0.16));
    const grad = featherCtx.createLinearGradient(0, 0, w, 0);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(featherWidth / w, 'rgba(0,0,0,1)');
    grad.addColorStop(1 - (featherWidth / w), 'rgba(0,0,0,1)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');

    featherCtx.fillStyle = grad;
    featherCtx.fillRect(0, 0, w, h);

    featherCtx.globalCompositeOperation = 'source-over';
    return featherCanvas;
  }

  // Draw frame with full-bleed background and transparent overlay
  function drawFrame(img) {
    if (!ctx || !img || !img.complete || img.naturalWidth === 0) return;

    const imgW = img.naturalWidth;
    const imgH = img.naturalHeight;

    const offsetX = currentParallaxX * 14;
    const offsetY = currentParallaxY * 8;

    // Dark obsidian base matching the theme
    ctx.fillStyle = '#03070d';
    ctx.fillRect(0, 0, viewWidth, viewHeight);

    if (bgMode === 'cover') {
      // MODE: TRUE FULL COVER (Stretches edge-to-edge across 100% of viewport)
      const scale = Math.max(viewWidth / imgW, viewHeight / imgH);
      const w = imgW * scale;
      const h = imgH * scale;
      const x = (viewWidth - w) / 2 + offsetX;
      const y = (viewHeight - h) * 0.2 + offsetY;

      ctx.drawImage(img, x, y, w, h);

      // Light, transparent gradient so the moving photo is bright and clear
      const leftShadow = ctx.createLinearGradient(0, 0, viewWidth * 0.55, 0);
      leftShadow.addColorStop(0, 'rgba(3, 7, 13, 0.45)');
      leftShadow.addColorStop(0.5, 'rgba(3, 7, 13, 0.15)');
      leftShadow.addColorStop(1, 'rgba(3, 7, 13, 0)');
      ctx.fillStyle = leftShadow;
      ctx.fillRect(0, 0, viewWidth, viewHeight);
    } else {
      // MODE: FULL SEAMLESS (Ambient Glow + Complete Sharp Portrait)
      // 1. Pass 1: Full-bleed blurred background filling 100% of the screen with live video colors
      ctx.save();
      const bgScale = Math.max(viewWidth / imgW, viewHeight / imgH);
      const bgW = imgW * bgScale;
      const bgH = imgH * bgScale;
      const bgX = (viewWidth - bgW) / 2;
      const bgY = (viewHeight - bgH) * 0.25;

      ctx.filter = 'blur(35px) brightness(0.7) saturate(125%)';
      ctx.drawImage(img, bgX, bgY, bgW, bgH);
      ctx.restore();

      // 2. Pass 2: Atmospheric emerald/gold ambient light spread
      const ambientGlow = ctx.createRadialGradient(
        viewWidth * 0.65, viewHeight * 0.45, 40,
        viewWidth * 0.65, viewHeight * 0.45, viewWidth * 0.6
      );
      ambientGlow.addColorStop(0, 'rgba(0, 229, 153, 0.12)');
      ambientGlow.addColorStop(0.5, 'rgba(0, 180, 216, 0.05)');
      ambientGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = ambientGlow;
      ctx.fillRect(0, 0, viewWidth, viewHeight);

      // 3. Pass 3: Sharp foreground subject with feathered edges
      let fgScale;
      if (viewWidth < viewHeight) {
        // Mobile vertical aspect ratio
        fgScale = Math.max(viewWidth / imgW, viewHeight / imgH) * 0.98;
      } else {
        // Desktop: 110% viewport height
        fgScale = (viewHeight / imgH) * 1.10;
      }
      const fgW = Math.round(imgW * fgScale);
      const fgH = Math.round(imgH * fgScale);

      // Shift right on desktop so Rian stands prominently in the open right side
      const centerShift = viewWidth > 960 ? viewWidth * 0.14 : 0;
      const fgX = Math.round((viewWidth - fgW) / 2 + centerShift + offsetX);
      const fgY = Math.round((viewHeight - fgH) / 2 + offsetY);

      const featheredImg = getFeatheredImage(img, fgW, fgH);
      ctx.drawImage(featheredImg, fgX, fgY);

      // 4. Pass 4: Light, transparent gradient to ensure typography contrast
      const leftShadow = ctx.createLinearGradient(0, 0, viewWidth * 0.55, 0);
      leftShadow.addColorStop(0, 'rgba(3, 7, 13, 0.4)');
      leftShadow.addColorStop(0.5, 'rgba(3, 7, 13, 0.12)');
      leftShadow.addColorStop(1, 'rgba(3, 7, 13, 0)');
      ctx.fillStyle = leftShadow;
      ctx.fillRect(0, 0, viewWidth, viewHeight);
    }
  }

  // Safe UI state helper
  function updateHudUI(frameIdx) {
    // Retained for potential UI badge updates
  }

  // Main background animation loop
  function renderLoop() {
    const diff = targetProgress - currentProgress;
    if (Math.abs(diff) > 0.0001) {
      currentProgress += diff * LERP_SPEED;
    } else {
      currentProgress = targetProgress;
    }

    currentParallaxX += (mouseX - currentParallaxX) * 0.05;
    currentParallaxY += (mouseY - currentParallaxY) * 0.05;

    const frameIndex = Math.min(
      TOTAL_FRAMES,
      Math.max(1, Math.round(currentProgress * (TOTAL_FRAMES - 1)) + 1)
    );

    const isParallaxMoving = Math.abs(mouseX - currentParallaxX) > 0.002 || Math.abs(mouseY - currentParallaxY) > 0.002;
    if (frameIndex !== lastRenderedIndex || isParallaxMoving) {
      // Find closest loaded image if current frame is loading
      let img = images[frameIndex];
      if (!img || !img.complete || img.naturalWidth === 0) {
        for (let offset = 1; offset <= 30; offset++) {
          const prev = ((frameIndex - offset - 1 + TOTAL_FRAMES) % TOTAL_FRAMES) + 1;
          const next = ((frameIndex + offset - 1) % TOTAL_FRAMES) + 1;
          if (images[prev] && images[prev].complete && images[prev].naturalWidth > 0) {
            img = images[prev];
            break;
          }
          if (images[next] && images[next].complete && images[next].naturalWidth > 0) {
            img = images[next];
            break;
          }
        }
      }

      if (img && img.complete && img.naturalWidth > 0) {
        drawFrame(img);
        lastRenderedIndex = frameIndex;
      }

      updateHudUI(frameIndex);
    }

    requestAnimationFrame(renderLoop);
  }

  // Scroll listener for whole website
  function onScroll() {
    if (isDragging || isAutoRotating) return;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (maxScroll > 0) {
      targetProgress = Math.min(1, Math.max(0, window.scrollY / maxScroll));
    } else {
      targetProgress = 0.5;
    }
  }

  // Mouse move handler for 3D parallax
  function onMouseMove(e) {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = (e.clientY / window.innerHeight) * 2 - 1;
  }

  // Preloading System
  function loadSingleFrame(idx, onDone) {
    if (images[idx]) return;
    const img = new Image();
    img.src = getFrameUrl(idx);
    img.onload = () => {
      images[idx] = img;
      loadedCount++;
      if (onDone) onDone();
    };
    img.onerror = () => {
      img.src = getFrameUrl(idx);
    };
  }

  function initPreloading() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    // 1. Load initial frame 150 immediately (front view)
    loadSingleFrame(150, () => {
      drawFrame(images[150]);
      updateHudUI(150);
    });

    // 2. Load sparse keyframes (every 15 frames) for fast responsiveness
    const keyframes = [];
    for (let i = 1; i <= TOTAL_FRAMES; i += 15) {
      if (i !== 150) keyframes.push(i);
    }
    keyframes.forEach(k => loadSingleFrame(k));

    // 3. Load remaining frames progressively in chunks
    let nextIdx = 1;
    function loadNextBatch() {
      const batchSize = 10;
      let count = 0;
      while (nextIdx <= TOTAL_FRAMES && count < batchSize) {
        loadSingleFrame(nextIdx);
        nextIdx++;
        count++;
      }
      if (nextIdx <= TOTAL_FRAMES) {
        setTimeout(loadNextBatch, 35);
      }
    }
    setTimeout(loadNextBatch, 120);

    requestAnimationFrame(renderLoop);
  }

  initPreloading();

  // Background Display Mode Toggle (Seamless vs Cover)
  if (toggleBgModeBtn) {
    toggleBgModeBtn.addEventListener('click', () => {
      bgMode = bgMode === 'seamless' ? 'cover' : 'seamless';
      localStorage.setItem('porto_bg_mode', bgMode);
      if (bgModeText) bgModeText.textContent = bgMode === 'cover' ? 'BG: Cover' : 'BG: Seamless';
      if (lastRenderedIndex >= 1 && images[lastRenderedIndex]) {
        drawFrame(images[lastRenderedIndex]);
      }
      showToast(`Mode Background: ${bgMode === 'cover' ? 'Full Cover (Edge-to-Edge)' : 'Full Seamless (Ambient Glow)'}`);
    });
  }

  // ========================================================================
  // FULLSCREEN SWIPE & TOUCH ENGINE (ANDROID, IOS & DESKTOP FRIENDLY)
  // ========================================================================
  let isDragging = false;
  let touchStartX = 0;
  let touchStartY = 0;
  let lastTouchX = 0;
  let startProgress = 0.5;
  let swipeVelocity = 0;
  let inertiaRaf = null;
  let isHorizontalSwipe = false;

  // 1. Mobile Touch Events (Android & iOS)
  window.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    if (e.target.closest('button, a, input, select, textarea, .nav-menu, .copy-field, .btn, .modal')) return;

    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    lastTouchX = touch.clientX;
    startProgress = currentProgress;
    swipeVelocity = 0;
    isHorizontalSwipe = false;
    cancelAnimationFrame(inertiaRaf);
    if (isAutoRotating) toggleAutoRotate(false);
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    const dx = touch.clientX - touchStartX;
    const dy = touch.clientY - touchStartY;

    // Detect horizontal swipe vs vertical scroll
    if (!isHorizontalSwipe && Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy) * 1.15) {
      isHorizontalSwipe = true;
      isDragging = true;
    }

    if (isHorizontalSwipe) {
      const progressDelta = -dx / 600;
      swipeVelocity = touch.clientX - lastTouchX;
      lastTouchX = touch.clientX;
      targetProgress = Math.min(1, Math.max(0, startProgress + progressDelta));
      if (e.cancelable) e.preventDefault();
    }
  }, { passive: false });

  window.addEventListener('touchend', (e) => {
    if (!isHorizontalSwipe) return;
    isHorizontalSwipe = false;
    isDragging = false;

    // Inertia physics on flick
    if (Math.abs(swipeVelocity) > 2) {
      let vel = -swipeVelocity / 600;
      function applyInertia() {
        if (Math.abs(vel) < 0.0005 || isDragging) return;
        targetProgress = Math.min(1, Math.max(0, targetProgress + vel));
        vel *= 0.92;
        inertiaRaf = requestAnimationFrame(applyInertia);
      }
      inertiaRaf = requestAnimationFrame(applyInertia);
    }
  });

  // 2. Mouse Drag Events (Desktop)
  let isMouseDown = false;
  let mouseStartX = 0;
  let lastMouseX = 0;
  let mouseDragVelocity = 0;

  window.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    if (e.target.closest('button, a, input, select, textarea, .nav-menu, .copy-field, .btn, .modal')) return;

    isMouseDown = true;
    isDragging = true;
    mouseStartX = e.clientX;
    lastMouseX = e.clientX;
    startProgress = currentProgress;
    mouseDragVelocity = 0;
    cancelAnimationFrame(inertiaRaf);
    if (isAutoRotating) toggleAutoRotate(false);
    document.body.style.cursor = 'grabbing';
  });

  window.addEventListener('mousemove', (e) => {
    if (!isMouseDown) return;
    const dx = e.clientX - mouseStartX;
    const progressDelta = -dx / 800;
    mouseDragVelocity = e.clientX - lastMouseX;
    lastMouseX = e.clientX;
    targetProgress = Math.min(1, Math.max(0, startProgress + progressDelta));
  });

  const endMouseDrag = () => {
    if (!isMouseDown) return;
    isMouseDown = false;
    isDragging = false;
    document.body.style.cursor = '';

    if (Math.abs(mouseDragVelocity) > 2) {
      let vel = -mouseDragVelocity / 800;
      function applyInertia() {
        if (Math.abs(vel) < 0.0005 || isDragging) return;
        targetProgress = Math.min(1, Math.max(0, targetProgress + vel));
        vel *= 0.90;
        inertiaRaf = requestAnimationFrame(applyInertia);
      }
      inertiaRaf = requestAnimationFrame(applyInertia);
    }
  };

  window.addEventListener('mouseup', endMouseDrag);
  window.addEventListener('mouseleave', endMouseDrag);

  // Auto-Rotate Engine (Mini Button)
  let isAutoRotating = false;
  let autoRotateInterval = null;

  function toggleAutoRotate(forceState) {
    isAutoRotating = typeof forceState === 'boolean' ? forceState : !isAutoRotating;
    if (btnAutoRotateMini) {
      btnAutoRotateMini.classList.toggle('active', isAutoRotating);
    }
    if (autoRotateIconMini) {
      autoRotateIconMini.textContent = isAutoRotating ? '⏸' : '⏵';
    }
    if (autoRotateLabelMini) {
      autoRotateLabelMini.textContent = isAutoRotating ? 'Jeda 360°' : 'Auto 360°';
    }
    if (autoRotateInterval) clearInterval(autoRotateInterval);

    if (isAutoRotating) {
      autoRotateInterval = setInterval(() => {
        targetProgress += 1 / (TOTAL_FRAMES - 1);
        if (targetProgress > 1) targetProgress = 0;
      }, 40);
      showToast('Putar otomatis background 360° aktif');
    }
  }

  if (btnAutoRotateMini) {
    btnAutoRotateMini.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleAutoRotate();
    });
  }

  // ========================================================================
  // 2. 3D TILT & SPECULAR GLARE EFFECT
  // ========================================================================
  const tiltCards = document.querySelectorAll('.tilt-card');
  tiltCards.forEach(card => {
    const depth = parseFloat(card.getAttribute('data-depth')) || 20;

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -(depth / 3);
      const rotateY = ((x - centerX) / centerX) * (depth / 3);

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.01, 1.01, 1.01)`;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
    });

    card.addEventListener('mouseenter', () => {
      card.style.transition = 'none';
    });
  });

  // ========================================================================
  // 4. PROJECT SHOWCASE LIGHTBOX PREVIEW
  // ========================================================================
  const imageLightboxModal = document.getElementById('imageLightboxModal');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxCloseBtn = document.getElementById('lightboxCloseBtn');
  const lightboxBackdrop = document.getElementById('lightboxBackdrop');

  function openLightbox(imgSrc, captionText) {
    if (!imageLightboxModal || !lightboxImg) return;
    lightboxImg.src = imgSrc;
    lightboxImg.alt = captionText || 'Pratinjau Project';
    if (lightboxCaption) {
      lightboxCaption.textContent = captionText || 'Pratinjau Project';
    }
    imageLightboxModal.removeAttribute('hidden');
    imageLightboxModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (!imageLightboxModal) return;
    imageLightboxModal.setAttribute('hidden', '');
    imageLightboxModal.setAttribute('aria-hidden', 'true');
    if (lightboxImg) lightboxImg.src = '';
    const cvModalElem = document.getElementById('cvModal');
    if (!cvModalElem || cvModalElem.hasAttribute('hidden')) {
      document.body.style.overflow = '';
    }
  }

  // Ensure initially hidden
  if (imageLightboxModal) {
    imageLightboxModal.setAttribute('hidden', '');
  }

  // Bind all zoom preview buttons & media click triggers
  document.querySelectorAll('[data-zoom]').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const zoomSrc = trigger.getAttribute('data-zoom');
      const title = trigger.getAttribute('data-title') || 'Project Preview';
      if (zoomSrc) {
        openLightbox(zoomSrc, title);
      }
    });
  });

  if (lightboxCloseBtn) lightboxCloseBtn.addEventListener('click', closeLightbox);
  if (lightboxBackdrop) lightboxBackdrop.addEventListener('click', closeLightbox);

  // ========================================================================
  // 5. TOAST NOTIFICATIONS & 1-CLICK CLIPBOARD COPY
  // ========================================================================
  const toastContainer = document.getElementById('toastContainer');

  function showToast(message) {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00e599" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
      <span>${message}</span>
    `;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(15px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }

  // Handle all copy buttons
  document.querySelectorAll('[data-copy]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const textToCopy = btn.getAttribute('data-copy');
      if (!textToCopy) return;

      navigator.clipboard.writeText(textToCopy).then(() => {
        showToast(`Tersalin ke clipboard: ${textToCopy}`);
      }).catch(() => {
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = textToCopy;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast(`Tersalin: ${textToCopy}`);
      });
    });
  });

  // ========================================================================
  // 6. SCROLL SPY & NAVBAR ACTIVE STATE
  // ========================================================================
  const navLinks = document.querySelectorAll('.nav-menu .nav-link:not(.nav-btn-cta)');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    let current = '';
    const scrollPos = window.scrollY + 200;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });

  // Mobile menu toggle
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const navMenu = document.getElementById('navMenu');
  if (mobileMenuBtn && navMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      navMenu.classList.toggle('open');
    });

    navMenu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
      });
    });
  }

  // ========================================================================
  // 7. CV MODAL DIALOG
  // ========================================================================
  const viewCvBtn = document.getElementById('viewCvBtn');
  const cvModal = document.getElementById('cvModal');
  const cvCloseBtn = document.getElementById('cvCloseBtn');
  const cvCloseBtnBottom = document.getElementById('cvCloseBtnBottom');
  const cvModalBackdrop = document.getElementById('cvModalBackdrop');
  const cvPrintBtn = document.getElementById('cvPrintBtn');

  function openCvModal() {
    if (!cvModal) return;
    cvModal.removeAttribute('hidden');
    cvModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeCvModal() {
    if (!cvModal) return;
    cvModal.setAttribute('hidden', '');
    cvModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // Hide initially
  if (cvModal) {
    cvModal.setAttribute('hidden', '');
  }

  if (viewCvBtn) viewCvBtn.addEventListener('click', openCvModal);
  if (cvCloseBtn) cvCloseBtn.addEventListener('click', closeCvModal);
  if (cvCloseBtnBottom) cvCloseBtnBottom.addEventListener('click', closeCvModal);
  if (cvModalBackdrop) cvModalBackdrop.addEventListener('click', closeCvModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (imageLightboxModal && !imageLightboxModal.hasAttribute('hidden')) {
        closeLightbox();
      } else if (cvModal && !cvModal.hasAttribute('hidden')) {
        closeCvModal();
      }
    }
  });

  if (cvPrintBtn) {
    cvPrintBtn.addEventListener('click', () => {
      window.print();
    });
  }

});
