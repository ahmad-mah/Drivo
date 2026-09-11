import { createAudioPlayer, preload } from "expo-audio";
import { Asset } from "expo-asset";
import type { AudioPlayer } from "expo-audio";

/**
 * Ride-hailing sound effects. Preloaded once at app startup, then played
 * imperatively at key ride-status transitions.
 *
 * Files are short (1–3 s) royalty-free chimes stored under assets/sounds/.
 */

const SOUNDS = {
  match: require("@/assets/sounds/match.mp3"),
  notification: require("@/assets/sounds/notification.mp3"),
  success: require("@/assets/sounds/success.mp3"),
  softAlert: require("@/assets/sounds/soft-alert.mp3"),
} as const;

type SoundKey = keyof typeof SOUNDS;

/** Preloaded players keyed by sound id. */
const players: Partial<Record<SoundKey, AudioPlayer>> = {};

/**
 * Must be called once before any play*() — e.g. inside useAppInit.
 * Each source is preloaded into memory so the first play() is near-instant.
 */
export async function preloadSounds(): Promise<void> {
  const keys = Object.keys(SOUNDS) as SoundKey[];
  await Promise.all(
    keys.map(async (key) => {
      try {
        const asset = (await Asset.loadAsync(SOUNDS[key]))[0];
        if (!asset.localUri) {
          console.warn(`[sounds] Failed to resolve "${key}" sound: localUri is null`);
          return;
        }
        const source = { uri: asset.localUri };
        await preload(source);
        players[key] = createAudioPlayer(source);
      } catch (error) {
        console.warn(`[sounds] Failed to preload "${key}" sound`, error);
      }
    }),
  );
}

async function play(key: SoundKey, volume = 1.0): Promise<void> {
  const player = players[key];
  if (!player) {
    console.warn(`[sounds] play("${key}") aborted: player is ${player}`);
    return;
  }
  try {
    player.volume = volume;
    await player.seekTo(0);
    player.play();
  } catch (error) {
    console.warn(`[sounds] Failed to play "${key}" sound`, error);
  }
}

/** Bright ascending chime — driver matched / new ride request. */
export function playMatch(): void {
  void play("match");
}

/** Soft ping — driver arrived / payment sheet opened. */
export function playNotification(): void {
  void play("notification");
}

/** Warm satisfying tone — payment confirmed. */
export function playSuccess(): void {
  void play("success");
}

/** Quiet, brief — ride cancelled/expired, mid-trip notification. */
export function playSoftAlert(): void {
  void play("softAlert", 0.4);
}
