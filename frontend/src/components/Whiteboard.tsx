import { useState, useRef, useEffect, useCallback } from "react";
import { Channel } from "stream-chat";
import { Loader2, Save, X } from "lucide-react";
import toast from "react-hot-toast";

// ── Types ──────────────────────────────────────────────────────────────────
type Tool = "pen" | "eraser" | "line" | "rect" | "ellipse" | "text" | "select";
type StrokeStyle = "solid" | "dashed" | "dotted";

interface Point {
  x: number;
  y: number;
}

interface BaseShape {
  id: string;
  tool: Tool;
  color: string;
  lineWidth: number;
  strokeStyle: StrokeStyle;
  opacity: number;
  selected?: boolean;
}

interface PathShape extends BaseShape {
  tool: "pen" | "eraser";
  points: Point[];
}

interface LineShape extends BaseShape {
  tool: "line";
  start: Point;
  end: Point;
}

interface RectShape extends BaseShape {
  tool: "rect";
  x: number;
  y: number;
  width: number;
  height: number;
  fill?: string;
}

interface EllipseShape extends BaseShape {
  tool: "ellipse";
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  fill?: string;
}

interface TextShape extends BaseShape {
  tool: "text";
  x: number;
  y: number;
  text: string;
  fontSize: number;
  fontFamily: string;
}

type Shape = PathShape | LineShape | RectShape | EllipseShape | TextShape;

interface WhiteboardProps {
  channel: Channel;
  onClose: () => void;
}

// ── Utilities ──────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 9);

const COLORS = [
  "#1a1a2e", "#16213e", "#e94560", "#f5a623",
  "#2ecc71", "#3498db", "#8b5cf6", "#e67e22",
  "#1abc9c", "#e74c3c", "#ffffff", "#f1c40f",
];

const applyStrokeStyle = (ctx: CanvasRenderingContext2D, style: StrokeStyle, lw: number) => {
  if (style === "dashed") ctx.setLineDash([lw * 4, lw * 2]);
  else if (style === "dotted") ctx.setLineDash([lw, lw * 2]);
  else ctx.setLineDash([]);
};

// ── Drawing helpers ────────────────────────────────────────────────────────
function drawShape(ctx: CanvasRenderingContext2D, shape: Shape, dpr = 1) {
  ctx.save();
  ctx.globalAlpha = shape.opacity;
  ctx.strokeStyle = shape.color;
  ctx.lineWidth = shape.lineWidth;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  applyStrokeStyle(ctx, shape.strokeStyle, shape.lineWidth);

  if (shape.tool === "pen") {
    if (shape.points.length < 2) { ctx.restore(); return; }
    ctx.beginPath();
    ctx.moveTo(shape.points[0].x, shape.points[0].y);
    for (let i = 1; i < shape.points.length; i++) ctx.lineTo(shape.points[i].x, shape.points[i].y);
    ctx.stroke();
  }

  if (shape.tool === "eraser") {
    ctx.globalCompositeOperation = "destination-out";
    ctx.globalAlpha = 1;
    ctx.strokeStyle = "rgba(0,0,0,1)";
    ctx.lineWidth = shape.lineWidth * 3;
    if (shape.points.length < 2) { ctx.restore(); return; }
    ctx.beginPath();
    ctx.moveTo(shape.points[0].x, shape.points[0].y);
    for (let i = 1; i < shape.points.length; i++) ctx.lineTo(shape.points[i].x, shape.points[i].y);
    ctx.stroke();
  }

  if (shape.tool === "line") {
    ctx.beginPath();
    ctx.moveTo(shape.start.x, shape.start.y);
    ctx.lineTo(shape.end.x, shape.end.y);
    ctx.stroke();
  }

  if (shape.tool === "rect") {
    ctx.beginPath();
    ctx.rect(shape.x, shape.y, shape.width, shape.height);
    if (shape.fill) { ctx.fillStyle = shape.fill; ctx.fill(); }
    ctx.stroke();
  }

  if (shape.tool === "ellipse") {
    ctx.beginPath();
    ctx.ellipse(shape.cx, shape.cy, Math.abs(shape.rx), Math.abs(shape.ry), 0, 0, Math.PI * 2);
    if (shape.fill) { ctx.fillStyle = shape.fill; ctx.fill(); }
    ctx.stroke();
  }

  if (shape.tool === "text") {
    ctx.font = `${shape.fontSize}px ${shape.fontFamily}`;
    ctx.fillStyle = shape.color;
    ctx.globalAlpha = shape.opacity;
    ctx.setLineDash([]);
    ctx.fillText(shape.text, shape.x, shape.y);
  }

  // selection ring
  if (shape.selected && shape.tool !== "eraser") {
    ctx.globalAlpha = 0.7;
    ctx.strokeStyle = "#8b5cf6";
    ctx.lineWidth = 2 / dpr;
    ctx.setLineDash([6, 3]);
    if (shape.tool === "pen") {
      const xs = shape.points.map(p => p.x), ys = shape.points.map(p => p.y);
      const pad = 8;
      ctx.strokeRect(Math.min(...xs) - pad, Math.min(...ys) - pad,
        Math.max(...xs) - Math.min(...xs) + pad * 2, Math.max(...ys) - Math.min(...ys) + pad * 2);
    } else if (shape.tool === "rect") {
      ctx.strokeRect(shape.x - 6, shape.y - 6, shape.width + 12, shape.height + 12);
    } else if (shape.tool === "ellipse") {
      ctx.beginPath();
      ctx.ellipse(shape.cx, shape.cy, Math.abs(shape.rx) + 6, Math.abs(shape.ry) + 6, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  ctx.restore();
}

// ── Component ──────────────────────────────────────────────────────────────
export default function Whiteboard({ channel, onClose }: WhiteboardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null); // live preview
  const containerRef = useRef<HTMLDivElement>(null);

  const [tool, setTool] = useState<Tool>("pen");
  const [color, setColor] = useState("#ffffff");
  const [lineWidth, setLineWidth] = useState(3);
  const [strokeStyle, setStrokeStyle] = useState<StrokeStyle>("solid");
  const [opacity, setOpacity] = useState(1);
  const [fillShape, setFillShape] = useState(false);
  const [fontSize, setFontSize] = useState(20);

  const [shapes, setShapes] = useState<Shape[]>([]);
  const [undoStack, setUndoStack] = useState<Shape[][]>([]);
  const [redoStack, setRedoStack] = useState<Shape[][]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const isDrawing = useRef(false);
  const currentShape = useRef<Shape | null>(null);
  const dpr = useRef(window.devicePixelRatio || 1);

  // ── Synchronization ────────────────────────────────────────────────────
  const broadcastShape = async (shape: Shape) => {
    if (!channel) return;
    try {
      await channel.sendEvent({
        type: 'custom.whiteboard_draw',
        shape: shape
      } as any);
    } catch (error) {
      console.error("Failed to sync whiteboard drawing:", error);
    }
  };

  const broadcastClear = async () => {
    if (!channel) return;
    try {
      await channel.sendEvent({
        type: 'custom.whiteboard_clear',
      } as any);
    } catch (error) {
      console.error("Failed to sync whiteboard clear:", error);
    }
  };

  useEffect(() => {
    if (!channel) return;

    const handleEvent = (event: any) => {
      if (event.type === 'custom.whiteboard_draw' && event.shape) {
        setShapes(prev => {
          // Avoid duplicating shapes if we receive our own event
          if (prev.some(s => s.id === event.shape.id)) return prev;
          return [...prev, event.shape];
        });
      } else if (event.type === 'custom.whiteboard_clear') {
        setShapes([]);
        setUndoStack([]);
        setRedoStack([]);
      }
    };

    channel.on('custom.whiteboard_draw' as any, handleEvent);
    channel.on('custom.whiteboard_clear' as any, handleEvent);

    return () => {
      channel.off('custom.whiteboard_draw' as any, handleEvent);
      channel.off('custom.whiteboard_clear' as any, handleEvent);
    };
  }, [channel]);

  // ── Canvas sizing ──────────────────────────────────────────────────────
  const resizeCanvas = useCallback(() => {
    const c = canvasRef.current, o = overlayRef.current, el = containerRef.current;
    if (!c || !o || !el) return;
    const { width, height } = el.getBoundingClientRect();
    const d = dpr.current;
    [c, o].forEach(cv => {
      cv.width = width * d; cv.height = height * d;
      cv.style.width = `${width}px`; cv.style.height = `${height}px`;
      cv.getContext("2d")?.scale(d, d);
    });
    // Trigger a redraw after resize
    redraw(shapes);
  }, [shapes]);

  useEffect(() => {
    resizeCanvas();
    const ro = new ResizeObserver(resizeCanvas);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [resizeCanvas]);

  // ── Redraw main canvas ─────────────────────────────────────────────────
  const redraw = useCallback((list: Shape[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // Fill background with #121212 to match modal
    ctx.fillStyle = "#121212";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw dot grid
    ctx.save();
    ctx.fillStyle = "#ffffff12";
    const dotSpacing = 28;
    for (let x = 0; x < canvas.width; x += dotSpacing) {
      for (let y = 0; y < canvas.height; y += dotSpacing) {
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();

    list.forEach(s => drawShape(ctx, s, dpr.current));
  }, []);

  useEffect(() => { redraw(shapes); }, [shapes, redraw]);

  // ── Pointer helpers ───────────────────────────────────────────────────
  const getPos = (e: React.PointerEvent): Point => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const clearOverlay = () => {
    const o = overlayRef.current;
    if (!o) return;
    const ctx = o.getContext("2d");
    ctx?.clearRect(0, 0, o.width, o.height);
  };

  // ── Push to history ───────────────────────────────────────────────────
  const pushHistory = (prev: Shape[]) => {
    setUndoStack(s => [...s, prev]);
    setRedoStack([]);
  };

  // ── Text input ────────────────────────────────────────────────────────
  const [textInput, setTextInput] = useState<{ x: number; y: number } | null>(null);
  const [textValue, setTextValue] = useState("");
  const textRef = useRef<HTMLInputElement>(null);

  const commitText = useCallback(() => {
    if (!textInput || !textValue.trim()) { setTextInput(null); setTextValue(""); return; }
    const s: TextShape = {
      id: uid(), tool: "text",
      color, lineWidth, strokeStyle, opacity,
      x: textInput.x, y: textInput.y,
      text: textValue, fontSize, fontFamily: "'IBM Plex Mono', monospace",
    };
    setShapes(prev => { pushHistory(prev); return [...prev, s]; });
    broadcastShape(s);
    setTextInput(null); setTextValue("");
  }, [textInput, textValue, color, lineWidth, strokeStyle, opacity, fontSize]);

  // ── Pointer events ────────────────────────────────────────────────────
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (tool === "text") {
      const p = getPos(e);
      setTextInput(p);
      setTextValue("");
      setTimeout(() => textRef.current?.focus(), 50);
      return;
    }
    isDrawing.current = true;
    const p = getPos(e);
    const base = { id: uid(), color, lineWidth, strokeStyle, opacity };

    if (tool === "pen" || tool === "eraser") {
      currentShape.current = { ...base, tool, points: [p] } as PathShape;
    } else if (tool === "line") {
      currentShape.current = { ...base, tool: "line", start: p, end: p } as LineShape;
    } else if (tool === "rect") {
      currentShape.current = { ...base, tool: "rect", x: p.x, y: p.y, width: 0, height: 0, fill: fillShape ? color + "33" : undefined } as RectShape;
    } else if (tool === "ellipse") {
      currentShape.current = { ...base, tool: "ellipse", cx: p.x, cy: p.y, rx: 0, ry: 0, fill: fillShape ? color + "33" : undefined } as EllipseShape;
    }
  }, [tool, color, lineWidth, strokeStyle, opacity, fillShape]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDrawing.current || !currentShape.current) return;
    const p = getPos(e);
    const s = currentShape.current;

    if (s.tool === "pen" || s.tool === "eraser") {
      (s as PathShape).points.push(p);
    } else if (s.tool === "line") {
      (s as LineShape).end = p;
    } else if (s.tool === "rect") {
      const r = s as RectShape;
      r.width = p.x - r.x; r.height = p.y - r.y;
    } else if (s.tool === "ellipse") {
      const el = s as EllipseShape;
      el.rx = p.x - el.cx; el.ry = p.y - el.cy;
    }

    // draw preview on overlay
    clearOverlay();
    const o = overlayRef.current;
    if (!o) return;
    const ctx = o.getContext("2d");
    if (!ctx) return;
    drawShape(ctx, { ...currentShape.current }, dpr.current);
  }, []);

  const onPointerUp = useCallback(() => {
    if (!isDrawing.current || !currentShape.current) return;
    isDrawing.current = false;
    clearOverlay();
    const s = currentShape.current;
    // filter degenerate shapes
    const valid =
      (s.tool === "pen" || s.tool === "eraser") ? (s as PathShape).points.length > 1 :
      s.tool === "line" ? true :
      s.tool === "rect" ? Math.abs((s as RectShape).width) > 2 || Math.abs((s as RectShape).height) > 2 :
      s.tool === "ellipse" ? Math.abs((s as EllipseShape).rx) > 2 || Math.abs((s as EllipseShape).ry) > 2 :
      false;
    if (valid) {
      setShapes(prev => { pushHistory(prev); return [...prev, s!]; });
      broadcastShape(s!);
    }
    currentShape.current = null;
  }, []);

  // ── Undo / Redo ───────────────────────────────────────────────────────
  const undo = useCallback(() => {
    setUndoStack(prev => {
      if (!prev.length) return prev;
      const next = [...prev];
      const state = next.pop()!;
      setRedoStack(r => [...r, shapes]);
      setShapes(state);
      // To strictly sync undo, we could send the full state or a specific undo event.
      // Full state is heavy, let's keep it simple. True CRDT is ideal here.
      // For this implementation, undo is local-only unless we clear all.
      return next;
    });
  }, [shapes]);

  const redo = useCallback(() => {
    setRedoStack(prev => {
      if (!prev.length) return prev;
      const next = [...prev];
      const state = next.pop()!;
      setUndoStack(r => [...r, shapes]);
      setShapes(state);
      return next;
    });
  }, [shapes]);

  const clearAll = () => { 
    pushHistory(shapes); 
    setShapes([]); 
    broadcastClear();
  };

  // ── Keyboard shortcuts ────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if ((e.metaKey || e.ctrlKey) && e.key === "z") { e.preventDefault(); if (e.shiftKey) redo(); else undo(); }
      if ((e.metaKey || e.ctrlKey) && e.key === "y") { e.preventDefault(); redo(); }
      const map: Record<string, Tool> = { p: "pen", e: "eraser", l: "line", r: "rect", o: "ellipse", t: "text", s: "select" };
      if (map[e.key]) setTool(map[e.key] as Tool);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [undo, redo]);

  // ── Export / Share ────────────────────────────────────────────────────
  const saveToChannel = async () => {
    const c = canvasRef.current; 
    if (!c || !channel) return;
    
    setIsSaving(true);
    try {
      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve) => {
        c.toBlob((b) => resolve(b as Blob), "image/png");
      });
      
      const file = new File([blob], "whiteboard.png", { type: "image/png" });
      const uploadResponse = await channel.sendFile(file, file.name, file.type);
      
      await channel.sendMessage({
        text: "Shared a real-time whiteboard session",
        attachments: [
          {
            type: "image",
            image_url: uploadResponse.file,
            fallback: "Whiteboard image",
          },
        ],
      });

      toast.success("Saved to channel!");
      onClose();
    } catch (error) {
      console.error("Error saving whiteboard:", error);
      toast.error("Failed to save whiteboard");
    } finally {
      setIsSaving(false);
    }
  };

  // ── Cursor style ──────────────────────────────────────────────────────
  const cursorMap: Record<Tool, string> = {
    pen: "crosshair", eraser: "cell", line: "crosshair",
    rect: "crosshair", ellipse: "crosshair", text: "text", select: "default",
  };

  // ── UI ────────────────────────────────────────────────────────────────
  const TOOLS: { id: Tool; label: string; key: string; icon: string }[] = [
    { id: "pen",     label: "Pen",     key: "P", icon: "✏️" },
    { id: "eraser",  label: "Eraser",  key: "E", icon: "🧹" },
    { id: "line",    label: "Line",    key: "L", icon: "╱" },
    { id: "rect",    label: "Rect",    key: "R", icon: "▭" },
    { id: "ellipse", label: "Ellipse", key: "O", icon: "◯" },
    { id: "text",    label: "Text",    key: "T", icon: "T" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#121212] w-full max-w-6xl h-[85vh] rounded-2xl flex flex-col overflow-hidden border border-white/10 shadow-2xl">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#121212] z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
              <span className="text-purple-400 font-bold tracking-widest text-xs">W</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white leading-tight">Collaborative Whiteboard</h2>
              <p className="text-[10px] text-purple-400 uppercase tracking-widest">Real-time sync active</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={saveToChannel}
              disabled={isSaving}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors font-medium text-sm"
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Share to Channel
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Whiteboard Content */}
        <div style={{
          display: "flex", flex: 1, fontFamily: "'IBM Plex Mono', monospace",
          background: "#121212", color: "#e2e8f0", overflow: "hidden",
        }}>
          {/* ── Sidebar ── */}
          <aside style={{
            width: 220, background: "#0a0a0a", borderRight: "1px solid #1e1e30",
            display: "flex", flexDirection: "column", padding: "16px 12px", gap: 20,
            overflowY: "auto", flexShrink: 0,
          }} className="no-scrollbar">

            {/* Tools */}
            <section>
              <div style={sectionLabel}>TOOLS</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {TOOLS.map(t => (
                  <button key={t.id} onClick={() => setTool(t.id)} style={toolBtn(tool === t.id)}
                    title={`${t.label} [${t.key}]`}>
                    <span style={{ fontSize: 16 }}>{t.icon}</span>
                    <span style={{ fontSize: 9, opacity: 0.7 }}>{t.key}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Colors */}
            <section>
              <div style={sectionLabel}>COLOR</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 5 }}>
                {COLORS.map(c => (
                  <button key={c} onClick={() => setColor(c)} style={{
                    width: "100%", aspectRatio: "1", borderRadius: 6,
                    background: c, border: color === c ? "2px solid #8b5cf6" : "2px solid transparent",
                    cursor: "pointer", transition: "transform .1s",
                  }} />
                ))}
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, fontSize: 11 }}>
                Custom
                <input type="color" value={color} onChange={e => setColor(e.target.value)}
                  style={{ width: 36, height: 24, border: "none", borderRadius: 4, background: "none", cursor: "pointer" }} />
              </label>
            </section>

            {/* Stroke width */}
            <section>
              <div style={sectionLabel}>STROKE WIDTH — {lineWidth}px</div>
              <input type="range" min={1} max={32} value={lineWidth}
                onChange={e => setLineWidth(+e.target.value)} style={rangeStyle} />
            </section>

            {/* Opacity */}
            <section>
              <div style={sectionLabel}>OPACITY — {Math.round(opacity * 100)}%</div>
              <input type="range" min={0.05} max={1} step={0.05} value={opacity}
                onChange={e => setOpacity(+e.target.value)} style={rangeStyle} />
            </section>

            {/* Stroke style */}
            <section>
              <div style={sectionLabel}>STROKE STYLE</div>
              <div style={{ display: "flex", gap: 6 }}>
                {(["solid", "dashed", "dotted"] as StrokeStyle[]).map(s => (
                  <button key={s} onClick={() => setStrokeStyle(s)}
                    style={{ ...miniBtn, background: strokeStyle === s ? "#8b5cf6" : "#1e1e30", color: strokeStyle === s ? "white" : "#e2e8f0" }}>
                    {s[0].toUpperCase()}
                  </button>
                ))}
              </div>
            </section>

            {/* Shape fill */}
            {(tool === "rect" || tool === "ellipse") && (
              <section>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, cursor: "pointer" }}>
                  <input type="checkbox" checked={fillShape} onChange={e => setFillShape(e.target.checked)} />
                  Fill shape
                </label>
              </section>
            )}

            {/* Font size */}
            {tool === "text" && (
              <section>
                <div style={sectionLabel}>FONT SIZE — {fontSize}px</div>
                <input type="range" min={10} max={80} value={fontSize}
                  onChange={e => setFontSize(+e.target.value)} style={rangeStyle} />
              </section>
            )}

            {/* Actions */}
            <section style={{ marginTop: "auto" }}>
              <div style={sectionLabel}>ACTIONS</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <button onClick={undo} disabled={!undoStack.length} style={actionBtn}>↩ Undo (⌘Z)</button>
                <button onClick={redo} disabled={!redoStack.length} style={actionBtn}>↪ Redo (⌘⇧Z)</button>
                <button onClick={clearAll} style={{ ...actionBtn, color: "#e94560", borderColor: "#e9456033", background: "#e9456011" }}>🗑 Clear All</button>
              </div>
            </section>

            {/* Shape count */}
            <div style={{ fontSize: 10, opacity: 0.4, textAlign: "center", marginTop: 8 }}>
              {shapes.length} object{shapes.length !== 1 ? "s" : ""}
            </div>
          </aside>

          {/* ── Canvas area ── */}
          <div ref={containerRef} style={{ flex: 1, position: "relative", overflow: "hidden", background: "#121212" }}>
            <canvas ref={canvasRef} style={{
              position: "absolute", inset: 0, cursor: cursorMap[tool],
              touchAction: "none",
            }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerLeave={onPointerUp}
            />
            <canvas ref={overlayRef} style={{
              position: "absolute", inset: 0, pointerEvents: "none",
            }} />

            {/* Text input overlay */}
            {textInput && (
              <input ref={textRef} value={textValue}
                onChange={e => setTextValue(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") commitText(); if (e.key === "Escape") { setTextInput(null); setTextValue(""); } }}
                onBlur={commitText}
                style={{
                  position: "absolute",
                  left: textInput.x, top: textInput.y - fontSize,
                  background: "transparent", border: "none",
                  outline: "1px dashed #8b5cf6",
                  color, fontSize, fontFamily: "'IBM Plex Mono', monospace",
                  minWidth: 120, padding: "2px 4px", caretColor: color,
                }}
              />
            )}

            {/* Hint bar */}
            <div style={{
              position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)",
              background: "#0a0a0acc", border: "1px solid #1e1e30",
              borderRadius: 20, padding: "6px 16px", fontSize: 11, opacity: 0.7,
              backdropFilter: "blur(8px)", whiteSpace: "nowrap",
            }}>
              {tool === "text" ? "Click to place text · Enter to confirm · Esc to cancel" :
              tool === "eraser" ? "Click & drag to erase" :
              "Click & drag to draw · ⌘Z undo · ⌘⇧Z redo · shortcuts: P E L R O T"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Style helpers ────────────────────────────────────────────────────────
const sectionLabel: React.CSSProperties = {
  fontSize: 9, letterSpacing: 2, opacity: 0.45, marginBottom: 8, marginTop: 2,
};

const toolBtn = (active: boolean): React.CSSProperties => ({
  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
  gap: 2, padding: "10px 4px", borderRadius: 8, border: "1px solid",
  borderColor: active ? "#8b5cf6" : "#1e1e30",
  background: active ? "#8b5cf622" : "#1a1a2a",
  color: active ? "#c4b5fd" : "#94a3b8",
  cursor: "pointer", transition: "all .15s", fontSize: 12, fontFamily: "inherit",
});

const miniBtn: React.CSSProperties = {
  padding: "5px 10px", borderRadius: 6, border: "1px solid #1e1e30",
  color: "#e2e8f0", cursor: "pointer", fontSize: 11, fontFamily: "inherit",
};

const actionBtn: React.CSSProperties = {
  padding: "8px 10px", borderRadius: 7, border: "1px solid #1e1e30",
  background: "#1a1a2a", color: "#94a3b8", cursor: "pointer",
  fontSize: 11, fontFamily: "inherit", textAlign: "left", transition: "all .15s",
};

const rangeStyle: React.CSSProperties = { width: "100%", accentColor: "#8b5cf6" };
