const TEST_IMAGES = ["assets/1.jpg", "assets/2.jpg", "assets/x.jpg"];

export class App {
  constructor({ canvas }) {
    const regex = new RegExp(`.+?\/\/${location.hostname}.+?\/`);
    const base = location.href.replace(regex, "/");
    const urls = TEST_IMAGES.map(relative => base + relative);
    this.slideshow = new Slideshow({ urls, canvas });
  }

  async start() {
    await this.slideshow.load();
    requestAnimationFrame(this.draw);
  }

  draw = () => {
    this.slideshow.draw();
    requestAnimationFrame(this.draw);
  };
}

export class Slideshow {
  constructor({ canvas, urls = [] }) {
    this.sources = urls.map(src => new ImageLoader({ src }));
    this.assets = [];
    this.canvas = canvas;
    this.context = canvas.getContext("2d");
  }

  async load() {
    await Promise.all(this.sources.map(source => source.load()));
    this.assets = this.sources.filter(source => source.loaded);
    return this.assets;
  }

  draw() {
    const [asset] = this.assets;
    const rect = this.canvas.getBoundingClientRect();
    const { naturalWidth, naturalHeight } = asset.image;
    const cover = resize(
      { w: naturalWidth, h: naturalHeight },
      { w: rect.width, h: rect.height }
    );
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
    this.context.drawImage(asset.image, cover.x, cover.y, cover.w, cover.h);
  }
}

export class ImageLoader {
  constructor({ src } = {}) {
    this.src = src;
    this.loaded = false;
  }
  load = () =>
    new Promise(good => {
      const regardless = () => good(this);
      this.image = new Image();
      this.image.onload = () => {
        this.loaded = true;
        regardless();
      };
      this.image.onerror = regardless;
      this.image.src = this.src;
    });
}

export class Queue {
  constructor() {
    this._q = [];
  }
  push = item => this._q.push(item);
  pop = () => this._q.splice(0, 1)[0];
  get = () => this._q.slice(0);
}

const resize = (fit, within) => {
  const ratio = { w: within.w / fit.w, h: within.h / fit.h };
  const abs = { w: Math.abs(1 - ratio.w), h: Math.abs(1 - ratio.h) };
  const key = abs.w < abs.h ? "w" : "h";
  const [w, h] = [fit.w * ratio[key], fit.h * ratio[key]];
  const [x, y] = [within.w / 2 - w / 2, within.h / 2 - h / 2];
  return { w, h, x, y };
};
