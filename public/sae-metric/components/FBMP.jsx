/* global React, Binrow, Bincell, f1Stats, fbeta, annotateKinds */
const { useState, useMemo } = React;

// Fully-Binary Matching Pursuit — interactive step-through
// Uses SAE_DATA.fbmp.

function FBMPSection() {
  const data = window.SAE_DATA.fbmp;
  const [beta, setBeta] = useState(0.5);
  const [step, setStep] = useState(0); // 0 = before any selection, 1..k after each
  const [mode, setMode] = useState("fbmp"); // 'fbmp' or 'topk'
  const [maxK, setMaxK] = useState(4);
  const [naiveK, setNaiveK] = useState(3);
  const [target, setTarget] = useState(data.target);
  const [targetLabel, setTargetLabel] = useState(data.targetLabel);

  // Precompute the FBMP trajectory for given beta, target, maxK.
  // Matches paper Algorithm 1: update r and ŷ first, then check F1 — if no
  // improvement break WITHOUT adding l* to S (stopped step not in trajectory).
  const trajectory = useMemo(() => {
    const traj = [];
    let residual = [...target];
    let approx = target.map(() => 0);
    const selected = [];
    for (let it = 0; it < maxK; it++) {
      let bestI = -1, bestScore = -1;
      for (let i = 0; i < data.latents.length; i++) {
        if (selected.includes(i)) continue;
        const s = fbeta(residual, data.latents[i].z, beta);
        if (s > bestScore) { bestScore = s; bestI = i; }
      }
      if (bestI < 0) break;
      const z = data.latents[bestI].z;
      const newResidual = residual.map((r, i) => r & (1 - z[i]));
      const newApprox = approx.map((a, i) => a | z[i]);
      const f1Before = f1Stats(target, approx).F1;
      const f1After = f1Stats(target, newApprox).F1;
      if (f1After <= f1Before) break; // stopping criterion — discard l*, don't add to S
      traj.push({
        picked: bestI,
        pickedLabel: data.latents[bestI].label,
        pickedZ: z,
        residualBefore: [...residual],
        approxAfter: newApprox,
        f1Before, f1After,
        fbetaScore: bestScore,
      });
      selected.push(bestI);
      residual = newResidual;
      approx = newApprox;
    }
    return traj;
  }, [target, beta, maxK]);

  // Naive top-k by individual F1 (for comparison)
  const naiveTopK = useMemo(() => {
    const scored = data.latents.map((l, i) => ({ i, score: f1Stats(target, l.z).F1, z: l.z, label: l.label }));
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, naiveK);
  }, [target, naiveK]);

  const naiveApprox = useMemo(() => {
    let a = target.map(() => 0);
    for (const r of naiveTopK) a = a.map((v, i) => v | r.z[i]);
    return a;
  }, [naiveTopK]);

  const maxStep = trajectory.length;
  const curStep = Math.min(step, maxStep);
  const cur = curStep > 0 ? trajectory[curStep - 1] : null;
  const currentResidual = cur ? cur.residualBefore : target.map(() => 0);
  const currentApprox = cur ? cur.approxAfter : target.map(() => 0);
  const currentF1 = f1Stats(target, currentApprox).F1;
  const finalApprox = trajectory.length > 0 ? trajectory[trajectory.length - 1].approxAfter : target.map(() => 0);
  const finalF1 = f1Stats(target, finalApprox).F1;

  // toggle a target bit (mini sandbox)
  function toggleTarget(i) {
    const next = [...target];
    next[i] = 1 - next[i];
    setTarget(next);
    setStep(0);
  }

  return (
    <section id="fbmp">
      <div className="page">
        <div className="measure">
          <div className="kicker">§ 2 · The algorithm</div>
          <h2>FBMP, one iteration at a time.</h2>
          <p>
            A single SAE latent rarely captures an attribute on its own — concepts get
            <em> split </em>across multiple specialised units. <strong>Fully-Binary Matching
            Pursuit</strong> greedily assembles a small <em>coalition</em> of latents whose
            logical-OR best reconstructs the binary attribute vector. The trick: every
            operation stays in the binary domain — selection by F<sub>β</sub>, residual update by
            <span className="mono"> AND&nbsp;NOT</span>, approximation update by <span className="mono">OR</span>.
          </p>
          <p>
            Step through the toy below. Watch how the residual shrinks and the coalition&rsquo;s
            joint approximation grows, then compare against a naïve top-k baseline that just picks
            the three best individual latents.
          </p>
        </div>

        <div className="wide mt-3">
          <div className="panel">
            <div className="panel-hd">
              <span><strong>Target attribute:</strong> <span className="mono">{targetLabel}</span></span>
              <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                <div className="seg">
                  <button className={mode === "fbmp" ? "on" : ""} onClick={() => setMode("fbmp")}>FBMP</button>
                  <button className={mode === "topk" ? "on" : ""} onClick={() => setMode("topk")}>Naïve top-k</button>
                </div>
                {mode === "fbmp" && <>
                  <span className="small">β =</span>
                  <div className="seg">
                    {[0.25, 0.5, 1].map((b) =>
                      <button key={b} className={beta === b ? "on" : ""} onClick={() => {setBeta(b);setStep(0);}}>
                        F<sub>{b}</sub>
                      </button>
                    )}
                  </div>
                  <span className="small">k =</span>
                  <div className="seg">
                    {[1, 2, 3, 4].map((k) =>
                      <button key={k} className={maxK === k ? "on" : ""} onClick={() => {setMaxK(k);setStep(0);}}>
                        {k}
                      </button>
                    )}
                  </div>
                </>}
                {mode === "topk" && <>
                  <span className="small">k =</span>
                  <div className="seg">
                    {[1, 3].map((k) =>
                      <button key={k} className={naiveK === k ? "on" : ""} onClick={() => setNaiveK(k)}>
                        {k}
                      </button>
                    )}
                  </div>
                </>}
              </div>
            </div>
            <div className="panel-pad">

              <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 32 }}>

                {/* LEFT: data view */}
                <div>
                  {mode === "fbmp" &&
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {/* target */}
                      <Binrow vec={target} label="Target y" sub="ground-truth attribute" />
                      <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                        <div style={{ minWidth: 160, fontFamily: "var(--mono)", fontSize: 12, color: "var(--ink-2)" }}>
                          Residual r<sub>{curStep}</sub>
                          <div className="dim" style={{ fontSize: 10, marginTop: 2 }}>r ← r ∧ ¬z*</div>
                        </div>
                        <div className="bingrid" style={{ gridAutoColumns: "22px" }}>
                          {currentResidual.map((v, i) =>
                        <div key={i} className={`bincell ${v ? "on" : ""}`} style={{
                          outline: v ? "1.5px dashed var(--accent)" : "none",
                          outlineOffset: -2
                        }}>{v}</div>
                        )}
                        </div>
                      </div>

                      <div style={{ height: 1, background: "var(--rule-soft)", margin: "10px 0" }} />

                      {/* candidate latents */}
                      {data.latents.map((l, i) => {
                      const isPicked = trajectory.slice(0, curStep).some((t) => t.picked === i);
                      const isJustPicked = cur && cur.picked === i;
                      const score = fbeta(currentResidual, l.z, beta);
                      return (
                        <div key={i} style={{
                          display: "flex", gap: 14, alignItems: "center",
                          opacity: isPicked && !isJustPicked ? 0.4 : 1,
                          padding: "4px 6px", marginLeft: -6,
                          background: isJustPicked ? "color-mix(in oklab, var(--accent) 8%, transparent)" : "transparent",
                          borderRadius: 4
                        }}>
                            <div style={{ minWidth: 160, fontFamily: "var(--mono)", fontSize: 12, color: "var(--ink-2)" }}>
                              {l.label}
                              {isPicked && <span className="tag accent" style={{ marginLeft: 8, fontSize: 10, padding: "1px 6px" }}>picked</span>}
                            </div>
                            <div className="bingrid" style={{ gridAutoColumns: "22px" }}>
                              {l.z.map((v, j) =>
                            <div key={j} className={`bincell ${v ? "on" : ""}`}>{v}</div>
                            )}
                            </div>
                            <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: isJustPicked ? "var(--accent)" : "var(--ink-3)", marginLeft: 8, minWidth: 70 }}>
                              F<sub>{beta}</sub>={score.toFixed(2)}
                            </div>
                          </div>);

                    })}

                      <div style={{ height: 1, background: "var(--rule-soft)", margin: "10px 0" }} />

                      {/* coalition approx */}
                      <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                        <div style={{ minWidth: 160, fontFamily: "var(--mono)", fontSize: 12, color: "var(--ink-2)" }}>
                          Approx ŷ<sub>{curStep}</sub>
                          <div className="dim" style={{ fontSize: 10, marginTop: 2 }}>ŷ ← ŷ ∨ z*</div>
                        </div>
                        <div className="bingrid" style={{ gridAutoColumns: "22px" }}>
                          {currentApprox.map((v, i) =>
                        <Bincell key={i} v={v} kind={annotateKinds(target, currentApprox)[i]} />
                        )}
                        </div>
                        <div style={{ fontFamily: "var(--mono)", fontSize: 12, marginLeft: 8, color: "var(--accent)" }}>
                          F1 = {currentF1.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  }

                  {mode === "topk" &&
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <Binrow vec={target} label="Target y" />
                      <div className="small">
                        Naïve baseline: rank latents by their <em>individual</em> F1 against the target,
                        take the top {naiveK}.
                      </div>
                      {naiveTopK.map((r, i) =>
                    <div key={r.i} style={{ display: "flex", gap: 14, alignItems: "center" }}>
                          <div style={{ minWidth: 160, fontFamily: "var(--mono)", fontSize: 12, color: "var(--ink-2)" }}>
                            #{i + 1} {r.label}
                          </div>
                          <div className="bingrid" style={{ gridAutoColumns: "22px" }}>
                            {r.z.map((v, j) => <div key={j} className={`bincell ${v ? "on" : ""}`}>{v}</div>)}
                          </div>
                          <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-3)", marginLeft: 8 }}>
                            F1={r.score.toFixed(2)}
                          </div>
                        </div>
                    )}
                      <div style={{ display: "flex", gap: 14, alignItems: "center", marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--rule-soft)" }}>
                        <div style={{ minWidth: 160, fontFamily: "var(--mono)", fontSize: 12 }}>OR of top-{naiveK}</div>
                        <div className="bingrid" style={{ gridAutoColumns: "22px" }}>
                          {naiveApprox.map((v, i) =>
                        <Bincell key={i} v={v} kind={annotateKinds(target, naiveApprox)[i]} />
                        )}
                        </div>
                        <div style={{ fontFamily: "var(--mono)", fontSize: 12, marginLeft: 8, color: "var(--ink-2)" }}>
                          F1 = {f1Stats(target, naiveApprox).F1.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  }

                  <div className="small mt-2" style={{ display: "flex", gap: 14, alignItems: "center" }}>
                    <span><span style={{ display: "inline-block", width: 10, height: 10, background: "var(--pos)", marginRight: 4, verticalAlign: "middle" }} /> true positive</span>
                    <span><span style={{ display: "inline-block", width: 10, height: 10, background: "#f3d4d4", border: "1px solid var(--neg)", marginRight: 4, verticalAlign: "middle" }} /> false positive</span>
                    <span><span style={{ display: "inline-block", width: 10, height: 10, background: "#fdf6e3", border: "1px solid var(--neu)", marginRight: 4, verticalAlign: "middle" }} /> false negative</span>
                  </div>

                  {/* Step info + controls — lives below the data, left of Why β */}
                  {mode === "fbmp" &&
                  <div style={{ marginTop: 20 }}>
                    <h4>Step {curStep} of {maxStep}</h4>
                    {cur &&
                      <div style={{ background: "var(--paper-2)", padding: 12, border: "1px solid var(--rule)", borderRadius: 4, fontSize: 13, lineHeight: 1.5 }}>
                        <div>Picked: <strong>{cur.pickedLabel}</strong></div>
                        <div className="small mt-1">F<sub>{beta}</sub> on residual = {cur.fbetaScore.toFixed(3)}</div>
                        <div className="small">Joint F1: {cur.f1Before.toFixed(2)} → <strong style={{ color: "var(--pos)" }}>{cur.f1After.toFixed(2)}</strong></div>
                      </div>
                    }
                    <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                      <button className="btn" onClick={() => setStep(Math.max(0, step - 1))} disabled={curStep === 0}>← prev</button>
                      <button className="btn primary" onClick={() => setStep(Math.min(maxStep, step + 1))} disabled={curStep >= maxStep}>next →</button>
                      <button className="btn ghost tiny" onClick={() => setStep(0)}>reset</button>
                    </div>
                  </div>
                  }
                </div>

                {/* RIGHT: algorithm + explainer */}
                <div>
                  <h4>Algorithm</h4>
                  <pre style={{ fontFamily: "var(--mono)", fontSize: 11, lineHeight: 1.55, background: "var(--paper-2)", padding: 12, border: "1px solid var(--rule)", borderRadius: 4, overflow: "auto" }}>
{`r₀ ← y          # Initialize residual
ŷ₀ ← 0          # Initialize approximation
S  ← ∅          # Initialize empty subset
for κ = 0 to k−1:
  l* ← argmax_l SIMbin(rκ, zₗ)   # Select most-aligned concept
  rκ₊₁ ← rκ ∧ ¬zₗ*               # Update residual
  ŷκ₊₁ ← ŷκ ∨ zₗ*                # Update approximation
  if F₁(y, ŷκ₊₁) ≤ F₁(y, ŷκ):   # Stopping criterion
    break
  S ← S ∪ {l*}                    # Add to subset
return S`}
                  </pre>

                  <h4 className="mt-3">Why β ≤ 1?</h4>
                  <p className="small">
                    Lower β favours precision over recall when picking each new atom. Because
                    several latents will be OR&rsquo;d together, individual recall isn&rsquo;t crucial — we
                    want each pick to be <em>specific</em>. F<sub>0.5</sub> tends to win across our experiments.
                  </p>

                  <h4 className="mt-3">Try it</h4>
                  <p className="small">Click cells in the target row to flip them, then step through again.</p>
                  <div className="bingrid" style={{ gridAutoColumns: "22px", marginTop: 6 }}>
                    {target.map((v, i) =>
                    <button key={i} onClick={() => toggleTarget(i)}
                    className={`bincell ${v ? "on" : ""}`}
                    style={{ cursor: "pointer", border: "1px solid var(--rule)" }}>{v}</button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Bottom comparison bar */}
          <div style={{ marginTop: 16, padding: "14px 24px", background: "var(--paper-2)", border: "1px solid var(--rule)", borderRadius: "var(--rad)", display: "grid", gridTemplateColumns: "1fr 1px 1fr", gap: 0, alignItems: "center" }}>
            <div style={{ paddingRight: 24 }}>
              <div className="label" style={{ marginBottom: 4 }}>FBMP F<sub>{beta}</sub> — final F1 on S ({maxStep} latent{maxStep !== 1 ? "s" : ""})</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                <span style={{ fontFamily: "var(--mono)", fontSize: 28, color: maxStep > 0 ? "var(--accent)" : "var(--ink-3)" }}>
                  {maxStep > 0 ? finalF1.toFixed(2) : "—"}
                </span>
                {maxStep > 0 && <span className="small">{trajectory.map(t => t.pickedLabel.replace(/L#\d+ · /, "")).join(" + ")}</span>}
              </div>
            </div>
            <div style={{ width: 1, height: 40, background: "var(--rule)" }} />
            <div style={{ paddingLeft: 24 }}>
              <div className="label" style={{ marginBottom: 4 }}>Naïve top-{naiveK} OR baseline</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                <span style={{ fontFamily: "var(--mono)", fontSize: 28, color: "var(--ink-3)" }}>
                  {f1Stats(target, naiveApprox).F1.toFixed(2)}
                </span>
                <span className="small">F1 · {naiveTopK.map(r => r.label.replace(/L#\d+ · /, "")).join(" + ")}</span>
              </div>
            </div>
          </div>

          <div className="figcaption mt-2">
            <strong>Fig. 2.</strong> Interactive FBMP run on 5 candidate latents. Step through to see how the coalition is assembled — FBMP F<sub>0.5</sub> recovers the target with fewer latents than even the OR of the three best by individual F1. Click cells in the target row (right panel) to explore different attributes.
          </div>
        </div>
      </div>
    </section>);

}

Object.assign(window, { FBMPSection });