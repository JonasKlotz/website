/* global React, ImgSlot */
const { useState, useMemo } = React;

function DatasetSection() {
  const pairs = window.SAE_DATA.datasetPairs;
  const [dataset, setDataset] = useState("all");
  const [family, setFamily] = useState("all");
  const [success, setSuccess] = useState("all");
  const [openId, setOpenId] = useState(null);

  const families = useMemo(() => Array.from(new Set(pairs.map(p => p.family))), []);

  const filtered = pairs.filter(p =>
    (dataset === "all" || p.dataset === dataset) &&
    (family === "all" || p.family === family) &&
    (success === "all" || p.success === success)
  );

  const open = openId ? pairs.find(p => p.id === openId) : null;

  return (
    <section id="dataset">
      <div className="page">
        <div className="measure">
          <div className="kicker">§ 3 · The benchmarks</div>
          <h2>synCUB & synCOCO — paired images that differ in exactly one thing.</h2>
          <p>
            To measure whether matched latents <em>causally</em> encode their attributes, we need
            counterfactual images: pairs that are identical in every respect except one. We
            construct two such benchmarks with Flux2 — synCUB perturbs single bird attributes
            (breast pattern, bill shape, …), synCOCO removes one object from complex scenes.
          </p>
          <p>
            Browse below. Failure modes — the kind you usually see hidden in an appendix — are kept
            on purpose; click into them.
          </p>
          <div className="mt-2" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <a href="https://huggingface.co/datasets/jokl/syncub" className="btn" target="_blank" rel="noopener">
              ↓ Download synCUB
            </a>
            <a href="https://huggingface.co/datasets/jokl/syncoco" className="btn" target="_blank" rel="noopener">
              ↓ Download synCOCO
            </a>
          </div>
        </div>

        <div className="wide mt-3">
          <div className="panel">
            <div className="panel-hd" style={{ flexWrap: "wrap", gap: 12 }}>
              <div style={{ display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}>
                <div>
                  <span className="label" style={{ display: "inline", marginRight: 8 }}>Dataset</span>
                  <div className="seg" style={{ verticalAlign: "middle" }}>
                    {["all", "synCUB", "synCOCO"].map(d => (
                      <button key={d} className={dataset === d ? "on" : ""} onClick={() => setDataset(d)}>{d}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="label" style={{ display: "inline", marginRight: 8 }}>Family</span>
                  <select className="sel" value={family} onChange={e => setFamily(e.target.value)}>
                    <option value="all">all families</option>
                    {families.map(f => <option key={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <span className="label" style={{ display: "inline", marginRight: 8 }}>Edit</span>
                  <div className="seg" style={{ verticalAlign: "middle" }}>
                    <button className={success === "all" ? "on" : ""} onClick={() => setSuccess("all")}>all</button>
                    <button className={success === "good" ? "on" : ""} onClick={() => setSuccess("good")}>good</button>
                    <button className={success === "fail" ? "on" : ""} onClick={() => setSuccess("fail")}>failure</button>
                  </div>
                </div>
              </div>
              <span className="small">{filtered.length} pair{filtered.length === 1 ? "" : "s"}</span>
            </div>

            <div style={{ padding: 20, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 18 }}>
              {filtered.map(p => (
                <button key={p.id} onClick={() => setOpenId(p.id)} style={{
                  textAlign: "left", border: "1px solid var(--rule)", borderRadius: 4,
                  background: "var(--card)", padding: 0, cursor: "pointer", overflow: "hidden",
                  transition: "border-color 120ms, transform 120ms",
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "var(--accent)"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "var(--rule)"}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "var(--rule-soft)" }}>
                    <ImgSlot src={p.base} label="base" ratio="1/1" />
                    <ImgSlot src={p.edit} label="edit" ratio="1/1" />
                  </div>
                  <div style={{ padding: "10px 12px" }}>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-3)" }}>
                      {p.dataset} · {p.family}
                    </div>
                    <div style={{ marginTop: 4, fontSize: 14 }}>
                      <strong>{p.class}</strong>
                    </div>
                    <div className="small mt-1" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span className="mono">{p.from} → {p.to}</span>
                      <span className={"tag " + (p.success === "good" ? "pos" : "neg")}>
                        {p.success === "good" ? "good" : "failure"}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div className="figcaption">
            <strong>Fig. 3.</strong> synCUB pairs use a reference image to guide a single attribute edit;
            synCOCO pairs remove the lowest-frequency object in a scene. Both pass an automatic
            attribute predictor + manual curation.
          </div>
        </div>
      </div>

      {open && <PairModal pair={open} onClose={() => setOpenId(null)} />}
    </section>
  );
}

function PairModal({ pair, onClose }) {
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(20,20,28,0.55)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 50, padding: 32,
    }}>
      <div onClick={e => e.stopPropagation()} className="panel" style={{ maxWidth: 900, width: "100%" }}>
        <div className="panel-hd">
          <span><strong>{pair.dataset}</strong> · {pair.class} · <span className="mono">{pair.family}</span></span>
          <button className="btn tiny" onClick={onClose}>close ✕</button>
        </div>
        <div className="panel-pad">
          <div style={{ display: "grid", gridTemplateColumns: pair.ref ? "1fr 1fr 1fr" : "1fr 1fr", gap: 16 }}>
            <div>
              <div className="label">Base</div>
              <ImgSlot src={pair.base} label="base image" />
            </div>
            {pair.ref && (
              <div>
                <div className="label">Reference</div>
                <ImgSlot src={pair.ref} label="reference" />
              </div>
            )}
            <div>
              <div className="label">Edit</div>
              <ImgSlot src={pair.edit} label="edited image" />
            </div>
          </div>
          <div className="mt-2" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <span className="tag">{pair.from} → {pair.to}</span>
            <span className={"tag " + (pair.success === "good" ? "pos" : "neg")}>{pair.success === "good" ? "good" : "failure"}</span>
          </div>
          {pair.note && <p className="mt-2" style={{ fontSize: 15 }}>{pair.note}</p>}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { DatasetSection });
