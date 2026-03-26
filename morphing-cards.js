/* ============================================
   MORPHING CARD STACK — Vanilla JS
   Converted from React/Framer Motion to GSAP
   Supports: Stack / Grid / List layouts with 
   smooth morphing transitions & swipe
   ============================================ */

(function () {
  'use strict';

  const SWIPE_THRESHOLD = 50;

  // Card Data
  const cardData = [
    {
      id: 'card-1',
      title: 'Days, Not Months',
      description: 'Concept to launch at a pace that redefines fast. We compress timelines without cutting corners.',
      icon: 'solar:bolt-linear',
    },
    {
      id: 'card-2',
      title: 'Obsessively Crafted',
      description: 'Every detail considered. Every element refined. Pixel-perfect design that speaks volumes.',
      icon: 'solar:palette-linear',
    },
    {
      id: 'card-3',
      title: 'Built to Convert',
      description: 'Layouts informed by data. Design decisions backed by real performance metrics and user behavior.',
      icon: 'solar:chart-square-linear',
    },
    {
      id: 'card-4',
      title: 'Secure by Default',
      description: 'Enterprise-grade protection comes standard. SSL, DDoS mitigation, and compliance built in.',
      icon: 'solar:shield-check-linear',
    },
  ];

  let currentLayout = 'stack';
  let activeIndex = 0;
  let expandedCard = null;
  let isDragging = false;
  let dragStartX = 0;
  let dragCurrentX = 0;

  function init() {
    const container = document.getElementById('morphing-cards-container');
    const cardsWrapper = document.getElementById('morphing-cards-wrapper');
    const dotsContainer = document.getElementById('morphing-dots');

    if (!container || !cardsWrapper) return;

    // Build cards
    buildCards(cardsWrapper);
    buildDots(dotsContainer);
    setupLayoutToggle();
    applyLayout('stack', false);
    setupSwipe(cardsWrapper);
  }

  function buildCards(wrapper) {
    wrapper.innerHTML = '';

    cardData.forEach((card, index) => {
      const el = document.createElement('div');
      el.className = 'morph-card liquid-glass rounded-2xl';
      el.id = card.id;
      el.dataset.index = index;
      el.innerHTML = `
        <div class="morph-card-inner">
          <div class="morph-card-icon liquid-glass-strong rounded-full">
            <iconify-icon icon="${card.icon}" class="text-xl text-white"></iconify-icon>
          </div>
          <div class="morph-card-content">
            <h3 class="morph-card-title">${card.title}</h3>
            <p class="morph-card-desc">${card.description}</p>
          </div>
        </div>
        <div class="morph-card-swipe-hint">Swipe to explore</div>
      `;

      el.addEventListener('click', () => {
        if (isDragging) return;
        if (expandedCard === card.id) {
          expandedCard = null;
          gsap.to(el, { scale: 1, duration: 0.3, ease: 'back.out(1.7)' });
          el.classList.remove('expanded');
        } else {
          // Collapse previous
          if (expandedCard) {
            const prev = document.getElementById(expandedCard);
            if (prev) {
              gsap.to(prev, { scale: 1, duration: 0.3, ease: 'back.out(1.7)' });
              prev.classList.remove('expanded');
            }
          }
          expandedCard = card.id;
          gsap.to(el, { scale: 1.03, duration: 0.3, ease: 'back.out(1.7)' });
          el.classList.add('expanded');
        }
      });

      wrapper.appendChild(el);
    });
  }

  function buildDots(container) {
    if (!container) return;
    container.innerHTML = '';

    cardData.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.className = 'morph-dot' + (index === activeIndex ? ' active' : '');
      dot.setAttribute('aria-label', `Go to card ${index + 1}`);
      dot.addEventListener('click', () => {
        activeIndex = index;
        applyLayout('stack', true);
        updateDots();
      });
      container.appendChild(dot);
    });
  }

  function updateDots() {
    const dots = document.querySelectorAll('.morph-dot');
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === activeIndex);
    });
  }

  function setupLayoutToggle() {
    const buttons = document.querySelectorAll('[data-layout-mode]');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.dataset.layoutMode;
        if (mode === currentLayout) return;

        // Update active state
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        currentLayout = mode;
        applyLayout(mode, true);

        // Show/hide dots
        const dotsContainer = document.getElementById('morphing-dots');
        if (dotsContainer) {
          dotsContainer.style.display = mode === 'stack' ? 'flex' : 'none';
        }

        // Show/hide swipe hints
        document.querySelectorAll('.morph-card-swipe-hint').forEach(hint => {
          hint.style.display = mode === 'stack' ? 'block' : 'none';
        });
      });
    });
  }

  function applyLayout(mode, animated) {
    const cards = document.querySelectorAll('.morph-card');
    const wrapper = document.getElementById('morphing-cards-wrapper');
    if (!wrapper) return;

    const duration = animated ? 0.6 : 0;
    const ease = 'power3.out';

    // Update wrapper class
    wrapper.className = 'morphing-cards-wrapper layout-' + mode;

    switch (mode) {
      case 'stack':
        applyStackLayout(cards, duration, ease);
        break;
      case 'grid':
        applyGridLayout(cards, duration, ease);
        break;
      case 'list':
        applyListLayout(cards, duration, ease);
        break;
    }
  }

  function getStackOrder() {
    const order = [];
    for (let i = 0; i < cardData.length; i++) {
      const index = (activeIndex + i) % cardData.length;
      order.push({ originalIndex: index, stackPos: i });
    }
    return order;
  }

  function applyStackLayout(cards, duration, ease) {
    const order = getStackOrder();

    order.forEach(({ originalIndex, stackPos }) => {
      const card = cards[originalIndex];
      if (!card) return;

      const offsetY = stackPos * 10;
      const offsetX = stackPos * 10;
      const rotation = (stackPos) * 2.5;
      const scale = 1 - stackPos * 0.03;
      const zIndex = cardData.length - stackPos;
      const opacity = stackPos > 2 ? 0 : 1 - stackPos * 0.15;

      card.style.position = 'absolute';
      card.style.width = '100%';
      card.style.maxWidth = '340px';

      gsap.to(card, {
        x: offsetX,
        y: offsetY,
        rotation: rotation,
        scale: scale,
        opacity: opacity,
        zIndex: zIndex,
        duration: duration,
        ease: ease,
      });

      // Show swipe hint only on top card
      const hint = card.querySelector('.morph-card-swipe-hint');
      if (hint) hint.style.display = stackPos === 0 ? 'block' : 'none';

      // Set cursor
      card.style.cursor = stackPos === 0 ? 'grab' : 'pointer';
    });
  }

  function applyGridLayout(cards, duration, ease) {
    cards.forEach((card, i) => {
      card.style.position = 'relative';
      card.style.width = '100%';
      card.style.maxWidth = 'none';

      gsap.to(card, {
        x: 0,
        y: 0,
        rotation: 0,
        scale: 1,
        opacity: 1,
        zIndex: 1,
        duration: duration,
        ease: ease,
      });
    });
  }

  function applyListLayout(cards, duration, ease) {
    cards.forEach((card, i) => {
      card.style.position = 'relative';
      card.style.width = '100%';
      card.style.maxWidth = 'none';

      gsap.to(card, {
        x: 0,
        y: 0,
        rotation: 0,
        scale: 1,
        opacity: 1,
        zIndex: 1,
        duration: duration,
        ease: ease,
      });
    });
  }

  // Swipe handling
  function setupSwipe(wrapper) {
    let startX = 0;
    let currentX = 0;
    let topCard = null;

    function getTopCard() {
      const order = getStackOrder();
      if (order.length === 0) return null;
      return document.querySelectorAll('.morph-card')[order[0].originalIndex];
    }

    function onPointerDown(e) {
      if (currentLayout !== 'stack') return;
      topCard = getTopCard();
      if (!topCard || e.target.closest('[data-layout-mode]')) return;

      isDragging = false;
      startX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      currentX = startX;

      topCard.style.cursor = 'grabbing';

      document.addEventListener('pointermove', onPointerMove);
      document.addEventListener('pointerup', onPointerUp);
    }

    function onPointerMove(e) {
      if (!topCard) return;
      currentX = e.clientX || 0;
      const dx = currentX - startX;

      if (Math.abs(dx) > 5) isDragging = true;

      gsap.to(topCard, {
        x: dx * 0.8,
        rotation: dx * 0.04,
        duration: 0.1,
        ease: 'none',
      });
    }

    function onPointerUp(e) {
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);

      if (!topCard) return;
      const dx = currentX - startX;

      if (Math.abs(dx) > SWIPE_THRESHOLD) {
        // Animate card off-screen
        const direction = dx > 0 ? 1 : -1;

        gsap.to(topCard, {
          x: direction * 400,
          opacity: 0,
          rotation: direction * 20,
          duration: 0.4,
          ease: 'power2.in',
          onComplete: () => {
            if (direction < 0) {
              activeIndex = (activeIndex + 1) % cardData.length;
            } else {
              activeIndex = (activeIndex - 1 + cardData.length) % cardData.length;
            }
            updateDots();
            applyLayout('stack', true);
          },
        });
      } else {
        // Snap back
        gsap.to(topCard, {
          x: getStackOrder()[0].stackPos * 10,
          rotation: 0,
          duration: 0.5,
          ease: 'elastic.out(1, 0.5)',
        });
      }

      topCard.style.cursor = 'grab';
      setTimeout(() => { isDragging = false; }, 50);
    }

    wrapper.addEventListener('pointerdown', onPointerDown);
  }

  // Init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
