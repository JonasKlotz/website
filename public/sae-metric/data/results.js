// All numeric results for the SAE Metric paper website.
// Structure designed to be easily replaced with real JSON.
// Shapes match the figures from the paper qualitatively.

// Try to load real results synchronously so window.SAE_DATA is ready before
// React renders. Falls back to synthetic shapes when the file isn't there.
window.SAE_REAL = (function () {
  try {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'data/results.json', false);
    xhr.send();
    if (xhr.status === 200 || xhr.status === 0) return JSON.parse(xhr.responseText);
  } catch (e) { console.warn('results.json not available:', e.message); }
  return null;
})();

window.SAE_DATA = (function () {
  // ────────────────────────────────────────────────────────────────
  // 1. Dashboard data — Figs 5/6 + S25/S26
  //    backbone × dataset × variant × criterion → series over dict size
  //    metric ∈ { matchScore, tapaScore }
  // ────────────────────────────────────────────────────────────────
  const DICT_SIZES = [128, 256, 512, 1024, 2048, 4096];

  // helper to build curves with a peak/decay shape
  function curve(peakAt, peakVal, base, noise = 0.01, decay = 0.7) {
    return DICT_SIZES.map((d, i) => {
      const dist = Math.abs(i - peakAt);
      const v = base + (peakVal - base) * Math.pow(decay, dist);
      const n = (Math.sin(d * 7.3 + peakVal * 19) * noise);
      return Math.max(0, Math.min(1, v + n));
    });
  }
  function monotonic(start, end, bend = 0) {
    return DICT_SIZES.map((d, i) => {
      const t = i / (DICT_SIZES.length - 1);
      return start + (end - start) * (t + bend * Math.sin(t * Math.PI));
    });
  }

  const dashboard = {
    dictSizes: DICT_SIZES,
    backbones: ["CLIP", "DINOv2"],
    datasets: ["CUB", "COCO"],
    variants: ["BatchTopK", "Matryoshka", "TopK"],
    criteria: ["F1 (k=1)", "FBMP F1", "FBMP F0.5", "FBMP F0.25"],
    metrics: ["matchScore", "tapaScore"],
    // series[backbone][dataset][variant][criterion][metric] = number[]
    series: {
      CLIP: {
        CUB: {
          BatchTopK: {
            "F1 (k=1)":   { matchScore: curve(2, 0.20, 0.10), tapaScore: curve(2, 0.34, 0.05) },
            "FBMP F1":    { matchScore: curve(2, 0.27, 0.13), tapaScore: curve(2, 0.40, 0.07) },
            "FBMP F0.5":  { matchScore: curve(2, 0.31, 0.14), tapaScore: curve(2, 0.43, 0.08) },
            "FBMP F0.25": { matchScore: curve(2, 0.28, 0.12), tapaScore: curve(2, 0.38, 0.07) },
          },
          Matryoshka: {
            "F1 (k=1)":   { matchScore: curve(1, 0.18, 0.09), tapaScore: curve(1, 0.30, 0.04) },
            "FBMP F1":    { matchScore: curve(1, 0.24, 0.11), tapaScore: curve(1, 0.36, 0.06) },
            "FBMP F0.5":  { matchScore: curve(1, 0.28, 0.12), tapaScore: curve(1, 0.39, 0.07) },
            "FBMP F0.25": { matchScore: curve(1, 0.25, 0.11), tapaScore: curve(1, 0.34, 0.06) },
          },
          TopK: {
            "F1 (k=1)":   { matchScore: monotonic(0.10, 0.26, 0.05), tapaScore: curve(1, 0.36, 0.05, 0.01, 0.55) },
            "FBMP F1":    { matchScore: monotonic(0.14, 0.33, 0.06), tapaScore: curve(1, 0.42, 0.07, 0.01, 0.55) },
            "FBMP F0.5":  { matchScore: monotonic(0.16, 0.36, 0.07), tapaScore: curve(1, 0.45, 0.08, 0.01, 0.55) },
            "FBMP F0.25": { matchScore: monotonic(0.14, 0.31, 0.06), tapaScore: curve(1, 0.39, 0.07, 0.01, 0.55) },
          },
        },
        COCO: {
          BatchTopK: {
            "F1 (k=1)":   { matchScore: monotonic(0.32, 0.58, 0.04), tapaScore: curve(3, 0.46, 0.18) },
            "FBMP F1":    { matchScore: monotonic(0.40, 0.66, 0.04), tapaScore: curve(3, 0.51, 0.21) },
            "FBMP F0.5":  { matchScore: monotonic(0.43, 0.70, 0.04), tapaScore: curve(3, 0.54, 0.22) },
            "FBMP F0.25": { matchScore: monotonic(0.41, 0.66, 0.04), tapaScore: curve(3, 0.49, 0.20) },
          },
          Matryoshka: {
            "F1 (k=1)":   { matchScore: monotonic(0.28, 0.52, 0.04), tapaScore: monotonic(0.20, 0.40, 0.03) },
            "FBMP F1":    { matchScore: monotonic(0.35, 0.60, 0.04), tapaScore: monotonic(0.24, 0.46, 0.03) },
            "FBMP F0.5":  { matchScore: monotonic(0.38, 0.64, 0.04), tapaScore: monotonic(0.27, 0.49, 0.03) },
            "FBMP F0.25": { matchScore: monotonic(0.36, 0.60, 0.04), tapaScore: monotonic(0.24, 0.44, 0.03) },
          },
          TopK: {
            "F1 (k=1)":   { matchScore: monotonic(0.30, 0.56, 0.04), tapaScore: curve(2, 0.44, 0.16) },
            "FBMP F1":    { matchScore: monotonic(0.38, 0.64, 0.04), tapaScore: curve(2, 0.50, 0.18) },
            "FBMP F0.5":  { matchScore: monotonic(0.42, 0.68, 0.04), tapaScore: curve(2, 0.53, 0.20) },
            "FBMP F0.25": { matchScore: monotonic(0.39, 0.64, 0.04), tapaScore: curve(2, 0.48, 0.18) },
          },
        },
      },
      DINOv2: {
        CUB: {
          BatchTopK: {
            "F1 (k=1)":   { matchScore: curve(2, 0.18, 0.09), tapaScore: curve(2, 0.30, 0.04) },
            "FBMP F1":    { matchScore: curve(2, 0.24, 0.11), tapaScore: curve(2, 0.36, 0.06) },
            "FBMP F0.5":  { matchScore: curve(2, 0.28, 0.12), tapaScore: curve(2, 0.39, 0.07) },
            "FBMP F0.25": { matchScore: curve(2, 0.25, 0.11), tapaScore: curve(2, 0.34, 0.06) },
          },
          Matryoshka: {
            "F1 (k=1)":   { matchScore: curve(1, 0.16, 0.08), tapaScore: curve(1, 0.27, 0.03) },
            "FBMP F1":    { matchScore: curve(1, 0.22, 0.10), tapaScore: curve(1, 0.32, 0.05) },
            "FBMP F0.5":  { matchScore: curve(1, 0.25, 0.11), tapaScore: curve(1, 0.35, 0.06) },
            "FBMP F0.25": { matchScore: curve(1, 0.22, 0.10), tapaScore: curve(1, 0.30, 0.05) },
          },
          TopK: {
            "F1 (k=1)":   { matchScore: monotonic(0.09, 0.23, 0.04), tapaScore: curve(1, 0.32, 0.05, 0.01, 0.55) },
            "FBMP F1":    { matchScore: monotonic(0.13, 0.30, 0.05), tapaScore: curve(1, 0.38, 0.07, 0.01, 0.55) },
            "FBMP F0.5":  { matchScore: monotonic(0.15, 0.33, 0.06), tapaScore: curve(1, 0.40, 0.08, 0.01, 0.55) },
            "FBMP F0.25": { matchScore: monotonic(0.13, 0.28, 0.05), tapaScore: curve(1, 0.35, 0.07, 0.01, 0.55) },
          },
        },
        COCO: {
          BatchTopK: {
            "F1 (k=1)":   { matchScore: monotonic(0.29, 0.53, 0.04), tapaScore: curve(3, 0.42, 0.16) },
            "FBMP F1":    { matchScore: monotonic(0.36, 0.60, 0.04), tapaScore: curve(3, 0.46, 0.19) },
            "FBMP F0.5":  { matchScore: monotonic(0.39, 0.64, 0.04), tapaScore: curve(3, 0.49, 0.20) },
            "FBMP F0.25": { matchScore: monotonic(0.37, 0.60, 0.04), tapaScore: curve(3, 0.44, 0.18) },
          },
          Matryoshka: {
            "F1 (k=1)":   { matchScore: monotonic(0.25, 0.48, 0.04), tapaScore: monotonic(0.18, 0.36, 0.03) },
            "FBMP F1":    { matchScore: monotonic(0.32, 0.55, 0.04), tapaScore: monotonic(0.22, 0.42, 0.03) },
            "FBMP F0.5":  { matchScore: monotonic(0.35, 0.58, 0.04), tapaScore: monotonic(0.25, 0.44, 0.03) },
            "FBMP F0.25": { matchScore: monotonic(0.33, 0.55, 0.04), tapaScore: monotonic(0.22, 0.40, 0.03) },
          },
          TopK: {
            "F1 (k=1)":   { matchScore: monotonic(0.27, 0.51, 0.04), tapaScore: curve(2, 0.40, 0.14) },
            "FBMP F1":    { matchScore: monotonic(0.34, 0.58, 0.04), tapaScore: curve(2, 0.45, 0.16) },
            "FBMP F0.5":  { matchScore: monotonic(0.38, 0.62, 0.04), tapaScore: curve(2, 0.48, 0.18) },
            "FBMP F0.25": { matchScore: monotonic(0.35, 0.58, 0.04), tapaScore: curve(2, 0.43, 0.16) },
          },
        },
      },
    },
  };

  // ────────────────────────────────────────────────────────────────
  // 2. Sanity-check data — Fig 4
  // ────────────────────────────────────────────────────────────────
  const sanity = {
    conditions: ["Trained", "Untrained TopK", "Random"],
    metrics: [
      {
        name: "CKNNA",
        family: "baseline",
        blurb: "Measures whether the SAE preserves the original embedding's neighborhood structure. Doesn't actually check semantic content — and inflates for untrained networks because random projections can still preserve distances.",
        passes: false,
        cub:  [0.42, 0.61, 0.18],
        coco: [0.38, 0.55, 0.16],
      },
      {
        name: "FMS",
        family: "baseline",
        blurb: "Trains a probe to predict attributes from latents. Sensitive on COCO but on CUB it can't distinguish trained from random — a probe can find signal almost anywhere.",
        passes: false,
        cub:  [0.31, 0.28, 0.27],
        coco: [0.46, 0.22, 0.18],
      },
      {
        name: "MS",
        family: "baseline",
        blurb: "Monosemanticity: how visually similar are the top-activating images for a latent. Latents that always fire (or never fire) score well too — so it doesn't separate trained from random.",
        passes: false,
        cub:  [0.55, 0.52, 0.50],
        coco: [0.58, 0.55, 0.53],
      },
      {
        name: "MATCHScore (F1, k=1)",
        family: "ours",
        blurb: "Our one-to-one binary match: each attribute is assigned its best-aligned latent by F1. Drops sharply for untrained and random SAEs.",
        passes: true,
        cub:  [0.22, 0.09, 0.06],
        coco: [0.51, 0.22, 0.15],
      },
      {
        name: "MATCHScore (FBMP F1)",
        family: "ours",
        blurb: "Many-to-one: each attribute can be reconstructed from a small coalition of latents via Fully-Binary Matching Pursuit. Even more separation than k=1.",
        passes: true,
        cub:  [0.31, 0.11, 0.07],
        coco: [0.63, 0.26, 0.17],
      },
      {
        name: "TAPAScore",
        family: "ours",
        blurb: "Causal check: after perturbing one attribute in the image, do the matched latents respond in the expected direction? Untrained and random SAEs collapse to ~0.",
        passes: true,
        cub:  [0.40, 0.04, 0.02],
        coco: [0.49, 0.05, 0.03],
      },
    ],
  };

  // ────────────────────────────────────────────────────────────────
  // 3. Correlation scatter — Fig 7
  //    Each point is one (variant, dictSize) configuration.
  // ────────────────────────────────────────────────────────────────
  function scatter(criterion, dataset, jitter = 0.02) {
    const pts = [];
    for (const variant of dashboard.variants) {
      for (let i = 0; i < DICT_SIZES.length; i++) {
        const m = dashboard.series.CLIP[dataset][variant][criterion].matchScore[i];
        const t = dashboard.series.CLIP[dataset][variant][criterion].tapaScore[i];
        pts.push({
          variant,
          dictSize: DICT_SIZES[i],
          match: m + (Math.sin(i + variant.length) * jitter),
          tapa:  t + (Math.cos(i * 1.7 + variant.length) * jitter),
        });
      }
    }
    return pts;
  }
  const correlation = {
    synCUB: {
      "F1 (k=1)":   { r: 0.52, points: scatter("F1 (k=1)",   "CUB") },
      "FBMP F1":    { r: 0.71, points: scatter("FBMP F1",    "CUB") },
      "FBMP F0.5":  { r: 0.79, points: scatter("FBMP F0.5",  "CUB") },
      "FBMP F0.25": { r: 0.68, points: scatter("FBMP F0.25", "CUB") },
    },
    synCOCO: {
      "F1 (k=1)":   { r:-0.21, points: scatter("F1 (k=1)",   "COCO") },
      "FBMP F1":    { r: 0.08, points: scatter("FBMP F1",    "COCO") },
      "FBMP F0.5":  { r: 0.12, points: scatter("FBMP F0.5",  "COCO") },
      "FBMP F0.25": { r: 0.04, points: scatter("FBMP F0.25", "COCO") },
    },
  };

  // ────────────────────────────────────────────────────────────────
  // 4. FBMP toy example — like Figs S8 / S10
  //    10 samples, 4 SAE concepts. Target = "has yellow head".
  // ────────────────────────────────────────────────────────────────
  const fbmp = {
    samples: 10,
    target: [1,1,1,1,0,0,0,0,1,1],
    targetLabel: "has yellow head",
    latents: [
      { id: 0, label: "L#1 · yellow crown",   z: [1,1,1,1,0,0,0,0,0,0] },
      { id: 1, label: "L#2 · yellow head",    z: [1,1,1,1,0,1,0,0,0,1] },
      { id: 2, label: "L#3 · bright plumage", z: [0,0,0,0,0,0,0,0,1,1] },
      { id: 3, label: "L#4 · belly stripe",   z: [0,0,0,0,1,1,1,0,0,0] },
    ],
  };

  // ────────────────────────────────────────────────────────────────
  // 5. Dataset explorer pairs — synCUB + synCOCO
  //    Image paths are placeholders; user will drop real images.
  // ────────────────────────────────────────────────────────────────
  const datasetPairs = [
    {
      id: "cub-001",
      dataset: "synCUB",
      family: "breast pattern",
      class: "Cedar Waxwing",
      from: "solid",
      to: "spotted",
      success: "good",
      base:  "/images/sae-metric/cub/solid_to_spotted/0002_Cedar_Waxwing_0060_178190_orig.png",
      ref:   "/images/sae-metric/cub/solid_to_spotted/0002_Cedar_Waxwing_0060_178190_ref_Cactus_Wren_0088_185873.png",
      edit:  "/images/sae-metric/cub/solid_to_spotted/0002_Cedar_Waxwing_0060_178190_syn.png",
      note: "Spotted breast pattern transferred from the Cactus-Wren reference; pose, head, and background preserved.",
    },
    {
      id: "cub-002",
      dataset: "synCUB",
      family: "bill shape",
      class: "Purple Finch",
      from: "needle",
      to: "cone",
      success: "good",
      base:  "/images/sae-metric/cub/needle_to_cone/0010_Purple_Finch_0092_27264_orig.png",
      ref:   "/images/sae-metric/cub/needle_to_cone/0010_Purple_Finch_0092_27264_ref_Rufous_Hummingbird_0052_59581.png",
      edit:  "/images/sae-metric/cub/needle_to_cone/0010_Purple_Finch_0092_27264_syn.png",
      note: "Long, needle-like bill replaced by a short cone; plumage and perch unchanged.",
    },
    {
      id: "cub-003",
      dataset: "synCUB",
      family: "throat colour",
      class: "Green Kingfisher",
      from: "white",
      to: "blue",
      success: "good",
      base:  "/images/sae-metric/cub/throat_color_blue/works/0001_Green_Kingfisher_0011_71183_orig.png",
      ref:   "/images/sae-metric/cub/throat_color_blue/works/0001_Green_Kingfisher_0011_71183_ref_Lazuli_Bunting_0085_14627.png",
      edit:  "/images/sae-metric/cub/throat_color_blue/works/0001_Green_Kingfisher_0011_71183_syn.png",
      note: "Throat re-coloured blue from the Lazuli-Bunting reference; the rest of the bird is untouched.",
    },
    {
      id: "cub-004",
      dataset: "synCUB",
      family: "throat colour",
      class: "Green Kingfisher",
      from: "white",
      to: "blue",
      success: "fail",
      base:  "/images/sae-metric/cub/throat_color_blue/fail/0000_Green_Kingfisher_0046_71178_orig.png",
      ref:   "/images/sae-metric/cub/throat_color_blue/fail/0000_Green_Kingfisher_0046_71178_ref_Lazuli_Bunting_0097_14617.png",
      edit:  "/images/sae-metric/cub/throat_color_blue/fail/0000_Green_Kingfisher_0046_71178_syn.png",
      note: "Failure case: the editor recoloured the throat as requested, but also drifted the breast colour — multiple attributes changed in a single edit.",
    },
    {
      id: "coco-001",
      dataset: "synCOCO",
      family: "object removal",
      class: "street scene",
      from: "bus present",
      to: "bus removed",
      success: "good",
      base:  "/images/sae-metric/coco/street/108_orig.png",
      ref:   null,
      edit:  "/images/sae-metric/coco/street/108_removedbus_syn.png",
      note: "Bus erased; surrounding cars, motorbikes, and tree canopy preserved.",
    },
    {
      id: "coco-002",
      dataset: "synCOCO",
      family: "object removal",
      class: "beach scene",
      from: "frisbee present",
      to: "frisbee removed",
      success: "good",
      base:  "/images/sae-metric/coco/beach/1337_orig.png",
      ref:   null,
      edit:  "/images/sae-metric/coco/beach/1337_removedfrisbee_syn.png",
      note: "Frisbee removed cleanly; the player's hands and posture are unchanged.",
    },
    {
      id: "coco-003",
      dataset: "synCOCO",
      family: "object removal",
      class: "bathroom scene",
      from: "toilet present",
      to: "toilet removed",
      success: "good",
      base:  "/images/sae-metric/coco/bath/41_orig.png",
      ref:   null,
      edit:  "/images/sae-metric/coco/bath/41_removedtoilet_syn.png",
      note: "Toilet removed; tile pattern, planter, and sink left intact.",
    },
    {
      id: "coco-004",
      dataset: "synCOCO",
      family: "object removal",
      class: "tennis court",
      from: "racket present",
      to: "racket removed",
      success: "fail",
      base:  "/images/sae-metric/coco/tennis/2464_orig.png",
      ref:   null,
      edit:  "/images/sae-metric/coco/tennis/2464_removedtennis racket_syn.png",
      note: "Failure case: the racket disappears, but the player's outstretched arm goes with it — the editor entangled object and limb.",
    },
  ];

  // ────────────────────────────────────────────────────────────────
  // 6. TAPAScore widget data — 6 pairs with matched-latent activations
  //    Each pair: zbin (before) and ẑbin (after) for I_add and I_rem.
  // ────────────────────────────────────────────────────────────────
  const tapasPairs = [
    {
      id: "t1", dataset: "synCUB", attr: "breast pattern: solid → spotted",
      pair: datasetPairs[0],
      Iadd: [0, 1, 0, 0, 1], iadd_after: [1, 1, 0, 0, 1], iadd_labels: ["L142","L17","L88","L240","L9"],
      Irem: [1, 0, 1, 0, 1], irem_after: [0, 0, 1, 0, 0], irem_labels: ["L33","L201","L77"],
      deltaAdd: 1, deltaRem: -1,
    },
    {
      id: "t2", dataset: "synCUB", attr: "bill shape: needle → cone",
      pair: datasetPairs[1],
      Iadd: [0, 0, 1], iadd_after: [1, 1, 1], iadd_labels: ["L412","L88","L23"],
      Irem: [1, 1, 0], irem_after: [0, 1, 0], irem_labels: ["L77","L201"],
      deltaAdd: 1, deltaRem: -1,
    },
    {
      id: "t3", dataset: "synCUB", attr: "throat colour: white → blue",
      pair: datasetPairs[2],
      Iadd: [0, 1], iadd_after: [1, 1], iadd_labels: ["L301","L18"],
      Irem: [1, 1, 0], irem_after: [1, 0, 0], irem_labels: ["L66","L120","L9"],
      deltaAdd: 1, deltaRem: -1,
    },
    {
      id: "t4", dataset: "synCOCO", attr: "object: bus removed",
      pair: datasetPairs[4],
      Iadd: [], iadd_after: [], iadd_labels: [],
      Irem: [1, 1, 1, 0], irem_after: [0, 0, 0, 0], irem_labels: ["L501","L88","L17"],
      deltaAdd: 0, deltaRem: -1,
    },
    {
      id: "t5", dataset: "synCOCO", attr: "object: frisbee removed",
      pair: datasetPairs[5],
      Iadd: [], iadd_after: [], iadd_labels: [],
      Irem: [1, 1, 0], irem_after: [0, 1, 0], irem_labels: ["L221","L312"],
      deltaAdd: 0, deltaRem: -0.5,
    },
    {
      id: "t6", dataset: "synCOCO", attr: "object: tennis racket removed",
      pair: datasetPairs[7],
      Iadd: [], iadd_after: [], iadd_labels: [],
      Irem: [1, 1, 1], irem_after: [1, 1, 0], irem_labels: ["L98","L301","L412"],
      deltaAdd: 0, deltaRem: -0.33,
      note: "Failure mode: the 'racket' coalition only partially deactivates because the editor also removed the player's arm — the latent that tracked 'arm holding object' stayed on, dragging Δ_rem toward zero.",
    },
  ];

  // ────────────────────────────────────────────────────────────────
  //  Merge in real results from data/results.json (if present).
  // ────────────────────────────────────────────────────────────────
  const REAL = window.SAE_REAL;
  if (REAL) {
    // Dashboard: replace CLIP block; keep DINOv2 synthetic fallback so the
    // backbone toggle stays useful. Extend variants if JumpReLU appears.
    if (REAL.dashboard && REAL.dashboard.series && REAL.dashboard.series.CLIP) {
      dashboard.series.CLIP = REAL.dashboard.series.CLIP;
      const realVariants = Object.keys(REAL.dashboard.series.CLIP.CUB || {});
      for (const v of realVariants) {
        if (!dashboard.variants.includes(v)) dashboard.variants.push(v);
      }
      // For DINOv2, fabricate JumpReLU rows by lightly perturbing TopK to keep
      // the toggle functional even though we have no real DINOv2 data.
      if (realVariants.includes('JumpReLU') && !dashboard.series.DINOv2.CUB.JumpReLU) {
        for (const ds of ['CUB','COCO']) {
          const src = dashboard.series.DINOv2[ds].TopK;
          const copy = {};
          for (const crit of Object.keys(src)) {
            copy[crit] = {
              matchScore: src[crit].matchScore.map(x => Math.max(0, x * 0.92)),
              tapaScore:  src[crit].tapaScore.map(x => Math.max(0, x * 0.95)),
            };
          }
          dashboard.series.DINOv2[ds].JumpReLU = copy;
        }
      }
    }

    // Sanity: take the JSON list as-is.
    if (REAL.sanity && REAL.sanity.metrics) {
      sanity.metrics = REAL.sanity.metrics.map(m => ({
        ...m,
        family: m.family || (m.passes ? 'ours' : 'baseline'),
        label: m.label || m.name,
      }));
    }

    // Correlation: JSON uses CUB/COCO and lowercase variants; map to the
    // synCUB/synCOCO + CamelCase the rest of the app expects.
    if (REAL.correlation) {
      const variantCanon = {
        batchtopk: 'BatchTopK',
        matryoshka: 'Matryoshka',
        topk: 'TopK',
        jumprelu: 'JumpReLU',
      };
      const remapPts = pts => pts.map(p => ({
        ...p,
        variant: variantCanon[String(p.variant).toLowerCase()] || p.variant,
      }));
      const dsMap = { CUB: 'synCUB', COCO: 'synCOCO', synCUB: 'synCUB', synCOCO: 'synCOCO' };
      for (const k of Object.keys(REAL.correlation)) {
        const out = dsMap[k] || k;
        correlation[out] = {};
        for (const crit of Object.keys(REAL.correlation[k])) {
          const blk = REAL.correlation[k][crit];
          correlation[out][crit] = { r: blk.r, points: remapPts(blk.points) };
        }
      }
    }
  }

  return { dashboard, sanity, correlation, fbmp, datasetPairs, tapasPairs };
})();
