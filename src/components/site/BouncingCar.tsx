"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { cn } from "@/lib/utils/cn";

const CAR_WIDTH = 64;
const CAR_HEIGHT = 32;
const SPEED = 100; // px/sec
const MAX_FLING_SPEED = 900; // px/sec, caps how fast a hard flick can send it
const INITIAL_X = 16;
const INITIAL_Y = 16;
const INITIAL_ANGLE = Math.atan2(SPEED * 0.6, SPEED);
const DRAG_THRESHOLD = 4; // px of movement before a pointer-down counts as a drag, not a click
const STEER_STEP = 15; // degrees per arrow-key press

function clamp(v: number, min: number, max: number) {
  return Math.min(Math.max(v, min), max);
}

function subscribeReducedMotion(callback: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}
function getReducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
function getReducedMotionServerSnapshot() {
  return false;
}

// Top-down car with a glossy-paint gradient, a windshield highlight and a soft cast shadow
// underneath, so it reads as a lifted, dimensional object rather than a flat icon. Nose points
// along +x (right) at rotation 0, so rotating it by the current heading angle (or drag/steering
// angle) always keeps it facing the direction it's moving.
function CarIcon({ className, lifted }: { className?: string; lifted?: boolean }) {
  return (
    <svg viewBox="-4 -6 72 44" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="carBody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff9e6e" />
          <stop offset="55%" stopColor="#fa5a1f" />
          <stop offset="100%" stopColor="#c73f10" />
        </linearGradient>
        <linearGradient id="carGlass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#eaf1ff" />
          <stop offset="100%" stopColor="#b9c9e8" />
        </linearGradient>
        <radialGradient id="carShadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1a1330" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#1a1330" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse
        cx="32"
        cy={lifted ? 30 : 26}
        rx={lifted ? 26 : 30}
        ry="5"
        fill="url(#carShadow)"
        className="transition-all duration-150"
      />

      <rect x="14" y="0" width="11" height="7" rx="2.5" className="fill-ink-900" />
      <rect x="14" y="25" width="11" height="7" rx="2.5" className="fill-ink-900" />
      <rect x="39" y="0" width="11" height="7" rx="2.5" className="fill-ink-900" />
      <rect x="39" y="25" width="11" height="7" rx="2.5" className="fill-ink-900" />

      <rect x="4" y="6" width="56" height="20" rx="9" fill="url(#carBody)" />
      <rect x="4" y="6" width="56" height="8" rx="4" fill="#fff" opacity="0.18" />

      <rect x="8" y="10" width="16" height="12" rx="4" fill="url(#carGlass)" />
      <rect x="38" y="10" width="14" height="12" rx="4" className="fill-primary-100" />

      <circle cx="58" cy="11" r="1.8" className="fill-sun-300" />
      <circle cx="58" cy="21" r="1.8" className="fill-sun-300" />
    </svg>
  );
}

function SteeringWheelIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 56 56" className={className} aria-hidden="true">
      <circle cx="28" cy="28" r="21.5" fill="none" strokeWidth="5" className="stroke-ink-800" />
      <line x1="28" y1="28" x2="28" y2="8" strokeWidth="5" strokeLinecap="round" className="stroke-ink-800" />
      <line x1="28" y1="28" x2="45.6" y2="38" strokeWidth="5" strokeLinecap="round" className="stroke-ink-800" />
      <line x1="28" y1="28" x2="10.4" y2="38" strokeWidth="5" strokeLinecap="round" className="stroke-ink-800" />
      <circle cx="28" cy="28" r="7.5" className="fill-accent-500" />
    </svg>
  );
}

// A purely decorative floating car — no product data, just a bit of playful personality for the
// storefront. Left alone, it bounces off the edges of the viewport (below the header, above the
// mobile nav), reversing vx/vy independently on each wall hit and rotating to face whichever way
// it's heading. Click it to pause/resume, drag it to pick it up and fling it in a new direction,
// or use the steering wheel to redirect it while it keeps driving. Position/rotation updates
// after mount mutate the DOM node directly (not via React state) so none of this re-renders the
// component 60 times a second.
export function BouncingCar() {
  const arenaRef = useRef<HTMLDivElement>(null);
  const carRef = useRef<HTMLButtonElement>(null);
  const wheelRef = useRef<HTMLButtonElement>(null);
  const posRef = useRef({ x: INITIAL_X, y: INITIAL_Y });
  const velRef = useRef({ vx: SPEED, vy: SPEED * 0.6 });
  const pausedRef = useRef(false);
  const draggingRef = useRef(false);
  const suppressClickRef = useRef(false);
  const wheelAngleRef = useRef(INITIAL_ANGLE);
  const frameRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);
  const [paused, setPaused] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [topInset, setTopInset] = useState(96);
  const prefersReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );

  useEffect(() => {
    const header = document.querySelector("header");
    function syncTopInset() {
      const h = header?.getBoundingClientRect().height ?? 96;
      setTopInset(Math.round(h + 12));
    }
    syncTopInset();
    window.addEventListener("resize", syncTopInset);
    return () => window.removeEventListener("resize", syncTopInset);
  }, []);

  function applyCarTransform(headingDeg?: number) {
    if (!carRef.current) return;
    const { x, y } = posRef.current;
    const { vx, vy } = velRef.current;
    const heading = headingDeg ?? Math.atan2(vy, vx) * (180 / Math.PI);
    carRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${heading}deg)`;
  }

  function syncWheelTransform() {
    if (!wheelRef.current) return;
    wheelRef.current.style.transform = `rotate(${wheelAngleRef.current * (180 / Math.PI)}deg)`;
  }

  function steerTo(angle: number) {
    wheelAngleRef.current = angle;
    const speed = Math.max(Math.hypot(velRef.current.vx, velRef.current.vy), SPEED);
    velRef.current = { vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed };
    syncWheelTransform();
    if (pausedRef.current) applyCarTransform();
  }

  useEffect(() => {
    if (prefersReducedMotion) return;

    const angle = Math.random() * (Math.PI / 3) + Math.PI / 6; // 30°-90°, varies each load
    velRef.current = { vx: Math.cos(angle) * SPEED, vy: Math.sin(angle) * SPEED };
    wheelAngleRef.current = angle;
    syncWheelTransform();

    function tick(ts: number) {
      if (lastTsRef.current === null) lastTsRef.current = ts;
      const dt = Math.min((ts - lastTsRef.current) / 1000, 0.05);
      lastTsRef.current = ts;

      if (!pausedRef.current && !draggingRef.current && arenaRef.current && carRef.current) {
        const maxX = arenaRef.current.clientWidth - CAR_WIDTH;
        const maxY = arenaRef.current.clientHeight - CAR_HEIGHT;
        let { x, y } = posRef.current;
        let { vx, vy } = velRef.current;

        x += vx * dt;
        y += vy * dt;

        if (x <= 0) { x = 0; vx = Math.abs(vx); }
        else if (x >= maxX) { x = maxX; vx = -Math.abs(vx); }
        if (y <= 0) { y = 0; vy = Math.abs(vy); }
        else if (y >= maxY) { y = maxY; vy = -Math.abs(vy); }

        posRef.current = { x, y };
        velRef.current = { vx, vy };
        applyCarTransform();
      }

      frameRef.current = requestAnimationFrame(tick);
    }

    applyCarTransform();
    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [prefersReducedMotion]);

  function toggle() {
    pausedRef.current = !pausedRef.current;
    setPaused(pausedRef.current);
  }

  function handleCarClick() {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    toggle();
  }

  function handleCarPointerDown(e: ReactPointerEvent<HTMLButtonElement>) {
    if (e.button !== undefined && e.button !== 0) return;
    e.preventDefault();

    const startClientX = e.clientX;
    const startClientY = e.clientY;
    const startPos = { ...posRef.current };
    let moved = false;
    let lastX = startPos.x;
    let lastY = startPos.y;
    let lastT = performance.now();
    let flingVx = 0;
    let flingVy = 0;

    function onMove(ev: PointerEvent) {
      const dx = ev.clientX - startClientX;
      const dy = ev.clientY - startClientY;

      if (!moved) {
        if (Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD) return;
        moved = true;
        draggingRef.current = true;
        setDragging(true);
      }

      const arena = arenaRef.current;
      if (!arena) return;
      const maxX = arena.clientWidth - CAR_WIDTH;
      const maxY = arena.clientHeight - CAR_HEIGHT;
      const nx = clamp(startPos.x + dx, 0, maxX);
      const ny = clamp(startPos.y + dy, 0, maxY);

      const now = performance.now();
      const dt = Math.max((now - lastT) / 1000, 0.001);
      const stepVx = (nx - lastX) / dt;
      const stepVy = (ny - lastY) / dt;
      // Smooth the instantaneous velocity so the fling isn't dominated by one noisy sample.
      flingVx = flingVx * 0.7 + stepVx * 0.3;
      flingVy = flingVy * 0.7 + stepVy * 0.3;

      const heading = (Math.abs(nx - lastX) > 0.05 || Math.abs(ny - lastY) > 0.05)
        ? Math.atan2(ny - lastY, nx - lastX) * (180 / Math.PI)
        : undefined;

      lastX = nx;
      lastY = ny;
      lastT = now;
      posRef.current = { x: nx, y: ny };
      applyCarTransform(heading);
    }

    function onUp() {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);

      if (!moved) return;

      suppressClickRef.current = true;
      draggingRef.current = false;
      setDragging(false);

      const flingSpeed = Math.hypot(flingVx, flingVy);
      if (flingSpeed > 40) {
        const capped = Math.min(flingSpeed, MAX_FLING_SPEED);
        const scale = capped / flingSpeed;
        velRef.current = { vx: flingVx * scale, vy: flingVy * scale };
        wheelAngleRef.current = Math.atan2(velRef.current.vy, velRef.current.vx);
        syncWheelTransform();
      }
      lastTsRef.current = null;
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  function handleWheelPointerDown(e: ReactPointerEvent<HTMLButtonElement>) {
    e.preventDefault();
    const wheelEl = wheelRef.current;
    if (!wheelEl) return;
    const rect = wheelEl.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    function updateFromPoint(clientX: number, clientY: number) {
      steerTo(Math.atan2(clientY - cy, clientX - cx));
    }

    updateFromPoint(e.clientX, e.clientY);

    function onMove(ev: PointerEvent) {
      updateFromPoint(ev.clientX, ev.clientY);
    }
    function onUp() {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  function handleWheelKeyDown(e: ReactKeyboardEvent<HTMLButtonElement>) {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      steerTo(wheelAngleRef.current - (STEER_STEP * Math.PI) / 180);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      steerTo(wheelAngleRef.current + (STEER_STEP * Math.PI) / 180);
    }
  }

  const showPaused = paused || prefersReducedMotion;

  return (
    <>
      <div
        ref={arenaRef}
        className="pointer-events-none fixed inset-x-3 bottom-20 z-20 sm:inset-x-6 md:bottom-6"
        style={{ top: topInset }}
      >
        <button
          ref={carRef}
          onClick={handleCarClick}
          onPointerDown={handleCarPointerDown}
          aria-label={showPaused ? "Resume the floating car" : "Pause the floating car — drag to move it"}
          style={{
            width: CAR_WIDTH,
            height: CAR_HEIGHT,
            transform: `translate3d(${INITIAL_X}px, ${INITIAL_Y}px, 0)`,
            transformOrigin: "50% 50%",
            touchAction: "none",
          }}
          className="group pointer-events-auto absolute left-0 top-0 cursor-grab bg-transparent active:cursor-grabbing"
        >
          <CarIcon
            lifted={dragging}
            className={cn(
              "size-full transition-transform duration-150",
              dragging ? "scale-110" : "group-active:scale-95"
            )}
          />
        </button>
      </div>

      <button
        ref={wheelRef}
        onPointerDown={handleWheelPointerDown}
        onKeyDown={handleWheelKeyDown}
        aria-label="Steer the floating car"
        style={{ transform: `rotate(${INITIAL_ANGLE * (180 / Math.PI)}deg)`, touchAction: "none" }}
        className="fixed bottom-24 right-4 z-30 flex size-14 cursor-pointer items-center justify-center rounded-full border border-primary-200 bg-white/95 shadow-lifted backdrop-blur transition-transform hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 md:bottom-8 md:right-8"
      >
        <SteeringWheelIcon className="size-9" />
      </button>
    </>
  );
}
