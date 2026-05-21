/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef } from "react";

// ─── Simulation config ────────────────────────────────────────────────────────
const SIM_RES        = 128;
const DYE_RES        = 1440;
const DENSITY_DISS   = 3.5;
const VELOCITY_DISS  = 2;
const PRESSURE_INIT  = 0.1;
const PRESSURE_ITERS = 20;
const CURL_STR       = 3;
const SPLAT_RAD      = 0.2;
const SPLAT_FORCE    = 6000;

// ─── Shader sources (verbatim from PavelDoGreat/WebGL-Fluid-Simulation) ───────

const BASE_VS = `
precision highp float;
attribute vec2 aPosition;
varying vec2 vUv;
varying vec2 vL; varying vec2 vR; varying vec2 vT; varying vec2 vB;
uniform vec2 texelSize;
void main () {
  vUv = aPosition * 0.5 + 0.5;
  vL = vUv - vec2(texelSize.x, 0.0);
  vR = vUv + vec2(texelSize.x, 0.0);
  vT = vUv + vec2(0.0, texelSize.y);
  vB = vUv - vec2(0.0, texelSize.y);
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

const COPY_FS = `
precision mediump float;
precision mediump sampler2D;
varying highp vec2 vUv;
uniform sampler2D uTexture;
void main () { gl_FragColor = texture2D(uTexture, vUv); }`;

const CLEAR_FS = `
precision mediump float;
precision mediump sampler2D;
varying highp vec2 vUv;
uniform sampler2D uTexture;
uniform float value;
void main () { gl_FragColor = value * texture2D(uTexture, vUv); }`;

const SPLAT_FS = `
precision highp float;
precision highp sampler2D;
varying vec2 vUv;
uniform sampler2D uTarget;
uniform float aspectRatio;
uniform vec3 color;
uniform vec2 point;
uniform float radius;
void main () {
  vec2 p = vUv - point.xy;
  p.x *= aspectRatio;
  vec3 splat = exp(-dot(p, p) / radius) * color;
  vec3 base = texture2D(uTarget, vUv).xyz;
  gl_FragColor = vec4(base + splat, 1.0);
}`;

const ADVECTION_FS = `
precision highp float;
precision highp sampler2D;
varying vec2 vUv;
uniform sampler2D uVelocity;
uniform sampler2D uSource;
uniform vec2 texelSize;
uniform vec2 dyeTexelSize;
uniform float dt;
uniform float dissipation;
vec4 bilerp (sampler2D sam, vec2 uv, vec2 tsize) {
  vec2 st = uv / tsize - 0.5;
  vec2 iuv = floor(st);
  vec2 fuv = fract(st);
  vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);
  vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);
  vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);
  vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);
  return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
}
void main () {
#ifdef MANUAL_FILTERING
  vec2 coord = vUv - dt * bilerp(uVelocity, vUv, texelSize).xy * texelSize;
  vec4 result = bilerp(uSource, coord, dyeTexelSize);
#else
  vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
  vec4 result = texture2D(uSource, coord);
#endif
  float decay = 1.0 + dissipation * dt;
  gl_FragColor = result / decay;
}`;

const DIVERGENCE_FS = `
precision mediump float;
precision mediump sampler2D;
varying highp vec2 vUv;
varying highp vec2 vL; varying highp vec2 vR;
varying highp vec2 vT; varying highp vec2 vB;
uniform sampler2D uVelocity;
void main () {
  float L = texture2D(uVelocity, vL).x;
  float R = texture2D(uVelocity, vR).x;
  float T = texture2D(uVelocity, vT).y;
  float B = texture2D(uVelocity, vB).y;
  vec2 C = texture2D(uVelocity, vUv).xy;
  if (vL.x < 0.0) { L = -C.x; }
  if (vR.x > 1.0) { R = -C.x; }
  if (vT.y > 1.0) { T = -C.y; }
  if (vB.y < 0.0) { B = -C.y; }
  float div = 0.5 * (R - L + T - B);
  gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
}`;

const CURL_FS = `
precision mediump float;
precision mediump sampler2D;
varying highp vec2 vUv;
varying highp vec2 vL; varying highp vec2 vR;
varying highp vec2 vT; varying highp vec2 vB;
uniform sampler2D uVelocity;
void main () {
  float L = texture2D(uVelocity, vL).y;
  float R = texture2D(uVelocity, vR).y;
  float T = texture2D(uVelocity, vT).x;
  float B = texture2D(uVelocity, vB).x;
  float vorticity = R - L - T + B;
  gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
}`;

const VORTICITY_FS = `
precision highp float;
precision highp sampler2D;
varying vec2 vUv;
varying vec2 vL; varying vec2 vR; varying vec2 vT; varying vec2 vB;
uniform sampler2D uVelocity;
uniform sampler2D uCurl;
uniform float curl;
uniform float dt;
void main () {
  float L = texture2D(uCurl, vL).x;
  float R = texture2D(uCurl, vR).x;
  float T = texture2D(uCurl, vT).x;
  float B = texture2D(uCurl, vB).x;
  float C = texture2D(uCurl, vUv).x;
  vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
  force /= length(force) + 0.0001;
  force *= curl * C;
  force.y *= -1.0;
  vec2 velocity = texture2D(uVelocity, vUv).xy;
  velocity += force * dt;
  velocity = min(max(velocity, -1000.0), 1000.0);
  gl_FragColor = vec4(velocity, 0.0, 1.0);
}`;

const PRESSURE_FS = `
precision mediump float;
precision mediump sampler2D;
varying highp vec2 vUv;
varying highp vec2 vL; varying highp vec2 vR;
varying highp vec2 vT; varying highp vec2 vB;
uniform sampler2D uPressure;
uniform sampler2D uDivergence;
void main () {
  float L = texture2D(uPressure, vL).x;
  float R = texture2D(uPressure, vR).x;
  float T = texture2D(uPressure, vT).x;
  float B = texture2D(uPressure, vB).x;
  float divergence = texture2D(uDivergence, vUv).x;
  float pressure = (L + R + B + T - divergence) * 0.25;
  gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
}`;

const GRADIENT_SUBTRACT_FS = `
precision mediump float;
precision mediump sampler2D;
varying highp vec2 vUv;
varying highp vec2 vL; varying highp vec2 vR;
varying highp vec2 vT; varying highp vec2 vB;
uniform sampler2D uPressure;
uniform sampler2D uVelocity;
void main () {
  float L = texture2D(uPressure, vL).x;
  float R = texture2D(uPressure, vR).x;
  float T = texture2D(uPressure, vT).x;
  float B = texture2D(uPressure, vB).x;
  vec2 velocity = texture2D(uVelocity, vUv).xy;
  velocity.xy -= vec2(R - L, T - B);
  gl_FragColor = vec4(velocity, 0.0, 1.0);
}`;

// Display shader — shading: true, transparent: true (alpha = max color channel)
const DISPLAY_FS = `
precision highp float;
precision highp sampler2D;
varying vec2 vUv;
varying vec2 vL; varying vec2 vR; varying vec2 vT; varying vec2 vB;
uniform sampler2D uTexture;
uniform vec2 texelSize;
void main () {
  vec3 c = texture2D(uTexture, vUv).rgb;
#ifdef SHADING
  vec3 lc = texture2D(uTexture, vL).rgb;
  vec3 rc = texture2D(uTexture, vR).rgb;
  vec3 tc = texture2D(uTexture, vT).rgb;
  vec3 bc = texture2D(uTexture, vB).rgb;
  float dx = length(rc) - length(lc);
  float dy = length(tc) - length(bc);
  vec3 n = normalize(vec3(dx, dy, length(texelSize)));
  vec3 l = vec3(0.0, 0.0, 1.0);
  float diffuse = clamp(dot(n, l) + 0.7, 0.7, 1.0);
  c *= diffuse;
#endif
  float a = max(c.r, max(c.g, c.b));
  gl_FragColor = vec4(c, a);
}`;

// ─── Component ────────────────────────────────────────────────────────────────

export default function FluidSimulation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    if (!canvas) return;

    // Resize canvas to full viewport at device pixel ratio
    const setSize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width  = Math.floor(window.innerWidth  * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
    };
    setSize();

    // ── WebGL context ──────────────────────────────────────────────────────
    const params = { alpha: true, depth: false, stencil: false, antialias: false, preserveDrawingBuffer: false };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const GL = (canvas.getContext("webgl2", params) ??
                canvas.getContext("webgl",  params) ??
                canvas.getContext("experimental-webgl", params)) as any;
    if (!GL) return;

    const isWebGL2 = typeof WebGL2RenderingContext !== "undefined" && GL instanceof WebGL2RenderingContext;

    // ── Extensions & format detection ─────────────────────────────────────
    let halfFloatTexType: number;
    let supportLinearFiltering: boolean;

    if (isWebGL2) {
      GL.getExtension("EXT_color_buffer_float");
      supportLinearFiltering = !!GL.getExtension("OES_texture_float_linear");
      halfFloatTexType = GL.HALF_FLOAT;
    } else {
      const hf = GL.getExtension("OES_texture_half_float");
      if (!hf) return;
      supportLinearFiltering = !!GL.getExtension("OES_texture_half_float_linear");
      halfFloatTexType = hf.HALF_FLOAT_OES;
    }

    GL.clearColor(0, 0, 0, 0);

    function supportRTF(internalFormat: number, format: number, type: number): boolean {
      const tex = GL.createTexture();
      GL.bindTexture(GL.TEXTURE_2D, tex);
      GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.NEAREST);
      GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.NEAREST);
      GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
      GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
      GL.texImage2D(GL.TEXTURE_2D, 0, internalFormat, 4, 4, 0, format, type, null);
      const fbo = GL.createFramebuffer();
      GL.bindFramebuffer(GL.FRAMEBUFFER, fbo);
      GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT0, GL.TEXTURE_2D, tex, 0);
      return GL.checkFramebufferStatus(GL.FRAMEBUFFER) === GL.FRAMEBUFFER_COMPLETE;
    }

    function getSupportedFmt(internalFormat: number, format: number, type: number): { internalFormat: number; format: number } | null {
      if (!supportRTF(internalFormat, format, type)) {
        if (internalFormat === GL.R16F)  return getSupportedFmt(GL.RG16F,   GL.RG,   type);
        if (internalFormat === GL.RG16F) return getSupportedFmt(GL.RGBA16F, GL.RGBA, type);
        return null;
      }
      return { internalFormat, format };
    }

    let fmtRGBA, fmtRG, fmtR;
    if (isWebGL2) {
      fmtRGBA = getSupportedFmt(GL.RGBA16F, GL.RGBA, halfFloatTexType);
      fmtRG   = getSupportedFmt(GL.RG16F,   GL.RG,   halfFloatTexType);
      fmtR    = getSupportedFmt(GL.R16F,    GL.RED,  halfFloatTexType);
    } else {
      fmtRGBA = getSupportedFmt(GL.RGBA, GL.RGBA, halfFloatTexType);
      fmtRG   = getSupportedFmt(GL.RGBA, GL.RGBA, halfFloatTexType);
      fmtR    = getSupportedFmt(GL.RGBA, GL.RGBA, halfFloatTexType);
    }
    if (!fmtRGBA) return;

    const velFmt  = fmtRG  ?? fmtRGBA;
    const scFmt   = fmtR   ?? fmtRGBA; // single-channel (divergence, curl, pressure)

    // ── Full-screen quad blit ──────────────────────────────────────────────
    GL.bindBuffer(GL.ARRAY_BUFFER, GL.createBuffer());
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), GL.STATIC_DRAW);
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, GL.createBuffer());
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), GL.STATIC_DRAW);
    GL.vertexAttribPointer(0, 2, GL.FLOAT, false, 0, 0);
    GL.enableVertexAttribArray(0);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const blit = (target: any, clear = false) => {
      if (target == null) {
        GL.viewport(0, 0, GL.drawingBufferWidth, GL.drawingBufferHeight);
        GL.bindFramebuffer(GL.FRAMEBUFFER, null);
      } else {
        GL.viewport(0, 0, target.width, target.height);
        GL.bindFramebuffer(GL.FRAMEBUFFER, target.fbo);
      }
      if (clear) {
        GL.clearColor(0, 0, 0, 0);
        GL.clear(GL.COLOR_BUFFER_BIT);
      }
      GL.drawElements(GL.TRIANGLES, 6, GL.UNSIGNED_SHORT, 0);
    };

    // ── Shader & program helpers ───────────────────────────────────────────

    function addKeywords(source: string, keywords: string[]): string {
      return keywords.map(k => `#define ${k}`).join("\n") + "\n" + source;
    }

    function compileShader(type: number, source: string, keywords?: string[]) {
      const src = keywords?.length ? addKeywords(source, keywords) : source;
      const s = GL.createShader(type);
      GL.shaderSource(s, src);
      GL.compileShader(s);
      if (!GL.getShaderParameter(s, GL.COMPILE_STATUS))
        console.error("Shader compile error:", GL.getShaderInfoLog(s));
      return s;
    }

    function createGLProgram(vs: unknown, fs: unknown) {
      const p = GL.createProgram();
      GL.attachShader(p, vs);
      GL.attachShader(p, fs);
      GL.linkProgram(p);
      if (!GL.getProgramParameter(p, GL.LINK_STATUS))
        console.error("Program link error:", GL.getProgramInfoLog(p));
      return p;
    }

    function getUniforms(program: unknown): Record<string, unknown> {
      const u: Record<string, unknown> = {};
      const n = GL.getProgramParameter(program, GL.ACTIVE_UNIFORMS) as number;
      for (let i = 0; i < n; i++) {
        const info = GL.getActiveUniform(program, i);
        if (info) u[info.name] = GL.getUniformLocation(program, info.name);
      }
      return u;
    }

    // Compile base vertex shader once
    const baseVS = compileShader(GL.VERTEX_SHADER, BASE_VS);

    class Prog {
      program: unknown;
      uniforms: Record<string, unknown>;
      constructor(fsSrc: string, keywords?: string[]) {
        const fs = compileShader(GL.FRAGMENT_SHADER, fsSrc, keywords);
        this.program = createGLProgram(baseVS, fs);
        this.uniforms = getUniforms(this.program);
      }
      // eslint-disable-next-line react-hooks/rules-of-hooks
      bind() { GL.useProgram(this.program); }
    }

    // Material: lazy-compiles keyword variants of one fragment shader
    class Mat {
      fsSrc: string;
      cache: Record<number, unknown> = {};
      uniforms: Record<string, unknown> = {};
      active: unknown = null;
      constructor(fsSrc: string) { this.fsSrc = fsSrc; }
      setKeywords(kw: string[]) {
        let hash = 0;
        for (const k of kw) for (let i = 0; i < k.length; i++)
          hash = ((hash << 5) - hash + k.charCodeAt(i)) | 0;
        if (!this.cache[hash]) {
          const fs = compileShader(GL.FRAGMENT_SHADER, this.fsSrc, kw);
          this.cache[hash] = createGLProgram(baseVS, fs);
        }
        if (this.cache[hash] === this.active) return;
        this.active = this.cache[hash];
        this.uniforms = getUniforms(this.active);
      }
      // eslint-disable-next-line react-hooks/rules-of-hooks
      bind() { GL.useProgram(this.active); }
    }

    const copyProg     = new Prog(COPY_FS);
    const clearProg    = new Prog(CLEAR_FS);
    const splatProg    = new Prog(SPLAT_FS);
    const advProg      = new Prog(ADVECTION_FS, supportLinearFiltering ? [] : ["MANUAL_FILTERING"]);
    const divProg      = new Prog(DIVERGENCE_FS);
    const curlProg     = new Prog(CURL_FS);
    const vortProg     = new Prog(VORTICITY_FS);
    const pressProg    = new Prog(PRESSURE_FS);
    const gradSubProg  = new Prog(GRADIENT_SUBTRACT_FS);
    const displayMat   = new Mat(DISPLAY_FS);
    displayMat.setKeywords(["SHADING"]);

    void copyProg; // used only in resize path — referenced to silence TS

    // ── FBO management ────────────────────────────────────────────────────
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function createFBO(w: number, h: number, iFmt: number, fmt: number, type: number, param: number): any {
      GL.activeTexture(GL.TEXTURE0);
      const tex = GL.createTexture();
      GL.bindTexture(GL.TEXTURE_2D, tex);
      GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, param);
      GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, param);
      GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
      GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
      GL.texImage2D(GL.TEXTURE_2D, 0, iFmt, w, h, 0, fmt, type, null);
      const fbo = GL.createFramebuffer();
      GL.bindFramebuffer(GL.FRAMEBUFFER, fbo);
      GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT0, GL.TEXTURE_2D, tex, 0);
      GL.viewport(0, 0, w, h);
      GL.clear(GL.COLOR_BUFFER_BIT);
      return {
        texture: tex, fbo,
        width: w, height: h,
        texelSizeX: 1 / w, texelSizeY: 1 / h,
        attach(id: number) {
          GL.activeTexture(GL.TEXTURE0 + id);
          GL.bindTexture(GL.TEXTURE_2D, tex);
          return id;
        },
      };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function createDoubleFBO(w: number, h: number, iFmt: number, fmt: number, type: number, param: number): any {
      const obj = {
        width: w, height: h,
        texelSizeX: 1 / w, texelSizeY: 1 / h,
        read:  createFBO(w, h, iFmt, fmt, type, param),
        write: createFBO(w, h, iFmt, fmt, type, param),
        swap() { const t = this.read; this.read = this.write; this.write = t; },
      };
      return obj;
    }

    function getResolution(res: number) {
      let ar = GL.drawingBufferWidth / GL.drawingBufferHeight;
      if (ar < 1) ar = 1 / ar;
      const min = Math.round(res);
      const max = Math.round(res * ar);
      return GL.drawingBufferWidth > GL.drawingBufferHeight
        ? { width: max, height: min }
        : { width: min, height: max };
    }

    const fp = supportLinearFiltering ? GL.LINEAR : GL.NEAREST;

    let velocity: ReturnType<typeof createDoubleFBO>;
    let dye:      ReturnType<typeof createDoubleFBO>;
    let divergenceFBO: ReturnType<typeof createFBO>;
    let curlFBO:  ReturnType<typeof createFBO>;
    let pressure: ReturnType<typeof createDoubleFBO>;

    function initFramebuffers() {
      const sim = getResolution(SIM_RES);
      const dyr = getResolution(DYE_RES);
      velocity     = createDoubleFBO(sim.width, sim.height, velFmt.internalFormat, velFmt.format, halfFloatTexType, fp);
      dye          = createDoubleFBO(dyr.width, dyr.height, fmtRGBA!.internalFormat, fmtRGBA!.format, halfFloatTexType, fp);
      divergenceFBO = createFBO(sim.width, sim.height, scFmt.internalFormat, scFmt.format, halfFloatTexType, GL.NEAREST);
      curlFBO      = createFBO(sim.width, sim.height, scFmt.internalFormat, scFmt.format, halfFloatTexType, GL.NEAREST);
      pressure     = createDoubleFBO(sim.width, sim.height, scFmt.internalFormat, scFmt.format, halfFloatTexType, GL.NEAREST);
    }
    initFramebuffers();

    // ── Simulation step (Navier-Stokes) ───────────────────────────────────

    function correctRadius(r: number) {
      const ar = canvas.width / canvas.height;
      return ar > 1 ? r * ar : r;
    }

    function splat(x: number, y: number, dx: number, dy: number, color: { r: number; g: number; b: number }) {
      splatProg.bind();
      GL.uniform1i(splatProg.uniforms.uTarget, velocity.read.attach(0));
      GL.uniform1f(splatProg.uniforms.aspectRatio, canvas.width / canvas.height);
      GL.uniform2f(splatProg.uniforms.point, x, y);
      GL.uniform3f(splatProg.uniforms.color, dx, dy, 0);
      GL.uniform1f(splatProg.uniforms.radius, correctRadius(SPLAT_RAD / 100));
      blit(velocity.write);
      velocity.swap();

      GL.uniform1i(splatProg.uniforms.uTarget, dye.read.attach(0));
      GL.uniform3f(splatProg.uniforms.color, color.r, color.g, color.b);
      blit(dye.write);
      dye.swap();
    }

    function step(dt: number) {
      GL.disable(GL.BLEND);

      curlProg.bind();
      GL.uniform2f(curlProg.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      GL.uniform1i(curlProg.uniforms.uVelocity, velocity.read.attach(0));
      blit(curlFBO);

      vortProg.bind();
      GL.uniform2f(vortProg.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      GL.uniform1i(vortProg.uniforms.uVelocity, velocity.read.attach(0));
      GL.uniform1i(vortProg.uniforms.uCurl, curlFBO.attach(1));
      GL.uniform1f(vortProg.uniforms.curl, CURL_STR);
      GL.uniform1f(vortProg.uniforms.dt, dt);
      blit(velocity.write);
      velocity.swap();

      divProg.bind();
      GL.uniform2f(divProg.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      GL.uniform1i(divProg.uniforms.uVelocity, velocity.read.attach(0));
      blit(divergenceFBO);

      clearProg.bind();
      GL.uniform1i(clearProg.uniforms.uTexture, pressure.read.attach(0));
      GL.uniform1f(clearProg.uniforms.value, PRESSURE_INIT);
      blit(pressure.write);
      pressure.swap();

      pressProg.bind();
      GL.uniform2f(pressProg.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      GL.uniform1i(pressProg.uniforms.uDivergence, divergenceFBO.attach(0));
      for (let i = 0; i < PRESSURE_ITERS; i++) {
        GL.uniform1i(pressProg.uniforms.uPressure, pressure.read.attach(1));
        blit(pressure.write);
        pressure.swap();
      }

      gradSubProg.bind();
      GL.uniform2f(gradSubProg.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      GL.uniform1i(gradSubProg.uniforms.uPressure, pressure.read.attach(0));
      GL.uniform1i(gradSubProg.uniforms.uVelocity, velocity.read.attach(1));
      blit(velocity.write);
      velocity.swap();

      advProg.bind();
      GL.uniform2f(advProg.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      if (!supportLinearFiltering)
        GL.uniform2f(advProg.uniforms.dyeTexelSize, velocity.texelSizeX, velocity.texelSizeY);
      const velId = velocity.read.attach(0);
      GL.uniform1i(advProg.uniforms.uVelocity, velId);
      GL.uniform1i(advProg.uniforms.uSource, velId);
      GL.uniform1f(advProg.uniforms.dt, dt);
      GL.uniform1f(advProg.uniforms.dissipation, VELOCITY_DISS);
      blit(velocity.write);
      velocity.swap();

      if (!supportLinearFiltering)
        GL.uniform2f(advProg.uniforms.dyeTexelSize, dye.texelSizeX, dye.texelSizeY);
      GL.uniform1i(advProg.uniforms.uVelocity, velocity.read.attach(0));
      GL.uniform1i(advProg.uniforms.uSource, dye.read.attach(1));
      GL.uniform1f(advProg.uniforms.dissipation, DENSITY_DISS);
      blit(dye.write);
      dye.swap();
    }

    function render() {
      GL.blendFunc(GL.ONE, GL.ONE_MINUS_SRC_ALPHA);
      GL.enable(GL.BLEND);
      displayMat.bind();
      GL.uniform2f(displayMat.uniforms.texelSize, 1 / GL.drawingBufferWidth, 1 / GL.drawingBufferHeight);
      GL.uniform1i(displayMat.uniforms.uTexture, dye.read.attach(0));
      blit(null);
    }

    // ── Color: HSV → RGB ──────────────────────────────────────────────────
    function HSVtoRGB(h: number, s: number, v: number) {
      const i = Math.floor(h * 6);
      const f = h * 6 - i;
      const p = v * (1 - s);
      const q = v * (1 - f * s);
      const t = v * (1 - (1 - f) * s);
      const cases = [
        [v, t, p], [q, v, p], [p, v, t],
        [p, q, v], [t, p, v], [v, p, q],
      ];
      const [r, g, b] = cases[i % 6];
      return { r, g, b };
    }

    // ── Mouse input ───────────────────────────────────────────────────────
    let prevX = -1, prevY = -1;
    let currentHue = Math.random();
    let targetHue  = currentHue;
    let lastColorPick = 0;
    const COLOR_INTERVAL = 175; // ms between new random target hues

    const onMove = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth;
      const y = 1 - e.clientY / window.innerHeight;

      // Throttle: only pick a new target hue every COLOR_INTERVAL ms
      const now = performance.now();
      if (now - lastColorPick >= COLOR_INTERVAL) {
        targetHue = Math.random();
        lastColorPick = now;
      }

      if (prevX >= 0) {
        const ar = canvas.width / canvas.height;
        let dx = (x - prevX) * SPLAT_FORCE;
        let dy = (y - prevY) * SPLAT_FORCE;
        if (ar < 1) dx *= ar;
        if (ar > 1) dy /= ar;

        const c = HSVtoRGB(currentHue, 1, 1);
        // Scale for visible but not over-saturating brightness on white
        c.r *= 0.35;
        c.g *= 0.35;
        c.b *= 0.35;

        splat(x, y, dx, dy, c);
      }

      prevX = x;
      prevY = y;
    };
    window.addEventListener("mousemove", onMove);

    // ── Render loop ───────────────────────────────────────────────────────
    let animId: number;
    let lastTime = performance.now();

    const update = () => {
      const now = performance.now();
      const dt  = Math.min((now - lastTime) / 1000, 0.016666);
      lastTime  = now;

      // Lerp currentHue toward targetHue — take the short arc around the hue wheel
      let diff = targetHue - currentHue;
      if (diff > 0.5) diff -= 1;
      if (diff < -0.5) diff += 1;
      currentHue = ((currentHue + diff * (1 - Math.exp(-dt * 8))) + 1) % 1;

      // Resize if needed
      const dpr = window.devicePixelRatio || 1;
      const ww  = Math.floor(window.innerWidth  * dpr);
      const wh  = Math.floor(window.innerHeight * dpr);
      if (canvas.width !== ww || canvas.height !== wh) {
        canvas.width  = ww;
        canvas.height = wh;
        initFramebuffers();
        prevX = -1; prevY = -1; // reset delta after resize
      }

      step(dt);
      render();

      animId = requestAnimationFrame(update);
    };
    animId = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}
