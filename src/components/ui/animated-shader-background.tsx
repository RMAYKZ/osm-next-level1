import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const IS_MOBILE = typeof window !== 'undefined' && window.innerWidth < 768;

export default function AnimatedShaderBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Mobile GPUs heat up and stutter under a continuous full-screen
    // fragment shader (35-iteration noise loop, every pixel, every frame).
    // Not worth the trade-off on a phone — use the static CSS gradient
    // fallback below instead. Desktop keeps the full animated effect.
    if (IS_MOBILE) return;

    // Respect OS-level "reduce motion" — skip the continuous 60fps WebGL
    // render loop entirely for users who've asked for it. Falls back to the
    // plain background colour already set via CSS below.
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    // ── Renderer ──────────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      powerPreference: IS_MOBILE ? 'low-power' : 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, IS_MOBILE ? 1 : 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight);
    // Let Three.js control canvas sizing — don't override with CSS
    renderer.domElement.style.display = 'block';
    container.appendChild(renderer.domElement);

    // ── Scene ─────────────────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const material = new THREE.ShaderMaterial({
      uniforms: {
        iTime:       { value: 0 },
        iResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      },
      vertexShader: `void main() { gl_Position = vec4(position, 1.0); }`,
      fragmentShader: `
        uniform float iTime;
        uniform vec2  iResolution;

        #define NUM_OCTAVES 3

        float rand(vec2 n) {
          return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
        }

        float noise(vec2 p) {
          vec2 ip = floor(p);
          vec2 u  = fract(p);
          u = u * u * (3.0 - 2.0 * u);
          float res = mix(
            mix(rand(ip), rand(ip + vec2(1.0, 0.0)), u.x),
            mix(rand(ip + vec2(0.0, 1.0)), rand(ip + vec2(1.0, 1.0)), u.x),
            u.y
          );
          return res * res;
        }

        float fbm(vec2 x) {
          float v = 0.0;
          float a = 0.3;
          vec2 shift = vec2(100.0);
          mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
          for (int i = 0; i < NUM_OCTAVES; ++i) {
            v += a * noise(x);
            x  = rot * x * 2.0 + shift;
            a *= 0.4;
          }
          return v;
        }

        void main() {
          vec2 shake = vec2(sin(iTime * 1.2) * 0.005, cos(iTime * 2.1) * 0.005);
          vec2 p = ((gl_FragCoord.xy + shake * iResolution.xy) - iResolution.xy * 0.5)
                   / iResolution.y * mat2(6.0, -4.0, 4.0, 6.0);
          vec2  v;
          vec4  o = vec4(0.0);
          float f = 2.0 + fbm(p + vec2(iTime * 5.0, 0.0)) * 0.5;

          for (float i = 0.0; i < 35.0; i++) {
            v = p + cos(i * i + (iTime + p.x * 0.08) * 0.025 + i * vec2(13.0, 11.0)) * 3.5
                  + vec2(sin(iTime * 3.0 + i) * 0.003, cos(iTime * 3.5 - i) * 0.003);
            float tailNoise = fbm(v + vec2(iTime * 0.5, i)) * 0.3 * (1.0 - (i / 35.0));
            vec4 col = vec4(
              0.88 + 0.12 * sin(i * 0.2 + iTime * 0.4),
              0.08 + 0.10 * cos(i * 0.3 + iTime * 0.5),
              0.02 + 0.03 * sin(i * 0.4 + iTime * 0.3),
              1.0
            );
            vec4 contrib = col
              * exp(sin(i * i + iTime * 0.8))
              / length(max(v, vec2(v.x * f * 0.015, v.y * 1.5)));
            float thin = smoothstep(0.0, 1.0, i / 35.0) * 0.6;
            o += contrib * (1.0 + tailNoise * 0.8) * thin;
          }

          o = tanh(pow(o / 100.0, vec4(1.6)));
          gl_FragColor = o * 1.5;
        }
      `,
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    scene.add(new THREE.Mesh(geometry, material));

    // ── Animation loop ────────────────────────────────────────────────────────
    const INTERVAL = IS_MOBILE ? 1000 / 30 : 1000 / 60;
    const STEP     = IS_MOBILE ? 0.012 : 0.016;
    let frameId  = 0;
    let lastTs   = 0;

    const tick = (ts: number) => {
      frameId = requestAnimationFrame(tick);
      if (ts - lastTs < INTERVAL) return;
      lastTs = ts;
      material.uniforms.iTime.value += STEP;
      renderer.render(scene, camera);
    };
    frameId = requestAnimationFrame(tick);

    // Pause when tab hidden
    const onVis = () => {
      if (document.hidden) cancelAnimationFrame(frameId);
      else { lastTs = 0; frameId = requestAnimationFrame(tick); }
    };
    document.addEventListener('visibilitychange', onVis);

    // Resize
    const onResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      material.uniforms.iResolution.value.set(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVis);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  // Container is fixed full-screen, z-index 0 — sits above body, behind content (z-index 1)
  return (
    <div
      ref={containerRef}
      aria-hidden
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        // Mobile: this IS the background (no WebGL) — static gradient in
        // the same colour mood as the shader, zero ongoing CPU/GPU cost.
        // Desktop: fallback colour shown only until WebGL paints over it.
        background: IS_MOBILE
          ? 'radial-gradient(ellipse 80% 60% at 50% 10%, rgba(239,68,68,0.14) 0%, transparent 65%), #050506'
          : '#050506',
      }}
    />
  );
}
