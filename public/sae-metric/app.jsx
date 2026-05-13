/* global React, ReactDOM, HeroSection, FBMPSection, DatasetSection, TAPASSection, DashboardSection, SanitySection, ScatterSection, TweaksPanel, useTweaks, TweakSection, TweakRadio, TweakColor, TweakSlider, TweakSelect */
const { useEffect } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "serif": "Crimson Text",
  "sans": "Plus Jakarta Sans",
  "mono": "JetBrains Mono",
  "accent": "#CA8A04",
  "paper": "#f9f9f7",
  "density": 1.0
} /*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Apply tweaks live by writing CSS vars on :root
  useEffect(() => {
    const r = document.documentElement;
    r.style.setProperty("--serif", `"${t.serif}", "Source Serif 4", "Source Serif Pro", Georgia, serif`);
    r.style.setProperty("--sans", `"${t.sans}", -apple-system, BlinkMacSystemFont, sans-serif`);
    r.style.setProperty("--mono", `"${t.mono}", ui-monospace, Menlo, monospace`);
    r.style.setProperty("--accent", t.accent);
    r.style.setProperty("--paper", t.paper);
    // derive paper-2 by darkening paper a touch
    r.style.setProperty("--paper-2", shade(t.paper, -0.04));
    r.style.setProperty("--density", String(t.density));
  }, [t]);

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <span style={{display:"flex",alignItems:"center",gap:16}}><a href="/" style={{fontFamily:"var(--mono)",fontSize:12,letterSpacing:"0.08em",color:"var(--ink-3)",textDecoration:"none",opacity:0.8}} onMouseEnter={e=>e.target.style.color="var(--accent)"} onMouseLeave={e=>e.target.style.color="var(--ink-3)"}>← jonasklotz.com</a><span className="brand" style={{opacity:0.5}}>·</span><span className="brand">TAPAS</span></span>
          <nav>
            <a href="#overview">Overview</a>
            <a href="#fbmp">FBMP</a>
            <a href="#dataset">Datasets</a>
            <a href="#tapas">TAPAScore</a>
            <a href="#dashboard">Results</a>
            <a href="#sanity">Sanity</a>
            {/* <a href="#scatter">Correlation</a> */}
          </nav>
        </div>
      </header>

      <main>
        {/* inject abstract between hero title and hero figure via slot */}
        {Object.assign(window, { __abstractSlot: () => <AbstractSection inline /> }) && null}
        <HeroSection />
        <FBMPSection />
        <DatasetSection />
        <TAPASSection />
        <DashboardSection />
        <SanitySection />
        {/* <ScatterSection /> */}
        <ConclusionSection />
        <BibSection />
      </main>

      <footer className="foot">
        <div className="page">
          <div>
            <div className="brand">TAPAS</div>
            <div className="small mt-1">An interactive companion to an anonymous submission.</div>
          </div>
          <nav style={{display:"flex",gap:20,alignItems:"flex-end",fontFamily:"var(--mono)",fontSize:11,letterSpacing:"0.08em",color:"var(--ink-3)"}}>
            <a href="/impressum" style={{color:"var(--ink-3)",textDecoration:"none"}} onMouseEnter={e=>e.target.style.color="var(--accent)"} onMouseLeave={e=>e.target.style.color="var(--ink-3)"}>Impressum</a>
            <a href="/datenschutz" style={{color:"var(--ink-3)",textDecoration:"none"}} onMouseEnter={e=>e.target.style.color="var(--accent)"} onMouseLeave={e=>e.target.style.color="var(--ink-3)"}>Datenschutz</a>
          </nav>
        </div>
      </footer>

      <TweaksPanel title="Tweaks">
        <TweakSection title="Typography">
          <TweakSelect label="Body (serif)" value={t.serif} onChange={(v) => setTweak("serif", v)}
          options={["Source Serif 4", "Crimson Pro", "Lora", "EB Garamond", "Newsreader", "Spectral"]} />
          <TweakSelect label="UI (sans)" value={t.sans} onChange={(v) => setTweak("sans", v)}
          options={["Inter Tight", "Inter", "IBM Plex Sans", "Geist", "Söhne"]} />
          <TweakSelect label="Mono" value={t.mono} onChange={(v) => setTweak("mono", v)}
          options={["JetBrains Mono", "IBM Plex Mono", "Geist Mono", "Berkeley Mono"]} />
        </TweakSection>
        <TweakSection title="Color">
          <TweakColor label="Accent" value={t.accent} onChange={(v) => setTweak("accent", v)}
          options={["#CA8A04", "#c2410c", "#0e7490", "#1f8a5b", "#1a1a1f"]} />
          <TweakColor label="Paper" value={t.paper} onChange={(v) => setTweak("paper", v)}
          options={["#f7f4ec", "#fbfaf6", "#efece3", "#ecede9", "#1a1a1f"]} />
        </TweakSection>
        <TweakSection title="Density">
          <TweakSlider label="Line / spacing" value={t.density} min={0.85} max={1.25} step={0.05}
          onChange={(v) => setTweak("density", v)} />
        </TweakSection>
      </TweaksPanel>
    </>);

}

function shade(hex, amount) {
  // amount negative => darken; positive => lighten
  if (!hex.startsWith("#")) return hex;
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const mix = (c) => Math.round(amount < 0 ? c * (1 + amount) : c + (255 - c) * amount);
  return "#" + [mix(r), mix(g), mix(b)].map((v) => v.toString(16).padStart(2, "0")).join("");
}

function AbstractSection({ inline }) {
  return (
    <section id="abstract" style={inline ? { paddingTop: 24, paddingBottom: 16, borderTop: 0 } : {}}>
      <div className="page">
        <div className="measure">
          <div className="kicker">Abstract</div>
          <p style={{ fontSize: 20, lineHeight: 1.55 }}>
             



            <em></em> 
          
          </p>
          <p>
            Sparse autoencoders (SAEs) are increasingly used to extract interpretable concepts from vision and vision language models, yet existing evaluation methods largely rely on proxy metrics or qualitative inspection rather than measuring semantic correspondence. We present a human-grounded evaluation framework that quantifies alignment between SAE latents and human-annotated concepts, without requiring user studies, and validate this matching through targeted attribute perturbations. To enable this intervention-style evaluation in vision, we construct synCUB and synCOCO, synthetic benchmarks of paired images that differ in exactly one attribute. We introduce Fully-Binary Matching Pursuit (FBMP), a coalition-based matching procedure that supports many-to-one mappings between SAE latents and annotated concepts, and consistently outperforms one-to-one baselines. For functional validation, we propose a Targeted Attribute Perturbation Alignment Score (TAPAScore), which tests whether matched concepts respond selectively and in the expected direction under targeted image-level attribute perturbations. Under sanity checks, our matching and TAPAScore are the only evaluated metrics that reliably distinguish trained SAEs from untrained ones. Across SAEs trained on CLIP and DINOv2 embeddings, we find that increased overcompleteness can reduce perturbation alignment, indicating a reduction in interpretability. Our evaluation framework suggests that moderate dictionary sizes provide the best trade-off, yielding the most interpretable SAEs. The code and datasets will be publicly available. <strong></strong>
            and <strong></strong>, paired synthetic benchmarks where images differ in
            exactly one attribute or object. We introduce <strong></strong>, a coalition-based
            matching procedure supporting many-to-one mappings; and <strong></strong>,
            which tests whether matched latents respond selectively under targeted perturbations.
            Across CLIP and DINOv2 backbones, increasing overcompleteness can <em></em>
            perturbation alignment — moderate dictionary sizes provide the best trade-off.
          </p>
        </div>
      </div>
    </section>);

}

function ConclusionSection() {
  return (
    <section id="conclusion">
      <div className="page">
        <div className="measure">
          <div className="kicker">Takeaways</div>
          <h2>Three things to remember.</h2>
          <ol style={{ paddingLeft: 20 }}>
            <li className="mb-1">
              <strong>FBMP &gt; one-to-one matching.</strong> Concepts get split across multiple
              latents; a small coalition recovers them more faithfully than the single best
              individual latent.
            </li>
            <li className="mb-1">
              <strong>Statistical alignment ≠ causal alignment.</strong> Matching correlates with
              TAPAScore on synCUB, but the two diverge on synCOCO at large dictionaries —
              correlation isn&rsquo;t enough.
            </li>
            <li className="mb-1">
              <strong>Moderate dictionaries win.</strong> Bigger isn&rsquo;t better. Overcompleteness
              degrades causal alignment even when matching scores keep climbing.
            </li>
          </ol>
        </div>
      </div>
    </section>);

}

function BibSection() {
  return (
    <section id="paper">
      <div className="page">
        <div className="measure">
          <div className="kicker">Cite</div>
          <h2>BibTeX</h2>
          <pre style={{ fontFamily: "var(--mono)", fontSize: 12, lineHeight: 1.5, background: "var(--card)", border: "1px solid var(--rule)", padding: 16, borderRadius: 4, overflow: "auto" }}>
{`@inproceedings{anonymous2026sae,
  title     = {Evaluating the Interpretability of Sparse Autoencoders
               with Concept Annotations},
  author    = {Anonymous},
  booktitle = {Anonymous submission},
  year      = {2026}
}`}
          </pre>
        </div>
      </div>
    </section>);

}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);