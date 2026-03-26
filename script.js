/* ============================================
   STUDIO — AI-POWERED WEB DESIGN AGENCY
   Interactions & Animation Engine
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ========================================
  // 1. HLS VIDEO PLAYERS
  // ========================================
  const setupHLS = (videoId, src) => {
    const video = document.getElementById(videoId);
    if (!video) return;

    if (typeof Hls !== 'undefined' && Hls.isSupported()) {
      const hls = new Hls({
        capLevelToPlayerSize: true,
        maxMaxBufferLength: 30,
        startLevel: -1,
        enableWorker: true,
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari native HLS
      video.src = src;
    }
  };

  // Initialize all HLS video sections
  setupHLS('hls-video-1', 'https://stream.mux.com/9JXDljEVWYwWu01PUkAemafDugK89o01BR6zqJ3aS9u00A.m3u8');
  setupHLS('hls-video-2', 'https://stream.mux.com/NcU3HlHeF7CUL86azTTzpy3Tlb00d6iF3BmCdFslMJYM.m3u8');
  setupHLS('hls-video-3', 'https://stream.mux.com/8wrHPCX2dC3msyYU9ObwqNdm00u3ViXvOSHUMRYSEe5Q.m3u8');

  // ========================================
  // 2. BLUR TEXT ANIMATION (Word-by-Word)
  // ========================================
  document.querySelectorAll('.blur-text').forEach(el => {
    const text = el.textContent.trim();
    el.innerHTML = '';
    const words = text.split(/\s+/);

    words.forEach((word, idx) => {
      const span = document.createElement('span');
      span.textContent = word + ' ';
      span.className = 'blur-word';
      span.style.transitionDelay = `${idx * 100}ms`;
      el.appendChild(span);
    });
  });

  // ========================================
  // 3. INTERSECTION OBSERVER — Scroll Animations
  // ========================================
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -60px 0px',
    threshold: 0.12,
  };

  const animationObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = entry.target;

        if (target.classList.contains('blur-text')) {
          // Animate each word inside blur-text
          target.querySelectorAll('.blur-word').forEach(word => {
            requestAnimationFrame(() => {
              word.classList.add('is-visible');
            });
          });
        } else {
          target.classList.add('is-visible');
        }

        obs.unobserve(target);
      }
    });
  }, observerOptions);

  // Observe all animatable elements
  document.querySelectorAll('.blur-text, .fade-up').forEach(el => {
    animationObserver.observe(el);
  });

  // ========================================
  // 4. NAVBAR — Scroll-responsive
  // ========================================
  const navbar = document.querySelector('#main-nav');
  if (navbar) {
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;

      // Add background blur when scrolled
      if (scrollY > 100) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }

      lastScroll = scrollY;
    }, { passive: true });
  }

  // ========================================
  // 5. SMOOTH SCROLL — Anchor links
  // ========================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;

      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ========================================
  // 6. MOBILE NAV TOGGLE
  // ========================================
  const mobileToggle = document.querySelector('#mobile-nav-toggle');
  const mobileMenu = document.querySelector('#mobile-menu');

  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.contains('open');
      if (isOpen) {
        mobileMenu.classList.remove('open');
        mobileToggle.setAttribute('aria-expanded', 'false');
      } else {
        mobileMenu.classList.add('open');
        mobileToggle.setAttribute('aria-expanded', 'true');
      }
    });

    // Close on link click
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        mobileToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ========================================
  // 7. LAZY VIDEO LOADING — Only play when in view
  // ========================================
  const videoElements = document.querySelectorAll('video[data-lazy]');
  if (videoElements.length) {
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const video = entry.target;
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      });
    }, { threshold: 0.1 });

    videoElements.forEach(v => videoObserver.observe(v));
  }

  // ========================================
  // 8. PARALLAX TILT — Subtle mouse effect on hero
  // ========================================
  const heroSection = document.querySelector('#hero');
  const heroContent = document.querySelector('#hero-content');

  if (heroSection && heroContent && window.innerWidth > 1024) {
    heroSection.addEventListener('mousemove', (e) => {
      const rect = heroSection.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
      const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
      heroContent.style.transform = `translate(${x * 8}px, ${y * 6}px)`;
    });

    heroSection.addEventListener('mouseleave', () => {
      heroContent.style.transform = 'translate(0, 0)';
      heroContent.style.transition = 'transform 0.6s ease';
      setTimeout(() => { heroContent.style.transition = ''; }, 600);
    });
  }

  // ========================================
  // 9. COUNTER ANIMATION — Stats section
  // ========================================
  const counters = document.querySelectorAll('[data-counter]');
  if (counters.length) {
    const counterObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const finalText = el.dataset.counter;
          const suffix = el.dataset.suffix || '';
          const prefix = el.dataset.prefix || '';
          const numericPart = parseFloat(finalText);

          if (!isNaN(numericPart)) {
            const isDecimal = finalText.includes('.');
            const duration = 1500;
            const startTime = performance.now();

            function updateCounter(currentTime) {
              const elapsed = currentTime - startTime;
              const progress = Math.min(elapsed / duration, 1);
              // Ease-out cubic
              const eased = 1 - Math.pow(1 - progress, 3);
              const current = numericPart * eased;

              if (isDecimal) {
                el.textContent = prefix + current.toFixed(1) + suffix;
              } else {
                el.textContent = prefix + Math.floor(current) + suffix;
              }

              if (progress < 1) {
                requestAnimationFrame(updateCounter);
              } else {
                el.textContent = prefix + finalText + suffix;
              }
            }

            requestAnimationFrame(updateCounter);
          }

          obs.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(c => counterObserver.observe(c));
  }

});
