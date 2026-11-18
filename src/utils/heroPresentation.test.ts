import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DESKTOP_INTRO_VIDEO,
  formatPresentationTime,
  MOBILE_INTRO_VIDEO,
  resolveHeroMediaStrategy,
} from './heroPresentation';

test('desktop default mounts HD intro.mp4 in cinematic video mode', () => {
  const result = resolveHeroMediaStrategy({
    viewportWidth: 1440,
    prefersReducedMotion: false,
    saveData: false,
    autostart: false,
    manualVideoRequested: false,
  });

  assert.equal(result.initialMode, 'video');
  assert.equal(result.shouldMountVideo, true);
  assert.equal(result.videoSrc, DESKTOP_INTRO_VIDEO);
  assert.equal(result.isLightweightMode, false);
});

test('mobile keeps lightweight poster until user taps play, then uses mobile video', () => {
  const initialMobile = resolveHeroMediaStrategy({
    viewportWidth: 390,
    prefersReducedMotion: false,
    saveData: false,
    autostart: false,
    manualVideoRequested: false,
  });

  assert.equal(initialMobile.initialMode, 'video');
  assert.equal(initialMobile.shouldMountVideo, false);
  assert.equal(initialMobile.videoSrc, MOBILE_INTRO_VIDEO);
  assert.equal(initialMobile.isLightweightMode, true);

  const requestedMobile = resolveHeroMediaStrategy({
    viewportWidth: 390,
    prefersReducedMotion: false,
    saveData: false,
    autostart: false,
    manualVideoRequested: true,
  });

  assert.equal(requestedMobile.shouldMountVideo, true);
  assert.equal(requestedMobile.videoSrc, MOBILE_INTRO_VIDEO);
});

test('reduced motion, saveData, or autostart skip straight to light app interface without auto-loading video', () => {
  const reduced = resolveHeroMediaStrategy({
    viewportWidth: 1440,
    prefersReducedMotion: true,
    saveData: false,
    autostart: false,
    manualVideoRequested: false,
  });
  assert.equal(reduced.initialMode, 'app');
  assert.equal(reduced.shouldMountVideo, false);

  const saveData = resolveHeroMediaStrategy({
    viewportWidth: 1440,
    prefersReducedMotion: false,
    saveData: true,
    autostart: false,
    manualVideoRequested: false,
  });
  assert.equal(saveData.initialMode, 'app');
  assert.equal(saveData.shouldMountVideo, false);
});

test('formatPresentationTime formats seconds safely into mm:ss', () => {
  assert.equal(formatPresentationTime(0), '00:00');
  assert.equal(formatPresentationTime(9.8), '00:09');
  assert.equal(formatPresentationTime(29), '00:29');
  assert.equal(formatPresentationTime(-4), '00:00');
  assert.equal(formatPresentationTime(Number.NaN), '00:00');
});
