import type { Theme } from "@/scripts/theme";
import { createNoiseTexture } from "./noise-texture";
import { FULLSCREEN_VERT, INK_DEFAULTS, INK_FRAG, RIM_COLORS } from "./shaders";

export interface InkFrame {
  readonly centerX: number;
  readonly centerY: number;
  readonly cleanup: number;
  readonly from: Theme;
  readonly radius: number;
  readonly seedAngle: number;
  readonly seedX: number;
  readonly seedY: number;
  readonly time: number;
  readonly to: Theme;
}

interface SnapshotTexture {
  height: number;
  key: string;
  scrollY: number;
  tex: WebGLTexture;
  theme: Theme;
  width: number;
}

const UNIFORM_NAMES = [
  "uFrom",
  "uNoise",
  "uFromSize",
  "uCanvasScale",
  "uRes",
  "uCenter",
  "uRadius",
  "uCleanup",
  "uTime",
  "uRef",
  "uSeed",
  "uSeedRot",
  "uTendril",
  "uNoiseScale",
  "uSoftness",
  "uDrift",
  "uRimColor",
] as const;

type UniformName = (typeof UNIFORM_NAMES)[number];

function compileShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string,
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) {
    return null;
  }
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function linkProgram(gl: WebGL2RenderingContext): WebGLProgram | null {
  const vert = compileShader(gl, gl.VERTEX_SHADER, FULLSCREEN_VERT);
  const frag = compileShader(gl, gl.FRAGMENT_SHADER, INK_FRAG);
  if (!vert || !frag) {
    if (vert) gl.deleteShader(vert);
    if (frag) gl.deleteShader(frag);
    return null;
  }
  const program = gl.createProgram();
  if (!program) {
    gl.deleteShader(vert);
    gl.deleteShader(frag);
    return null;
  }
  gl.attachShader(program, vert);
  gl.attachShader(program, frag);
  gl.linkProgram(program);
  gl.deleteShader(vert);
  gl.deleteShader(frag);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

interface GLState {
  noiseTex: WebGLTexture;
  program: WebGLProgram;
  uniforms: Map<UniformName, WebGLUniformLocation | null>;
  vao: WebGLVertexArrayObject;
}

export class InkRenderer {
  public readonly canvas: HTMLCanvasElement;
  public readonly maxTextureSize: number;

  private readonly gl: WebGL2RenderingContext;
  private scale = 1;
  private readonly snapshots = new Map<Theme, SnapshotTexture>();
  private state: GLState | null = null;

  private constructor(canvas: HTMLCanvasElement, gl: WebGL2RenderingContext, state: GLState) {
    this.canvas = canvas;
    this.gl = gl;
    this.state = state;
    this.maxTextureSize = Number(gl.getParameter(gl.MAX_TEXTURE_SIZE)) || 4096;
  }

  public static create(canvas: HTMLCanvasElement): InkRenderer | null {
    const gl = canvas.getContext("webgl2", {
      alpha: true,
      antialias: false,
      depth: false,
      powerPreference: "high-performance",
      premultipliedAlpha: true,
      stencil: false,
    });
    if (!gl) {
      return null;
    }

    const state = InkRenderer.initState(gl);
    if (!state) {
      return null;
    }

    return new InkRenderer(canvas, gl, state);
  }

  private static initState(gl: WebGL2RenderingContext): GLState | null {
    if (gl.isContextLost()) {
      return null;
    }
    const program = linkProgram(gl);
    const noiseTex = createNoiseTexture(gl);
    const vao = gl.createVertexArray();
    if (!program || !noiseTex || !vao) {
      if (program) gl.deleteProgram(program);
      if (noiseTex) gl.deleteTexture(noiseTex);
      if (vao) gl.deleteVertexArray(vao);
      return null;
    }

    const uniforms = new Map<UniformName, WebGLUniformLocation | null>();
    for (const name of UNIFORM_NAMES) {
      uniforms.set(name, gl.getUniformLocation(program, name));
    }

    return { noiseTex, program, uniforms, vao };
  }

  public get isLost(): boolean {
    return this.gl.isContextLost() || this.state === null;
  }

  public clearSnapshots(): void {
    for (const snap of this.snapshots.values()) {
      this.gl.deleteTexture(snap.tex);
    }
    this.snapshots.clear();
  }

  public draw(frame: InkFrame): boolean {
    const { gl, state } = this;
    const snapshot = this.snapshots.get(frame.from);
    if (!state || !snapshot || gl.isContextLost()) {
      return false;
    }

    const { uniforms } = state;
    const width = this.canvas.width;
    const height = this.canvas.height;
    const cssW = width / this.scale;
    const cssH = height / this.scale;

    gl.viewport(0, 0, width, height);
    gl.useProgram(state.program);
    gl.bindVertexArray(state.vao);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, snapshot.tex);
    gl.uniform1i(uniforms.get("uFrom") ?? null, 0);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, state.noiseTex);
    gl.uniform1i(uniforms.get("uNoise") ?? null, 1);

    gl.uniform2f(uniforms.get("uFromSize") ?? null, snapshot.width, snapshot.height);
    gl.uniform1f(uniforms.get("uCanvasScale") ?? null, this.scale);
    gl.uniform2f(uniforms.get("uRes") ?? null, width, height);
    gl.uniform2f(uniforms.get("uCenter") ?? null, frame.centerX, frame.centerY);
    gl.uniform1f(uniforms.get("uRadius") ?? null, frame.radius);
    gl.uniform1f(uniforms.get("uCleanup") ?? null, frame.cleanup);
    gl.uniform1f(uniforms.get("uTime") ?? null, frame.time);
    gl.uniform1f(uniforms.get("uRef") ?? null, Math.max(cssW, cssH, 1));
    gl.uniform2f(uniforms.get("uSeed") ?? null, frame.seedX, frame.seedY);

    const cos = Math.cos(frame.seedAngle);
    const sin = Math.sin(frame.seedAngle);
    gl.uniformMatrix2fv(uniforms.get("uSeedRot") ?? null, false, [cos, sin, -sin, cos]);

    gl.uniform1f(uniforms.get("uTendril") ?? null, INK_DEFAULTS.tendril);
    gl.uniform1f(uniforms.get("uNoiseScale") ?? null, INK_DEFAULTS.noiseScale);
    gl.uniform1f(uniforms.get("uSoftness") ?? null, INK_DEFAULTS.softness);
    gl.uniform1f(uniforms.get("uDrift") ?? null, INK_DEFAULTS.drift);

    const rim = RIM_COLORS[frame.to];
    gl.uniform3f(uniforms.get("uRimColor") ?? null, rim[0], rim[1], rim[2]);

    gl.drawArrays(gl.TRIANGLES, 0, 3);
    return true;
  }

  public hasValid(theme: Theme, key: string, scrollY: number): boolean {
    const snapshot = this.snapshots.get(theme);
    if (!snapshot || this.isLost) {
      return false;
    }
    return snapshot.key === key && Math.abs(snapshot.scrollY - scrollY) <= 2;
  }

  public resize(scale: number): void {
    this.scale = scale;
    const w = Math.max(1, Math.round(document.documentElement.clientWidth * scale));
    const h = Math.max(1, Math.round(globalThis.innerHeight * scale));
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }
  }

  public upload(source: HTMLCanvasElement, theme: Theme, key: string, scrollY: number): boolean {
    const { gl } = this;
    if (gl.isContextLost() || !this.state) {
      return false;
    }

    const existing = this.snapshots.get(theme);
    if (existing) {
      gl.deleteTexture(existing.tex);
      this.snapshots.delete(theme);
    }

    // Invalidate opposite theme if layout or scroll changed so stale textures never persist.
    for (const [cachedTheme, cached] of this.snapshots) {
      if (cached.key !== key || Math.abs(cached.scrollY - scrollY) > 2) {
        gl.deleteTexture(cached.tex);
        this.snapshots.delete(cachedTheme);
      }
    }

    const tex = gl.createTexture();
    if (!tex) {
      return false;
    }

    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);

    this.snapshots.set(theme, {
      height: source.height,
      key,
      scrollY,
      tex,
      theme,
      width: source.width,
    });
    return true;
  }

  public watchContext(onLost: () => void, onRestored: () => void): void {
    this.canvas.addEventListener("webglcontextlost", (e: Event) => {
      e.preventDefault();
      this.snapshots.clear();
      this.state = null;
      onLost();
    });

    this.canvas.addEventListener("webglcontextrestored", () => {
      this.state = InkRenderer.initState(this.gl);
      if (this.state) {
        onRestored();
      }
    });
  }
}
