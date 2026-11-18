export interface HeroMediaEnvironment {
  viewportWidth: number;
  prefersReducedMotion: boolean;
  saveData: boolean;
  autostart: boolean;
  manualVideoRequested: boolean;
}

export interface HeroMediaStrategy {
  initialMode: 'video' | 'app';
  shouldMountVideo: boolean;
  videoSrc: string;
  posterSrc: string;
  isLightweightMode: boolean;
}

export const DESKTOP_INTRO_VIDEO = '/videos/intro.mp4';
export const MOBILE_INTRO_VIDEO = '/videos/intro-mobile.mp4';
export const INTRO_POSTER_IMAGE = '/videos/intro-poster.jpg';

export function resolveHeroMediaStrategy(
  env: HeroMediaEnvironment
): HeroMediaStrategy {
  const isMobile = env.viewportWidth < 768;
  const shouldSuppressAutoVideo =
    env.prefersReducedMotion || env.saveData || env.autostart;

  if (env.manualVideoRequested) {
    return {
      initialMode: 'video',
      shouldMountVideo: true,
      videoSrc: isMobile ? MOBILE_INTRO_VIDEO : DESKTOP_INTRO_VIDEO,
      posterSrc: INTRO_POSTER_IMAGE,
      isLightweightMode: isMobile,
    };
  }

  if (shouldSuppressAutoVideo) {
    return {
      initialMode: 'app',
      shouldMountVideo: false,
      videoSrc: isMobile ? MOBILE_INTRO_VIDEO : DESKTOP_INTRO_VIDEO,
      posterSrc: INTRO_POSTER_IMAGE,
      isLightweightMode: true,
    };
  }

  // On mobile viewports, keep the fullscreen cinematic hero on a static crisp poster
  // until the user explicitly chooses to play the lightweight clip (saving bandwidth & LCP).
  if (isMobile) {
    return {
      initialMode: 'video',
      shouldMountVideo: false,
      videoSrc: MOBILE_INTRO_VIDEO,
      posterSrc: INTRO_POSTER_IMAGE,
      isLightweightMode: true,
    };
  }

  return {
    initialMode: 'video',
    shouldMountVideo: true,
    videoSrc: DESKTOP_INTRO_VIDEO,
    posterSrc: INTRO_POSTER_IMAGE,
    isLightweightMode: false,
  };
}

export function formatPresentationTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return '00:00';
  }
  const whole = Math.floor(seconds);
  const mins = Math.floor(whole / 60);
  const secs = whole % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}
