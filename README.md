# HSS EVS360 — Fleet Maintenance Digital Twin

Interactive simulation for the International Transport Project Competition, **Problem #6**:
maintenance planning for the JSC High-Speed Services (HSS) EVS360 high-speed fleet on the
670 km Moscow to St. Petersburg line.

It compares the **current fixed-cycle scheme (Baseline)** against an **Optimized twin** and lets
anyone tune the inputs and watch the outcome change live. Built to be shared: no install, no
build step, no account. Just open the files in a browser.

## What is in here

| File | What it is | Needs internet? |
|---|---|---|
| `index.html` | **2D digital twin** — the analysis dashboard: KPIs, charts, technique toggles, baseline-vs-optimized comparison, CSV export. | No. Fully offline. |
| `depot-3d.html` | **3D simulation** — a live 3D depot and line: trains running, entering bays for maintenance, sitting in hot reserve, with a real-time availability readout. | Yes (loads Three.js from a CDN). |
| `_enginetest.cjs`, `_uitest.cjs` | Validation harnesses (Node). Optional. Proof the model is not rigged. | Node only. |
| `_serve.cjs` | Tiny local static server for previewing (optional). | Node only. |

To share with the team, send `index.html` and `depot-3d.html` (or the whole folder / the zip).

## How to use

- **2D twin (`index.html`):** drag any slider and everything recomputes instantly. Top-right
  toggles "Compare vs baseline". The four checkboxes turn each optimization technique on and off
  so you can show what each one is worth. The button at the bottom exports the full daily timeline
  as CSV.
- **3D twin (`depot-3d.html`):** drag to orbit, scroll to zoom. Switch Baseline / Optimized and
  watch the depot fill up (baseline) or stay nearly empty (optimized). Adjust speed and bay count.

## The three ideas

1. **First principles** — mileage *phase control* (stagger when each train becomes due so depot
   arrivals are smooth) plus opportunistic *overnight service-block packing* (do routine cycles in
   the 00:00–06:00 idle window so they cost zero daytime availability), with a queueing-theory
   capacity bound.
2. **Modern tech** — a digital twin fed by telematics, *condition-based reprofiling* (cut wheels on
   actual wear, not a fixed 200,000 km, freeing the single-lathe bottleneck), and a rolling-horizon
   optimizer.
3. **AI** — *predictive* capture of unscheduled failures (turn the random 30% into planned work)
   and a reinforcement-learning scheduling policy.

Each technique targets a **different** KPI, which is exactly the point.

## Validated results (default scenario, identical depot for both)

| Metric | Baseline | Optimized |
|---|---|---|
| Mean availability | ~85% | **~95%** |
| Days meeting 89% | ~25% | **~95%** |
| Peak trains in shop | ~23 | **~9** |

Key finding (robust to bay count): the all-daytime baseline **plateaus at ~85% no matter how many
bays you add**, because the bottleneck is daytime hours, not depot space. The optimized twin
recovers ~10 points by moving routine work into the night.

## Model notes (auditable)

From the brief (fixed): 670 km line, 43 trains, 8-car fixed consist, 4 hot reserve, IS100 every
12,500 km / 2 h, IS600 at 1.2 M km, IS700 at 2.4 M km, reprofiling every 200,000 km on one tandem
lathe (1.2 h/bogie), availability ≥ 89%, ramp of 6 trains in Q2 2028 then +1/month, ~900,000
km/train/year.

Modelling assumptions (all are sliders or documented in the app): IS200/IS510–540 periods and
durations, seats/train, load factor, depot bay count, overnight-window length (6 h), max hideable
job (72 h), condition-based wear factor, predictive capture rate. Calibrate to real HSS data when
available.

To re-validate the engine: `node _enginetest.cjs`.
