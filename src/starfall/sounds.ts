// The four sounds from the GameMaker project (version 2.0 adds Game Over),
// played with <audio> so they
// work from file:// with no server. Files live in public/starfall/.

export type SoundName = "snd_popSound" | "snd_sadWhistleSound" | "snd_gameOverSound" | "snd_wizardSong";

export const soundFiles: Record<SoundName, string> = {
  snd_popSound: "./starfall/snd_popSound.wav",
  snd_sadWhistleSound: "./starfall/snd_sadWhistleSound.wav",
  snd_gameOverSound: "./starfall/snd_gameOverSound.wav",
  // Public version: an original placeholder loop replaces the workshop's music.
  snd_wizardSong: "./starfall/snd_music.wav",
};

export class SoundBank {
  music = true;
  effects = true;
  volume = 0.7;
  private song: HTMLAudioElement | null = null;
  private templates = new Map<SoundName, HTMLAudioElement>();

  private template(name: SoundName) {
    let a = this.templates.get(name);
    if (!a) {
      a = new Audio(soundFiles[name]);
      a.preload = "auto";
      this.templates.set(name, a);
    }
    return a;
  }

  /** Start downloading every sound before Start is pressed (GameMaker has them loaded already). */
  preload() {
    (Object.keys(soundFiles) as SoundName[]).forEach((n) => this.template(n));
  }

  /** audio_play_sound(snd, 1, false): a fresh copy so overlapping pops all play. */
  effect(name: Exclude<SoundName, "snd_wizardSong">) {
    if (!this.effects) return;
    const a = this.template(name).cloneNode(true) as HTMLAudioElement;
    a.volume = this.volume;
    a.play().catch(() => {});
  }

  /** obj_gameManager Create_0: if (!audio_is_playing(snd_wizardSong)) audio_play_sound(snd_wizardSong, 1, true). */
  startMusic() {
    if (!this.song) {
      this.song = this.template("snd_wizardSong");
      this.song.loop = true;
    }
    this.song.volume = this.volume;
    if (this.music) this.song.play().catch(() => {});
  }

  pauseMusic() {
    this.song?.pause();
  }

  /** audio_stop_sound(snd_wizardSong) at Game Over: the next start begins from the top. */
  stopMusic() {
    if (!this.song) return;
    this.song.pause();
    this.song.currentTime = 0;
  }

  setMusic(on: boolean) {
    this.music = on;
    if (!this.song) return;
    if (on) this.song.play().catch(() => {});
    else this.song.pause();
  }

  setVolume(v: number) {
    this.volume = v;
    if (this.song) this.song.volume = v;
  }

  stopAll() {
    if (this.song) {
      this.song.pause();
      this.song.currentTime = 0;
    }
  }
}

/** One-off preview of a project sound (used by the project anatomy). */
export function playPreview(name: SoundName): HTMLAudioElement {
  const a = new Audio(soundFiles[name]);
  a.volume = 0.7;
  a.play().catch(() => {});
  return a;
}
