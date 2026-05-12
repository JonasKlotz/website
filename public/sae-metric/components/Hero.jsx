/* global React, ImgSlot */
const { useState } = React;

function HeroSection() {
  const [stage, setStage] = useState(0);
  const [focus, setFocus] = useState(null); // 'add' | 'rem' | null

  // Latent firing pattern — encodes the TAPAScore logic:
  // Original: I_rem latents (idx 5) are ON (solid belly present), I_add latents (idx 1,4) are OFF
  // Perturbed: I_rem latents go OFF, I_add latents turn ON; unmatched latents (idx 0,3,8) also change
  const latentsBefore = [0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0];
  const latentsAfter  = [0, 1, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0];
  const matched    = [false, true,  false, false, true,  false, false, false, false, false, false, false]; // I_add
  const matchedRem = [false, false, false, false, false, true,  false, false, false, false, false, false]; // I_rem
  const showAfter = stage >= 2;
  const showMatch = stage >= 1;
  const showScore = stage >= 3;

  // δ readouts
  const deltaAdd = showScore ? 1.0 : 0;
  const deltaRem = showScore ? -1.0 : 0;
  const tapas = (deltaAdd - deltaRem);

  const labels = ["Encode", "Match", "Perturb", "Score"];

  return (
    <>
    <section className="hero" id="overview" style={{ paddingBottom: 0, borderTop: 0 }}>
      <div className="page">
        <div className="measure">
          <div className="kicker">A paper website · anonymous submission</div>
          <h1>Evaluating the interpretability of <span className="accent">sparse autoencoders</span> with concept annotations.</h1>
          <p className="dim" style={{ fontSize: 21, lineHeight: 1.5, color: "var(--ink-2)", marginTop: 18 }}>
            We propose a human-grounded framework that quantifies how well an SAE&rsquo;s sparse latents
            align with annotated semantic concepts — and then tests, through targeted image
            perturbations, whether those latents <em>causally</em> encode the concepts they match.
          </p>
          <div className="byline">
            <span className="chip">Anonymous · double-blind</span>
            <a href="#paper" className="chip">PDF</a>
            <a href="#code" className="chip">Code (soon)</a>
            <a href="#dataset" className="chip">synCUB / synCOCO</a>
          </div>
        </div>
      </div>
    </section>

    {window.__abstractSlot && window.__abstractSlot()}

    <section style={{ paddingTop: 16, borderTop: 0 }}>
      <div className="page">
            <div className="hero-stage" style={{ padding: "28px 32px 40px", minHeight: 540 }}>
              <div className="stage-chip">
                STAGE {stage + 1} / 4 — {["ENCODE", "MATCH", "PERTURB", "SCORE"][stage]}
              </div>

              {/* Prominent stage navigation */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                gap: 12, marginBottom: 22, flexWrap: "wrap",
              }}>
                <button
                  onClick={() => setStage(Math.max(0, stage - 1))}
                  disabled={stage === 0}
                  style={{
                    fontFamily: "var(--sans)", fontSize: 14, padding: "10px 18px", fontWeight: 500,
                    border: "1px solid " + (stage === 0 ? "var(--rule)" : "color-mix(in oklab, var(--accent) 35%, var(--rule))"),
                    borderRadius: "var(--rad)",
                    background: stage === 0 ? "var(--card)" : "color-mix(in oklab, var(--accent) 14%, var(--card))",
                    color: stage === 0 ? "var(--ink-3)" : "var(--accent-ink)",
                    cursor: stage === 0 ? "not-allowed" : "pointer",
                    opacity: stage === 0 ? 0.55 : 1,
                    transition: "all .12s ease",
                  }}
                  aria-label="Previous stage"
                >← prev</button>
                <div className="seg" style={{ boxShadow: "var(--shadow-1)" }}>
                  {labels.map((l, i) => (
                    <button key={l}
                            className={stage === i ? "on" : ""}
                            onClick={() => setStage(i)}
                            style={{ fontSize: 13, padding: "10px 18px", fontWeight: 500 }}>
                      <span style={{ fontFamily: "var(--mono)", marginRight: 6, opacity: 0.55 }}>{i + 1}</span>{l}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setStage(Math.min(3, stage + 1))}
                  disabled={stage === 3}
                  style={{
                    fontFamily: "var(--sans)", fontSize: 14, padding: "10px 18px", fontWeight: 500,
                    border: "1px solid " + (stage === 3 ? "var(--rule)" : "color-mix(in oklab, var(--accent) 35%, var(--rule))"),
                    borderRadius: "var(--rad)",
                    background: stage === 3 ? "var(--card)" : "color-mix(in oklab, var(--accent) 14%, var(--card))",
                    color: stage === 3 ? "var(--ink-3)" : "var(--accent-ink)",
                    cursor: stage === 3 ? "not-allowed" : "pointer",
                    opacity: stage === 3 ? 0.55 : 1,
                    transition: "all .12s ease",
                  }}
                  aria-label="Next stage"
                >next →</button>
              </div>

              <div className="row" style={{ gap: 32, alignItems: "stretch" }}>
                {/* Left: image + caption */}
                <div style={{ flex: "0 0 220px", display: "flex", flexDirection: "column", gap: 18 }}>
                  <div>
                    <div className="label">Original</div>
                    <ImgSlot src="/images/sae-metric/hero/catbird-orig.png" label="bird · solid belly" force />
                  </div>
                  <div style={{ opacity: showAfter ? 1 : 0.15, transition: "opacity 400ms" }}>
                    <div className="label">Perturbed (synCUB)</div>
                    <ImgSlot src="/images/sae-metric/hero/catbird-syn.png" label="bird · striped belly" force />
                  </div>
                </div>

                {/* Right column: latents → concepts → readouts */}
                <div style={{ flex: 1, position: "relative", display: "flex", flexDirection: "column" }}>
                  <div className="label">SAE latents (12 of L)</div>
                  <HeroLatents
                    before={latentsBefore}
                    after={latentsAfter}
                    matched={showMatch ? matched : Array(12).fill(false)}
                    matchedRem={showMatch ? matchedRem : Array(12).fill(false)}
                    showAfter={showAfter}
                    focus={focus}
                  />

                  <div style={{ marginTop: 24 }}>
                    <div className="label">Matched concepts</div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", minHeight: 28 }}>
                      <ConceptTag
                        kind="add"
                        label={<>latents matched to the added concept: &ldquo;striped belly pattern&rdquo;</>}
                        visible={showMatch}
                        active={focus === "add"}
                        onClick={() => setFocus(focus === "add" ? null : "add")}
                      />
                      <ConceptTag
                        kind="rem"
                        label={<>latents matched to the removed concept: &ldquo;solid belly pattern&rdquo;</>}
                        visible={showMatch}
                        active={focus === "rem"}
                        onClick={() => setFocus(focus === "rem" ? null : "rem")}
                      />
                    </div>
                    <div className="small" style={{ marginTop: 6, color: "var(--ink-3)", minHeight: 18 }}>
                      {showMatch ? "Click a concept to highlight its matched latents." : "\u00A0"}
                    </div>
                  </div>

                  {/* Readouts: δ bars row, then TAPAScore box below */}
                  <div style={{ marginTop: 28 }}>
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 32,
                      alignItems: "start",
                    }}>
                      <div>
                        <div className="label">δ readouts</div>
                        <DeltaBar label="δ_add" value={deltaAdd} pos highlighted={focus === "add"} />
                        <DeltaBar label="δ_rem" value={deltaRem} highlighted={focus === "rem"} />
                      </div>
                      <div className="small" style={{ color: "var(--ink-3)", lineHeight: 1.55, paddingTop: 22 }}>
                        For each matched set, fire-or-not is aggregated over its latents (logical OR).
                        δ is the signed change between the original and the perturbed image.
                      </div>
                    </div>

                    <div style={{
                      marginTop: 22,
                      padding: "16px 24px",
                      border: "2px solid " + (showScore ? "var(--accent)" : "var(--rule)"),
                      borderRadius: 6,
                      background: showScore ? "color-mix(in oklab, var(--accent) 6%, var(--card))" : "var(--card)",
                      boxShadow: showScore ? "var(--shadow-1)" : "none",
                      transition: "all 400ms",
                      display: "flex", alignItems: "center", gap: 28, flexWrap: "wrap",
                    }}>
                      <div>
                        <div className="label" style={{ marginBottom: 4, color: showScore ? "var(--accent-ink)" : undefined }}>TAPAScore</div>
                        <div style={{ fontFamily: "var(--mono)", fontSize: 40, lineHeight: 1, color: showScore ? "var(--accent)" : "var(--ink-3)", transition: "color 400ms", fontWeight: 600 }}>
                          {showScore ? "+" + tapas.toFixed(2) : "—"}
                        </div>
                      </div>
                      <div className="small" style={{ flex: 1, minWidth: 180, color: "var(--ink-2)" }}>
                        Δ<sub>add</sub> − Δ<sub>rem</sub>, averaged over all paired images.
                        A positive score indicates matched latents respond in the expected direction under targeted perturbations.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="figcaption" style={{ marginTop: 28, borderTop: "1px solid var(--rule-soft)", paddingTop: 16 }}>
                <strong style={{ color: "var(--ink)" }}>Fig. 1.</strong> Click through the stages to step through the framework.
                A pretrained vision encoder produces an embedding; the SAE encodes it into sparse latents;
                a coalition of latents is matched to each annotated attribute; a targeted single-attribute
                perturbation then tests whether the matched latents move in the expected direction.
              </div>
            </div>
      </div>
    </section>
    </>
  );
}

function ConceptTag({ kind, label, visible, active, onClick }) {
  const isAdd = kind === "add";
  const color = isAdd ? "var(--pos)" : "var(--neg)";
  const bgBase = isAdd
    ? "color-mix(in oklab, var(--pos) 10%, var(--card))"
    : "color-mix(in oklab, var(--neg) 10%, var(--card))";
  const bgActive = isAdd
    ? "color-mix(in oklab, var(--pos) 18%, var(--card))"
    : "color-mix(in oklab, var(--neg) 16%, var(--card))";
  return (
    <button
      onClick={onClick}
      disabled={!visible}
      className="tag"
      style={{
        opacity: visible ? 1 : 0.15,
        transition: "all 240ms",
        cursor: visible ? "pointer" : "default",
        color,
        borderColor: visible ? color : "var(--rule)",
        background: active ? bgActive : (visible ? bgBase : "var(--card)"),
        boxShadow: active ? "0 0 0 1px " + color : "none",
        fontFamily: "var(--sans)",
        fontSize: 13,
      }}
      aria-pressed={active}
    >{label}</button>
  );
}

function HeroLatents({ before, after, matched, matchedRem, showAfter, focus }) {
  const dimAdd = focus === "rem";
  const dimRem = focus === "add";
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 6 }}>
        <div style={{ minWidth: 100, fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-3)" }}>z<sub>bin</sub></div>
        <div style={{ display: "flex", gap: 4 }}>
          {before.map((v, i) => {
            const isAdd = matched[i], isRem = matchedRem[i];
            const dim = (isAdd && dimAdd) || (isRem && dimRem);
            const emph = (isAdd && focus === "add") || (isRem && focus === "rem");
            const bg = isAdd
              ? (v ? "color-mix(in oklab, var(--pos) 72%, var(--card))" : "color-mix(in oklab, var(--pos) 16%, var(--card))")
              : isRem
              ? (v ? "color-mix(in oklab, var(--neg) 72%, var(--card))" : "color-mix(in oklab, var(--neg) 16%, var(--card))")
              : undefined;
            return (
              <div key={i} className={`bincell ${v && !isAdd && !isRem ? "on" : ""}`} style={{
                width: 28, height: 28,
                background: bg,
                borderColor: isAdd ? "var(--pos)" : isRem ? "var(--neg)" : undefined,
                color: (isAdd || isRem) ? (v ? "#fff" : isAdd ? "var(--pos)" : "var(--neg)") : undefined,
                opacity: focus && !isAdd && !isRem ? 0.45 : dim ? 0.4 : 1,
                boxShadow: emph ? (isAdd ? "0 0 0 4px color-mix(in oklab, var(--pos) 28%, transparent)" : "0 0 0 4px color-mix(in oklab, var(--neg) 28%, transparent)") : "none",
                transition: "all 300ms",
              }}>{v}</div>
            );
          })}
        </div>
      </div>
      <div style={{ display: "flex", gap: 14, alignItems: "center", opacity: showAfter ? 1 : 0.35, transition: "opacity 400ms" }}>
        <div style={{ minWidth: 100, fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-3)" }}>ẑ<sub>bin</sub></div>
        <div style={{ display: "flex", gap: 4 }}>
          {after.map((v, i) => {
            const changed = showAfter && v !== before[i];
            const isAdd = matched[i], isRem = matchedRem[i];
            const dim = (isAdd && dimAdd) || (isRem && dimRem);
            const emph = (isAdd && focus === "add") || (isRem && focus === "rem");
            const bg = isAdd
              ? (v ? "color-mix(in oklab, var(--pos) 72%, var(--card))" : "color-mix(in oklab, var(--pos) 16%, var(--card))")
              : isRem
              ? (v ? "color-mix(in oklab, var(--neg) 72%, var(--card))" : "color-mix(in oklab, var(--neg) 16%, var(--card))")
              : (changed && v ? "var(--accent)" : undefined);
            return (
              <div key={i} className={`bincell ${v && !isAdd && !isRem && !changed ? "on" : ""}`} style={{
                width: 28, height: 28,
                background: bg,
                borderColor: isAdd ? "var(--pos)" : isRem ? "var(--neg)" : (changed && v ? "var(--accent)" : undefined),
                color: (isAdd || isRem) ? (v ? "#fff" : isAdd ? "var(--pos)" : "var(--neg)") : (changed && v ? "#fff" : undefined),
                opacity: focus && !isAdd && !isRem ? 0.45 : dim ? 0.4 : 1,
                boxShadow: emph ? (isAdd ? "0 0 0 4px color-mix(in oklab, var(--pos) 28%, transparent)" : "0 0 0 4px color-mix(in oklab, var(--neg) 28%, transparent)") : "none",
                transition: "all 300ms",
              }}>{v}</div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function DeltaBar({ label, value, pos, highlighted }) {
  const max = 1;
  const w = Math.abs(value) / max * 100;
  const color = value > 0 ? "var(--pos)" : value < 0 ? "var(--neg)" : "var(--rule)";
  return (
    <div style={{ marginBottom: 12, opacity: highlighted === false ? 0.45 : 1, transition: "opacity 240ms" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontFamily: "var(--mono)", fontSize: 12, fontWeight: highlighted ? 600 : 400 }}>{label}</span>
        <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--ink-3)" }}>
          {value === 0 ? "—" : (value > 0 ? "+" : "") + value.toFixed(2)}
        </span>
      </div>
      <div style={{ position: "relative", height: highlighted ? 10 : 8, background: "var(--paper-2)", borderRadius: 2, overflow: "hidden", transition: "height 240ms" }}>
        <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 1, background: "var(--rule)" }} />
        <div style={{
          position: "absolute",
          left: value >= 0 ? "50%" : `${50 - w / 2}%`,
          top: 0, bottom: 0,
          width: w / 2 + "%",
          background: color,
          transition: "all 500ms",
        }} />
      </div>
    </div>
  );
}

Object.assign(window, { HeroSection });
