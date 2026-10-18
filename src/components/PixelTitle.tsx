import { useEffect, useRef } from "react";
import * as THREE from "three";
import { createTextCanvas, sampleCanvas } from "../lib/PixelTest";

// ============================================================
// Efektin säädöt
// ============================================================
const RADIUS = 80; // kuinka kaukaa hiiri vaikuttaa (px)
const STRENGTH = 6; // kuinka kovaa työntää
const RETURN = 0.08; // kuinka nopeasti pisteet palaavat (0..1)
const STEP_X = 4; // näytteenoton väli vaakasuunnassa (px)
const STEP_Y = 4; // näytteenoton väli pystysuunnassa (px)

type PixelTitleProps = {
  text?: string;
  fontSize?: number;
  height?: number;
  color?: string;
};

export default function PixelTitle({
  text = "waltteri.dev",
  fontSize = 120,
  height = 180,
  color = "#00FF41",
}: PixelTitleProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // --------------------------------------------------------
    // 1. Jaetut muuttujat
    // --------------------------------------------------------
    let geometry: THREE.BufferGeometry | null = null;
    let material: THREE.PointsMaterial | null = null;
    let original: Float32Array | null = null;
    const mouse = { x: 99999, y: 99999 };

    let cancelled = false;

    // --------------------------------------------------------
    // 2. Koko: containerin koko, ei ikkunan
    // --------------------------------------------------------
    let width = container.clientWidth;
    let h = container.clientHeight;

    // --------------------------------------------------------
    // 3. Scene, ortokamera, renderer
    // --------------------------------------------------------
    const scene = new THREE.Scene();

    const camera = new THREE.OrthographicCamera(
      -width / 2,
      width / 2,
      h / 2,
      -h / 2,
      0.1,
      1000,
    );
    camera.position.z = 400;

    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(width, h);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // --------------------------------------------------------
    // 4. Animaatioloop (sama kuin prototyypissä)
    // --------------------------------------------------------
    function animate() {
      if (geometry && original) {
        const attr = geometry.getAttribute("position") as THREE.BufferAttribute;
        const pos = attr.array as Float32Array;

        for (let i = 0; i < pos.length; i += 3) {
          const dx = pos[i] - mouse.x;
          const dy = pos[i + 1] - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < RADIUS && dist > 0) {
            const force = (RADIUS - dist) / RADIUS;
            pos[i] += (dx / dist) * force * STRENGTH;
            pos[i + 1] += (dy / dist) * force * STRENGTH;
          }

          pos[i] += (original[i] - pos[i]) * RETURN;
          pos[i + 1] += (original[i + 1] - pos[i + 1]) * RETURN;
        }

        attr.needsUpdate = true;
      }

      renderer.render(scene, camera);
    }

    renderer.setAnimationLoop(animate);

    // --------------------------------------------------------
    // 5. Hiiri: suhteessa containeriin, ei ikkunaan
    // --------------------------------------------------------
    const onMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = e.clientX - rect.left - rect.width / 2;
      mouse.y = -(e.clientY - rect.top - rect.height / 2);
    };

    const onLeave = () => {
      mouse.x = 99999;
      mouse.y = 99999;
    };

    container.addEventListener("pointermove", onMove);
    container.addEventListener("pointerleave", onLeave);

    // --------------------------------------------------------
    // 6. Resize: ResizeObserver seuraa containeria
    // --------------------------------------------------------
    const observer = new ResizeObserver(() => {
      width = container.clientWidth;
      h = container.clientHeight;

      camera.left = -width / 2;
      camera.right = width / 2;
      camera.top = h / 2;
      camera.bottom = -h / 2;
      camera.updateProjectionMatrix();

      renderer.setSize(width, h);
    });
    observer.observe(container);

    // --------------------------------------------------------
    // 7. Teksti -> pisteet
    // --------------------------------------------------------
    createTextCanvas(text, fontSize).then((c) => {
      if (cancelled) return;

      const positions = sampleCanvas(c, STEP_X, STEP_Y);
      original = positions.slice();

      geometry = new THREE.BufferGeometry();
      geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3),
      );

      material = new THREE.PointsMaterial({ size: 2, color });
      scene.add(new THREE.Points(geometry, material));
    });

    // --------------------------------------------------------
    // 8. Cleanup: ajetaan kun komponentti poistuu
    //    (ja dev-tilassa Strict Moden takia kerran heti alussa)
    // --------------------------------------------------------
    return () => {
      cancelled = true;

      renderer.setAnimationLoop(null);

      container.removeEventListener("pointermove", onMove);
      container.removeEventListener("pointerleave", onLeave);
      observer.disconnect();

      geometry?.dispose();
      material?.dispose();
      renderer.dispose();

      container.removeChild(renderer.domElement);
    };
  }, [text, fontSize, color]);

  return (
    <div
      ref={containerRef}
      style={{ position: "relative", width: "100%", height }}
    >
      {/* Oikea otsikko ruudunlukijoille ja hakukoneille, piilotettu näkyvistä */}
      <h1
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          overflow: "hidden",
          clip: "rect(0 0 0 0)",
          whiteSpace: "nowrap",
        }}
      >
        {text}
      </h1>
    </div>
  );
}
