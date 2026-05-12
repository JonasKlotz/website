/* global React, ImgSlot */
const { useState, useEffect } = React;

function TAPASSection() {
  const pairs = window.SAE_DATA.tapasPairs;
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState("before"); // before / after / scored
  const [accum, setAccum] = useState({ add: [], rem: [] });
  const [auto, setAuto] = useState(false);

  const p = pairs[idx];

  // Reset accumulator if we jump backwards
  useEffect(() => {
    setAccum({
      add: pairs.slice(0, idx).map(pp => pp.deltaAdd),
      rem: pairs.slice(0, idx).map(pp => pp.deltaRem),
    });
    setPhase("before");
  }, [idx]);

  useEffect(() => {
    if (!auto) return;
    const id = setTimeout(() => {
      if (phase === "before") setPhase("after");
      else if (phase === "after") setPhase("scored");
      else if (phase === "scored") {
        if (idx < pairs.length - 1) {
          setAccum(a => ({ add: [...a.add, p.deltaAdd], rem: [...a.rem, p.deltaRem] }));
          setIdx(idx + 1);
        } else {
          setAuto(false);
        }
      }
    }, phase === "scored" ? 1400 : 900);
    return () => clearTimeout(id);
  }, [auto, phase, idx]);

  function next() {
    if (phase === "before") setPhase("after");
    else if (phase === "after") setPhase("scored");
    else {
      if (idx < pairs.length - 1) {
        setAccum(a => ({ add: [...a.add, p.deltaAdd], rem: [...a.rem, p.deltaRem] }));
        setIdx(idx + 1);
      }
    }
  }
  function prev() {
    if (phase === "scored") setPhase("after");
    else if (phase === "after") setPhase("before");
    else if (idx > 0) setIdx(idx - 1);
  }
  function reset() {
    setIdx(0); setAccum({ add: [], rem: [] }); setPhase("before"); setAuto(false);
  }

  // ΔAdd, ΔRem, TAPAScore running averages
  const includeCurrent = phase === "scored";
  const allAdd = includeCurrent ? [...accum.add, p.deltaAdd] : accum.add;
  const allRem = includeCurrent ? [...accum.rem, p.deltaRem] : accum.rem;
  const mean = arr => arr.length ? arr.reduce((s, x) => s + x, 0) / arr.length : 0;
  const dAdd = mean(allAdd);
  const dRem = mean(allRem);
  const tapas = dAdd - dRem;

  // Latent firing display
  const showAfter = phase !== "before";

  return (
    <section id="tapas">
      <div className="page">
        <div className="measure">
          <div className="kicker">§ 4 · Causal validation</div>
          <h2>TAPAScore: does the matched latent actually move?</h2>
          <p>
            A high matching score only proves <em>statistical</em> alignment — a latent that
            correlates with &ldquo;striped belly&rdquo; might just be a co-occurrence proxy. To test
            causality, we feed the SAE a counterfactual pair and watch the latents matched to
            the perturbed attribute. The added-concept latents should switch <em>on</em>; the
            removed-concept latents should switch <em>off</em>.
          </p>
        </div>

        <div className="wide mt-3">
          <div className="panel">
            <div className="panel-hd">
              <span><strong>Pair {idx + 1} / {pairs.length}</strong> · <span className="mono">{p.dataset}</span> · {p.attr}</span>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn tiny" onClick={prev} disabled={idx === 0 && phase === "before"}>← prev</button>
                <button className="btn primary tiny" onClick={next}
                  disabled={idx === pairs.length - 1 && phase === "scored"}>
                  {phase === "before" ? "perturb →" : phase === "after" ? "score →" : "next pair →"}
                </button>
                <button className="btn ghost tiny" onClick={() => setAuto(a => !a)}>{auto ? "⏸ pause" : "▶ play"}</button>
                <button className="btn ghost tiny" onClick={reset}>reset</button>
              </div>
            </div>
            <div className="panel-pad">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 300px", gap: 28 }}>

                {/* Images */}
                <div>
                  <div className="label">Original</div>
                  <ImgSlot src={p.pair.base} label="base" />
                </div>
                <div>
                  <div className="label">Perturbed (synthetic)</div>
                  <div style={{ position: "relative" }}>
                    <ImgSlot src={p.pair.edit} label="perturbed" />
                    <div style={{
                      position: "absolute", inset: 0, background: "var(--paper)",
                      opacity: phase === "before" ? 0.92 : 0, transition: "opacity 600ms",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      pointerEvents: "none",
                      fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-3)",
                    }}>
                      &nbsp;
                    </div>
                  </div>
                </div>

                {/* Latents column */}
                <div>
                  <h4 style={{ marginBottom: 6 }}>I<sub>add</sub> · added latents</h4>
                  {p.Iadd.length === 0 && <div className="small dim" style={{ marginBottom: 14 }}>
                    (removal-only pair — no I<sub>add</sub>)
                  </div>}
                  <LatentRows before={p.Iadd} after={p.iadd_after} labels={p.iadd_labels} showAfter={showAfter} polarity="add" />
                  <h4 className="mt-2">I<sub>rem</sub> · removed latents</h4>
                  <LatentRows before={p.Irem} after={p.irem_after} labels={p.irem_labels} showAfter={showAfter} polarity="rem" />
                </div>
              </div>

              {/* Single-pair δ readout */}
              <div className="mt-3" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                <DeltaTile label="δ_add" value={p.deltaAdd} active={showAfter} sub="max ẑ ‒ max z over I_add" pos />
                <DeltaTile label="δ_rem" value={p.deltaRem} active={showAfter} sub="max ẑ ‒ max z over I_rem" />
                <DeltaTile label="δ_add − δ_rem" value={p.deltaAdd - p.deltaRem} active={phase === "scored"} sub="contribution to TAPAScore" highlight />
              </div>

              {p.note && phase !== "before" && (
                <div className="mt-2 small" style={{ background: "var(--paper-2)", padding: "10px 14px", borderRadius: 4, borderLeft: "3px solid var(--neg)" }}>
                  <strong>Note:</strong> {p.note}
                </div>
              )}
            </div>
            <div style={{ padding: "16px 28px", borderTop: "1px solid var(--rule-soft)", background: "var(--paper-2)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, alignItems: "center" }}>
                <AccumBar label="Δ_add" value={dAdd} n={allAdd.length} N={pairs.length} pos />
                <AccumBar label="Δ_rem" value={dRem} n={allRem.length} N={pairs.length} />
                <div style={{ textAlign: "center" }}>
                  <div className="label" style={{ marginBottom: 2 }}>TAPAScore (running)</div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 32, color: "var(--accent)" }}>
                    {tapas >= 0 ? "+" : ""}{tapas.toFixed(2)}
                  </div>
                  <div className="small">avg over {allAdd.length} pair{allAdd.length === 1 ? "" : "s"}</div>
                </div>
              </div>
            </div>
          </div>
          <div className="figcaption">
            <strong>Fig. 4.</strong> Each pair contributes one δ<sub>add</sub> and one δ<sub>rem</sub>; averaged
            across all pairs we obtain Δ<sub>add</sub>, Δ<sub>rem</sub>, and finally TAPAScore = Δ<sub>add</sub> − Δ<sub>rem</sub>.
            A positive TAPAScore means the matched latents move in the right direction.
          </div>
        </div>
      </div>
    </section>
  );
}

function LatentRows({ before, after, labels, showAfter, polarity }) {
  const rows = before.length;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {Array.from({ length: rows }).map((_, i) => {
        const b = before[i], a = after[i];
        const changed = showAfter && b !== a;
        const desired = polarity === "add" ? a > b : a < b;
        const wrong = changed && !desired;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-3)", minWidth: 38 }}>{labels[i] || `L${i}`}</div>
            <div className={`bincell ${b ? "on" : ""}`} style={{ width: 22, height: 22 }}>{b}</div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 14, color: "var(--ink-3)" }}>→</div>
            <div className={`bincell ${(showAfter ? a : b) ? "on" : ""}`}
                 style={{
                   width: 22, height: 22,
                   background: changed && desired ? (polarity === "add" ? "var(--pos)" : "var(--neg)") : undefined,
                   borderColor: changed && desired ? (polarity === "add" ? "var(--pos)" : "var(--neg)") : undefined,
                   color: changed && desired ? "#fff" : undefined,
                   transition: "all 400ms",
                 }}>
              {showAfter ? a : b}
            </div>
            {changed && (
              <span className={"tag " + (desired ? (polarity === "add" ? "pos" : "neg") : "warn")} style={{ fontSize: 10 }}>
                {polarity === "add" ? (a ? "fired ↑" : "off") : (a ? "still on" : "off ↓")}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function DeltaTile({ label, value, active, sub, pos, highlight }) {
  const color = !active ? "var(--ink-3)" : value > 0 ? "var(--pos)" : value < 0 ? "var(--neg)" : "var(--ink-3)";
  return (
    <div style={{ border: "1px solid var(--rule)", borderRadius: 4, padding: "14px 16px", background: highlight ? "var(--paper-2)" : "var(--card)" }}>
      <div className="label" style={{ marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: "var(--mono)", fontSize: 24, color, transition: "color 400ms" }}>
        {active ? (value >= 0 ? "+" : "") + value.toFixed(2) : "—"}
      </div>
      <div className="small mt-1">{sub}</div>
    </div>
  );
}

function AccumBar({ label, value, n, N, pos }) {
  const w = Math.abs(value) * 100;
  const color = value > 0 ? "var(--pos)" : value < 0 ? "var(--neg)" : "var(--rule)";
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span className="label" style={{ marginBottom: 0 }}>{label}</span>
        <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--ink-2)" }}>
          {value === 0 ? "—" : (value > 0 ? "+" : "") + value.toFixed(2)}
        </span>
      </div>
      <div style={{ position: "relative", height: 10, background: "var(--card)", border: "1px solid var(--rule)", borderRadius: 2 }}>
        <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 1, background: "var(--rule)" }} />
        <div style={{
          position: "absolute",
          left: value >= 0 ? "50%" : `${50 - w / 2}%`,
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

Object.assign(window, { TAPASSection });
