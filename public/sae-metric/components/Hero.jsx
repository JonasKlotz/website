/* global React, ImgSlot */
const { useState, useEffect, useRef } = React;

// Scroll-driven hero: as user scrolls, the cartoon walkthrough animates
// through (1) SAE latents lighting up, (2) matching to concept, (3) synthetic
// pair appearing, (4) δ_add / δ_rem readouts updating.

function HeroSection() {
  const wrapRef = useRef(null);
  const [p, setP] = useState(0); // 0..1 scroll progress within section
  const [focus, setFocus] = useState(null); // 'add' | 'rem' | null

  useEffect(() => {
    function onScroll() {
      if (!wrapRef.current) return;
      const rect = wrapRef.current.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const scrolled = -rect.top;
      const t = Math.max(0, Math.min(1, scrolled / total));
      setP(t);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // 4 stages: 0..0.25 encode, 0.25..0.5 match, 0.5..0.75 perturb, 0.75..1 score
  const stage =
    p < 0.22 ? 0 :
    p < 0.46 ? 1 :
    p < 0.72 ? 2 : 3;

  // latent firing pattern
  const latentsBefore = [0, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 0];
  const latentsAfter  = [1, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0];
  const matched = [false, true, false, false, true, false, false, false, false, false, false, false]; // I_add
  const matchedRem = [false, false, false, false, false, true, false, false, false, false, false, false]; // I_rem
  const showAfter = stage >= 2;
  const showMatch = stage >= 1;
  const showScore = stage >= 3;

  // δ readouts
  const deltaAdd = showScore ? 0.86 : 0;
  const deltaRem = showScore ? -0.74 : 0;
  const tapas = (deltaAdd - deltaRem);

  // Programmatic scroll to a stage (0..3)
  function scrollToStage(target) {
    if (!wrapRef.current) return;
    // Midpoints of each stage band: [0..0.22], [0.22..0.46], [0.46..0.72], [0.72..1]
    const mids = [0.06, 0.30, 0.55, 0.85];
    const rect = wrapRef.current.getBoundingClientRect();
    const total = rect.height - window.innerHeight;
    const top = window.scrollY + rect.top + mids[target] * total;
    window.scrollTo({ top, behavior: "smooth" });
  }
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

    <section style={{ paddingTop: 0, borderTop: 0 }}>
      {/* The animated walkthrough */}
      <div ref={wrapRef} style={{ position: "relative", height: "320vh", marginTop: 80 }}>
        <div className="hero-track" style={{ position: "sticky", top: 70, height: "calc(100vh - 70px)", display: "flex", alignItems: "center" }}>
          <div className="page" style={{ width: "100%" }}>
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
                  onClick={() => scrollToStage(Math.max(0, stage - 1))}
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
                            onClick={() => scrollToStage(i)}
                            style={{ fontSize: 13, padding: "10px 18px", fontWeight: 500 }}>
                      <span style={{ fontFamily: "var(--mono)", marginRight: 6, opacity: 0.55 }}>{i + 1}</span>{l}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => scrollToStage(Math.min(3, stage + 1))}
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
                    after={showAfter ? latentsAfter : latentsBefore}
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
                        label={<>I<sub>add</sub> · &ldquo;striped belly pattern&rdquo;</>}
                        visible={showMatch}
                        active={focus === "add"}
                        onClick={() => setFocus(focus === "add" ? null : "add")}
                      />
                      <ConceptTag
                        kind="rem"
                        label={<>I<sub>rem</sub> · &ldquo;solid belly pattern&rdquo;</>}
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
                <strong style={{ color: "var(--ink)" }}>Fig. 1.</strong> Scroll to step through the framework.
                A pretrained vision encoder produces an embedding; the SAE encodes it into sparse latents;
                a coalition of latents is matched to each annotated attribute; a targeted single-attribute
                perturbation then tests whether the matched latents move in the expected direction.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    </>
  );
}

function ConceptTag({ kind, label, visible, active, onClick }) {
  const isAdd = kind === "add";
  const color = isAdd ? "var(--accent)" : "var(--neg)";
  const bgActive = isAdd
    ? "color-mix(in oklab, var(--accent) 14%, var(--card))"
    : "color-mix(in oklab, var(--neg) 12%, var(--card))";
  return (
    <button
      onClick={onClick}
      disabled={!visible}
      className="tag"
      style={{
        opacity: visible ? 1 : 0.15,
        transition: "all 240ms",
        cursor: visible ? "pointer" : "default",
        color: isAdd ? "var(--accent-ink)" : "var(--neg)",
        borderColor: active ? color : "var(--rule)",
        background: active ? bgActive : "var(--card)",
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
            return (
              <div key={i} className={`bincell ${v ? "on" : ""}`} style={{
                width: 28, height: 28,
                outline: isAdd ? `${emph ? 3 : 2}px solid var(--accent)` :
                          isRem ? `${emph ? 3 : 2}px solid var(--neg)` : "none",
                outlineOffset: emph ? 2 : 1,
                opacity: focus && !isAdd && !isRem ? 0.45 : 1,
                filter: dim ? "saturate(0.4)" : "none",
                boxShadow: emph ? (isAdd ? "0 0 0 4px color-mix(in oklab, var(--accent) 22%, transparent)" : "0 0 0 4px color-mix(in oklab, var(--neg) 22%, transparent)") : "none",
                transition: "all 300ms",
              }}>{v}</div>
            );
          })}
        </div>
      </div>
      <div style={{ display: "flex", gap: 14, alignItems: "center", opacity: showAfter ? 1 : 0.2, transition: "opacity 400ms" }}>
        <div style={{ minWidth: 100, fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-3)" }}>ẑ<sub>bin</sub></div>
        <div style={{ display: "flex", gap: 4 }}>
          {after.map((v, i) => {
            const changed = showAfter && v !== before[i];
            const isAdd = matched[i], isRem = matchedRem[i];
            const dim = (isAdd && dimAdd) || (isRem && dimRem);
            const emph = (isAdd && focus === "add") || (isRem && focus === "rem");
            return (
              <div key={i} className={`bincell ${v ? "on" : ""}`} style={{
                width: 28, height: 28,
                outline: isAdd ? `${emph ? 3 : 2}px solid var(--accent)` :
                          isRem ? `${emph ? 3 : 2}px solid var(--neg)` : "none",
                outlineOffset: emph ? 2 : 1,
                opacity: focus && !isAdd && !isRem ? 0.45 : 1,
                filter: dim ? "saturate(0.4)" : "none",
                background: changed && v ? "var(--accent)" : undefined,
                borderColor: changed && v ? "var(--accent)" : undefined,
                color: changed && v ? "#fff" : undefined,
                boxShadow: emph ? (isAdd ? "0 0 0 4px color-mix(in oklab, var(--accent) 22%, transparent)" : "0 0 0 4px color-mix(in oklab, var(--neg) 22%, transparent)") : "none",
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
