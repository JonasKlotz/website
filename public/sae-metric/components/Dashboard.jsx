/* global React, Axis */
const { useState } = React;

function DashboardSection() {
  const D = window.SAE_DATA.dashboard;
  const [backbone, setBackbone] = useState("CLIP");
  const [dataset, setDataset] = useState("CUB");
  const [metric, setMetric] = useState("matchScore"); // or tapaScore
  const [criterion, setCriterion] = useState("FBMP F0.5");
  const [showVariants, setShowVariants] = useState({ BatchTopK: true, Matryoshka: true, TopK: true, JumpReLU: true });

  const variantColors = { BatchTopK: "var(--accent)", Matryoshka: "#2d8a5a", TopK: "#b53a3a", JumpReLU: "#6e3aaa" };

  const W = 580, H = 360, padL = 56, padR = 40, padT = 24, padB = 56;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const xMax = D.dictSizes.length - 1;

  const series = D.variants.map(v => ({
    name: v,
    values: D.series[backbone]?.[dataset]?.[v]?.[criterion]?.[metric] ?? [],
    color: variantColors[v],
    visible: showVariants[v],
  }));

  // Data-driven y range from visible series
  const visibleValues = series.filter(s => s.visible).flatMap(s => s.values);
  const rawMax = visibleValues.length ? Math.max(...visibleValues) : 1;
  const rawMin = visibleValues.length ? Math.min(...visibleValues) : 0;
  const snap = 0.05;
  const yMax = Math.min(1, Math.ceil(rawMax / snap) * snap);
  const yMin = Math.max(0, Math.floor(rawMin / snap) * snap);
  const yRange = yMax > yMin ? yMax - yMin : 1;

  // Nice tick step: ~4–6 ticks
  const tickStep = yRange <= 0.2 ? 0.05 : yRange <= 0.5 ? 0.1 : 0.25;
  const yTicks = [];
  for (let t = yMin; t <= yMax + 1e-9; t = +(t + tickStep).toFixed(6)) yTicks.push(t);

  function xpos(i) { return padL + (i / xMax) * innerW; }
  function ypos(v) { return padT + (1 - (v - yMin) / yRange) * innerH; }

  return (
    <section id="dashboard">
      <div className="page">
        <div className="measure">
          <div className="kicker">§ 5 · Results dashboard</div>
          <h2>Moderate dictionaries win.</h2>
          <p>
            One chart, four dropdowns. Pick a backbone, a dataset, a matching criterion, and
            switch between matching score and TAPAScore on the y-axis. The story that emerges
            across configurations: matching keeps improving with dictionary size, but causal
            alignment plateaus or collapses — moderate dictionaries hit the sweet spot.
          </p>
        </div>

        <div className="wide mt-3">
          <div className="panel">
            <div className="panel-hd" style={{ flexWrap: "wrap", gap: 12 }}>
              <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
                <div><span className="label" style={{ display: "inline", marginRight: 6 }}>Backbone</span>
                  <div className="seg">{D.backbones.map(b => (
                    <button key={b} className={backbone === b ? "on" : ""} onClick={() => setBackbone(b)}>{b}</button>
                  ))}</div>
                </div>
                <div><span className="label" style={{ display: "inline", marginRight: 6 }}>Dataset</span>
                  <div className="seg">{D.datasets.map(b => (
                    <button key={b} className={dataset === b ? "on" : ""} onClick={() => setDataset(b)}>{b}</button>
                  ))}</div>
                </div>
                <div><span className="label" style={{ display: "inline", marginRight: 6 }}>Criterion</span>
                  <select className="sel" value={criterion} onChange={e => setCriterion(e.target.value)}>
                    {D.criteria.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="seg">
                <button className={metric === "matchScore" ? "on" : ""} onClick={() => setMetric("matchScore")}>Δ MATCHScore</button>
                <button className={metric === "tapaScore" ? "on" : ""} onClick={() => setMetric("tapaScore")}>TAPAScore</button>
              </div>
            </div>

            <div className="panel-pad">
              <div className="dashboard-grid" style={{ gap: 24 }}>
                <svg width={W} height={H} style={{ maxWidth: "100%" }}>
                  {/* gridlines at y-tick positions */}
                  {yTicks.map(t => (
                    <line key={t} x1={padL} x2={W - padR}
                          y1={ypos(t)} y2={ypos(t)}
                          stroke="var(--rule-soft)" strokeDasharray="2 4" />
                  ))}
                  {/* axes */}
                  <Axis x={padL} y={padT} w={innerW} h={innerH} dir="x"
                    ticks={D.dictSizes.map((d, i) => ({ v: i, max: xMax }))}
                    label="dictionary size"
                    fmt={v => D.dictSizes[v]}
                  />
                  <Axis x={padL} y={padT} w={innerW} h={innerH} dir="y"
                    ticks={yTicks.map(t => ({ v: t - yMin, max: yRange }))}
                    label={metric === "matchScore" ? "Δ MATCHScore" : "TAPAScore"}
                    fmt={v => (v + yMin).toFixed(2)}
                  />

                  {/* lines + dots */}
                  {series.map((s) => s.visible && s.values.length > 0 && (
                    <g key={s.name}>
                      <polyline
                        fill="none"
                        stroke={s.color}
                        strokeWidth="2"
                        points={s.values.map((v, i) => `${xpos(i)},${ypos(v)}`).join(" ")}
                      />
                      {s.values.map((v, i) => (
                        <circle key={i} cx={xpos(i)} cy={ypos(v)} r="4"
                          fill="var(--card)" stroke={s.color} strokeWidth="2">
                          <title>{s.name} · L={D.dictSizes[i]} · {v.toFixed(3)}</title>
                        </circle>
                      ))}
                    </g>
                  ))}
                </svg>

                {/* Legend / variant toggles */}
                <div>
                  <div className="label">SAE variant</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {D.variants.map(v => (
                      <label key={v} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13 }}>
                        <input type="checkbox" checked={showVariants[v]}
                               onChange={() => setShowVariants(s => ({ ...s, [v]: !s[v] }))} />
                        <span style={{ display: "inline-block", width: 12, height: 3, background: variantColors[v] }} />
                        <span style={{ fontFamily: "var(--sans)" }}>{v}</span>
                      </label>
                    ))}
                  </div>
                  <h4 className="mt-3">Read this chart</h4>
                  <p className="small">
                    {metric === "matchScore"
                      ? "Matching scores tend to grow with dictionary size (more candidate latents = more chances to find good alignment), but the rate depends on variant."
                      : "TAPAScore peaks early and decays for TopK on CUB. On COCO, all variants degrade past dict size 1024 — overcompleteness hurts causal alignment."}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="figcaption">
            <strong>Fig. 5.</strong> Reproducing Figs 5/6 + S25/S26 of the paper in a single configurable view.
            Click a point on the scatter (next section) to jump back here.
          </div>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { DashboardSection });
