export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ProcessingOptions {
  threshold?: number; // luminância acima da qual o pixel vira transparente (padrão: 210)
}

const MAX_OUTPUT_WIDTH = 800;
const MAX_OUTPUT_HEIGHT = 400;

/** Cria um canvas oculto (fallback quando OffscreenCanvas não disponível) */
function createCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.style.visibility = "hidden";
  canvas.style.position = "absolute";
  canvas.style.pointerEvents = "none";
  return canvas;
}

/**
 * Detecta o bounding box da assinatura na imagem carregada num canvas.
 * Retorna coordenadas em pixels no espaço do canvas.
 */
export function detectBoundingBox(canvas: HTMLCanvasElement): CropArea {
  const ctx = canvas.getContext("2d");
  if (!ctx) return { x: 0, y: 0, width: canvas.width, height: canvas.height };

  const { width, height } = canvas;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  // Estimar luminância do fundo a partir dos 4 cantos (20×20px cada)
  const cornerSize = Math.min(20, Math.floor(width / 4), Math.floor(height / 4));
  let bgLumSum = 0;
  let bgCount = 0;

  const corners = [
    { startX: 0, startY: 0 },
    { startX: width - cornerSize, startY: 0 },
    { startX: 0, startY: height - cornerSize },
    { startX: width - cornerSize, startY: height - cornerSize },
  ];

  for (const { startX, startY } of corners) {
    for (let cy = startY; cy < startY + cornerSize; cy++) {
      for (let cx = startX; cx < startX + cornerSize; cx++) {
        const i = (cy * width + cx) * 4;
        const L = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        bgLumSum += L;
        bgCount++;
      }
    }
  }

  const bgLum = bgCount > 0 ? bgLumSum / bgCount : 240;

  // Encontrar limites dos pixels que diferem do fundo
  let minX = width;
  let maxX = 0;
  let minY = height;
  let maxY = 0;
  let found = false;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const alpha = data[i + 3];
      if (alpha < 30) continue;

      const L = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      if (Math.abs(L - bgLum) > 30) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
        found = true;
      }
    }
  }

  if (!found) {
    return { x: 0, y: 0, width, height };
  }

  // Adicionar padding de 8%
  const padX = Math.round((maxX - minX) * 0.08);
  const padY = Math.round((maxY - minY) * 0.08);

  const x = Math.max(0, minX - padX);
  const y = Math.max(0, minY - padY);
  const w = Math.min(width - x, maxX - minX + padX * 2);
  const h = Math.min(height - y, maxY - minY + padY * 2);

  return { x, y, width: w, height: h };
}

/**
 * Processa a região `crop` da imagem:
 * - Remove fundo claro (pixels acima do threshold viram transparentes)
 * - Realça o traço da assinatura
 * - Aplica unsharp mask suave
 *
 * Retorna um File PNG pronto para upload.
 */
export async function digitizeSignature(
  source: HTMLImageElement | HTMLCanvasElement,
  crop: CropArea,
  options: ProcessingOptions = {},
): Promise<File> {
  const { threshold = 210 } = options;

  // Calcular dimensões de output com limite máximo
  let outW = crop.width;
  let outH = crop.height;

  if (outW > MAX_OUTPUT_WIDTH || outH > MAX_OUTPUT_HEIGHT) {
    const scale = Math.min(MAX_OUTPUT_WIDTH / outW, MAX_OUTPUT_HEIGHT / outH);
    outW = Math.round(outW * scale);
    outH = Math.round(outH * scale);
  }

  const canvas = createCanvas(outW, outH);
  document.body.appendChild(canvas);

  try {
    const ctx = canvas.getContext("2d")!;

    // Aplicar crop com scale
    const scaleX = outW / crop.width;
    const scaleY = outH / crop.height;
    ctx.save();
    ctx.scale(scaleX, scaleY);
    ctx.drawImage(source as CanvasImageSource, -crop.x, -crop.y);
    ctx.restore();

    const imageData = ctx.getImageData(0, 0, outW, outH);
    const data = imageData.data;
    const len = data.length;

    // Etapa A: Remoção de fundo + realce do traço
    for (let i = 0; i < len; i += 4) {
      const alpha = data[i + 3];
      if (alpha === 0) continue;

      const L = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];

      if (L > threshold) {
        // Fundo claro → transparente
        data[i + 3] = 0;
      } else {
        // Traço → escurecer (gamma 0.7 para realçar)
        const ink = Math.min(255, Math.round(Math.pow((255 - L) / 255, 0.7) * 255));
        data[i] = 255 - ink;
        data[i + 1] = 255 - ink;
        data[i + 2] = 255 - ink;
        // Manter alpha original
      }
    }

    // Etapa B: Unsharp mask suave (fator 0.4, kernel 3×3)
    const sharpened = new Uint8ClampedArray(data.length);
    const kernel = [0, -1, 0, -1, 5, -1, 0, -1, 0];
    const factor = 0.4;

    for (let y = 0; y < outH; y++) {
      for (let x = 0; x < outW; x++) {
        const idx = (y * outW + x) * 4;

        if (data[idx + 3] === 0) {
          // Pixel transparente — copiar sem sharpening
          sharpened[idx] = data[idx];
          sharpened[idx + 1] = data[idx + 1];
          sharpened[idx + 2] = data[idx + 2];
          sharpened[idx + 3] = 0;
          continue;
        }

        let rSum = 0, gSum = 0, bSum = 0;

        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const nx = Math.min(outW - 1, Math.max(0, x + kx));
            const ny = Math.min(outH - 1, Math.max(0, y + ky));
            const ni = (ny * outW + nx) * 4;
            const w = kernel[(ky + 1) * 3 + (kx + 1)];

            rSum += data[ni] * w;
            gSum += data[ni + 1] * w;
            bSum += data[ni + 2] * w;
          }
        }

        sharpened[idx] = Math.min(255, Math.max(0, Math.round(data[idx] + (rSum - data[idx]) * factor)));
        sharpened[idx + 1] = Math.min(255, Math.max(0, Math.round(data[idx + 1] + (gSum - data[idx + 1]) * factor)));
        sharpened[idx + 2] = Math.min(255, Math.max(0, Math.round(data[idx + 2] + (bSum - data[idx + 2]) * factor)));
        sharpened[idx + 3] = data[idx + 3];
      }
    }

    ctx.putImageData(new ImageData(sharpened, outW, outH), 0, 0);

    return await new Promise<File>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) { reject(new Error("canvas.toBlob retornou nulo")); return; }
          resolve(new File([blob], "signature.png", { type: "image/png" }));
        },
        "image/png",
      );
    });
  } finally {
    document.body.removeChild(canvas);
  }
}

/**
 * Carrega uma URL de imagem em um canvas e retorna o canvas + as dimensões.
 * Útil para passar à detectBoundingBox antes de ter o Cropper montado.
 */
export function loadImageToCanvas(url: string): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = createCanvas(img.naturalWidth, img.naturalHeight);
      document.body.appendChild(canvas);
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      resolve(canvas);
    };
    img.onerror = reject;
    img.src = url;
  });
}
