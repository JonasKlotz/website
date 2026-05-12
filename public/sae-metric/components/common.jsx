/* global React */
const { useState, useEffect, useRef, useMemo, useLayoutEffect } = React;

// ─────────────────────────────────────────────────────────────
// Small primitives shared by all sections
// ─────────────────────────────────────────────────────────────

function Bincell({ v, kind, size = 22 }) {
  // kind: undefined | 'tp' | 'fp' | 'fn'
  const cls = ["bincell"];
  if (kind) cls.push(kind);
  else if (v) cls.push("on");
  return (
    <div className={cls.join(" ")} style={{ width: size, height: size }}>
      {v ? 1 : 0}
    </div>
  );
}

function Binrow({ vec, kinds, size = 22, label, sub }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      {label !== undefined && (
        <div style={{ minWidth: 160, fontFamily: "var(--mono)", fontSize: 12, color: "var(--ink-2)" }}>
          {label}
          {sub && <div className="dim" style={{ fontSize: 10, marginTop: 2 }}>{sub}</div>}
        </div>
      )}
      <div className="bingrid" style={{ gridAutoColumns: `${size}px` }}>
        {vec.map((v, i) => (
          <Bincell key={i} v={v} kind={kinds ? kinds[i] : undefined} size={size} />
        ))}
      </div>
    </div>
  );
}

function ImgSlot({ src, label, ratio = "1/1", force }) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  // Preload to avoid console 404 noise — only attempt if force=true or global flag set.
  useEffect(() => {
    if (!src || !(force || window.SAE_HAS_IMAGES)) return;
    let cancelled = false;
    const img = new Image();
    img.onload = () => { if (!cancelled) setLoaded(true); };
    img.onerror = () => { if (!cancelled) setErrored(true); };
    img.src = src;
    return () => { cancelled = true; };
  }, [src]);
  return (
    <div className="imgslot" data-loaded={loaded && !errored} style={{ aspectRatio: ratio }}>
      {src && loaded && !errored && (
        <img src={src} alt={label || ""} />
      )}
      <div className="ph">
        <div style={{ fontSize: 18, marginBottom: 6 }}>◳</div>
        <div>{label || "image"}</div>
      </div>
    </div>
  );
}

// Compute F1, precision, recall on binary vectors
function f1Stats(y, yhat) {
  let tp = 0, fp = 0, fn = 0, tn = 0;
  for (let i = 0; i < y.length; i++) {
    if (y[i] === 1 && yhat[i] === 1) tp++;
    else if (y[i] === 0 && yhat[i] === 1) fp++;
    else if (y[i] === 1 && yhat[i] === 0) fn++;
    else tn++;
  }
  const eps = 1e-9;
  const P = tp / (tp + fp + eps);
  const R = tp / (tp + fn + eps);
  const F1 = 2 * P * R / (P + R + eps);
  return { tp, fp, fn, tn, P, R, F1 };
}
function fbeta(y, yhat, beta) {
  const { P, R } = f1Stats(y, yhat);
  const b2 = beta * beta;
  const eps = 1e-9;
  return (1 + b2) * P * R / (b2 * P + R + eps);
}

function annotateKinds(y, yhat) {
  return y.map((yi, i) => {
    if (yi === 1 && yhat[i] === 1) return "tp";
    if (yi === 0 && yhat[i] === 1) return "fp";
    if (yi === 1 && yhat[i] === 0) return "fn";
    return null;
  });
}

// Min SVG line/scatter helpers
function Axis({ x, y, w, h, ticks, label, dir, fmt }) {
  // dir: 'x' or 'y'
  if (dir === "x") {
    return (
      <g>
        <line x1={x} y1={y + h} x2={x + w} y2={y + h} stroke="var(--rule)" />
        {ticks.map((t, i) => {
          const xx = x + (t.v / t.max) * w;
          return (
            <g key={i}>
              <line x1={xx} y1={y + h} x2={xx} y2={y + h + 4} stroke="var(--rule)" />
              <text x={xx} y={y + h + 16} fontSize="10" textAnchor="middle" fill="var(--ink-3)" fontFamily="var(--sans)">{fmt ? fmt(t.v) : t.v}</text>
            </g>
          );
        })}
        {label && <text x={x + w / 2} y={y + h + 36} fontSize="11" textAnchor="middle" fill="var(--ink-2)" fontFamily="var(--sans)">{label}</text>}
      </g>
    );
  }
  return (
    <g>
      <line x1={x} y1={y} x2={x} y2={y + h} stroke="var(--rule)" />
      {ticks.map((t, i) => {
        const yy = y + h - (t.v / t.max) * h;
        return (
          <g key={i}>
            <line x1={x - 4} y1={yy} x2={x} y2={yy} stroke="var(--rule)" />
            <text x={x - 8} y={yy + 3} fontSize="10" textAnchor="end" fill="var(--ink-3)" fontFamily="var(--sans)">{fmt ? fmt(t.v) : t.v}</text>
          </g>
        );
      })}
      {label && <text x={x - 40} y={y + h / 2} fontSize="11" textAnchor="middle" fill="var(--ink-2)" fontFamily="var(--sans)" transform={`rotate(-90 ${x - 40} ${y + h / 2})`}>{label}</text>}
    </g>
  );
}

Object.assign(window, { Bincell, Binrow, ImgSlot, f1Stats, fbeta, annotateKinds, Axis });
