class AudioManager {
  private sounds: { [key: string]: HTMLAudioElement } = {};
  private bgMusic: HTMLAudioElement | null = null;
  private isMuted: boolean = false;

  constructor() {
    // Using free assets from common sources or placeholders
    // In a real app, these would be actual URLs
    this.sounds = {
      ting: new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'),
      correct: new Audio('https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3'),
      wrong: new Audio('https://assets.mixkit.co/active_storage/sfx/251/251-preview.mp3'),
      tick: new Audio('https://assets.mixkit.co/active_storage/sfx/549/549-preview.mp3'),
      victory: new Audio('https://assets.mixkit.co/active_storage/sfx/1433/1433-preview.mp3'),
      applause: new Audio('https://assets.mixkit.co/active_storage/sfx/281/281-preview.mp3'),
    };

    this.bgMusic = new Audio('https://assets.mixkit.co/active_storage/sfx/123/123-preview.mp3'); // Placeholder for upbeat music
    if (this.bgMusic) {
      this.bgMusic.loop = true;
      this.bgMusic.volume = 0.3;
    }
  }

  play(name: string) {
    if (this.isMuted) return;
    const sound = this.sounds[name];
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch(e => console.log('Audio play blocked', e));
    }
  }

  startBgMusic() {
    if (this.isMuted || !this.bgMusic) return;
    this.bgMusic.play().catch(e => console.log('BG Music play blocked', e));
  }

  stopBgMusic() {
    if (this.bgMusic) {
      this.bgMusic.pause();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopBgMusic();
    } else {
      this.startBgMusic();
    }
    return this.isMuted;
  }
}

export const audioManager = new AudioManager();
