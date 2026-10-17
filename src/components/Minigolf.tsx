import { useEffect, useRef } from "react";

// Pelin asetukset
const START = { x: 80, y: 200 };
const HOLE = { x: 520, y: 200, r: 12 };
const PAR = 3;
const RADIUS = 7;
const POWER = 0.15;
const MAX_DRAG = 120;
const MAX_SINK_SPEED = 4; // tätä kovempi pallo kiitää reiän yli

// Tulosteksti lyöntien määrän mukaan
function getResultText(strokes: number) {
  if (strokes === 1) return "Hole in one!";
  const diff = strokes - PAR;
  if (diff <= -2) return "Eagle!";
  if (diff === -1) return "Birdie!";
  if (diff === 0) return "Par";
  if (diff === 1) return "Bogey";
  if (diff === 2) return "Double bogey";
  return `+${diff}`;
}

export default function Minigolf() {
  const canvaRef = useRef<HTMLCanvasElement>(null);
  const speedRef = useRef({ vx: 0, vy: 0, x: START.x, y: START.y });
  const aimRef = useRef({ aiming: false, x: 0, y: 0 });
  const gameRef = useRef({ strokes: 0, sunk: false });

  const ball = speedRef.current;
  const aim = aimRef.current;
  const game = gameRef.current;

  // Hiiren sijainti canvasin koordinaateissa (toimii myös, jos canvas on skaalattu CSS:llä)
  const getMousePos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvaRef.current;
    if (canvas == null) {
      return { x: 0, y: 0 };
    }
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    return { x, y };
  };

  // Uusi peli: pallo lähtöön ja laskuri nollaan
  const resetGame = () => {
    ball.x = START.x;
    ball.y = START.y;
    ball.vx = 0;
    ball.vy = 0;
    game.strokes = 0;
    game.sunk = false;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    // Pallo reiässä -> klikkaus aloittaa uuden pelin
    if (game.sunk) {
      resetGame();
      return;
    }

    const pos = getMousePos(e);
    if (ball.vx !== 0 || ball.vy !== 0) {
      return;
    }
    const dist = Math.hypot(pos.x - ball.x, pos.y - ball.y);
    if (dist > RADIUS * 3) {
      return;
    }

    // Hiiren vapautus rekisteröityy, vaikka se tapahtuisi canvasin ulkopuolella
    e.currentTarget.setPointerCapture(e.pointerId);

    aim.aiming = true;
    aim.x = pos.x;
    aim.y = pos.y;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!aim.aiming) {
      return;
    }
    const pos = getMousePos(e);
    aim.x = pos.x;
    aim.y = pos.y;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!aim.aiming) {
      return;
    }
    const pos = getMousePos(e);

    let dx = ball.x - pos.x;
    let dy = ball.y - pos.y;

    const dist = Math.hypot(dx, dy);
    if (dist > MAX_DRAG) {
      const scale = MAX_DRAG / dist;
      dx *= scale;
      dy *= scale;
    }

    ball.vx = dx * POWER;
    ball.vy = dy * POWER;
    aim.aiming = false;
    game.strokes += 1;
  };

  useEffect(() => {
    let id = 0;
    const canvas = canvaRef.current;
    if (canvas == null) {
      return;
    }
    const ctx = canvas.getContext("2d");
    if (ctx == null) {
      return;
    }

    const loop = () => {
      // --- FYSIIKKA ---

      // Seinät
      if (
        ball.y + ball.vy > canvas.height - RADIUS ||
        ball.y + ball.vy < RADIUS
      ) {
        ball.vy = -ball.vy;
      }
      if (
        ball.x + ball.vx > canvas.width - RADIUS ||
        ball.x + ball.vx < RADIUS
      ) {
        ball.vx = -ball.vx;
      }

      // Pysähtyminen
      const speed = Math.hypot(ball.vx, ball.vy);
      if (speed <= 0.05) {
        ball.vx = 0;
        ball.vy = 0;
      }

      // Liike ja kitka
      ball.x += ball.vx;
      ball.y += ball.vy;
      ball.vx *= 0.98;
      ball.vy *= 0.98;

      // Reikä: pallo menee sisään, jos se on reiän päällä eikä liian kovassa vauhdissa
      if (!game.sunk) {
        const holeDist = Math.hypot(ball.x - HOLE.x, ball.y - HOLE.y);
        if (holeDist < HOLE.r && speed < MAX_SINK_SPEED) {
          game.sunk = true;
          ball.vx = 0;
          ball.vy = 0;
        }
      }

      // --- PIIRTO (järjestyksellä on väliä: myöhempi menee päälle) ---

      // Väylä
      ctx.fillStyle = "#14301f";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Reikä
      ctx.fillStyle = "#0d1117";
      ctx.beginPath();
      ctx.arc(HOLE.x, HOLE.y, HOLE.r, 0, 2 * Math.PI);
      ctx.fill();

      // Lipputanko ja lippu
      ctx.strokeStyle = "#b5c0cb";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(HOLE.x, HOLE.y);
      ctx.lineTo(HOLE.x, HOLE.y - 50);
      ctx.stroke();

      ctx.fillStyle = "#5fd38d";
      ctx.beginPath();
      ctx.moveTo(HOLE.x, HOLE.y - 50);
      ctx.lineTo(HOLE.x + 22, HOLE.y - 43);
      ctx.lineTo(HOLE.x, HOLE.y - 36);
      ctx.fill();

      // Pallo (ei piirretä, kun se on reiässä)
      if (!game.sunk) {
        ctx.fillStyle = "#e6edf3";
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, RADIUS, 0, 2 * Math.PI);
        ctx.fill();
      }

      // Tähtäysviiva lyöntisuuntaan, rajattuna MAX_DRAGiin
      if (aim.aiming) {
        let dx = ball.x - aim.x;
        let dy = ball.y - aim.y;
        const dist = Math.hypot(dx, dy);
        if (dist > MAX_DRAG) {
          const scale = MAX_DRAG / dist;
          dx *= scale;
          dy *= scale;
        }
        ctx.strokeStyle = "#7d8a97";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(ball.x, ball.y);
        ctx.lineTo(ball.x + dx, ball.y + dy);
        ctx.stroke();
      }

      // Lyöntilaskuri vasempaan yläkulmaan
      ctx.fillStyle = "#b5c0cb";
      ctx.font = '14px "JetBrains Mono", monospace';
      ctx.textAlign = "left";
      ctx.fillText(`strokes: ${game.strokes}  par: ${PAR}`, 16, 28);

      // Tulos, kun pallo on reiässä
      if (game.sunk) {
        ctx.fillStyle = "rgba(13, 17, 23, 0.75)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.textAlign = "center";
        ctx.fillStyle = "#5fd38d";
        ctx.font = '700 32px "JetBrains Mono", monospace';
        ctx.fillText(
          getResultText(game.strokes),
          canvas.width / 2,
          canvas.height / 2,
        );

        ctx.fillStyle = "#7d8a97";
        ctx.font = '14px "JetBrains Mono", monospace';
        ctx.fillText(
          `${game.strokes} strokes · click to play again`,
          canvas.width / 2,
          canvas.height / 2 + 32,
        );
      }

      id = requestAnimationFrame(loop);
    };

    id = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(id);
    };
  }, []);

  return (
    <canvas
      ref={canvaRef}
      width={600}
      height={400}
      className="minigolf"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    />
  );
}
