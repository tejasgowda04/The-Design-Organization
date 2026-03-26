/* ============================================
   SPIRAL ANIMATION — Vanilla JS (converted from React/TSX)
   Full-screen intro overlay with "Open IT" button
   Uses GSAP for animation timeline
   ============================================ */

(function () {
  'use strict';

  // ========================================
  // Vector Classes
  // ========================================
  class Vector2D {
    constructor(x, y) {
      this.x = x;
      this.y = y;
    }
    static random(min, max) {
      return min + Math.random() * (max - min);
    }
  }

  class Vector3D {
    constructor(x, y, z) {
      this.x = x;
      this.y = y;
      this.z = z;
    }
  }

  // ========================================
  // Star Class
  // ========================================
  class Star {
    constructor(cameraZ, cameraTravelDistance) {
      this.angle = Math.random() * Math.PI * 2;
      this.distance = 30 * Math.random() + 15;
      this.rotationDirection = Math.random() > 0.5 ? 1 : -1;
      this.expansionRate = 1.2 + Math.random() * 0.8;
      this.finalScale = 0.7 + Math.random() * 0.6;

      this.dx = this.distance * Math.cos(this.angle);
      this.dy = this.distance * Math.sin(this.angle);

      this.spiralLocation = (1 - Math.pow(1 - Math.random(), 3.0)) / 1.3;
      this.z = Vector2D.random(0.5 * cameraZ, cameraTravelDistance + cameraZ);

      const lerp = (s, e, t) => s * (1 - t) + e * t;
      this.z = lerp(this.z, cameraTravelDistance / 2, 0.3 * this.spiralLocation);
      this.strokeWeightFactor = Math.pow(Math.random(), 2.0);
    }

    render(p, ctrl) {
      const spiralPos = ctrl.spiralPath(this.spiralLocation);
      const q = p - this.spiralLocation;

      if (q > 0) {
        const dp = ctrl.constrain(4 * q, 0, 1);

        const linearE = dp;
        const elasticE = ctrl.easeOutElastic(dp);
        const powerE = Math.pow(dp, 2);

        let easing;
        if (dp < 0.3) {
          easing = ctrl.lerp(linearE, powerE, dp / 0.3);
        } else if (dp < 0.7) {
          const t = (dp - 0.3) / 0.4;
          easing = ctrl.lerp(powerE, elasticE, t);
        } else {
          easing = elasticE;
        }

        let screenX, screenY;

        if (dp < 0.3) {
          screenX = ctrl.lerp(spiralPos.x, spiralPos.x + this.dx * 0.3, easing / 0.3);
          screenY = ctrl.lerp(spiralPos.y, spiralPos.y + this.dy * 0.3, easing / 0.3);
        } else if (dp < 0.7) {
          const midP = (dp - 0.3) / 0.4;
          const curveStr = Math.sin(midP * Math.PI) * this.rotationDirection * 1.5;
          const baseX = spiralPos.x + this.dx * 0.3;
          const baseY = spiralPos.y + this.dy * 0.3;
          const targetX = spiralPos.x + this.dx * 0.7;
          const targetY = spiralPos.y + this.dy * 0.7;
          const perpX = -this.dy * 0.4 * curveStr;
          const perpY = this.dx * 0.4 * curveStr;
          screenX = ctrl.lerp(baseX, targetX, midP) + perpX * midP;
          screenY = ctrl.lerp(baseY, targetY, midP) + perpY * midP;
        } else {
          const finalP = (dp - 0.7) / 0.3;
          const baseX = spiralPos.x + this.dx * 0.7;
          const baseY = spiralPos.y + this.dy * 0.7;
          const targetDist = this.distance * this.expansionRate * 1.5;
          const spiralTurns = 1.2 * this.rotationDirection;
          const spiralAngle = this.angle + spiralTurns * finalP * Math.PI;
          const targetX = spiralPos.x + targetDist * Math.cos(spiralAngle);
          const targetY = spiralPos.y + targetDist * Math.sin(spiralAngle);
          screenX = ctrl.lerp(baseX, targetX, finalP);
          screenY = ctrl.lerp(baseY, targetY, finalP);
        }

        const vx = (this.z - ctrl.cameraZ) * screenX / ctrl.viewZoom;
        const vy = (this.z - ctrl.cameraZ) * screenY / ctrl.viewZoom;

        const position = new Vector3D(vx, vy, this.z);

        let sizeMult = 1.0;
        if (dp < 0.6) {
          sizeMult = 1.0 + dp * 0.2;
        } else {
          const t = (dp - 0.6) / 0.4;
          sizeMult = 1.2 * (1.0 - t) + this.finalScale * t;
        }

        const dotSize = 8.5 * this.strokeWeightFactor * sizeMult;
        ctrl.showProjectedDot(position, dotSize);
      }
    }
  }

  // ========================================
  // Animation Controller
  // ========================================
  class AnimationController {
    constructor(canvas, ctx, dpr, size) {
      this.canvas = canvas;
      this.ctx = ctx;
      this.dpr = dpr;
      this.size = size;
      this.time = 0;
      this.stars = [];
      this.timeline = null;

      // Constants
      this.changeEventTime = 0.32;
      this.cameraZ = -400;
      this.cameraTravelDistance = 3400;
      this.startDotYOffset = 28;
      this.viewZoom = 100;
      this.numberOfStars = 5000;
      this.trailLength = 80;

      this._init();
    }

    _init() {
      // Seeded random for consistent star placement
      const origRandom = Math.random;
      let seed = 1234;
      Math.random = () => {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
      };
      this._createStars();
      Math.random = origRandom;

      // Re-create with real random for variety
      this._createStars();

      this._setupTimeline();
    }

    _createStars() {
      this.stars = [];
      for (let i = 0; i < this.numberOfStars; i++) {
        this.stars.push(new Star(this.cameraZ, this.cameraTravelDistance));
      }
    }

    _setupTimeline() {
      this.timeline = gsap.timeline({ repeat: -1 });
      this.timeline.to(this, {
        time: 1,
        duration: 15,
        repeat: -1,
        ease: 'none',
        onUpdate: () => this.render(),
      });
    }

    // --- Math utilities ---
    ease(p, g) {
      if (p < 0.5) return 0.5 * Math.pow(2 * p, g);
      return 1 - 0.5 * Math.pow(2 * (1 - p), g);
    }

    easeOutElastic(x) {
      const c4 = (2 * Math.PI) / 4.5;
      if (x <= 0) return 0;
      if (x >= 1) return 1;
      return Math.pow(2, -8 * x) * Math.sin((x * 8 - 0.75) * c4) + 1;
    }

    map(value, s1, e1, s2, e2) {
      return s2 + (e2 - s2) * ((value - s1) / (e1 - s1));
    }

    constrain(value, min, max) {
      return Math.min(Math.max(value, min), max);
    }

    lerp(start, end, t) {
      return start * (1 - t) + end * t;
    }

    // --- Spiral path ---
    spiralPath(p) {
      p = this.constrain(1.2 * p, 0, 1);
      p = this.ease(p, 1.8);
      const turns = 6;
      const theta = 2 * Math.PI * turns * Math.sqrt(p);
      const r = 170 * Math.sqrt(p);
      return new Vector2D(
        r * Math.cos(theta),
        r * Math.sin(theta) + this.startDotYOffset
      );
    }

    // --- Rotation ---
    rotate(v1, v2, p, orientation) {
      const mid = new Vector2D((v1.x + v2.x) / 2, (v1.y + v2.y) / 2);
      const dx = v1.x - mid.x;
      const dy = v1.y - mid.y;
      const angle = Math.atan2(dy, dx);
      const o = orientation ? -1 : 1;
      const r = Math.sqrt(dx * dx + dy * dy);
      const bounce = Math.sin(p * Math.PI) * 0.05 * (1 - p);
      return new Vector2D(
        mid.x + r * (1 + bounce) * Math.cos(angle + o * Math.PI * this.easeOutElastic(p)),
        mid.y + r * (1 + bounce) * Math.sin(angle + o * Math.PI * this.easeOutElastic(p))
      );
    }

    // --- Projected dot ---
    showProjectedDot(position, sizeFactor) {
      const t2 = this.constrain(this.map(this.time, this.changeEventTime, 1, 0, 1), 0, 1);
      const newCamZ = this.cameraZ + this.ease(Math.pow(t2, 1.2), 1.8) * this.cameraTravelDistance;

      if (position.z > newCamZ) {
        const depth = position.z - newCamZ;
        const x = this.viewZoom * position.x / depth;
        const y = this.viewZoom * position.y / depth;
        const sw = 400 * sizeFactor / depth;

        this.ctx.lineWidth = sw;
        this.ctx.beginPath();
        this.ctx.arc(x, y, 0.5, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }

    // --- Draw start dot ---
    _drawStartDot() {
      if (this.time > this.changeEventTime) {
        const dy = this.cameraZ * this.startDotYOffset / this.viewZoom;
        const pos = new Vector3D(0, dy, this.cameraTravelDistance);
        this.showProjectedDot(pos, 2.5);
      }
    }

    // --- Draw trail ---
    _drawTrail(t1) {
      for (let i = 0; i < this.trailLength; i++) {
        const f = this.map(i, 0, this.trailLength, 1.1, 0.1);
        const sw = (1.3 * (1 - t1) + 3.0 * Math.sin(Math.PI * t1)) * f;

        this.ctx.fillStyle = 'white';
        this.ctx.lineWidth = sw;

        const pathTime = t1 - 0.00015 * i;
        const position = this.spiralPath(pathTime);

        const basePos = position;
        const offset = new Vector2D(position.x + 5, position.y + 5);
        const rotated = this.rotate(
          basePos,
          offset,
          Math.sin(this.time * Math.PI * 2) * 0.5 + 0.5,
          i % 2 === 0
        );

        this.ctx.beginPath();
        this.ctx.arc(rotated.x, rotated.y, sw / 2, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }

    // --- Main render ---
    render() {
      const ctx = this.ctx;
      if (!ctx) return;

      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, this.size, this.size);

      ctx.save();
      ctx.translate(this.size / 2, this.size / 2);

      const t1 = this.constrain(this.map(this.time, 0, this.changeEventTime + 0.25, 0, 1), 0, 1);
      const t2 = this.constrain(this.map(this.time, this.changeEventTime, 1, 0, 1), 0, 1);

      ctx.rotate(-Math.PI * this.ease(t2, 2.7));

      this._drawTrail(t1);

      ctx.fillStyle = 'white';
      for (const star of this.stars) {
        star.render(t1, this);
      }

      this._drawStartDot();
      ctx.restore();
    }

    // --- Controls ---
    pause() {
      if (this.timeline) this.timeline.pause();
    }
    resume() {
      if (this.timeline) this.timeline.play();
    }
    destroy() {
      if (this.timeline) this.timeline.kill();
    }
  }

  // ========================================
  // INITIALIZATION — Create canvas & start animation
  // ========================================
  function initSpiral() {
    const overlay = document.getElementById('spiral-overlay');
    const canvas = document.getElementById('spiral-canvas');
    const enterBtn = document.getElementById('spiral-enter-btn');

    if (!overlay || !canvas || !enterBtn) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let controller = null;

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const size = Math.max(w, h);

      canvas.width = size * dpr;
      canvas.height = size * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      // Re-create controller on resize
      if (controller) controller.destroy();
      controller = new AnimationController(canvas, ctx, dpr, size);
    }

    resize();
    window.addEventListener('resize', resize);

    // Show "Open" button after 2s with a gentle fade
    setTimeout(() => {
      enterBtn.classList.add('visible');
    }, 2000);

    // Ripple element
    const ripple = document.getElementById('spiral-ripple');

    // Click handler — cinematic multi-stage exit
    enterBtn.addEventListener('click', () => {
      // Stage 1: Flash the button (scale up + fade)
      enterBtn.classList.add('clicked');

      // Stage 2: Trigger ripple ring expansion (after 100ms)
      setTimeout(() => {
        if (ripple) ripple.classList.add('active');
      }, 100);

      // Stage 3: Begin overlay zoom+blur exit (after 400ms)
      setTimeout(() => {
        overlay.classList.add('exiting');
        document.body.style.overflow = '';
      }, 400);

      // Stage 4: Cleanup & reveal main page (after full animation)
      setTimeout(() => {
        if (controller) controller.destroy();
        overlay.remove();
        window.removeEventListener('resize', resize);

        // Trigger scroll animations on the main page
        document.querySelectorAll('.fade-up, .blur-text').forEach(el => {
          if (el.getBoundingClientRect().top < window.innerHeight) {
            if (el.classList.contains('blur-text')) {
              el.querySelectorAll('.blur-word').forEach(w => w.classList.add('is-visible'));
            } else {
              el.classList.add('is-visible');
            }
          }
        });
      }, 1800);
    });

    // Lock body scroll while overlay is active
    document.body.style.overflow = 'hidden';
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSpiral);
  } else {
    initSpiral();
  }

})();
