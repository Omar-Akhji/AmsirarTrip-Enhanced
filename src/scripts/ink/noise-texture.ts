/**
 * Tileable 4-channel Perlin gradient-noise texture so the WebGL2 ink shader pays one bilinear fetch
 * per octave instead of computing four hashes and dot products per fragment.
 */

export const NOISE_SIZE = 256;
export const NOISE_CELLS = 32;

function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return (): number => {
    state = (state + 0x6d_2b_79_f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), state | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
}

function fade(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function createNoiseChannel(rand: () => number): Float32Array {
  const count = NOISE_CELLS * NOISE_CELLS;
  const gx = new Float32Array(count);
  const gy = new Float32Array(count);

  for (let i = 0; i < count; i += 1) {
    const angle = rand() * Math.PI * 2;
    gx[i] = Math.cos(angle);
    gy[i] = Math.sin(angle);
  }

  const texelsPerCell = NOISE_SIZE / NOISE_CELLS;
  const out = new Float32Array(NOISE_SIZE * NOISE_SIZE);
  const cellIndex = (cx: number, cy: number): number =>
    ((cy + NOISE_CELLS) % NOISE_CELLS) * NOISE_CELLS + ((cx + NOISE_CELLS) % NOISE_CELLS);

  for (let y = 0; y < NOISE_SIZE; y += 1) {
    const py = (y + 0.5) / texelsPerCell;
    const cy = Math.floor(py);
    const fy = py - cy;
    const v = fade(fy);

    for (let x = 0; x < NOISE_SIZE; x += 1) {
      const px = (x + 0.5) / texelsPerCell;
      const cx = Math.floor(px);
      const fx = px - cx;
      const u = fade(fx);

      const i00 = cellIndex(cx, cy);
      const i10 = cellIndex(cx + 1, cy);
      const i01 = cellIndex(cx, cy + 1);
      const i11 = cellIndex(cx + 1, cy + 1);

      const n00 = (gx[i00] ?? 0) * fx + (gy[i00] ?? 0) * fy;
      const n10 = (gx[i10] ?? 0) * (fx - 1) + (gy[i10] ?? 0) * fy;
      const n01 = (gx[i01] ?? 0) * fx + (gy[i01] ?? 0) * (fy - 1);
      const n11 = (gx[i11] ?? 0) * (fx - 1) + (gy[i11] ?? 0) * (fy - 1);

      const nx0 = n00 + (n10 - n00) * u;
      const nx1 = n01 + (n11 - n01) * u;
      out[y * NOISE_SIZE + x] = Math.max(-1, Math.min(1, (nx0 + (nx1 - nx0) * v) * 1.45));
    }
  }

  return out;
}

export function createNoiseTexture(gl: WebGL2RenderingContext): WebGLTexture | null {
  const rand = mulberry32(0x1b_1e_ed);
  const c0 = createNoiseChannel(rand);
  const c1 = createNoiseChannel(rand);
  const c2 = createNoiseChannel(rand);
  const c3 = createNoiseChannel(rand);
  const channels = [c0, c1, c2, c3] as const;

  const pixels = new Uint8Array(NOISE_SIZE * NOISE_SIZE * 4);
  const texelCount = NOISE_SIZE * NOISE_SIZE;

  for (let i = 0; i < texelCount; i += 1) {
    const base = i * 4;
    for (let ch = 0; ch < 4; ch += 1) {
      const sample = channels[ch]?.[i] ?? 0;
      pixels[base + ch] = Math.round((sample * 0.5 + 0.5) * 255);
    }
  }

  const texture = gl.createTexture();

  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA8,
    NOISE_SIZE,
    NOISE_SIZE,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    pixels,
  );
  return texture;
}
