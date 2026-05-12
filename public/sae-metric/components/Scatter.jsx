/* global React, Axis */
const { useState, useMemo } = React;

function ScatterSection() {
  const C = window.SAE_DATA.correlation;
  const [dataset, setDataset] = useState("synCUB");
  const [criterion, setCriterion] = useState("FBMP F0.5");
  const [hover, setHover] = useState(null);

  const variantColors = { BatchTopK: "var(--accent)", Matryoshka: "#2d8a5a", TopK: "#b53a3a", JumpReLU: "#6e3aaa" };
  const variantShapes = { BatchTopK: "circle", Matryoshka: "diamond", TopK: "triangle", JumpReLU: "square" };

  const block = C[dataset][criterion];
  const W = 560, H = 380, padL = 56, padR = 24, padT = 24, padB = 56;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  function xp(v) { return padL + v * innerW; }
  function yp(v) { return padT + (1 - v) * innerH; }

  // Fit a linear regression line on visible points
  const fit = useMemo(() => {
    const xs = block.points.map(p => p.match);
    const ys = block.points.map(p => p.tapa);
    const n = xs.length;
    const mx = xs.reduce((s, x) => s + x, 0) / n;
    const my = ys.reduce((s, x) => s + x, 0) / n;
    let num = 0, den = 0;
    for (let i = 0; i < n; i++) { num += (xs[i] - mx) * (ys[i] - my); den += (xs[i] - mx) ** 2; }
    const slope = num / (den || 1);
    const intercept = my - slope * mx;
    return { slope, intercept };
  }, [block]);

  return (
    <section id="scatter">
      <div className="page">
        <div className="measure">
          <div className="kicker">§ 7 · Correlation</div>
          <h2>When matching predicts causality — and when it doesn't.</h2>
          <p>
            Each point is one SAE configuration (variant × dictionary size). On synCUB,
            matching score and TAPAScore are strongly positively correlated under FBMP F<sub>0.5</sub>.
            On synCOCO that correlation weakens or flips — overcompleteness drives a divergence
            where matching keeps improving but causal alignment doesn&rsquo;t.
          </p>
        </div>

        <div className="wide mt-3">
          <div className="panel">
            <div className="panel-hd" style={{ flexWrap: "wrap", gap: 12 }}>
              <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
                <div><span className="label" style={{ display: "inline", marginRight: 6 }}>Dataset</span>
                  <div className="seg">
                    {["synCUB", "synCOCO"].map(d => (
                      <button key={d} className={dataset === d ? "on" : ""} onClick={() => setDataset(d)}>{d}</button>
                    ))}
                  </div>
                </div>
                <div><span className="label" style={{ display: "inline", marginRight: 6 }}>Criterion</span>
                  <select className="sel" value={criterion} onChange={e => setCriterion(e.target.value)}>
                    {Object.keys(C[dataset]).map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div className="label" style={{ marginBottom: 0 }}>Pearson r</div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 22, color: block.r > 0 ? "var(--pos)" : "var(--neg)" }}>
                  {block.r >= 0 ? "+" : ""}{block.r.toFixed(2)}
                </div>
              </div>
            </div>
            <div className="panel-pad">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 240px", gap: 24 }}>
                <svg width={W} height={H} style={{ maxWidth: "100%" }}>
                  {/* gridlines */}
                  {[0.25, 0.5, 0.75].map(t => (
                    <g key={t}>
                      <line x1={xp(t)} x2={xp(t)} y1={padT} y2={padT + innerH} stroke="var(--rule-soft)" strokeDasharray="2 4" />
                      <line x1={padL} x2={padL + innerW} y1={yp(t)} y2={yp(t)} stroke="var(--rule-soft)" strokeDasharray="2 4" />
                    </g>
                  ))}
                  {/* axes */}
                  <Axis x={padL} y={padT} w={innerW} h={innerH} dir="x"
                    ticks={[0, 0.25, 0.5, 0.75, 1].map(t => ({ v: t, max: 1 }))}
                    label="MATCHScore" fmt={v => v.toFixed(2)} />
                  <Axis x={padL} y={padT} w={innerW} h={innerH} dir="y"
                    ticks={[0, 0.25, 0.5, 0.75, 1].map(t => ({ v: t, max: 1 }))}
                    label="TAPAScore" fmt={v => v.toFixed(2)} />

                  {/* regression line */}
                  <line x1={xp(0)} y1={yp(fit.intercept)}
                        x2={xp(1)} y2={yp(fit.intercept + fit.slope)}
                        stroke="var(--accent)" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6" />

                  {/* points */}
                  {block.points.map((p, i) => {
                    const cx = xp(Math.max(0, Math.min(1, p.match)));
                    const cy = yp(Math.max(0, Math.min(1, p.tapa)));
                    const isHover = hover && hover.variant === p.variant && hover.dictSize === p.dictSize;
                    const size = 4 + Math.log2(p.dictSize / 64) * 1.5;
                    const color = variantColors[p.variant];
                    const shape = variantShapes[p.variant];
                    return (
                      <g key={i}
                         onMouseEnter={() => setHover(p)}
                         onMouseLeave={() => setHover(null)}
                         style={{ cursor: "pointer" }}>
                        {shape === "circle" && (
                          <circle cx={cx} cy={cy} r={size} fill={color} fillOpacity={isHover ? 1 : 0.65} stroke={color} strokeWidth="1.5" />
                        )}
                        {shape === "diamond" && (
                          <polygon points={`${cx},${cy - size} ${cx + size},${cy} ${cx},${cy + size} ${cx - size},${cy}`}
                                   fill={color} fillOpacity={isHover ? 1 : 0.65} stroke={color} strokeWidth="1.5" />
                        )}
                        {shape === "triangle" && (
                          <polygon points={`${cx},${cy - size} ${cx + size},${cy + size * 0.8} ${cx - size},${cy + size * 0.8}`}
                                   fill={color} fillOpacity={isHover ? 1 : 0.65} stroke={color} strokeWidth="1.5" />
                        )}
                      </g>
                    );
                  })}
                </svg>

                <div>
                  <div className="label">Legend</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, fontFamily: "var(--sans)", fontSize: 12 }}>
                    {["BatchTopK", "Matryoshka", "TopK", "JumpReLU"].map(v => (
                      <div key={v} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <svg width="14" height="14">
                          {variantShapes[v] === "circle" && <circle cx="7" cy="7" r="5" fill={variantColors[v]} />}
                          {variantShapes[v] === "diamond" && <polygon points="7,1 13,7 7,13 1,7" fill={variantColors[v]} />}
                          {variantShapes[v] === "triangle" && <polygon points="7,1 13,12 1,12" fill={variantColors[v]} />}
                        </svg>
                        <span>{v}</span>
                      </div>
                    ))}
                  </div>
                  <div className="small mt-2 dim">Marker size ∝ dictionary size.</div>

                  <h4 className="mt-3">Hover details</h4>
                  <div style={{ minHeight: 110, background: "var(--paper-2)", padding: 12, borderRadius: 4, border: "1px solid var(--rule)" }}>
                    {hover ? (
                      <div style={{ fontFamily: "var(--mono)", fontSize: 12, lineHeight: 1.7 }}>
                        <div><strong>{hover.variant}</strong></div>
                        <div>L = {hover.dictSize}</div>
                        <div>MATCHScore = {hover.match.toFixed(3)}</div>
                        <div>TAPAScore = {hover.tapa.toFixed(3)}</div>
                      </div>
                    ) : (
                      <div className="small dim">Hover a point to see its configuration.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="figcaption">
            <strong>Fig. 7.</strong> Pearson correlation between matching score and TAPAScore on
            synCUB and synCOCO across all (variant, dict-size) configurations. FBMP F<sub>0.5</sub>
            achieves the strongest correlation on synCUB; synCOCO correlations are weaker for all
            criteria, reflecting the matching/TAPAScore divergence at larger dictionaries.
          </div>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { ScatterSection });
