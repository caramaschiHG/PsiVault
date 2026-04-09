"use client";

import Cropper from "react-easy-crop";
import { useCallback, useEffect, useRef, useState } from "react";
import { type CropArea, detectBoundingBox, digitizeSignature } from "@/lib/signature/process";

// Fix 1: `detecting` eliminado como step — é agora um boolean silencioso
type ModalStep = "cropping" | "processing" | "result";

interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface SignatureCropModalProps {
  imageUrl: string;
  onConfirm: (file: File) => void;
  onCancel: () => void;
}

function SpinnerSVG({ size = 20, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={{ animation: "spin 0.7s linear infinite", flexShrink: 0 }}
    >
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2.5" strokeOpacity="0.2" />
      <path d="M12 2a10 10 0 0110 10" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function SignatureCropModal({ imageUrl, onConfirm, onCancel }: SignatureCropModalProps) {
  const [step, setStep] = useState<ModalStep>("cropping");
  // Fix 1: auto-detect é silencioso — não muda o step, apenas bloqueia o Cropper até concluir
  const [autoDetecting, setAutoDetecting] = useState(true);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [initialCrop, setInitialCrop] = useState<Area | undefined>(undefined);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [beforeUrl, setBeforeUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultFile, setResultFile] = useState<File | null>(null);
  // Fix 8: aviso de qualidade baixa (assinatura muito clara)
  const [qualityWarning, setQualityWarning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sourceImgRef = useRef<HTMLImageElement | null>(null);
  // Fix 7: ref para cancelar operações assíncronas e evitar setState após unmount
  const cancelledRef = useRef(false);
  // Refs para cleanup de object URLs (evita closure stale nos useEffects)
  const beforeUrlRef = useRef<string | null>(null);
  const resultUrlRef = useRef<string | null>(null);

  // Fix 7: marcar como cancelado ao desmontar
  useEffect(() => {
    cancelledRef.current = false;
    return () => {
      cancelledRef.current = true;
      if (beforeUrlRef.current) URL.revokeObjectURL(beforeUrlRef.current);
      if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
    };
  }, []);

  // Fix 1: auto-detect silencioso — Cropper só monta após concluir com initialCrop correto
  useEffect(() => {
    const safetyTimeout = setTimeout(() => {
      if (!cancelledRef.current) setAutoDetecting(false);
    }, 3000);

    const img = new Image();
    img.onload = () => {
      if (cancelledRef.current) return;
      clearTimeout(safetyTimeout);
      sourceImgRef.current = img;

      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const box = detectBoundingBox(canvas);
        if (!cancelledRef.current && box.width > 50 && box.height > 15) {
          setInitialCrop(box);
        }
      }
      if (!cancelledRef.current) setAutoDetecting(false);
    };
    img.onerror = () => {
      if (!cancelledRef.current) { clearTimeout(safetyTimeout); setAutoDetecting(false); }
    };
    img.src = imageUrl;

    return () => clearTimeout(safetyTimeout);
  }, [imageUrl]);

  // Fix 6 + Fix 7: keyboard com cancel seguro
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") { handleCancel(); return; }
      if (e.key === "Enter" && step === "result") handleConfirm();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  // Fix 7: cancel seguro — sinaliza cancelamento antes de chamar onCancel
  function handleCancel() {
    cancelledRef.current = true;
    onCancel();
  }

  async function handleProcess() {
    if (!croppedAreaPixels || !sourceImgRef.current) return;

    const cropArea: CropArea = {
      x: croppedAreaPixels.x,
      y: croppedAreaPixels.y,
      width: croppedAreaPixels.width,
      height: croppedAreaPixels.height,
    };

    if (cropArea.width < 50 || cropArea.height < 15) {
      setError("Assinatura muito pequena — tente uma imagem maior.");
      return;
    }

    cancelledRef.current = false;
    setStep("processing");
    setError(null);
    setQualityWarning(null);

    try {
      const img = sourceImgRef.current;

      // Preview "antes": recorte da imagem original em JPEG
      const beforeCanvas = document.createElement("canvas");
      const previewScale = Math.min(1, 300 / Math.max(cropArea.width, cropArea.height));
      beforeCanvas.width = Math.round(cropArea.width * previewScale);
      beforeCanvas.height = Math.round(cropArea.height * previewScale);
      const bCtx = beforeCanvas.getContext("2d")!;
      bCtx.scale(previewScale, previewScale);
      bCtx.drawImage(img, -cropArea.x, -cropArea.y);
      const newBeforeUrl = await new Promise<string>((res) =>
        beforeCanvas.toBlob((b) => res(URL.createObjectURL(b!)), "image/jpeg", 0.85),
      );
      if (cancelledRef.current) { URL.revokeObjectURL(newBeforeUrl); return; }

      const file = await digitizeSignature(img, cropArea);
      if (cancelledRef.current) return;

      const newResultUrl = URL.createObjectURL(file);

      // Fix 8: verificar densidade de tinta no resultado
      const qualImg = new Image();
      qualImg.src = newResultUrl;
      await new Promise<void>((res) => { qualImg.onload = () => res(); qualImg.onerror = () => res(); });
      if (!cancelledRef.current) {
        const qc = document.createElement("canvas");
        qc.width = 100; qc.height = 50;
        const qCtx = qc.getContext("2d")!;
        qCtx.drawImage(qualImg, 0, 0, 100, 50);
        const qd = qCtx.getImageData(0, 0, 100, 50);
        let inkPixels = 0;
        for (let i = 0; i < qd.data.length; i += 4) {
          if (qd.data[i + 3] > 20) inkPixels++;
        }
        if (inkPixels / 5000 < 0.015) {
          setQualityWarning("Assinatura muito clara — o resultado pode estar apagado. Tente uma foto com mais contraste.");
        }
      }

      if (cancelledRef.current) { URL.revokeObjectURL(newBeforeUrl); URL.revokeObjectURL(newResultUrl); return; }

      // Revogar URLs anteriores e setar novas
      if (beforeUrlRef.current) URL.revokeObjectURL(beforeUrlRef.current);
      if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
      beforeUrlRef.current = newBeforeUrl;
      resultUrlRef.current = newResultUrl;
      setBeforeUrl(newBeforeUrl);
      setResultUrl(newResultUrl);
      setResultFile(file);
      setStep("result");
    } catch {
      if (!cancelledRef.current) {
        setError("Erro ao processar a imagem. Tente novamente.");
        setStep("cropping");
      }
    }
  }

  function handleConfirm() {
    if (resultFile) onConfirm(resultFile);
  }

  function handleAdjust() {
    if (croppedAreaPixels) setInitialCrop({ ...croppedAreaPixels });
    setQualityWarning(null);
    setStep("cropping");
  }

  return (
    <div
      style={overlayStyle}
      onClick={(e) => { if (e.target === e.currentTarget) handleCancel(); }}
    >
      <div style={modalStyle}>

        {/* Header */}
        <div style={headerStyle}>
          {/* Fix 4: eyebrow 0.8rem */}
          <span style={eyebrowStyle}>Assinatura profissional</span>
          <h2 style={titleStyle}>
            {step === "result" ? "Resultado da digitalização" : "Ajustar e digitalizar"}
          </h2>
          {step !== "result" && (
            <p style={subtitleStyle}>
              Posicione o recorte sobre apenas a assinatura — o fundo será removido automaticamente.
            </p>
          )}
        </div>

        {/* Área de crop / processing */}
        {step !== "result" && (
          <div style={cropAreaStyle}>
            {/* Fix 1: spinner sutil durante auto-detect, sem texto, sem step separado */}
            {autoDetecting && step === "cropping" && (
              <div style={silentDetectStyle}>
                <SpinnerSVG size={18} color="rgba(255,252,247,0.22)" />
              </div>
            )}
            {/* Overlay de processing */}
            {step === "processing" && (
              <div style={loadingOverlayStyle}>
                <SpinnerSVG size={24} color="rgba(255,252,247,0.6)" />
                <span style={loadingLabelStyle}>Digitalizando assinatura...</span>
              </div>
            )}
            {/* Fix 1: Cropper só monta após auto-detect (uma única vez, com initialCrop correto) */}
            {!autoDetecting && step === "cropping" && (
              <Cropper
                image={imageUrl}
                crop={crop}
                zoom={zoom}
                // Fix 2: aspect fixo 3:1 — elimina layouts quebrados com assinaturas incomuns
                aspect={3}
                objectFit="contain"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                initialCroppedAreaPixels={initialCrop}
                style={{
                  containerStyle: { borderRadius: "var(--radius-sm)", background: "#1e1b18" },
                }}
              />
            )}
          </div>
        )}

        {/* Fix 3: resultado — ambos painéis sobre fundo papel (#fffcf7) */}
        {step === "result" && (
          <div style={resultRowStyle}>
            <div style={resultPanelOriginalStyle}>
              {/* Fix 5: label cor sólida, contraste adequado */}
              <span style={resultLabelOriginalStyle}>Original</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {beforeUrl && (
                <img src={beforeUrl} alt="Recorte original da foto" style={resultImgStyle} />
              )}
            </div>
            <div style={resultPanelDigitalStyle}>
              <span style={resultLabelDigitalStyle}>Digitalizada</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {resultUrl && (
                <img src={resultUrl} alt="Assinatura digitalizada com fundo removido" style={resultImgStyle} />
              )}
            </div>
          </div>
        )}

        {/* Fix 6: zoom slider com targets de toque adequados e aria */}
        {step === "cropping" && !autoDetecting && (
          <div style={sliderWrapStyle}>
            <span style={sliderIconStyle} aria-hidden="true">−</span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              style={rangeStyle}
              aria-label="Zoom da assinatura"
              aria-valuetext={`${Math.round(zoom * 100)}%`}
            />
            <span style={sliderIconStyle} aria-hidden="true">+</span>
            <span style={zoomValueStyle} aria-live="polite">
              {Math.round(zoom * 100)}%
            </span>
          </div>
        )}

        {/* Fix 8: aviso de qualidade baixa (amber, não erro) */}
        {qualityWarning && <p style={warningStyle}>{qualityWarning}</p>}
        {error && <p style={errorStyle}>{error}</p>}

        {/* Ações */}
        <div style={actionsStyle}>
          {step === "cropping" && (
            <>
              <button
                type="button"
                onClick={() => void handleProcess()}
                disabled={!croppedAreaPixels || autoDetecting}
                style={{
                  ...confirmBtnStyle,
                  ...(!croppedAreaPixels || autoDetecting ? disabledStyle : {}),
                }}
              >
                Processar →
              </button>
              <button type="button" onClick={handleCancel} style={cancelBtnStyle}>
                Cancelar
              </button>
            </>
          )}

          {step === "result" && (
            <>
              <button type="button" onClick={handleConfirm} style={confirmBtnStyle}>
                Confirmar assinatura
              </button>
              <button type="button" onClick={handleAdjust} style={cancelBtnStyle}>
                ← Ajustar recorte
              </button>
            </>
          )}

          {/* Fix 7: cancel durante processing usa handleCancel (sinaliza cancelamento) */}
          {step === "processing" && (
            <button type="button" onClick={handleCancel} style={cancelBtnStyle}>
              Cancelar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(15, 12, 9, 0.75)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: "var(--z-modal)",
  padding: "1rem",
} satisfies React.CSSProperties;

const modalStyle = {
  background: "var(--color-surface-0)",
  borderRadius: "var(--radius-lg)",
  border: "1px solid var(--color-border-med)",
  padding: "1.75rem",
  width: "100%",
  maxWidth: "520px",
  display: "grid",
  gap: "1.25rem",
  boxShadow: "var(--shadow-lg)",
} satisfies React.CSSProperties;

const headerStyle = {
  display: "grid",
  gap: "0.2rem",
} satisfies React.CSSProperties;

// Fix 4: 0.8rem (≥ 12px) para WCAG 1.4.4
const eyebrowStyle = {
  fontSize: "0.8rem",
  fontWeight: 600,
  letterSpacing: "0.13em",
  textTransform: "uppercase" as const,
  color: "var(--color-accent)",
} satisfies React.CSSProperties;

const titleStyle = {
  margin: 0,
  fontSize: "var(--font-size-section-title)",
  fontWeight: 700,
  color: "var(--color-text-1)",
  lineHeight: 1.3,
} satisfies React.CSSProperties;

const subtitleStyle = {
  margin: 0,
  fontSize: "0.8rem",
  color: "var(--color-text-3)",
  lineHeight: 1.5,
  marginTop: "0.15rem",
} satisfies React.CSSProperties;

const cropAreaStyle = {
  position: "relative",
  height: "240px",
  borderRadius: "var(--radius-sm)",
  overflow: "hidden",
  background: "var(--color-overlay-bg)",
} satisfies React.CSSProperties;

// Fix 1: spinner sutil, sem texto — completamente silencioso visualmente
const silentDetectStyle = {
  position: "absolute",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "var(--color-overlay-bg)",
  zIndex: "var(--z-base)",
} satisfies React.CSSProperties;

const loadingOverlayStyle = {
  position: "absolute",
  inset: 0,
  display: "flex",
  flexDirection: "column" as const,
  alignItems: "center",
  justifyContent: "center",
  gap: "0.65rem",
  background: "var(--color-overlay-bg)",
  zIndex: "var(--z-base)",
} satisfies React.CSSProperties;

const loadingLabelStyle = {
  fontSize: "0.8rem",
  color: "rgba(255,252,247,0.45)",
} satisfies React.CSSProperties;

// Fix 3: ambos painéis sobre fundo papel
const resultRowStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "0.75rem",
} satisfies React.CSSProperties;

const resultPanelBase = {
  borderRadius: "var(--radius-sm)",
  padding: "1rem",
  display: "flex",
  flexDirection: "column" as const,
  gap: "0.6rem",
  alignItems: "center",
  minHeight: "130px",
  justifyContent: "center",
  background: "var(--color-surface-1)",
} satisfies React.CSSProperties;

// Painel "Original" — dashed border, fundo levemente cinza-quente
const resultPanelOriginalStyle = {
  ...resultPanelBase,
  background: "rgba(247, 244, 240, 0.9)",
  border: "1px dashed rgba(146, 64, 14, 0.2)",
} satisfies React.CSSProperties;

// Painel "Digitalizada" — solid border + shadow: é o output, hierarquia visual superior
const resultPanelDigitalStyle = {
  ...resultPanelBase,
  background: "var(--color-surface-1)",
  border: "1px solid rgba(146, 64, 14, 0.2)",
  boxShadow: "var(--shadow-sm)",
} satisfies React.CSSProperties;

const resultLabelBase = {
  fontSize: "0.7rem",
  fontWeight: 600,
  letterSpacing: "0.12em",
  textTransform: "uppercase" as const,
} satisfies React.CSSProperties;

// Fix 5: cores sólidas com contraste adequado (≥ 4.5:1)
const resultLabelOriginalStyle = {
  ...resultLabelBase,
  color: "var(--color-text-3)", // #57534e sobre fundo claro = 5.9:1
} satisfies React.CSSProperties;

const resultLabelDigitalStyle = {
  ...resultLabelBase,
  color: "var(--color-accent)", // #9a3412 sobre #fffcf7 = 5.1:1
} satisfies React.CSSProperties;

const resultImgStyle = {
  maxWidth: "100%",
  maxHeight: "90px",
  objectFit: "contain" as const,
} satisfies React.CSSProperties;

// Fix 6: touch targets — sliderWrap com minHeight para mobile
const sliderWrapStyle = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  minHeight: "44px",
} satisfies React.CSSProperties;

// Fix 6: icons com área de toque adequada (decorativos, mas tamanho generoso)
const sliderIconStyle = {
  fontSize: "1.1rem",
  color: "var(--color-text-3)",
  lineHeight: 1,
  userSelect: "none" as const,
  minWidth: "28px",
  textAlign: "center" as const,
} satisfies React.CSSProperties;

const rangeStyle = {
  flex: 1,
  height: "20px", // Fix 6: área interativa maior para toque
  accentColor: "var(--color-accent)",
  cursor: "pointer",
} satisfies React.CSSProperties;

const zoomValueStyle = {
  fontSize: "0.75rem",
  color: "var(--color-text-3)",
  minWidth: "3rem",
  textAlign: "right" as const,
  fontVariantNumeric: "tabular-nums",
} satisfies React.CSSProperties;

const actionsStyle = {
  display: "flex",
  gap: "0.5rem",
  flexWrap: "wrap" as const,
} satisfies React.CSSProperties;

const confirmBtnStyle = {
  padding: "0.6rem 1.2rem",
  borderRadius: "var(--radius-md)",
  background: "var(--color-accent)",
  color: "#fff7ed",
  border: "none",
  fontWeight: 700,
  fontSize: "0.875rem",
  cursor: "pointer",
} satisfies React.CSSProperties;

const cancelBtnStyle = {
  padding: "0.6rem 1rem",
  borderRadius: "var(--radius-md)",
  background: "transparent",
  color: "var(--color-text-2)",
  border: "1px solid var(--color-border-med)",
  fontWeight: 500,
  fontSize: "0.875rem",
  cursor: "pointer",
} satisfies React.CSSProperties;

const disabledStyle = {
  opacity: 0.6,
  cursor: "not-allowed",
} satisfies React.CSSProperties;

// Fix 8: warning (amarelo/amber) distinto de error (vermelho)
const warningStyle = {
  margin: 0,
  fontSize: "0.82rem",
  color: "var(--color-brown-mid)", // #b45309 — amber/bronze
  fontWeight: 500,
} satisfies React.CSSProperties;

const errorStyle = {
  margin: 0,
  fontSize: "0.82rem",
  color: "var(--color-rose)",
  fontWeight: 500,
} satisfies React.CSSProperties;
