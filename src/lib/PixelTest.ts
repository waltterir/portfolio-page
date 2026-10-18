// Apufunktiot pistetekstiä varten.
// Ei React- eikä Three.js-riippuvuuksia, pelkkä Canvas 2D API.

/**
 * Piirtää tekstin piilotettuun canvasiin, jota ei lisätä sivulle.
 * Odottaa ensin, että fontti on ladattu.
 */
export async function createTextCanvas(text: string, fontSize: number) {
  await document.fonts.load(`700 ${fontSize}px "JetBrains Mono"`);

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (ctx == null) {
    throw new Error("canvas is null");
  }

  ctx.font = `700 ${fontSize}px "JetBrains Mono"`;

  const width = ctx.measureText(text).width;

  canvas.width = Math.ceil(width + 20);
  canvas.height = Math.ceil(fontSize * 1.3);

  // Koon asettaminen nollaa kontekstin asetukset, joten fontti uudestaan
  ctx.font = `700 ${fontSize}px "JetBrains Mono"`;
  ctx.fillStyle = "#00FF41";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 10, canvas.height / 2);
  return canvas;
}

/**
 * Lukee canvasin pikselit ja palauttaa pisteiden paikat (x, y, z)
 * keskitettynä origoon. Vain pikselit, joiden alpha > 128, otetaan mukaan.
 */
export function sampleCanvas(
  canvas: HTMLCanvasElement,
  stepX: number,
  stepY: number,
) {
  const context = canvas.getContext("2d");
  const positions: number[] = [];

  if (context == null) {
    throw new Error("context is null");
  }
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  for (let y = 0; y < canvas.height; y += stepY) {
    for (let x = 0; x < canvas.width; x += stepX) {
      // Pikselin (x, y) alpha-arvon paikka taulukossa
      const alphaIndex = (y * canvas.width + x) * 4 + 3;

      // Onko tässä kohdassa tekstiä?
      if (data[alphaIndex] > 128) {
        positions.push(
          x - canvas.width / 2, // keskitetty x
          -(y - canvas.height / 2), // keskitetty ja käännetty y
          0, // z
        );
      }
    }
  }

  return new Float32Array(positions);
}
