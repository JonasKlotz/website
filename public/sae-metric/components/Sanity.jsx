/* global React */
const { useState } = React;

function SanitySection() {
  const S = window.SAE_DATA.sanity;
  const [dataset, setDataset] = useState("cub");
  const [hover, setHover] = useState(null);

  const condColors = ["var(--pos)", "var(--neu)", "var(--ink-3)"];

  return (
    <section id="sanity">
      <div className="page">
        <div className="measure">
          <div className="kicker">§ 6 · Sanity check</div>
          <h2>Existing metrics can't tell a trained SAE from random noise.</h2>
          <p>
            The litmus test for any interpretability metric: it should drop when the SAE is
            untrained or replaced with random activations. We compare three conditions across six
            metrics; only MATCHScore and TAPAScore separate trained from random.
          </p>
        </div>

        <div className="wide mt-3">
          <div className="panel">
            <div className="panel-hd">
              <span><strong>Sanity comparison</strong></span>
              <div className="seg">
                <button className={dataset === "cub" ? "on" : ""} onClick={() => setDataset("cub")}>CUB</button>
                <button className={dataset === "coco" ? "on" : ""} onClick={() => setDataset("coco")}>COCO</button>
              </div>
            </div>
            <div className="panel-pad">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 18 }}>
                {S.metrics.map(m => {
                  const vals = m[dataset];
                  const max = Math.max(...vals);
                  const isHover = hover === m.name;
                  return (
                    <div key={m.name}
                         onMouseEnter={() => setHover(m.name)}
                         onMouseLeave={() => setHover(null)}
                         style={{
                            border: "1px solid var(--rule)",
                            borderColor: m.passes ? "color-mix(in oklab, var(--pos) 40%, var(--rule))" : "var(--rule)",
                            borderRadius: 4, padding: 14,
                            background: isHover ? "var(--paper-2)" : "var(--card)",
                            transition: "background 120ms",
                            position: "relative",
                         }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                        <span className="label" style={{ marginBottom: 0, color: m.passes ? "var(--pos)" : "var(--ink-3)" }}>
                          {m.passes ? "✓ PASSES" : "✕ FAILS"}
                        </span>
                      </div>
                      <div style={{ fontFamily: "var(--serif)", fontSize: 15, fontWeight: 600, marginBottom: 12, minHeight: 38 }}>
                        {m.label || m.name}
                      </div>
                      {/* bars */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 6, minHeight: 100 }}>
                        {S.conditions.map((c, i) => (
                          <div key={c}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, fontFamily: "var(--mono)", color: "var(--ink-3)" }}>
                              <span>{c.toLowerCase()}</span>
                              <span>{vals[i].toFixed(2)}</span>
                            </div>
                            <div style={{ height: 6, background: "var(--paper-2)", borderRadius: 1, overflow: "hidden", marginTop: 2 }}>
                              <div style={{
                                height: "100%",
                                width: (vals[i] / Math.max(0.7, max)) * 100 + "%",
                                background: condColors[i],
                              }} />
                            </div>
                          </div>
                        ))}
                      </div>
                      <div style={{ marginTop: 12, fontSize: 12, lineHeight: 1.45, color: "var(--ink-2)", minHeight: 90 }}>
                        {m.blurb}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="small mt-2" style={{ display: "flex", gap: 16, justifyContent: "center" }}>
                {S.conditions.map((c, i) => (
                  <span key={c}>
                    <span style={{ display: "inline-block", width: 10, height: 10, background: condColors[i], marginRight: 4, verticalAlign: "middle" }} />
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="figcaption">
            <strong>Fig. 6.</strong> A metric should drop sharply when given an untrained SAE
            (orange) or random activations (grey). CKNNA even <em>increases</em> for untrained
            SAEs; FMS and MS are largely flat. Only our matching variants and TAPAScore behave.
          </div>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { SanitySection });
