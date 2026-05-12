/* global React, ImgSlot */
const { useState, useEffect } = React;

function TAPASSection() {
  const allPairs = window.SAE_DATA.tapasPairs;
  const [dataset, setDataset] = useState("synCUB");
  const [idx, setIdx]     = useState(0);
  const [phase, setPhase] = useState("before"); // before / after / scored
  const [accum, setAccum] = useState({ add: [], rem: [] });

  const pairs = allPairs.filter(p => p.dataset === dataset);
  const p = pairs[Math.min(idx, pairs.length - 1)] || pairs[0];

  // Reset everything when switching dataset
  useEffect(() => {
    setIdx(0);
    setAccum({ add: [], rem: [] });
    setPhase("before");
  }, [dataset]);

  // Rebuild accumulator when stepping backward
  useEffect(() => {
    setAccum({
      add: pairs.slice(0, idx).map(pp => pp.deltaAdd),
      rem: pairs.slice(0, idx).map(pp => pp.deltaRem),
    });
    setPhase("before");
  }, [idx]);

  function next() {
    if (phase === "before") { setPhase("after"); return; }
    if (phase === "after")  { setPhase("scored"); return; }
    if (idx < pairs.length - 1) {
      setAccum(a => ({ add: [...a.add, p.deltaAdd], rem: [...a.rem, p.deltaRem] }));
      setIdx(idx + 1);
    }
  }
  function prev() {
    if (phase === "scored") { setPhase("after"); return; }
    if (phase === "after")  { setPhase("before"); return; }
    if (idx > 0) setIdx(idx - 1);
  }
  function reset() {
    setIdx(0); setAccum({ add: [], rem: [] }); setPhase("before");
  }

  const isCOCO    = dataset === "synCOCO";
  const showAfter = phase !== "before";
  const scored    = phase === "scored";

  // Running averages
  const allAdd = scored ? [...accum.add, p.deltaAdd] : accum.add;
  const allRem = scored ? [...accum.rem, p.deltaRem] : accum.rem;
  const mean   = arr => arr.length ? arr.reduce((s, x) => s + x, 0) / arr.length : null;
  const dAdd   = isCOCO ? 0 : mean(allAdd);
  const dRem   = mean(allRem);
  // TAPAScore = Δ_add − Δ_rem; for COCO Δ_add = 0
  const tapas  = dRem !== null ? dAdd - dRem : null;

  return (
    <section id="tapas">
      <div className="page">
        <div className="measure">
          <div className="kicker">§ 4 · Causal validation</div>
          <h2>TAPAScore: does the matched latent actually move?</h2>
          <p>
            A high matching score only proves <em>statistical</em> alignment — a latent that
            correlates with &ldquo;striped belly&rdquo; might just be a co-occurrence proxy.
            To test causality we feed the SAE a counterfactual pair and watch the latents
            matched to the perturbed attribute. Added-concept latents should fire;
            removed-concept latents should go silent.
          </p>
          <p>
            For each pair: δ<sub>add</sub> = max<sub>I<sub>add</sub></sub> ẑ<sub>bin</sub> −
            max<sub>I<sub>add</sub></sub> z<sub>bin</sub>, and δ<sub>rem</sub> = max<sub>I<sub>rem</sub></sub> ẑ<sub>bin</sub> −
            max<sub>I<sub>rem</sub></sub> z<sub>bin</sub>.
            Averaged across all pairs: TAPAScore = Δ<sub>add</sub> − Δ<sub>rem</sub>.
            For synCOCO (removal only) Δ<sub>add</sub> = 0.
          </p>
        </div>

        <div className="wide mt-3">
          {/* Dataset tabs */}
          <div style={{ display: "flex", marginBottom: 16 }}>
            {["synCUB", "synCOCO"].map((ds, i) => (
              <button key={ds} onClick={() => setDataset(ds)} style={{
                fontFamily: "var(--mono)", fontSize: 12, letterSpacing: "0.06em",
                textTransform: "uppercase", padding: "8px 22px",
                background: dataset === ds ? "var(--accent)" : "var(--card)",
                color: dataset === ds ? "#fff" : "var(--ink-2)",
                border: "1px solid var(--rule)",
                borderRadius: i === 0 ? "4px 0 0 4px" : "0 4px 4px 0",
                cursor: "pointer", transition: "background 180ms, color 180ms",
              }}>
                {ds}
              </button>
            ))}
          </div>

          <div className="panel">
            {/* Header */}
            <div className="panel-hd">
              <span>
                <strong>Pair {idx + 1} / {pairs.length}</strong>
                {" · "}<span className="mono">{p.attr}</span>
              </span>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn tiny" onClick={prev}
                  disabled={idx === 0 && phase === "before"}>← prev</button>
                <button className="btn primary tiny" onClick={next}
                  disabled={idx === pairs.length - 1 && phase === "scored"}>
                  {phase === "before" ? "perturb →" : phase === "after" ? "score →" : "next pair →"}
                </button>
                <button className="btn ghost tiny" onClick={reset}>reset</button>
              </div>
            </div>

            <div className="panel-pad">
              <div style={{
                display: "grid",
                gridTemplateColumns: isCOCO ? "1fr 1fr 200px" : "1fr 1fr 240px",
                gap: 28,
              }}>
                {/* Base image */}
                <div>
                  <div className="label">Original</div>
                  <ImgSlot src={p.pair.base} label="base" />
                </div>

                {/* Perturbed image with reveal overlay */}
                <div>
                  <div className="label">Perturbed (synthetic)</div>
                  <div style={{ position: "relative" }}>
                    <ImgSlot src={p.pair.edit} label="perturbed" />
                    <div style={{
                      position: "absolute", inset: 0, background: "var(--paper)",
                      opacity: phase === "before" ? 0.92 : 0,
                      transition: "opacity 600ms", pointerEvents: "none",
                    }} />
                  </div>
                </div>

                {/* Latent columns */}
                <div>
                  {!isCOCO && (
                    <div style={{ marginBottom: 14 }}>
                      <h4 style={{ marginBottom: 6 }}>I<sub>add</sub> · added latents</h4>
                      <LatentRows before={p.Iadd} after={p.iadd_after} labels={p.iadd_labels}
                        showAfter={showAfter} polarity="add" />
                    </div>
                  )}
                  <div>
                    <h4 style={{ marginBottom: 6 }}>I<sub>rem</sub> · removed latents</h4>
                    <LatentRows before={p.Irem} after={p.irem_after} labels={p.irem_labels}
                      showAfter={showAfter} polarity="rem" />
                  </div>
                </div>
              </div>

              {/* Per-pair δ tiles */}
              <div className="mt-3" style={{
                display: "grid",
                gridTemplateColumns: isCOCO ? "1fr 1fr" : "1fr 1fr 1fr",
                gap: 16,
              }}>
                {!isCOCO && (
                  <DeltaTile label="δ_add" value={p.deltaAdd} active={showAfter}
                    sub="max ẑ − max z  over I_add" pos />
                )}
                <DeltaTile label="δ_rem" value={p.deltaRem} active={showAfter}
                  sub="max ẑ − max z  over I_rem" />
                <DeltaTile
                  label={isCOCO ? "−δ_rem  (pair contribution)" : "δ_add − δ_rem"}
                  value={isCOCO ? -p.deltaRem : p.deltaAdd - p.deltaRem}
                  active={scored} highlight
                  sub="contribution to TAPAScore" />
              </div>

              {p.note && scored && (
                <div className="mt-2 small" style={{
                  background: "var(--paper-2)", padding: "10px 14px",
                  borderRadius: 4, borderLeft: "3px solid var(--neg)",
                }}>
                  <strong>Note:</strong> {p.note}
                </div>
              )}
            </div>

            {/* Running-average footer */}
            <div style={{ padding: "16px 28px", borderTop: "1px solid var(--rule-soft)", background: "var(--paper-2)" }}>
              {isCOCO ? (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignItems: "center" }}>
                  <AccumBar label="Δ_rem" value={dRem} n={allRem.length} N={pairs.length} />
                  <ScoreBox
                    formula={<>TAPAScore = 0 − Δ<sub>rem</sub></>}
                    value={tapas}
                    n={allRem.length}
                  />
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, alignItems: "center" }}>
                  <AccumBar label="Δ_add" value={dAdd} n={allAdd.length} N={pairs.length} pos />
                  <AccumBar label="Δ_rem" value={dRem} n={allRem.length} N={pairs.length} />
                  <ScoreBox
                    formula={<>TAPAScore = Δ<sub>add</sub> − Δ<sub>rem</sub></>}
                    value={tapas}
                    n={allAdd.length}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="figcaption">
            <strong>Fig. 4.</strong> Each pair contributes one δ<sub>rem</sub>
            {!isCOCO && " and one δ_add"}; averaged across all pairs we obtain
            TAPAScore = Δ<sub>add</sub> − Δ<sub>rem</sub>
            {isCOCO ? " (Δ_add = 0 for removal-only synCOCO)." : "."}
            {" "}A positive score means matched latents respond selectively and in the
            correct direction under targeted attribute perturbations.
          </div>
        </div>
      </div>
    </section>
  );
}

function LatentRows({ before, after, labels, showAfter, polarity }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {before.map((b, i) => {
        const a = after[i];
        const changed = showAfter && b !== a;
        const desired = polarity === "add" ? a > b : a < b;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-3)", minWidth: 38 }}>
              {labels[i] || `L${i}`}
            </div>
            <div className={`bincell ${b ? "on" : ""}`} style={{ width: 22, height: 22 }}>{b}</div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 14, color: "var(--ink-3)" }}>→</div>
            <div
              className={`bincell ${(showAfter ? a : b) ? "on" : ""}`}
              style={{
                width: 22, height: 22,
                background: changed && desired ? (polarity === "add" ? "var(--pos)" : "var(--neg)") : undefined,
                borderColor: changed && desired ? (polarity === "add" ? "var(--pos)" : "var(--neg)") : undefined,
                color: changed && desired ? "#fff" : undefined,
                transition: "all 400ms",
              }}
            >
              {showAfter ? a : b}
            </div>
            {changed && (
              <span className={"tag " + (desired ? (polarity === "add" ? "pos" : "neg") : "warn")}
                style={{ fontSize: 10 }}>
                {polarity === "add"
                  ? (a ? "fired ↑" : "off ↓")
                  : (a ? "still on" : "off ↓")}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function DeltaTile({ label, value, active, sub, pos, highlight }) {
  const color = !active
    ? "var(--ink-3)"
    : value > 0 ? "var(--pos)" : value < 0 ? "var(--neg)" : "var(--ink-3)";
  return (
    <div style={{
      border: "1px solid var(--rule)", borderRadius: 4, padding: "14px 16px",
      background: highlight ? "var(--paper-2)" : "var(--card)",
    }}>
      <div className="label" style={{ marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: "var(--mono)", fontSize: 24, color, transition: "color 400ms" }}>
        {active ? (value >= 0 ? "+" : "") + value.toFixed(2) : "—"}
      </div>
      <div className="small mt-1">{sub}</div>
    </div>
  );
}

function AccumBar({ label, value, n, N, pos }) {
  const v = value ?? 0;
  const w = Math.abs(v) * 100;
  const color = v > 0 ? "var(--pos)" : v < 0 ? "var(--neg)" : "var(--rule)";
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span className="label" style={{ marginBottom: 0 }}>{label}</span>
        <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--ink-2)" }}>
          {value === null ? "—" : (v > 0 ? "+" : "") + v.toFixed(2)}
        </span>
      </div>
      <div style={{ position: "relative", height: 10, background: "var(--card)", border: "1px solid var(--rule)", borderRadius: 2 }}>
        <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 1, background: "var(--rule)" }} />
        <div style={{
          position: "absolute",
          left: v >= 0 ? "50%" : `${50 - w / 2}%`,
          top: 0, bottom: 0,
          width: w / 2 + "%",
          background: color,
          transition: "all 600ms",
        }} />
      </div>
      <div className="small mt-1">aggregated over {n}/{N}</div>
    </div>
  );
}

function ScoreBox({ formula, value, n }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div className="label" style={{ marginBottom: 2 }}>{formula}</div>
      <div style={{ fontFamily: "var(--mono)", fontSize: 32, color: "var(--accent)" }}>
        {value === null ? "—" : (value >= 0 ? "+" : "") + value.toFixed(2)}
      </div>
      <div className="small">avg over {n} pair{n === 1 ? "" : "s"}</div>
    </div>
  );
}

Object.assign(window, { TAPASSection });
