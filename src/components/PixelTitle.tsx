import { useEffect, useRef } from "react";
import * as THREE from "three";
import { createTextCanvas, sampleCanvas } from "../lib/PixelTest";

// ============================================================
// Efektin säädöt
// ============================================================
const RADIUS = 80; // kuinka kaukaa hiiri vaikuttaa (px)
const STRENGTH = 6; // kuinka kovaa työntää
const SPEED_MIN = 0.04; // INTRO: hitaimman pisteen paluunopeus
const SPEED_MAX = 0.12; // INTRO: nopeimman pisteen paluunopeus
const STEP_X = 2; // näytteenoton väli vaakasuunnassa (px)
const STEP_Y = 4; // näytteenoton väli pystysuunnassa (px)
const CANVAS_PADDING = 10; // sama reunus kuin createTextCanvasissa
const MIN_FONT_SIZE = 32; // pienin sallittu fonttikoko

type PixelTitleProps = {
  text?: string;
  fontSize?: number; // maksimikoko, pienenee tarvittaessa
  color?: string;
};

export default function PixelTitle({
  text = "waltteri.dev",
  fontSize = 120,
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
    let points: THREE.Points | null = null;
    let original: Float32Array | null = null;
    let speeds: Float32Array | null = null; // INTRO: jokaisen pisteen oma nopeus
    let textWidth = 0;
    const mouse = { x: 99999, y: 99999 };
    let cancelled = false;
    let lastTime = 0;

    let buildId = 0;
    let builtWidth = 0;
    let resizeTimer: number | undefined;

    // INTRO: animaatio vain ensimmäisellä rakennuskerralla, ei resizessa.
    // Jos käyttäjä on pyytänyt vähemmän liikettä, intro ohitetaan.
    let playIntro = true;

    // --------------------------------------------------------
    // 2. Koko
    // --------------------------------------------------------
    container.style.height = `${Math.ceil(fontSize * 1.3)}px`;

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

    // Siirtää tekstin vasemman reunan containerin vasempaan reunaan
    const alignLeft = () => {
      if (points) {
        points.position.x = -width / 2 + textWidth / 2 - CANVAS_PADDING;
      }
    };

    // Kameran ja rendererin päivitys
    const updateView = () => {
      camera.left = -width / 2;
      camera.right = width / 2;
      camera.top = h / 2;
      camera.bottom = -h / 2;
      camera.updateProjectionMatrix();
      renderer.setSize(width, h);
      alignLeft();
    };

    // Vanhojen pisteiden poisto ennen uudelleenrakennusta
    const disposePoints = () => {
      if (points) scene.remove(points);
      geometry?.dispose();
      material?.dispose();
      points = null;
      geometry = null;
      material = null;
      original = null;
      speeds = null; // INTRO
    };

    // --------------------------------------------------------
    // 4. Animaatioloop
    // --------------------------------------------------------
    function animate(time: number) {
      // Montako "60 fps -framea" kului edellisestä kerrasta.
      // 60 Hz -> 1, 144 Hz -> ~0.42. Rajataan 3:een, ettei pitkä
      // tauko (esim. välilehti taustalla) aiheuta hyppyä.
      const dt = lastTime ? Math.min((time - lastTime) / (1000 / 60), 3) : 1;
      lastTime = time;

      if (geometry && original && speeds && points) {
        const attr = geometry.getAttribute("position") as THREE.BufferAttribute;
        const pos = attr.array as Float32Array;

        // Hiiren paikka pisteiden omassa koordinaatistossa
        const mx = mouse.x - points.position.x;
        const my = mouse.y - points.position.y;

        for (let i = 0; i < pos.length; i += 3) {
          const dx = pos[i] - mx;
          const dy = pos[i + 1] - my;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Työntö skaalattuna kuluneella ajalla
          if (dist < RADIUS && dist > 0) {
            const force = (RADIUS - dist) / RADIUS;
            pos[i] += (dx / dist) * force * STRENGTH * dt;
            pos[i + 1] += (dy / dist) * force * STRENGTH * dt;
          }

          // Paluu: jokaisella pisteellä oma nopeus, skaalattuna ajalla.
          // Sama logiikka hoitaa sisääntulon ja hiiren jälkeisen paluun.
          const k = 1 - Math.pow(1 - speeds[i / 3], dt);
          pos[i] += (original[i] - pos[i]) * k;
          pos[i + 1] += (original[i + 1] - pos[i + 1]) * k;
        }

        attr.needsUpdate = true;
      }

      renderer.render(scene, camera);
    }

    renderer.setAnimationLoop(animate);

    // --------------------------------------------------------
    // 5. Hiiri
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
    // 6. Pisteiden rakennus sopivalla fonttikoolla
    // --------------------------------------------------------
    const build = async () => {
      const id = ++buildId;
      const available = container.clientWidth;
      builtWidth = available;
      // Piirretään ensin maksimikoolla ja mitataan
      let c = await createTextCanvas(text, fontSize);

      // Jos ei mahdu, lasketaan sopiva koko suhteessa
      if (c.width > available) {
        const pad = CANVAS_PADDING * 2;
        const fitted = Math.floor(
          (fontSize * (available - pad)) / (c.width - pad),
        );
        c = await createTextCanvas(text, Math.max(MIN_FONT_SIZE, fitted));
      }

      if (cancelled || id !== buildId) return;

      disposePoints();

      const positions = sampleCanvas(c, STEP_X, STEP_Y);
      original = positions.slice();

      // INTRO: jokaiselle pisteelle oma nopeus
      speeds = new Float32Array(positions.length / 3);
      for (let p = 0; p < speeds.length; p++) {
        speeds[p] = SPEED_MIN + Math.random() * (SPEED_MAX - SPEED_MIN);
      }

      geometry = new THREE.BufferGeometry();
      geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3),
      );

      material = new THREE.PointsMaterial({ size: 2, color });
      points = new THREE.Points(geometry, material);
      textWidth = c.width;
      scene.add(points);

      container.style.height = `${c.height}px`;
      width = container.clientWidth;
      h = c.height;
      updateView(); // asettaa myös points.position.x:n

      // INTRO: sekoitetaan pisteet satunnaisiin paikkoihin containerin
      // alueelle. Tehdään vasta updateView()n jälkeen, koska tarvitaan
      // ryhmän siirto (points.position.x): satunnainen paikka arvotaan
      // ruudun koordinaateissa ja muunnetaan pisteiden omiin.
      if (playIntro) {
        playIntro = false;
        const offsetX = points.position.x;

        for (let i = 0; i < positions.length; i += 3) {
          positions[i] = (Math.random() - 0.5) * width - offsetX; // x
          positions[i + 1] = (Math.random() - 0.5) * h; // y
        }

        (
          geometry.getAttribute("position") as THREE.BufferAttribute
        ).needsUpdate = true;
      }
    };

    build();

    // --------------------------------------------------------
    // 7. Resize
    // --------------------------------------------------------
    const observer = new ResizeObserver(() => {
      width = container.clientWidth;
      h = container.clientHeight;
      updateView();

      // Jos leveys muuttui, rakennetaan pisteet uudelleen (ilman introa)
      if (Math.abs(width - builtWidth) > 1) {
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(build, 150);
      }
    });
    observer.observe(container);

    // --------------------------------------------------------
    // 8. Cleanup
    // --------------------------------------------------------
    return () => {
      cancelled = true;
      window.clearTimeout(resizeTimer);

      renderer.setAnimationLoop(null);

      container.removeEventListener("pointermove", onMove);
      container.removeEventListener("pointerleave", onLeave);
      observer.disconnect();

      disposePoints();
      renderer.dispose();

      container.removeChild(renderer.domElement);
    };
  }, [text, fontSize, color]);

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%" }}>
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
