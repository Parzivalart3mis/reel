'use client';

/** Lightweight window-event bus to open chrome-level modals from anywhere. */
export const REEL_EVENTS = {
  addTitle: 'reel:add-title',
  commandPalette: 'reel:command-palette',
  watchTonight: 'reel:watch-tonight',
} as const;

export function openAddTitle() {
  window.dispatchEvent(new CustomEvent(REEL_EVENTS.addTitle));
}

export function openCommandPalette() {
  window.dispatchEvent(new CustomEvent(REEL_EVENTS.commandPalette));
}

export function openWatchTonight() {
  window.dispatchEvent(new CustomEvent(REEL_EVENTS.watchTonight));
}
