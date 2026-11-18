import {
  ArrowRight,
  MapPin,
  Play,
  SkipForward,
  Smartphone,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  HERO_CITY_IMAGE,
  REFERENCE_APP_IMAGE,
  TARAZ_EVENTS,
} from '../data/eventsData';
import {
  formatPresentationTime,
  INTRO_POSTER_IMAGE,
  resolveHeroMediaStrategy,
} from '../utils/heroPresentation';

gsap.registerPlugin(ScrollTrigger);

interface HeroSceneProps {
  onExploreClick: () => void;
  onOpenAppStage: (eventId?: string) => void;
}

export function HeroScene({ onExploreClick, onOpenAppStage }: HeroSceneProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const wordmarkRef = useRef<HTMLDivElement>(null);
  const subWordRef = useRef<HTMLSpanElement>(null);
  const backdropCardRef = useRef<HTMLDivElement>(null);
  const phoneWrapRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);

  const prefersReduced = useReducedMotion();

  const [viewportWidth, setViewportWidth] = useState<number>(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1440
  );
  const [manualVideoRequested, setManualVideoRequested] = useState(false);

  const initialEnv = resolveHeroMediaStrategy({
    viewportWidth: typeof window !== 'undefined' ? window.innerWidth : 1440,
    prefersReducedMotion:
      typeof window !== 'undefined'
        ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
        : false,
    saveData:
      typeof navigator !== 'undefined' &&
      Boolean(
        (navigator as Navigator & { connection?: { saveData?: boolean } })
          .connection?.saveData
      ),
    autostart:
      typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search).get('autostart') === '1'
        : false,
    manualVideoRequested: false,
  });

  const [heroMode, setHeroMode] = useState<'video' | 'app'>(
    initialEnv.initialMode
  );
  const [deferVideoMountReady, setDeferVideoMountReady] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [videoReady, setVideoReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(29);
  const [phoneScreenMode, setPhoneScreenMode] = useState<'launch' | 'live'>(
    'launch'
  );
  const [heroImgFailed, setHeroImgFailed] = useState(false);
  const [transitionVeilKey, setTransitionVeilKey] = useState(0);

  const strategy = resolveHeroMediaStrategy({
    viewportWidth,
    prefersReducedMotion: Boolean(prefersReduced),
    saveData:
      typeof navigator !== 'undefined' &&
      Boolean(
        (navigator as Navigator & { connection?: { saveData?: boolean } })
          .connection?.saveData
      ),
    autostart:
      typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search).get('autostart') === '1'
        : false,
    manualVideoRequested,
  });

  const shouldMountVideoElement =
    heroMode === 'video' &&
    deferVideoMountReady &&
    strategy.shouldMountVideo &&
    !videoFailed;

  // Defer video mounting cleanly after initial LCP paint so fonts & hero poster render immediately
  useEffect(() => {
    const win = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };

    if (typeof win.requestIdleCallback === 'function') {
      const id = win.requestIdleCallback(() => setDeferVideoMountReady(true), {
        timeout: 240,
      });
      return () => win.cancelIdleCallback?.(id);
    }

    const timer = window.setTimeout(() => setDeferVideoMountReady(true), 120);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Pause video automatically when scrolled out of Hero so CPU stays free for Gallery/ScrollTrigger
  useEffect(() => {
    const sectionEl = sectionRef.current;
    const videoEl = videoRef.current;
    if (!sectionEl || !videoEl || !shouldMountVideoElement) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!videoRef.current) return;
        if (entry.isIntersecting) {
          videoRef.current.play().catch(() => {});
        } else {
          videoRef.current.pause();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(sectionEl);
    return () => observer.disconnect();
  }, [shouldMountVideoElement]);

  // Keep DOM element's muted property synchronized with state
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted, shouldMountVideoElement]);

  // GSAP scroll-driven choreography for the Light App Interface state
  useEffect(() => {
    if (heroMode !== 'app' || !sectionRef.current) return;

    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    const ctx = gsap.context(() => {
      if (!reduced) {
        const tl = gsap.timeline();
        tl.from(wordmarkRef.current, {
          y: 28,
          scale: 1.04,
          opacity: 0,
          duration: 0.65,
          ease: 'power3.out',
          clearProps: 'transform,opacity',
        })
          .from(
            backdropCardRef.current,
            {
              scale: 0.97,
              opacity: 0,
              duration: 0.7,
              ease: 'power3.out',
              clearProps: 'transform,opacity',
            },
            '-=0.45'
          )
          .from(
            '.hero-editorial-reveal',
            {
              y: 22,
              opacity: 0,
              duration: 0.55,
              stagger: 0.07,
              ease: 'power3.out',
              clearProps: 'transform,opacity',
            },
            '-=0.4'
          )
          .from(
            phoneWrapRef.current,
            {
              y: 42,
              scale: 0.94,
              opacity: 0,
              duration: 0.7,
              ease: 'power3.out',
              clearProps: 'transform,opacity',
            },
            '-=0.45'
          );

        const mm = gsap.matchMedia();
        mm.add('(min-width: 1024px)', () => {
          if (wordmarkRef.current) {
            gsap.to(wordmarkRef.current, {
              xPercent: -6,
              ease: 'none',
              scrollTrigger: {
                trigger: sectionRef.current,
                start: 'top top',
                end: 'bottom top',
                scrub: 0.8,
              },
            });
          }

          if (subWordRef.current) {
            gsap.to(subWordRef.current, {
              xPercent: 8,
              ease: 'none',
              scrollTrigger: {
                trigger: sectionRef.current,
                start: 'top top',
                end: 'bottom top',
                scrub: 0.8,
              },
            });
          }

          if (phoneWrapRef.current) {
            gsap.to(phoneWrapRef.current, {
              y: -48,
              scale: 1.03,
              ease: 'none',
              scrollTrigger: {
                trigger: sectionRef.current,
                start: 'top top',
                end: 'bottom top',
                scrub: 0.9,
              },
            });
          }
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [heroMode]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      ScrollTrigger.refresh();
    }, 80);
    return () => window.clearTimeout(timer);
  }, [heroMode]);

  const handleTransitionToApp = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setTransitionVeilKey((k) => k + 1);
    setHeroMode('app');
  }, []);

  const handleReplayPresentation = useCallback(() => {
    setVideoFailed(false);
    setVideoReady(false);
    setCurrentTime(0);
    setManualVideoRequested(true);
    setDeferVideoMountReady(true);
    setTransitionVeilKey((k) => k + 1);
    setHeroMode('video');
  }, []);

  const handleToggleAudio = useCallback(() => {
    // On mobile poster state where video hasn't mounted yet, tapping sound starts playback with sound on user gesture
    if (!strategy.shouldMountVideo) {
      setManualVideoRequested(true);
      setDeferVideoMountReady(true);
      setIsMuted(false);
      return;
    }

    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (videoRef.current) {
      videoRef.current.muted = nextMuted;
      if (!nextMuted && videoRef.current.paused) {
        videoRef.current.play().catch(() => {});
      }
    }
  }, [isMuted, strategy.shouldMountVideo]);

  const handlePointerMove = (e: React.MouseEvent<HTMLElement>) => {
    if (
      heroMode !== 'app' ||
      window.innerWidth < 1024 ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const normX = (e.clientX - rect.left) / rect.width - 0.5;
    const normY = (e.clientY - rect.top) / rect.height - 0.5;

    if (phoneRef.current) {
      phoneRef.current.style.transform = `perspective(1200px) rotateY(${normX * 10}deg) rotateX(${-normY * 8}deg) translateZ(10px)`;
    }
  };

  const handlePointerLeave = () => {
    if (phoneRef.current) {
      phoneRef.current.style.transform =
        'perspective(1200px) rotateY(0deg) rotateX(0deg) translateZ(0px)';
    }
  };

  const progressRatio = duration > 0 ? Math.min(1, currentTime / duration) : 0;

  return (
    <section
      id="hero"
      ref={sectionRef}
      data-hero-mode={heroMode}
      onMouseMove={handlePointerMove}
      onMouseLeave={handlePointerLeave}
      className="scroll-mt-16 relative min-h-[calc(100svh-4rem)] overflow-hidden bg-[#FFF8F8]"
    >
      {transitionVeilKey > 0 && !prefersReduced && (
        <motion.div
          key={`veil-${transitionVeilKey}`}
          aria-hidden="true"
          initial={{ opacity: 0.92 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="pointer-events-none absolute inset-0 z-30 bg-[#FFF8F8]"
        />
      )}

      {heroMode === 'video' ? (
        <motion.div
          key="cinematic-video-stage"
          initial={prefersReduced ? false : { opacity: 0.92 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex min-h-[calc(100svh-4rem)] w-full flex-col justify-between overflow-hidden bg-[#2C2021]"
        >
            {/* Layer 0: Immediate LCP Poster (also serves as lightweight mobile visual) */}
            <img
              src={INTRO_POSTER_IMAGE}
              alt="Вечерний проспект Тараза с фестивальной сценой и аркой города"
              fetchPriority="high"
              referrerPolicy="no-referrer"
              className="absolute inset-0 h-full w-full object-cover object-center"
            />

            {/* Layer 1: Lazy-mounted faststart MP4 (<30s desktop / on-demand mobile) */}
            {shouldMountVideoElement && (
              <video
                ref={videoRef}
                key={strategy.videoSrc}
                src={strategy.videoSrc}
                poster={strategy.posterSrc}
                autoPlay
                muted={isMuted}
                playsInline
                preload="metadata"
                onCanPlay={() => setVideoReady(true)}
                onLoadedMetadata={(e) => {
                  const dur = e.currentTarget.duration;
                  if (Number.isFinite(dur) && dur > 0) {
                    setDuration(dur);
                  }
                }}
                onTimeUpdate={(e) => {
                  setCurrentTime(e.currentTarget.currentTime);
                }}
                onEnded={handleTransitionToApp}
                onError={() => setVideoFailed(true)}
                className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-500 ${
                  videoReady ? 'opacity-100' : 'opacity-0'
                }`}
              />
            )}

            {/* Layer 2: Measured warm espresso-crimson gradient scrim for >= 7:1 text legibility */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#2C2021]/92 via-[#2C2021]/34 to-[#2C2021]/58"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_65%_55%_at_22%_78%,rgba(190,0,34,0.28),transparent_70%)]"
            />

            {/* Layer 3: Non-blocking Top Cinema Header & Playback Controls */}
            <div className="relative z-10 mx-auto flex w-full max-w-[1380px] flex-wrap items-center justify-between gap-3 px-4 pt-5 sm:px-6 sm:pt-7 lg:px-8">
              <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.16em] text-[#FFEDE9] uppercase">
                <MapPin className="h-3.5 w-3.5 text-[#FFEDE9]" aria-hidden="true" />
                <span>Тараз, Қазақстан · Премьера 2026</span>
              </p>

              <div className="flex flex-wrap items-center gap-2.5">
                {strategy.isLightweightMode && !strategy.shouldMountVideo && (
                  <button
                    type="button"
                    onClick={() => {
                      setManualVideoRequested(true);
                      setDeferVideoMountReady(true);
                    }}
                    className="inline-flex min-h-[44px] items-center gap-2 whitespace-nowrap rounded-xl border border-[#FFF8F8]/35 bg-[#BE0022] px-4 py-2 text-xs font-semibold text-[#FEFEFF] transition-colors hover:bg-[#9E001C] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFF8F8]"
                  >
                    <Play className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Смотреть видео</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleToggleAudio}
                  aria-pressed={!isMuted}
                  className="inline-flex min-h-[44px] items-center gap-2 whitespace-nowrap rounded-xl border border-[#FFF8F8]/30 bg-[#2C2021]/55 px-4 py-2 text-xs font-semibold text-[#FFF8F8] backdrop-blur-md transition-colors hover:bg-[#2C2021]/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFF8F8]"
                >
                  {isMuted ? (
                    <>
                      <VolumeX className="h-4 w-4 text-[#FFEDE9]" aria-hidden="true" />
                      <span>Включить звук</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="h-4 w-4 text-[#FFEDE9]" aria-hidden="true" />
                      <span>Выключить звук</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleTransitionToApp}
                  className="inline-flex min-h-[44px] items-center gap-2 whitespace-nowrap rounded-xl border border-[#FFF8F8]/45 bg-[#FFF8F8]/95 px-4 py-2 text-xs font-semibold text-[#2C2021] transition-colors hover:bg-[#FFEDE9] hover:text-[#BE0022] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFF8F8]"
                >
                  <span>Пропустить</span>
                  <SkipForward className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Layer 4: Monumental Expressive Typography & Smooth Brand Reveal */}
            <div className="relative z-10 mx-auto w-full max-w-[1380px] px-4 pb-8 pt-12 sm:px-6 sm:pb-12 lg:px-8 lg:pb-14">
              <div className="grid grid-cols-1 items-end gap-8 lg:grid-cols-12">
                <div className="lg:col-span-9">
                  <motion.div
                    initial={prefersReduced ? false : { opacity: 0, y: 24, letterSpacing: '0.04em' }}
                    animate={{ opacity: 1, y: 0, letterSpacing: '-0.03em' }}
                    transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
                    className="font-display text-[clamp(2.9rem,8.4vw,6.8rem)] font-bold leading-[0.9] text-[#FFF8F8]"
                  >
                    TARAZ{' '}
                    <span className="text-[#FFEDE9] italic">EVENTS</span>
                  </motion.div>

                  <motion.div
                    initial={prefersReduced ? false : { scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 1 }}
                    transition={{ duration: 0.75, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="mt-4 h-1 w-24 origin-left rounded-full bg-[#BE0022]"
                    aria-hidden="true"
                  />

                  <motion.h1
                    initial={prefersReduced ? false : { opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="font-display mt-5 max-w-3xl text-balance text-[clamp(1.75rem,3.4vw,2.9rem)] font-bold leading-[1.1] text-[#FFF8F8]"
                  >
                    Тараз живёт.{' '}
                    <span className="text-[#FFEDE9]">Будь в центре событий</span>
                  </motion.h1>

                  <motion.p
                    initial={prefersReduced ? false : { opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.38, ease: [0.16, 1, 0.3, 1] }}
                    className="mt-3 max-w-xl text-sm leading-relaxed text-[#FFF8F8]/88 sm:text-base"
                  >
                    Концерты, театр, городские фестивали и закатные вечера у древних стен — единая афиша города на экране вашего смартфона.
                  </motion.p>

                  <motion.div
                    initial={prefersReduced ? false : { opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.65, delay: 0.48, ease: [0.16, 1, 0.3, 1] }}
                    className="mt-7 flex flex-wrap items-center gap-3.5"
                  >
                    <button
                      type="button"
                      onClick={handleTransitionToApp}
                      className="inline-flex min-h-[48px] items-center gap-2.5 whitespace-nowrap rounded-2xl bg-[#BE0022] px-6 py-3.5 text-sm font-semibold text-[#FEFEFF] shadow-[0_14px_30px_-8px_rgba(190,0,34,0.6)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#9E001C] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFF8F8] sm:text-base"
                    >
                      <Smartphone className="h-4 w-4" aria-hidden="true" />
                      <span>Перейти к интерфейсу</span>
                    </button>

                    <button
                      type="button"
                      onClick={onExploreClick}
                      className="inline-flex min-h-[48px] items-center gap-2 whitespace-nowrap rounded-2xl border border-[#FFF8F8]/35 bg-[#FEFEFF] px-6 py-3.5 text-sm font-semibold text-[#2C2021] transition-colors duration-200 hover:bg-[#FFEDE9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFF8F8] sm:text-base"
                    >
                      <span>Исследовать события</span>
                      <ArrowRight className="h-4 w-4 text-[#BE0022]" aria-hidden="true" />
                    </button>
                  </motion.div>
                </div>

                {/* Right Video Timecode & Seamless Light-Transition Cue */}
                <div className="flex flex-col items-start gap-2 text-left lg:col-span-3 lg:items-end lg:text-right">
                  {shouldMountVideoElement ? (
                    <div className="font-mono text-xs tabular-nums text-[#FFEDE9]/90">
                      <span>{formatPresentationTime(currentTime)}</span>
                      <span className="mx-1.5 text-[#FFF8F8]/50">/</span>
                      <span className="text-[#FFF8F8]/65">
                        {formatPresentationTime(duration)}
                      </span>
                    </div>
                  ) : (
                    <p className="font-mono text-xs text-[#FFEDE9]/85">
                      Облегчённый режим · Статичный постер
                    </p>
                  )}
                  <p className="text-xs text-[#FFF8F8]/75">
                    Листайте вниз свободно или откройте светлый интерфейс
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Crimson Progress Track linking video duration to the #FFF8F8 transition */}
            <div
              aria-hidden="true"
              className="relative z-10 h-1 w-full bg-[#FFF8F8]/20"
            >
              <div
                className="h-full origin-left bg-[#BE0022] transition-transform duration-200 ease-out"
                style={{ transform: `scaleX(${progressRatio})` }}
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="light-app-interface-stage"
            initial={prefersReduced ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReduced ? { opacity: 0 } : { opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="bg-[#FFF8F8] pb-14 pt-5 sm:pb-20 sm:pt-8"
          >
            <div className="mx-auto max-w-[1380px] px-4 sm:px-6 lg:px-8">
              {/* Top Kinetic Oversized Typographic Ribbon + Replay Video Control */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-2">
                <p className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.16em] text-[#BE0022] uppercase">
                  <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Тараз, Қазақстан · Городская афиша</span>
                </p>

                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={handleReplayPresentation}
                    className="inline-flex min-h-[40px] items-center gap-1.5 whitespace-nowrap rounded-xl border border-[#2C2021]/14 bg-[#FBF1F3] px-3.5 py-1.5 text-xs font-semibold text-[#2C2021] transition-colors hover:border-[#BE0022]/30 hover:bg-[#FFEDE9] hover:text-[#BE0022] focus-visible:outline-2 focus-visible:outline-[#BE0022]"
                  >
                    <Play className="h-3.5 w-3.5 text-[#BE0022]" aria-hidden="true" />
                    <span>Смотреть видеопрезентацию</span>
                  </button>
                  <span
                    ref={subWordRef}
                    className="hidden font-mono text-xs font-medium tracking-[0.2em] text-[#6E595B] uppercase sm:inline"
                  >
                    TARAZ EVENTS · 2026
                  </span>
                </div>
              </div>

              {/* Colossal Edge-to-Edge Kinetic Wordmark with Cityscape Inside Letters */}
              <div
                ref={wordmarkRef}
                className="relative z-10 select-none overflow-hidden py-1"
              >
                <div
                  style={{
                    backgroundImage: `linear-gradient(125deg, rgba(44,32,33,0.42), rgba(190,0,34,0.38)), url(${HERO_CITY_IMAGE})`,
                    backgroundSize: 'cover',
                    backgroundPosition: '50% 42%',
                  }}
                  className="taraz-text-city-mask font-display text-[clamp(4.4rem,16.5vw,13.5rem)] font-bold leading-[0.84] tracking-[-0.04em]"
                >
                  TARAZ
                </div>
              </div>

              {/* Full-Bleed Architectural City Canvas + Overlapping Editorial Typography & Protruding Smartphone */}
              <div className="relative -mt-4 sm:-mt-8 lg:-mt-12">
                <div
                  ref={backdropCardRef}
                  className="relative min-h-[520px] overflow-hidden rounded-[2rem] border border-[#2C2021]/10 bg-[#FBF1F3] taraz-card-shadow sm:min-h-[580px] lg:min-h-[600px] lg:rounded-[2.75rem]"
                >
                  {!heroImgFailed ? (
                    <img
                      src={HERO_CITY_IMAGE}
                      alt="Панорама современного Тараза на закате на фоне гор Таласского Алатау"
                      referrerPolicy="no-referrer"
                      onError={() => setHeroImgFailed(true)}
                      className="absolute inset-0 h-full w-full object-cover object-center"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-[#FFEDE9] via-[#FBF1F3] to-[#FFF8F8]" />
                  )}

                  {/* Measured Editorial Light-Rose Scrim */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#FFF8F8]/95 via-[#FFF8F8]/72 to-[#FFF8F8]/15 lg:via-[#FFF8F8]/55" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#FFF8F8]/92 via-transparent to-[#FFF8F8]/25" />

                  <div className="relative z-10 grid h-full min-h-[520px] grid-cols-1 items-end gap-8 p-6 sm:min-h-[580px] sm:p-10 lg:min-h-[600px] lg:grid-cols-12 lg:items-center lg:p-14">
                    {/* Bottom-Left Asymmetric Editorial Headline Lockup */}
                    <div className="lg:col-span-7 lg:self-end lg:pb-4">
                      <h1 className="hero-editorial-reveal font-display text-balance text-[clamp(2.3rem,4.6vw,4.1rem)] font-bold leading-[1.04] tracking-tight text-[#2C2021]">
                        Тараз живёт.{' '}
                        <span className="block text-[#BE0022] italic">
                          Будь в центре событий
                        </span>
                      </h1>

                      <p className="hero-editorial-reveal mt-4 max-w-lg text-base leading-relaxed text-[#2C2021]/85 sm:text-lg">
                        От оркестра в «Баласағұне» и премьер театра Токпанова до
                        закатных фестивалей у древних стен — единая афиша живого
                        города.
                      </p>

                      <div className="hero-editorial-reveal mt-7 flex flex-wrap items-center gap-3.5">
                        <button
                          type="button"
                          onClick={onExploreClick}
                          className="inline-flex items-center gap-2.5 whitespace-nowrap rounded-2xl bg-[#BE0022] px-7 py-4 text-sm font-semibold text-[#FEFEFF] shadow-[0_14px_30px_-8px_rgba(190,0,34,0.48)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#9E001C] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#BE0022] sm:text-base"
                        >
                          <span>Исследовать события</span>
                          <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onOpenAppStage()}
                          className="inline-flex items-center gap-2 whitespace-nowrap rounded-2xl border border-[#2C2021]/15 bg-[#FEFEFF]/92 px-6 py-4 text-sm font-semibold text-[#2C2021] backdrop-blur-xs transition-colors duration-200 hover:bg-[#FFEDE9] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#BE0022] sm:text-base"
                        >
                          <Smartphone
                            className="h-4 w-4 text-[#BE0022]"
                            aria-hidden="true"
                          />
                          <span>Сценарий приложения</span>
                        </button>
                      </div>
                    </div>

                    {/* Right Overlapping Smartphone rising out of the Cityscape */}
                    <div
                      ref={phoneWrapRef}
                      className="flex flex-col items-center lg:col-span-5 lg:items-end"
                    >
                      <div className="w-full max-w-[285px] sm:max-w-[305px]">
                        <div
                          ref={phoneRef}
                          className="rounded-[2.5rem] border-[6px] border-[#2C2021] bg-[#2C2021] px-1.5 pb-1.5 pt-2.5 taraz-phone-shadow transition-transform duration-300 ease-out will-change-transform"
                        >
                          <div
                            aria-hidden="true"
                            className="mx-auto mb-2 flex w-16 items-center justify-center gap-1.5"
                          >
                            <span className="h-1 w-8 rounded-full bg-[#FEFEFF]/20" />
                            <span className="h-1.5 w-1.5 rounded-full bg-[#FEFEFF]/25" />
                          </div>

                          <div className="relative overflow-hidden rounded-[1.95rem] bg-[#FFF8F8]">
                            {phoneScreenMode === 'launch' ? (
                              <div className="relative aspect-[9/16] w-full bg-[#FFF8F8]">
                                <img
                                  src={REFERENCE_APP_IMAGE}
                                  alt="Первый экран запуска мобильного приложения TARAZ EVENTS"
                                  referrerPolicy="no-referrer"
                                  className="h-full w-full object-cover object-top"
                                />
                                <button
                                  type="button"
                                  onClick={() => setPhoneScreenMode('live')}
                                  aria-label="Переключить экран смартфона на живую ленту"
                                  className="absolute inset-x-4 bottom-[10%] h-12 rounded-2xl border border-[#FEFEFF]/30 bg-transparent transition-colors hover:bg-[#FEFEFF]/12"
                                />
                              </div>
                            ) : (
                              <div className="flex aspect-[9/16] flex-col justify-between bg-[#FFF8F8] p-4 pt-5 text-left">
                                <div>
                                  <div className="flex items-center justify-between">
                                    <span className="inline-flex items-center gap-1 rounded-full bg-[#FEFEFF] px-2.5 py-1 text-[11px] font-semibold text-[#2C2021] shadow-xs">
                                      <MapPin className="h-3 w-3 text-[#BE0022]" />
                                      Тараз, Қазақстан
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => setPhoneScreenMode('launch')}
                                      className="rounded-full bg-[#FFEDE9] px-2.5 py-1 text-[11px] font-semibold text-[#BE0022] hover:bg-[#BE0022] hover:text-[#FEFEFF]"
                                    >
                                      Назад
                                    </button>
                                  </div>

                                  <h2 className="font-display mt-3.5 text-lg font-bold text-[#2C2021]">
                                    Афиша <span className="text-[#BE0022]">недели</span>
                                  </h2>

                                  <div className="mt-3 space-y-2">
                                    {TARAZ_EVENTS.slice(0, 3).map((ev) => (
                                      <button
                                        key={ev.id}
                                        type="button"
                                        onClick={() => onOpenAppStage(ev.id)}
                                        className="flex w-full items-center gap-2.5 rounded-2xl bg-[#FEFEFF] p-2 text-left shadow-xs transition-transform hover:-translate-y-0.5"
                                      >
                                        <img
                                          src={ev.image}
                                          alt={ev.imageAlt}
                                          referrerPolicy="no-referrer"
                                          className="h-11 w-11 shrink-0 rounded-xl object-cover"
                                        />
                                        <div className="min-w-0 flex-1">
                                          <p className="truncate text-xs font-bold text-[#2C2021]">
                                            {ev.title}
                                          </p>
                                          <p className="mt-0.5 truncate text-[10px] text-[#6E595B]">
                                            {ev.dateLabel} · {ev.venue}
                                          </p>
                                        </div>
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => onOpenAppStage()}
                                  className="w-full rounded-2xl bg-[#BE0022] py-2.5 text-center text-xs font-semibold text-[#FEFEFF] transition-colors hover:bg-[#9E001C]"
                                >
                                  Открыть в приложении
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => setPhoneScreenMode('launch')}
                            className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                              phoneScreenMode === 'launch'
                                ? 'bg-[#BE0022] text-[#FEFEFF]'
                                : 'bg-[#FEFEFF]/90 text-[#2C2021] hover:bg-[#FFEDE9]'
                            }`}
                          >
                            Первый запуск
                          </button>
                          <button
                            type="button"
                            onClick={() => setPhoneScreenMode('live')}
                            className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                              phoneScreenMode === 'live'
                                ? 'bg-[#BE0022] text-[#FEFEFF]'
                                : 'bg-[#FEFEFF]/90 text-[#2C2021] hover:bg-[#FFEDE9]'
                            }`}
                          >
                            Лента событий
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
      )}
    </section>
  );
}
