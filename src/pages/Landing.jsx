import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { motion as Motion } from 'framer-motion';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import LocalMall from '@mui/icons-material/LocalMall';
import LocalOffer from '@mui/icons-material/LocalOffer';
import HourglassEmpty from '@mui/icons-material/HourglassEmpty';
import Hearing from '@mui/icons-material/Hearing';
import DoNotTouch from '@mui/icons-material/DoNotTouch';
import Checkroom from '@mui/icons-material/Checkroom';
import Air from '@mui/icons-material/Air';
import Spa from '@mui/icons-material/Spa';
import AutoAwesome from '@mui/icons-material/AutoAwesome';
import WorkspacePremium from '@mui/icons-material/WorkspacePremium';
import LocalShipping from '@mui/icons-material/LocalShipping';
import CheckCircle from '@mui/icons-material/CheckCircle';
import Handyman from '@mui/icons-material/Handyman';
import Email from '@mui/icons-material/Email';
import Person from '@mui/icons-material/Person';
import PersonAdd from '@mui/icons-material/PersonAdd';
import Star from '@mui/icons-material/Star';
import $ from 'jquery';
import 'jquery.ripples';

import { selectIsAuthenticated, selectIsAdmin } from '../redux/slices/authSlice';

/* Floating Rose, Petal, and Leaf images from existing project assets */
const BLOOM_IMGS = [
  { src: '/images/roses/flower1.png', w: 500, h: 500 },
  { src: '/images/roses/flower2.png', w: 500, h: 500 },
  { src: '/images/roses/flower3.png', w: 444, h: 562 },
  { src: '/images/roses/flower4.png', w: 396, h: 630 },
];

const PETAL_IMGS = [
  { src: '/images/roses/patel1.png', w: 612, h: 408 },
];

const LEAF_IMGS = [
  { src: '/images/roses/patel1.png', w: 612, h: 408 },
];

const PETAL_KINDS = [
  'bloom',
  'bloom',
  'leaf',
  'bloom',
  'petal',
  'bloom',
  'leaf',
  'bloom',
  'bloom',
  'petal',
  'bloom',
  'bloom',
];

const FloatingRoseItem = ({ idx, kind, scale }) => {
  const s = (n) => n * scale;
  const pick = (arr) => arr[idx % arr.length];

  if (kind === 'leaf') {
    const leaf = pick(LEAF_IMGS);
    return (
      <img
        src={leaf.src}
        alt=""
        draggable="false"
        style={{
          width: `${s(34)}px`,
          height: `${s(34 * (leaf.h / leaf.w))}px`,
          display: 'block',
          filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.6))',
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      />
    );
  }
  if (kind === 'petal') {
    const petal = pick(PETAL_IMGS);
    return (
      <img
        src={petal.src}
        alt=""
        draggable="false"
        style={{
          width: `${s(38)}px`,
          height: `${s(38 * (petal.h / petal.w))}px`,
          display: 'block',
          filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.6))',
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      />
    );
  }
  const bloom = pick(BLOOM_IMGS);
  return (
    <img
      src={bloom.src}
      alt=""
      draggable="false"
      style={{
        width: `${s(46)}px`,
        height: `${s(46 * (bloom.h / bloom.w))}px`,
        display: 'block',
        filter: 'drop-shadow(0 8px 18px rgba(0,0,0,0.7))',
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    />
  );
};

/* Shared smooth loop for all drifting petals (single rAF, cached sizes) */
const petalRegistry = new Set();
let petalRaf = 0;
let petalT0 = 0;
const petalTick = (now) => {
  const t = (now - petalT0) / 1000;
  petalRegistry.forEach((draw) => draw(t));
  petalRaf = requestAnimationFrame(petalTick);
};
const registerPetals = (draw) => {
  petalRegistry.add(draw);
  if (!petalRaf) {
    petalT0 = performance.now();
    petalRaf = requestAnimationFrame(petalTick);
  }
  return () => {
    petalRegistry.delete(draw);
    if (petalRegistry.size === 0 && petalRaf) {
      cancelAnimationFrame(petalRaf);
      petalRaf = 0;
    }
  };
};

/* Randomly drifting single petals (JS physics, for non-hero sections) */
const FloatingPetals = ({ items }) => {
  const wrapRef = useRef(null);
  const nodeRefs = useRef([]);
  const visibleRef = useRef(true);
  /* Freeze the first items array: inline literals get a new identity every
     parent render (quotes/craft timers), which must NOT reset the motion */
  const itemsRef = useRef(items);

  useEffect(() => {
    const list = itemsRef.current;
    const wrap = wrapRef.current;
    if (!wrap) return undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry.isIntersecting;
      },
      { threshold: 0 }
    );
    io.observe(wrap);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = wrap.clientWidth || 1;
    let h = wrap.clientHeight || 1;
    const onResize = () => {
      w = wrap.clientWidth || 1;
      h = wrap.clientHeight || 1;
    };
    window.addEventListener('resize', onResize);
    const cfg = list.map(() => ({
      ax: 16 + Math.random() * 36,
      ay: 12 + Math.random() * 28,
      sx: 0.15 + Math.random() * 0.35,
      sy: 0.12 + Math.random() * 0.32,
      px: Math.random() * Math.PI * 2,
      py: Math.random() * Math.PI * 2,
      rot: Math.random() * 360,
      rd: Math.random() > 0.5 ? 1 : -1,
    }));

    const draw = (t) => {
      if (!visibleRef.current) return;
      list.forEach((p, i) => {
        const node = nodeRefs.current[i];
        if (!node) return;
        const c = cfg[i];
        const bx = (parseFloat(p.left) / 100) * w;
        const by = (parseFloat(p.top) / 100) * h;
        const x = reduced ? bx : bx + Math.sin(t * c.sx + c.px) * c.ax;
        const y = reduced ? by : by + Math.cos(t * c.sy + c.py) * c.ay;
        const r = reduced ? c.rot : c.rot + Math.sin(t * 0.25 + c.px) * 14 * c.rd + t * 0.12 * c.rd;
        node.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${r.toFixed(1)}deg)`;
      });
    };

    draw(0);
    if (reduced) {
      window.removeEventListener('resize', onResize);
      return undefined;
    }
    const unregister = registerPetals(draw);
    return () => {
      unregister();
      io.disconnect();
      window.removeEventListener('resize', onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box
      ref={wrapRef}
      aria-hidden="true"
      sx={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      {items.map((p, i) => (
        <Box
          key={i}
          ref={(el) => {
            nodeRefs.current[i] = el;
          }}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            willChange: 'transform',
          }}
        >
          <Box
            component="img"
            src="/images/roses/patel1.png"
            alt=""
            draggable="false"
            sx={{
              display: 'block',
              width: p.size,
              opacity: p.opacity ?? 0.8,
              userSelect: 'none',
            }}
          />
        </Box>
      ))}
    </Box>
  );
};

/* Creates high-res procedural dark gold refraction texture for WebGL ripples */
const createWaterTexture = (w, h) => {
  if (typeof document === 'undefined' || !w || !h) return '';
  const k = Math.min(1, 1400 / Math.max(w, h));
  const cw = Math.max(2, Math.round(w * k));
  const ch = Math.max(2, Math.round(h * k));
  const c = document.createElement('canvas');
  c.width = cw;
  c.height = ch;
  const g = c.getContext('2d');
  if (!g) return '';

  const lin = g.createLinearGradient(0, 0, 0, ch);
  lin.addColorStop(0, '#040405');
  lin.addColorStop(0.4, '#08080a');
  lin.addColorStop(0.8, '#0d0d12');
  lin.addColorStop(1, '#050507');
  g.fillStyle = lin;
  g.fillRect(0, 0, cw, ch);

  const glow = (fx, fy, rx, ry, col, stop) => {
    const cx = fx * cw;
    const cy = fy * ch;
    g.save();
    g.translate(cx, cy);
    g.scale((stop * rx * k) / 100, (stop * ry * k) / 100);
    const rg = g.createRadialGradient(0, 0, 0, 0, 0, 100);
    rg.addColorStop(0, col);
    rg.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = rg;
    g.beginPath();
    g.arc(0, 0, 100, 0, Math.PI * 2);
    g.fill();
    g.restore();
  };

  glow(0.5, 0.3, 1000, 680, 'rgba(212, 175, 55, 0.28)', 0.65);
  glow(0.8, 0.65, 850, 650, 'rgba(180, 130, 20, 0.22)', 0.6);
  glow(0.2, 0.75, 750, 550, 'rgba(146, 64, 14, 0.25)', 0.6);
  return c.toDataURL('image/png');
};

/* Interactive Water Ripple layer */
const WaterLayer = forwardRef((_, ref) => {
  const hostRef = useRef(null);
  const apiRef = useRef(null);

  useImperativeHandle(ref, () => ({
    node: hostRef.current,
    get api() {
      return apiRef.current;
    },
  }));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;
    let dead = false;
    let timer = 0;

    const init = () => {
      try {
        const $el = $(host);
        try {
          $el.ripples('destroy');
        } catch {
          /* noop */
        }
        const ew = host.clientWidth || window.innerWidth;
        const eh = host.clientHeight || window.innerHeight;
        $el.ripples({
          imageUrl: createWaterTexture(ew, eh),
          dropRadius: 25,
          perturbance: 0.038,
          resolution: ew < 768 ? 160 : 288,
          interactive: false,
        });
        apiRef.current = {
          drop: (x, y, radius, strength) => {
            try {
              $el.ripples('drop', x, y, radius, strength);
            } catch {
              /* noop */
            }
          },
        };
      } catch {
        apiRef.current = null;
      }
    };

    init();

    const onResize = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        if (!dead) init();
      }, 250);
    };

    window.addEventListener('resize', onResize);

    return () => {
      dead = true;
      window.clearTimeout(timer);
      window.removeEventListener('resize', onResize);
      try {
        $(host).ripples('destroy');
      } catch {
        /* noop */
      }
    };
  }, []);

  return (
    <div
      ref={hostRef}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
      aria-hidden="true"
    />
  );
});
WaterLayer.displayName = 'WaterLayer';

const getPetalCount = () => {
  if (typeof window === 'undefined') return 24;
  const w = window.innerWidth;
  if (w >= 1200) return 28;
  if (w >= 900) return 20;
  if (w >= 600) return 14;
  return 10;
};

const makePetals = (count, w, h) => {
  const counts = { bloom: 0, leaf: 0, petal: 0 };
  return Array.from({ length: count }, (_, i) => {
    const kind = PETAL_KINDS[i % PETAL_KINDS.length];
    const bx = 3 + Math.random() * 94;
    const by = 4 + Math.random() * 88;
    return {
      index: i,
      kind,
      no: counts[kind]++,
      bx,
      by,
      x: (bx / 100) * w,
      y: (by / 100) * h,
      rot: Math.random() * 360,
      rotV: (Math.random() - 0.5) * 0.6,
      vx: 0,
      vy: 0,
      phase: Math.random() * Math.PI * 2,
      size: 0.65 + Math.random() * 0.85,
      drift: 0.16 + Math.random() * 0.22,
    };
  });
};

/* Isolated auto-rotating quotes: only this subtree re-renders on tick */
const QuoteCarousel = ({ t }) => {
  const [quoteIdx, setQuoteIdx] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setQuoteIdx((v) => v + 1);
    }, 5000);
    return () => window.clearInterval(id);
  }, []);

  const quotesRaw = t('landing.quotes', { returnObjects: true });
  const quotes = Array.isArray(quotesRaw) && quotesRaw.length ? quotesRaw : [String(quotesRaw ?? '')];
  const n = quotes.length;
  const qi = ((quoteIdx % n) + n) % n;
  const quotePrev = quotes[(qi - 1 + n) % n];
  const quoteNext = quotes[(qi + 1) % n];

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: { xs: 300, md: 360 },
        gap: { xs: 1.5, md: 2 },
      }}
    >
      <Motion.div
        key={`qp-${qi}`}
        initial={{ opacity: 0, y: -26 }}
        animate={{ opacity: 0.28, y: 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        style={{ filter: 'blur(1.5px)', maxWidth: '100%' }}
      >
        <Typography
          sx={{
            fontFamily: `'Playfair Display', 'Amiri', serif`,
            fontSize: { xs: '1rem', md: '1.3rem' },
            color: 'rgba(255, 255, 255, 0.6)',
            userSelect: 'none',
          }}
        >
          {quotePrev}
        </Typography>
      </Motion.div>

      <Motion.div
        key={`qc-${qi}`}
        initial={{ opacity: 0, y: 70, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        style={{ maxWidth: '100%' }}
      >
        <Typography
          sx={{
            fontFamily: `'Playfair Display', 'Amiri', serif`,
            fontWeight: 700,
            fontSize: { xs: '1.9rem', sm: '2.8rem', md: '3.6rem' },
            lineHeight: 1.5,
            color: '#FFFFFF',
            textShadow: '0 6px 30px rgba(0,0,0,0.8)',
          }}
        >
          {quotes[qi]}
        </Typography>
      </Motion.div>

      <Motion.div
        key={`qn-${qi}`}
        initial={{ opacity: 0, y: 26 }}
        animate={{ opacity: 0.28, y: 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        style={{ filter: 'blur(1.5px)', maxWidth: '100%' }}
      >
        <Typography
          sx={{
            fontFamily: `'Playfair Display', 'Amiri', serif`,
            fontSize: { xs: '1rem', md: '1.3rem' },
            color: 'rgba(255, 255, 255, 0.6)',
            userSelect: 'none',
          }}
        >
          {quoteNext}
        </Typography>
      </Motion.div>
    </Box>
  );
};

/* Isolated craft spotlight: only this subtree re-renders on tick */
const CraftStage = ({ t, isRTL }) => {
  const [activeCraft, setActiveCraft] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setActiveCraft((v) => (v + 1) % 3);
    }, 6000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <>
      <style>{`@keyframes spinRing { to { transform: rotate(360deg); } } @keyframes spinRingRev { to { transform: rotate(-360deg); } }`}</style>
      <Box sx={{ maxWidth: 760, mx: 'auto', textAlign: 'center' }}>
        {/* Cinematic stage */}
        <Motion.div
          key={activeCraft}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        >
          <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1, py: { xs: 3, md: 4 } }}>
            {/* Rotating conic aura */}
            <Box
              aria-hidden="true"
              sx={{
                position: 'absolute',
                width: { xs: 250, md: 330 },
                height: { xs: 250, md: 330 },
                borderRadius: '50%',
                background: 'conic-gradient(from 0deg, transparent 0%, rgba(244,208,63,0.35) 12%, transparent 26%, transparent 55%, rgba(212,175,55,0.28) 68%, transparent 82%)',
                filter: 'blur(22px)',
                animation: 'spinRing 9s linear infinite',
              }}
            />
            {/* Floating gold dust */}
            {[
              { top: '6%', left: '18%', s: 5, d: 0, t: 5 },
              { top: '16%', left: '80%', s: 4, d: 0.8, t: 6 },
              { top: '70%', left: '12%', s: 6, d: 1.6, t: 7 },
              { top: '82%', left: '72%', s: 4, d: 0.4, t: 5.5 },
              { top: '38%', left: '90%', s: 5, d: 2, t: 6.5 },
              { top: '58%', left: '6%', s: 3, d: 1.1, t: 5 },
            ].map((p, k) => (
              <Box
                key={k}
                aria-hidden="true"
                sx={{
                  position: 'absolute',
                  top: p.top,
                  left: p.left,
                  width: p.s,
                  height: p.s,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, #FFF6DC, #D4AF37)',
                  boxShadow: '0 0 10px rgba(244,208,63,0.9)',
                  animation: 'floatSlow 5s ease-in-out infinite',
                  animationDuration: `${p.t}s`,
                  animationDelay: `${p.d}s`,
                }}
              />
            ))}
            <Motion.div
              initial={{ scale: 0.7, opacity: 0, rotate: -12 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 16 }}
            >
              <Box
                sx={{
                  position: 'relative',
                  width: { xs: 132, md: 164 },
                  height: { xs: 132, md: 164 },
                  borderRadius: '42px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'linear-gradient(150deg, #23232c 0%, #0a0a0c 70%)',
                  border: '1px solid rgba(212, 175, 55, 0.6)',
                  boxShadow: '0 24px 70px rgba(0,0,0,0.75), 0 0 54px rgba(212, 175, 55, 0.35), inset 0 1px 0 rgba(255,246,220,0.25), inset 0 -8px 18px rgba(212,175,55,0.12)',
                  color: '#F4D03F',
                  overflow: 'hidden',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    width: '45%',
                    left: '-60%',
                    background: 'linear-gradient(100deg, transparent, rgba(255,246,220,0.16), transparent)',
                    transform: 'skewX(-18deg)',
                    animation: 'sheenMove 4.5s ease-in-out infinite',
                    pointerEvents: 'none',
                  },
                  '& svg': { fontSize: { xs: 60, md: 74 }, filter: 'drop-shadow(0 4px 14px rgba(212,175,55,0.8))' },
                }}
              >
                {[<Spa key="0" />, <HourglassEmpty key="1" />, <Handyman key="2" />][activeCraft]}
              </Box>
              <Box
                aria-hidden="true"
                sx={{
                  mx: 'auto',
                  mt: 2,
                  width: 90,
                  height: 12,
                  borderRadius: '50%',
                  background: 'radial-gradient(ellipse, rgba(0,0,0,0.7), transparent 70%)',
                  filter: 'blur(4px)',
                }}
              />
            </Motion.div>
          </Box>

          <Motion.div
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <Typography
              className="luxury-gold-gradient"
              sx={{
                fontWeight: 800,
                fontSize: { xs: '2.1rem', md: '3.2rem' },
                fontFamily: `'Playfair Display', 'Amiri', serif`,
                letterSpacing: isRTL ? '0' : '0.01em',
                filter: 'drop-shadow(0 4px 22px rgba(212,175,55,0.35))',
                mb: 1.5,
                mt: 3,
              }}
            >
              {[t('landing.artistry.p1Title'), t('landing.artistry.p2Title'), t('landing.craftDuo.card3Title')][activeCraft]}
            </Typography>
            <Typography sx={{ color: 'rgba(255, 255, 255, 0.72)', fontSize: { xs: '1rem', md: '1.12rem' }, lineHeight: 1.9, maxWidth: 600, mx: 'auto', whiteSpace: 'pre-line', minHeight: { xs: 100, md: 106 } }}>
              {[t('landing.artistry.p1Desc'), t('landing.artistry.p2Desc'), t('landing.craftDuo.card3Desc')][activeCraft]}
            </Typography>
          </Motion.div>

          {/* Auto-advance indicator */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.2, mt: 4 }}>
            {[0, 1, 2].map((d) => (
              <Box
                key={d}
                sx={{
                  width: activeCraft === d ? 44 : 16,
                  height: 4,
                  borderRadius: '100px',
                  background: 'rgba(255,255,255,0.12)',
                  overflow: 'hidden',
                  transition: 'width 0.4s ease',
                }}
              >
                {activeCraft === d && (
                  <Motion.div
                    key={`bar-${activeCraft}`}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 6, ease: 'linear' }}
                    style={{
                      transformOrigin: isRTL ? 'right center' : 'left center',
                      height: '100%',
                      background: 'linear-gradient(90deg, #AA7C11, #F4D03F, #FFF6DC)',
                      boxShadow: '0 0 12px rgba(244,208,63,0.8)',
                    }}
                  />
                )}
              </Box>
            ))}
          </Box>
        </Motion.div>
      </Box>
    </>
  );
};

const Landing = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isAdmin = useSelector(selectIsAdmin);
  const accountPath = isAdmin ? '/admin-panel/profile' : '/profile';

  /* Petal states and refs */
  const [petalSpecs, setPetalSpecs] = useState(() =>
    makePetals(
      getPetalCount(),
      typeof window === 'undefined' ? 1280 : window.innerWidth,
      typeof window === 'undefined' ? 800 : window.innerHeight,
    ),
  );

  const heroRef = useRef(null);
  const petalEls = useRef({});
  const waterRef = useRef(null);
  const lastDropRef = useRef(0);
  const mouse = useRef({ x: -9999, y: -9999, active: false, radius: 185 });
  const specsRef = useRef(petalSpecs);
  const rafRef = useRef(0);
  const heroVisibleRef = useRef(true);

  useEffect(() => {
    specsRef.current = petalSpecs;
  }, [petalSpecs]);

  useEffect(() => {
    let breakpoint = getPetalCount();
    const onResize = () => {
      const next = getPetalCount();
      if (next !== breakpoint) {
        breakpoint = next;
        setPetalSpecs(makePetals(next, window.innerWidth, window.innerHeight));
      }
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  /* Water & Petals physics loop — purely decoupled, reliable, runs smoothly */
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return undefined;

    const onPointerMove = (e) => {
      const m = mouse.current;
      m.x = e.clientX;
      m.y = e.clientY;
      if (!m.active) m.active = true;

      const now = performance.now();
      if (now - lastDropRef.current > 45 || !lastDropRef.current) {
        lastDropRef.current = now;
        const wapi = waterRef.current;
        if (wapi && wapi.node && wapi.api) {
          const r = wapi.node.getBoundingClientRect();
          wapi.api.drop(e.clientX - r.left, e.clientY - r.top, 28, 0.12);
        }
      }
    };

    const onPointerDown = (e) => {
      lastDropRef.current = performance.now();
      const wapi = waterRef.current;
      if (wapi && wapi.node && wapi.api) {
        const r = wapi.node.getBoundingClientRect();
        wapi.api.drop(e.clientX - r.left, e.clientY - r.top, 65, 0.38);
      }
    };

    const onPointerLeave = () => {
      mouse.current.active = false;
    };

    const autoInterval = window.setInterval(() => {
      const wapi = waterRef.current;
      if (wapi && wapi.node && wapi.api && !mouse.current.active) {
        const r = wapi.node.getBoundingClientRect();
        const rx = r.width * (0.2 + Math.random() * 0.6);
        const ry = r.height * (0.2 + Math.random() * 0.6);
        wapi.api.drop(rx, ry, 34, 0.08);
      }
    }, 3800);

    let running = true;
    const tick = () => {
      if (!running) return;
      if (!heroVisibleRef.current) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      const specs = specsRef.current;
      const m = mouse.current;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const now = performance.now() / 1000;

      for (let i = 0; i < specs.length; i += 1) {
        const p = specs[i];
        const el = petalEls.current[i];
        if (!el) continue;

        const baseX = (p.bx / 100) * w + Math.sin(now * p.drift + p.phase) * 20;
        const baseY = (p.by / 100) * h + Math.cos(now * p.drift * 0.8 + p.phase) * 16;

        let fx = 0;
        let fy = 0;

        if (m.active) {
          const dx = p.x - m.x;
          const dy = p.y - m.y;
          const dist = Math.hypot(dx, dy);
          if (dist < m.radius && dist > 0.001) {
            const force = ((m.radius - dist) / m.radius) * 32;
            fx = (dx / dist) * force;
            fy = (dy / dist) * force;
            p.rot += (dx > 0 ? 1 : -1) * force * 0.15;
          }
        }

        p.vx += (baseX - p.x) * 0.0022 + fx * 0.42;
        p.vy += (baseY - p.y) * 0.0022 + fy * 0.42;
        p.vx *= 0.91;
        p.vy *= 0.91;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.rotV;

        el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) rotate(${p.rot}deg) scale(${p.size})`;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    hero.addEventListener('pointermove', onPointerMove, { passive: true });
    hero.addEventListener('pointerdown', onPointerDown);
    hero.addEventListener('pointerleave', onPointerLeave);
    const visObserver = new IntersectionObserver(
      ([entry]) => {
        heroVisibleRef.current = entry.isIntersecting;
      },
      { threshold: 0 }
    );
    visObserver.observe(hero);
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      running = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      visObserver.disconnect();
      clearInterval(autoInterval);
      hero.removeEventListener('pointermove', onPointerMove);
      hero.removeEventListener('pointerdown', onPointerDown);
      hero.removeEventListener('pointerleave', onPointerLeave);
    };
  }, []);

  return (
    <Box
      sx={{
        bgcolor: '#050507',
        color: '#FFFFFF',
        fontFamily: `'Outfit', 'Amiri', 'Georgia', sans-serif`,
        overflowX: 'hidden',
        position: 'relative',
      }}
    >
      <style>{`
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes goldGlowPulse {
          0%, 100% { opacity: 0.4; filter: blur(60px); transform: scale(1); }
          50% { opacity: 0.75; filter: blur(85px); transform: scale(1.12); }
        }
        .luxury-gold-gradient {
          background: linear-gradient(135deg, #FFF6DC 0%, #F4D03F 25%, #D4AF37 45%, #9A7B24 60%, #F4D03F 80%, #FFF6DC 100%);
          background-size: 220% auto;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: goldShine 7s linear infinite;
        }
        @keyframes goldShine {
          to { background-position: 220% center; }
        }
        .hero-watermark-word {
          font-family: 'Playfair Display', 'Amiri', serif;
          font-weight: 800;
          font-size: clamp(2rem, 5.5vw, 4.8rem);
          letter-spacing: 0.06em;
          white-space: nowrap;
          color: transparent;
          -webkit-text-stroke: 1px rgba(212, 175, 55, 0.11);
          user-select: none;
          animation: watermarkDrift 30s ease-in-out infinite alternate;
        }
        @keyframes watermarkDrift {
          from { transform: translateX(-2%) scale(1); }
          to { transform: translateX(2%) scale(1.04); }
        }
        .hero-visual-row { display: flex; justify-content: center; }
        @media (min-width: 900px) { .hero-visual-row { justify-content: flex-end; } }
        @keyframes heroKenburns {
          from { transform: scale(1) translateY(0); }
          to { transform: scale(1.09) translateY(-1.5%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-watermark-word { animation: none; }
        }
        @keyframes mistDrift {
          from { transform: translateX(-8%) translateY(0); opacity: 0.7; }
          to { transform: translateX(8%) translateY(-6%); opacity: 1; }
        }
        .hero-explore-wrap { position: relative; display: inline-block; }
        .hero-explore-rose {
          position: absolute;
          top: -11px;
          left: -11px;
          width: 36px;
          height: 36px;
          object-fit: contain;
          background: none;
          border: none;
          box-shadow: none;
          filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.5));
          transition: transform 0.3s ease;
          pointer-events: none;
          z-index: 1;
        }
        .hero-explore-wrap:hover .hero-explore-rose { transform: scale(1.25) rotate(-10deg); }
        .hero-cta-item { flex: 1 1 100%; min-width: 0; }
        @media (min-width: 900px) { .hero-cta-item { flex: 1 1 0; } }
        @keyframes sheenMove {
          0% { left: -60%; }
          55%, 100% { left: 135%; }
        }
      `}</style>

      {/* ============== SECTION 1 ============== */}
      <Box
        ref={heroRef}
        component="main"
        sx={{
          position: 'relative',
          minHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          pt: { xs: 8, md: 10 },
          pb: { xs: 6, md: 8 },
          userSelect: 'none',
          cursor: 'default',
        }}
      >
        {/* Background Ambient Glow */}
        <Box
          sx={{
            position: 'absolute',
            top: '25%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: 320, md: 680 },
            height: { xs: 320, md: 680 },
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(212, 175, 55, 0.22) 0%, rgba(146, 64, 14, 0.08) 50%, transparent 70%)',
            pointerEvents: 'none',
            zIndex: 0,
            animation: 'goldGlowPulse 7s ease-in-out infinite',
          }}
        />

        {/* Water Surface Layer (jQuery Ripples) */}
        <WaterLayer ref={waterRef} />

        {/* Giant campaign watermark word crowning the top behind everything */}
        <Box
          aria-hidden="true"
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: 0,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            pt: { xs: '0.5vh', md: '1vh' },
            overflow: 'hidden',
            pointerEvents: 'none',
          }}
        >
          <span className="hero-watermark-word">{t('navbar.brandName')}</span>
        </Box>

        {/* Campaign photo backdrop — masked edges keep center clean for text */}
        <Box
          aria-hidden="true"
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: 0,
            overflow: 'hidden',
            pointerEvents: 'none',
            WebkitMaskImage: 'radial-gradient(ellipse 95% 90% at 50% 42%, transparent 42%, black 80%)',
            maskImage: 'radial-gradient(ellipse 95% 90% at 50% 42%, transparent 42%, black 80%)',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              inset: '-6%',
              backgroundImage: 'url(/images/hero-campaign.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'brightness(0.85) saturate(1.05)',
              animation: 'heroKenburns 26s ease-in-out infinite alternate',
            }}
          />
        </Box>

        {/* Floating Organic Roses, Petals & Leaves (Disperse smoothly when cursor approaches) */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            pointerEvents: 'none',
            overflow: 'hidden',
          }}
          aria-hidden="true"
        >
          {petalSpecs.map((p) => (
            <span
              key={p.index}
              ref={(el) => {
                if (el) petalEls.current[p.index] = el;
                else delete petalEls.current[p.index];
              }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                willChange: 'transform',
                transformOrigin: 'center center',
              }}
            >
              <FloatingRoseItem idx={p.no} kind={p.kind} scale={p.size} />
            </span>
          ))}
        </Box>

        {/* Cinematic vignette + film grain (non-interactive, above petals) */}
        <Box
          aria-hidden="true"
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            pointerEvents: 'none',
            background:
              'radial-gradient(ellipse at center, transparent 52%, rgba(0, 0, 0, 0.5) 100%), linear-gradient(180deg, rgba(0,0,0,0.35), transparent 22%, transparent 78%, rgba(0,0,0,0.45))',
          }}
        />
        <Box
          aria-hidden="true"
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            pointerEvents: 'none',
            opacity: 0.05,
            backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='160' height='160' filter='url(%23n)'/></svg>")`,
            backgroundSize: '160px 160px',
          }}
        />

        {/* Hero Foreground Content with Framer Motion */}
        <Container
          maxWidth="lg"
          sx={{
            position: 'relative',
            zIndex: 2,
            px: { xs: 2.5, md: 4 },
          }}
        >
          <Box
            sx={{
              display: { xs: 'block', md: 'grid' },
              gridTemplateColumns: { md: '1.05fr 0.95fr' },
              gap: { md: 6 },
              alignItems: 'center',
            }}
          >
          <Box sx={{ textAlign: { xs: 'center', md: 'start' } }}>
          {/* Grand Hero Titles */}
          <Motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.15, ease: 'easeOut' }}
          >
            <Typography
              component="h1"
              sx={{
                fontSize: { xs: '2.8rem', sm: '4rem', md: '3.8rem' },
                fontWeight: 800,
                fontFamily: `'Playfair Display', 'Amiri', 'Times New Roman', serif`,
                lineHeight: 1.1,
                letterSpacing: isRTL ? '0' : '-0.02em',
                mb: 2,
                textShadow: '0 8px 28px rgba(0,0,0,0.8)',
              }}
            >
              <span style={{ color: '#FFFFFF' }}>{t('landing.hero.title1')} </span>
              <span className="luxury-gold-gradient">{t('landing.hero.title2')}</span>
            </Typography>
          </Motion.div>

          {/* Poetic Subtitle */}
          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
          >
            <Typography
              sx={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: { xs: '0.98rem', sm: '1.08rem', md: '1.12rem' },
                maxWidth: { xs: 780, md: 560 },
                mx: { xs: 'auto', md: 0 },
                lineHeight: 1.9,
                mb: 5,
                textShadow: '0 2px 12px rgba(0,0,0,0.9)',
              }}
            >
              {t('landing.hero.desc')}{' '}
              <Box
                component="span"
                className="luxury-gold-gradient"
                sx={{
                  fontWeight: 600,
                  display: { xs: 'block', sm: 'inline' },
                }}
              >
                {t('landing.hero.descEm')}
              </Box>
            </Typography>
          </Motion.div>

          {/* Focused Action Buttons */}
          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45, ease: 'easeOut' }}
          >
            <Box
              sx={{
                display: 'flex',
                flexWrap: { xs: 'wrap', md: 'nowrap' },
                alignItems: { xs: 'center', md: 'stretch' },
                justifyContent: { xs: 'center', md: 'flex-start' },
                gap: { xs: 2, md: 1.6 },
                mb: { xs: 2, md: 5 },
              }}
            >
              {/* Button to /perfumes */}
              <Box className="hero-explore-wrap hero-cta-item">
              <Motion.div style={{ height: '100%' }} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={() => navigate('/perfumes')}
                  variant="contained"
                  startIcon={<LocalMall sx={{ ml: isRTL ? '4px' : 0, mr: isRTL ? 0 : '4px' }} />}
                  sx={{
                    px: { xs: 3, md: 2.2 },
                    py: { xs: 1.05, md: 1 },
                    borderRadius: '100px',
                    fontSize: { xs: '0.82rem', md: '0.8rem' },
                    fontWeight: 600,
                    width: '100%',
                    height: '100%',
                    color: '#0a0a0c',
                    background: 'linear-gradient(135deg, #FFF6DC 0%, #F4D03F 30%, #D4AF37 75%, #AA7C11 100%)',
                    boxShadow: '0 10px 35px rgba(212, 175, 55, 0.4)',
                    border: '1px solid rgba(255,255,255,0.4)',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      bottom: 0,
                      width: '35%',
                      left: '-60%',
                      background: 'linear-gradient(100deg, transparent, rgba(255,255,255,0.4), transparent)',
                      transform: 'skewX(-18deg)',
                      animation: 'sheenMove 3.4s ease-in-out infinite',
                      pointerEvents: 'none',
                    },
                    '&:hover': {
                      color: '#0a0a0c',
                      boxShadow: '0 16px 45px rgba(212, 175, 55, 0.6)',
                      background: 'linear-gradient(135deg, #FFFFFF 0%, #F4D03F 40%, #D4AF37 100%)',
                    },
                  }}
                >
                  {t('landing.hero.shopNow')}
                </Button>
              </Motion.div>
              <img className="hero-explore-rose" src="/images/roses/flower4.png" alt="" draggable="false" />
              </Box>

              {/* Button to Login / Profile */}
              <Motion.div className="hero-cta-item" style={{ height: '100%' }} whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={() => navigate(isAuthenticated ? accountPath : '/login')}
                  variant="outlined"
                  startIcon={<Person sx={{ ml: isRTL ? '4px' : 0, mr: isRTL ? 0 : '4px' }} />}
                  sx={{
                    px: { xs: 3, md: 2.2 },
                    py: { xs: 1.05, md: 1 },
                    borderRadius: '100px',
                    fontSize: { xs: '0.82rem', md: '0.8rem' },
                    fontWeight: 600,
                    width: '100%',
                    height: '100%',
                    color: '#FFF6DC',
                    borderColor: 'rgba(212, 175, 55, 0.45)',
                    bgcolor: 'rgba(212, 175, 55, 0.05)',
                    backdropFilter: 'blur(12px)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: '#F4D03F',
                      bgcolor: 'rgba(212, 175, 55, 0.15)',
                    },
                  }}
                >
                  {isAuthenticated ? t('landing.access.customerBtnLoggedIn') : t('landing.hero.loginBtn')}
                </Button>
               </Motion.div>
            </Box>
          </Motion.div>
          </Box>

          {/* Product visual — new bottle floating over animated leaf */}
          <Motion.div
            aria-hidden="true"
            initial={{ opacity: 0, scale: 0.94, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
            className="hero-visual-row"
          >
            <Box
              sx={{
                position: 'relative',
                left: 0,
                mx: { xs: 'auto', md: 0 },
                width: { xs: 'min(72vw, 320px)', md: 'min(30vw, 380px)' },
                mt: { xs: 0, md: 0 },
                mb: { xs: 2, md: 0 },
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  left: '50%',
                  top: '8%',
                  width: '120%',
                  height: '60%',
                  transform: 'translateX(-50%)',
                  background: 'radial-gradient(ellipse, rgba(212,175,55,0.22), transparent 70%)',
                  filter: 'blur(36px)',
                  pointerEvents: 'none',
                }}
              />
              <Box
                component="img"
                src="/images/perfume.png"
                alt=""
                draggable="false"
                sx={{
                  position: 'relative',
                  left: { xs: '17%', md: '13%' },
                  zIndex: 1,
                  width: '100%',
                  aspectRatio: '602 / 415',
                  display: 'block',
                  mixBlendMode: 'screen',
                  animation: 'floatSlow 7s ease-in-out infinite',
                  userSelect: 'none',
                }}
              />
            </Box>
          </Motion.div>
          </Box>

          {/* Trust Guarantees Bar */}
          <Motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: 'easeOut' }}
          >
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
                gap: 2,
                maxWidth: 960,
                mx: 'auto',
              }}
            >
              {[
                { icon: <WorkspacePremium sx={{ color: '#F4D03F', fontSize: 24 }} />, text: t('landing.hero.pillPurity') },
                { icon: <AutoAwesome sx={{ color: '#F4D03F', fontSize: 24 }} />, text: t('landing.hero.pillLongevity') },
                { icon: <LocalShipping sx={{ color: '#F4D03F', fontSize: 24 }} />, text: t('landing.hero.pillDelivery') },
              ].map((pill, i) => (
                <Motion.div
                  key={i}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.65 + i * 0.12, ease: 'easeOut' }}
                  whileHover={{ y: -3 }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 1.5,
                      p: { xs: 1.6, sm: 2 },
                      borderRadius: '16px',
                      bgcolor: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      backdropFilter: 'blur(12px)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
                    }}
                  >
                    {pill.icon}
                    <Typography
                      sx={{
                        fontSize: { xs: '0.85rem', sm: '0.92rem' },
                        color: 'rgba(255, 255, 255, 0.88)',
                        fontWeight: 500,
                      }}
                    >
                      {pill.text}
                    </Typography>
                  </Box>
                </Motion.div>
              ))}
            </Box>
          </Motion.div>
        </Container>

      </Box>

      {/* ============== SECTION 2A: CINEMATIC QUOTE ============== */}
      <Box
        component="section"
        sx={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: { xs: '62vh', md: '78vh' },
          py: { xs: 12, md: 16 },
          overflow: 'hidden',
          borderTop: '1px solid rgba(212, 175, 55, 0.15)',
          borderBottom: '1px solid rgba(212, 175, 55, 0.15)',
        }}
      >
        <FloatingPetals
          items={[
            { top: '6%', left: '4%', size: 84, opacity: 0.85 },
            { top: '12%', left: '78%', size: 104, opacity: 0.9 },
            { top: '42%', left: '88%', size: 70, opacity: 0.7 },
            { top: '55%', left: '2%', size: 96, opacity: 0.8 },
            { top: '78%', left: '70%', size: 78, opacity: 0.75 },
            { top: '84%', left: '22%', size: 64, opacity: 0.7 },
            { top: '30%', left: '55%', size: 58, opacity: 0.65 },
            { top: '66%', left: '38%', size: 66, opacity: 0.7 },
            { top: '22%', left: '30%', size: 62, opacity: 0.7 },
            { top: '50%', left: '12%', size: 72, opacity: 0.75 },
          ]}
        />
        {/* Drifting golden ambience */}
        <Box
          aria-hidden="true"
          sx={{
            position: 'absolute',
            top: '10%',
            insetInlineStart: '8%',
            width: { xs: 260, md: 480 },
            height: { xs: 260, md: 480 },
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(212, 175, 55, 0.16) 0%, transparent 70%)',
            filter: 'blur(50px)',
            animation: 'mistDrift 11s ease-in-out infinite alternate',
            pointerEvents: 'none',
          }}
        />
        <Box
          aria-hidden="true"
          sx={{
            position: 'absolute',
            bottom: '5%',
            insetInlineEnd: '5%',
            width: { xs: 300, md: 560 },
            height: { xs: 300, md: 560 },
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(146, 64, 14, 0.2) 0%, transparent 70%)',
            filter: 'blur(60px)',
            animation: 'goldGlowPulse 8s ease-in-out infinite',
            pointerEvents: 'none',
          }}
        />
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1, textAlign: 'center', px: { xs: 3, md: 4 } }}>
          <Motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 1, ease: 'easeOut' }}
          >
            <Typography
              aria-hidden="true"
              sx={{
                fontFamily: `'Playfair Display', 'Amiri', serif`,
                fontSize: { xs: '4.5rem', md: '7rem' },
                lineHeight: 0.6,
                mb: 3,
                background: 'linear-gradient(180deg, #FFF6DC 0%, #D4AF37 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                userSelect: 'none',
              }}
            >
              &ldquo;
            </Typography>
            {/* Vertical auto-rotating quotes: faded prev / current / faded next */}
            <QuoteCarousel t={t} />
          </Motion.div>
        </Container>
      </Box>

      {/* ============== SECTION 2B: HOUSE CRAFT DUO ============== */}
      <Box
        component="section"
        sx={{
          py: { xs: 10, md: 14 },
          position: 'relative',
          overflow: 'hidden',
          borderBottom: '1px solid rgba(212, 175, 55, 0.15)',
          background: 'radial-gradient(ellipse at 50% 0%, rgba(212,175,55,0.06) 0%, transparent 60%)',
        }}
      >
        <FloatingPetals
          items={[
            { top: '6%', left: '80%', size: 88, opacity: 0.85 },
            { top: '20%', left: '8%', size: 72, opacity: 0.75 },
            { top: '48%', left: '90%', size: 64, opacity: 0.7 },
            { top: '66%', left: '3%', size: 98, opacity: 0.85 },
            { top: '82%', left: '55%', size: 70, opacity: 0.7 },
            { top: '34%', left: '45%', size: 60, opacity: 0.65 },
            { top: '52%', left: '25%', size: 68, opacity: 0.7 },
            { top: '12%', left: '45%', size: 58, opacity: 0.65 },
            { top: '74%', left: '78%', size: 66, opacity: 0.7 },
          ]}
        />
        <Container maxWidth="lg">
          <Motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 6 } }}>
              <Typography
                variant="h2"
                sx={{
                  fontSize: { xs: '2rem', sm: '2.7rem', md: '3.4rem' },
                  fontFamily: `'Playfair Display', 'Amiri', serif`,
                  fontWeight: 700,
                  mb: 2,
                }}
              >
                {t('landing.craftDuo.title')}
              </Typography>
              <Typography
                sx={{
                  color: 'rgba(255, 255, 255, 0.68)',
                  fontSize: { xs: '0.98rem', md: '1.12rem' },
                  maxWidth: 640,
                  mx: 'auto',
                  lineHeight: 1.8,
                }}
              >
                {t('landing.craftDuo.subtitle')}
              </Typography>
            </Box>
          </Motion.div>

          <CraftStage t={t} isRTL={isRTL} />
        </Container>
      </Box>

      {/* ============== SECTION 2C: PERFUMING RITUALS ============== */}
      <Box
        component="section"
        sx={{
          py: { xs: 10, md: 14 },
          position: 'relative',
          overflow: 'hidden',
          borderBottom: '1px solid rgba(212, 175, 55, 0.15)',
        }}
      >
        <FloatingPetals
          items={[
            { top: '8%', left: '5%', size: 76, opacity: 0.8 },
            { top: '16%', left: '82%', size: 92, opacity: 0.85 },
            { top: '45%', left: '93%', size: 62, opacity: 0.7 },
            { top: '62%', left: '2%', size: 88, opacity: 0.8 },
            { top: '85%', left: '60%', size: 68, opacity: 0.7 },
            { top: '30%', left: '40%', size: 58, opacity: 0.65 },
            { top: '70%', left: '30%', size: 64, opacity: 0.7 },
            { top: '48%', left: '68%', size: 60, opacity: 0.65 },
            { top: '24%', left: '62%', size: 66, opacity: 0.7 },
          ]}
        />
        <Container maxWidth="lg">
          <Motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 6 } }}>
              <Typography
                variant="h2"
                sx={{
                  fontSize: { xs: '2rem', sm: '2.7rem', md: '3.4rem' },
                  fontFamily: `'Playfair Display', 'Amiri', serif`,
                  fontWeight: 700,
                  mb: 2,
                }}
              >
                {t('landing.ritual.title')}
              </Typography>
              <Typography
                sx={{
                  color: 'rgba(255, 255, 255, 0.68)',
                  fontSize: { xs: '0.98rem', md: '1.12rem' },
                  maxWidth: 640,
                  mx: 'auto',
                  lineHeight: 1.8,
                }}
              >
                {t('landing.ritual.subtitle')}
              </Typography>
            </Box>
          </Motion.div>

          {/* Ritual timeline */}
          <Box sx={{ position: 'relative', maxWidth: 1100, mx: 'auto' }}>
            {/* Vertical gold line (mobile) */}
            <Motion.div
              aria-hidden="true"
              className="ritual-line-v"
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: 'easeInOut' }}
              style={{
                transformOrigin: 'top center',
                position: 'absolute',
                top: 24,
                bottom: 24,
                insetInlineStart: 22,
                width: 2,
                background: 'linear-gradient(180deg, transparent, rgba(212,175,55,0.7) 12%, rgba(244,208,63,0.7) 88%, transparent)',
              }}
            />
            {/* Horizontal gold line (desktop) */}
            <Motion.div
              aria-hidden="true"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: 'easeInOut' }}
              style={{
                transformOrigin: isRTL ? 'right center' : 'left center',
                position: 'absolute',
                top: 22,
                left: '8%',
                right: '8%',
                height: 2,
                background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.7) 12%, rgba(244,208,63,0.7) 88%, transparent)',
              }}
              className="ritual-line-h"
            />
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' },
                gap: { xs: 3, md: 3.5 },
                position: 'relative',
              }}
            >
              {[
                { icon: <Hearing sx={{ fontSize: 22, color: '#0a0a0c' }} />, title: t('landing.ritual.s1Title'), desc: t('landing.ritual.s1Desc') },
                { icon: <DoNotTouch sx={{ fontSize: 22, color: '#0a0a0c' }} />, title: t('landing.ritual.s2Title'), desc: t('landing.ritual.s2Desc') },
                { icon: <Checkroom sx={{ fontSize: 22, color: '#0a0a0c' }} />, title: t('landing.ritual.s3Title'), desc: t('landing.ritual.s3Desc') },
                { icon: <Air sx={{ fontSize: 22, color: '#0a0a0c' }} />, title: t('landing.ritual.s4Title'), desc: t('landing.ritual.s4Desc') },
              ].map((step, i) => (
                <Box
                  key={i}
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'row', md: 'column' },
                    alignItems: { xs: 'flex-start', md: 'center' },
                    textAlign: { xs: 'start', md: 'center' },
                    gap: { xs: 2.5, md: 0 },
                  }}
                >
                  <Motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.3 + i * 0.18 }}
                    style={{ position: 'relative', zIndex: 1, flexShrink: 0 }}
                  >
                    <Box
                      sx={{
                        width: 46,
                        height: 46,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, #FFF6DC 0%, #F4D03F 45%, #D4AF37 100%)',
                        boxShadow: '0 0 0 6px rgba(212, 175, 55, 0.12), 0 6px 20px rgba(212, 175, 55, 0.4)',
                      }}
                    >
                      {step.icon}
                    </Box>
                  </Motion.div>
                  <Motion.div
                    initial={{ opacity: 0, y: 22 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.45 + i * 0.18, ease: 'easeOut' }}
                    style={{ width: '100%' }}
                  >
                    <Box sx={{ pt: { xs: 0.5, md: 2.5 } }}>
                      <Typography sx={{ fontWeight: 700, fontSize: '1.05rem', color: '#FFFFFF', mb: 1 }}>
                        {step.title}
                      </Typography>
                      <Typography sx={{ color: 'rgba(255, 255, 255, 0.62)', fontSize: '0.88rem', lineHeight: 1.8 }}>
                        {step.desc}
                      </Typography>
                    </Box>
                  </Motion.div>
                </Box>
              ))}
            </Box>
          </Box>
          <style>{`.ritual-line-h, .ritual-line-v { display: none; } @media (max-width: 899px) { .ritual-line-v { display: block; } } @media (min-width: 900px) { .ritual-line-h { display: block; } }`}</style>
        </Container>
      </Box>

      {/* ============== SECTION 3: hidden when logged in (irrelevant for members) ============== */}
      {!isAuthenticated && (
      <Box
        component="section"
        sx={{
          py: { xs: 10, md: 14 },
          position: 'relative',
          overflow: 'hidden',
          borderTop: '1px solid rgba(212, 175, 55, 0.15)',
          background: 'radial-gradient(ellipse at 50% 0%, rgba(212,175,55,0.07) 0%, transparent 60%)',
        }}
      >
        <FloatingPetals
          items={[
            { top: '5%', left: '75%', size: 90, opacity: 0.85 },
            { top: '14%', left: '6%', size: 74, opacity: 0.75 },
            { top: '38%', left: '91%', size: 66, opacity: 0.7 },
            { top: '55%', left: '2%', size: 86, opacity: 0.8 },
            { top: '72%', left: '45%', size: 62, opacity: 0.65 },
            { top: '86%', left: '80%', size: 76, opacity: 0.75 },
            { top: '28%', left: '30%', size: 60, opacity: 0.65 },
            { top: '60%', left: '62%', size: 68, opacity: 0.7 },
            { top: '44%', left: '15%', size: 62, opacity: 0.65 },
            { top: '80%', left: '32%', size: 70, opacity: 0.7 },
          ]}
        />
        <Container maxWidth="lg">
          <Motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 6 } }}>
              <Typography
                variant="h2"
                sx={{
                  fontSize: { xs: '2rem', sm: '2.7rem', md: '3.4rem' },
                  fontFamily: `'Playfair Display', 'Amiri', serif`,
                  fontWeight: 700,
                  mb: 2,
                }}
              >
                {t('landing.access.title')}
              </Typography>
              <Typography
                sx={{
                  color: 'rgba(255, 255, 255, 0.68)',
                  fontSize: { xs: '0.98rem', md: '1.12rem' },
                  maxWidth: 640,
                  mx: 'auto',
                  lineHeight: 1.8,
                }}
              >
                {t('landing.access.subtitle')}
              </Typography>
            </Box>
          </Motion.div>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
              gap: 3,
              maxWidth: 980,
              mx: 'auto',
              alignItems: 'stretch',
            }}
          >
            {/* Guest card */}
            <Motion.div
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              whileHover={{ y: -5 }}
            >
              <Box
                sx={{
                  p: { xs: 3.5, sm: 4.5 },
                  height: '100%',
                  borderRadius: '24px',
                  bgcolor: 'rgba(255, 255, 255, 0.025)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <Box
                    sx={{
                      width: 52,
                      height: 52,
                      borderRadius: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                    }}
                  >
                    <Person sx={{ color: 'rgba(255,255,255,0.85)', fontSize: 28 }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: '1.25rem', color: '#FFFFFF' }}>
                      {t('landing.access.guestTitle')}
                    </Typography>
                    <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>
                      {t('landing.access.guestTag')}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.6, my: 3 }}>
                  {[t('landing.access.guest1'), t('landing.access.guest2'), t('landing.access.guest3')].map((item, i) => (
                    <Motion.div
                      key={i}
                      initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.15 + i * 0.12, ease: 'easeOut' }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                        <Motion.span
                          initial={{ scale: 0, rotate: -40 }}
                          whileInView={{ scale: 1, rotate: 0 }}
                          viewport={{ once: true }}
                          transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.25 + i * 0.12 }}
                          style={{ display: 'inline-flex', marginTop: 2 }}
                        >
                          <CheckCircle sx={{ color: 'rgba(255,255,255,0.55)', fontSize: 20 }} />
                        </Motion.span>
                        <Typography sx={{ color: 'rgba(255, 255, 255, 0.82)', fontSize: '0.95rem', lineHeight: 1.7 }}>
                          {item}
                        </Typography>
                      </Box>
                    </Motion.div>
                  ))}
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1.2,
                    p: 2,
                    mb: 3,
                    borderRadius: '14px',
                    bgcolor: 'rgba(212, 175, 55, 0.05)',
                    border: '1px dashed rgba(212, 175, 55, 0.4)',
                  }}
                >
                  <LocalOffer sx={{ color: '#F4D03F', fontSize: 20, mt: 0.2 }} />
                  <Typography sx={{ color: 'rgba(255, 246, 220, 0.85)', fontSize: '0.88rem', lineHeight: 1.7 }}>
                    {t('landing.access.guestNoCoupon')}
                  </Typography>
                </Box>

                <Button
                  onClick={() => navigate('/perfumes')}
                  variant="outlined"
                  startIcon={<LocalMall sx={{ ml: isRTL ? '10px' : 0, mr: isRTL ? 0 : '10px' }} />}
                  sx={{
                    mt: 'auto',
                    py: 1.35,
                    borderRadius: '100px',
                    fontSize: '0.95rem',
                    color: '#FFF6DC',
                    borderColor: 'rgba(255, 255, 255, 0.22)',
                    bgcolor: 'rgba(255, 255, 255, 0.04)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)',
                    transition: 'all 0.35s ease',
                    '&:hover': {
                      borderColor: '#F4D03F',
                      color: '#F4D03F',
                      bgcolor: 'rgba(212, 175, 55, 0.12)',
                      boxShadow: '0 8px 26px rgba(212, 175, 55, 0.25), inset 0 1px 0 rgba(255,255,255,0.15)',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  {t('landing.access.guestBtn')}
                </Button>
              </Box>
            </Motion.div>

            {/* Customer card (highlighted) */}
            <Motion.div
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.12, ease: 'easeOut' }}
              whileHover={{ y: -5 }}
            >
              <Box
                sx={{
                  p: { xs: 3.5, sm: 4.5 },
                  height: '100%',
                  borderRadius: '24px',
                  bgcolor: 'rgba(212, 175, 55, 0.05)',
                  border: '1px solid rgba(212, 175, 55, 0.45)',
                  boxShadow: '0 18px 50px rgba(0,0,0,0.5), 0 0 30px rgba(212, 175, 55, 0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  overflow: 'visible',
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: 18,
                    insetInlineEnd: 18,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.7,
                    px: 1.8,
                    py: 0.5,
                    borderRadius: '100px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#0a0a0c',
                    background: 'linear-gradient(135deg, #FFF6DC 0%, #F4D03F 40%, #D4AF37 100%)',
                  }}
                >
                  <Star sx={{ fontSize: 14 }} />
                  {t('landing.access.customerTag')}
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <Box
                    sx={{
                      width: 52,
                      height: 52,
                      borderRadius: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'rgba(212, 175, 55, 0.14)',
                      border: '1px solid rgba(212, 175, 55, 0.45)',
                    }}
                  >
                    <WorkspacePremium sx={{ color: '#F4D03F', fontSize: 28 }} />
                  </Box>
                  <Typography sx={{ fontWeight: 700, fontSize: '1.25rem', color: '#FFFFFF' }}>
                    {t('landing.access.customerTitle')}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.6, my: 3 }}>
                  {[t('landing.access.customer1'), t('landing.access.customer2'), t('landing.access.customer3'), t('landing.access.customer4')].map((item, i) => (
                    <Motion.div
                      key={i}
                      initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.15 + i * 0.12, ease: 'easeOut' }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                        <Motion.span
                          initial={{ scale: 0, rotate: -40 }}
                          whileInView={{ scale: 1, rotate: 0 }}
                          viewport={{ once: true }}
                          transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.25 + i * 0.12 }}
                          style={{ display: 'inline-flex', marginTop: 2, filter: 'drop-shadow(0 0 6px rgba(212,175,55,0.7))' }}
                        >
                          <CheckCircle sx={{ color: '#F4D03F', fontSize: 20 }} />
                        </Motion.span>
                        <Typography sx={{ color: 'rgba(255, 255, 255, 0.88)', fontSize: '0.95rem', lineHeight: 1.7 }}>
                          {item}
                        </Typography>
                      </Box>
                    </Motion.div>
                  ))}
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1.2,
                    p: 2,
                    mb: 3,
                    borderRadius: '14px',
                    bgcolor: 'rgba(212, 175, 55, 0.08)',
                    border: '1px dashed rgba(212, 175, 55, 0.5)',
                  }}
                >
                  <Email sx={{ color: '#F4D03F', fontSize: 20, mt: 0.2 }} />
                  <Typography sx={{ color: 'rgba(255, 246, 220, 0.9)', fontSize: '0.88rem', lineHeight: 1.7 }}>
                    {t('landing.access.customerCouponEmail')}
                  </Typography>
                </Box>

                <Button
                  onClick={() => navigate('/register')}
                  variant="contained"
                  startIcon={<PersonAdd sx={{ ml: isRTL ? '10px' : 0, mr: isRTL ? 0 : '10px' }} />}
                  sx={{
                    mt: 'auto',
                    py: 1.35,
                    borderRadius: '100px',
                    fontWeight: 700,
                    fontSize: '0.92rem',
                    color: '#0a0a0c',
                    background: 'linear-gradient(135deg, #FFF6DC 0%, #F4D03F 40%, #D4AF37 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.45)',
                    boxShadow: '0 10px 30px rgba(212, 175, 55, 0.4), inset 0 1px 0 rgba(255,255,255,0.5)',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.35s ease',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      bottom: 0,
                      width: '35%',
                      left: '-60%',
                      background: 'linear-gradient(100deg, transparent, rgba(255,255,255,0.5), transparent)',
                      transform: 'skewX(-18deg)',
                      animation: 'sheenMove 3.2s ease-in-out infinite',
                      pointerEvents: 'none',
                    },
                    '&:hover': {
                      boxShadow: '0 16px 44px rgba(212, 175, 55, 0.6), inset 0 1px 0 rgba(255,255,255,0.5)',
                      transform: 'translateY(-2px)',
                      background: 'linear-gradient(135deg, #FFFFFF 0%, #F4D03F 45%, #D4AF37 100%)',
                    },
                  }}
                >
                  {t('landing.access.customerBtn')}
                </Button>
              </Box>
            </Motion.div>
          </Box>
        </Container>
      </Box>
      )}

    </Box>
  );
};

export default Landing;