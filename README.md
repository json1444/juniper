# Juniper🌿

<p align="left">
  <img
    src="https://i.ibb.co/HDxHKHzj/Screenshot-2026-08-27-at-2-26-14-pm.png"
    alt="Juniper"
    width="95"
  /> 
</p>

**Juniper** is an autonomous agent that watches [pump.fun](https://pump.fun) in real time, tracking token **volume**, **bonding-curve migrations** (the jump to Raydium), and surfacing **statistically favorable windows to trade**.

> 🛠️ **Built with [grok.me](https://grok.me)** — this repo is the *scaffold*: structure, docs, and interfaces. The hardcore signal logic, model tuning, and live execution engine are being built and iterated on inside grok.me. Think of this repo as Juniper's skeleton; grok.me is where the muscle gets attached.
 
---

## 🌿 What Juniper Does

Pump.fun is noisy — hundreds of tokens launch daily, most die in the first hour, and the few that "migrate" to Raydium tend to do so after a recognizable volume ramp. Juniper exists to cut through that noise:

| Module | Job |
|---|---|
| `juniper_volume_pulse.py` | Streams real-time trade volume per token, computes rolling velocity (SOL/min), and flags abnormal spikes |
| `juniper_migration_radar.py` | Watches bonding-curve completion %, predicts time-to-migration, and fires alerts when a token crosses the Raydium migration threshold |
| `juniper_timing_oracle.py` | Aggregates historical volume/migration data into a heatmap of best trading windows (hour-of-day, day-of-week) |
| `juniper_agent.py` | The orchestrator — wires the three modules together into a single polling/streaming loop and dispatches alerts |
| `juniper_config.py` | Central config: RPC endpoints, polling intervals, thresholds, alert channels |
 
---

## 🌳 Architecture

```
                        ┌───────────────────────┐
                        │      pump.fun API      │
                        │   + Solana RPC/WS feed  │
                        └───────────┬─────────────┘
                                    │
                        ┌───────────▼─────────────┐
                        │      juniper_agent.py     │
                        │   (orchestration loop)    │
                        └───┬───────────┬──────────┘
             ┌──────────────┘           └──────────────┐
             ▼                                          ▼
┌─────────────────────────┐              ┌─────────────────────────────┐
│ juniper_volume_pulse.py  │              │ juniper_migration_radar.py   │
│ - rolling volume windows │              │ - bonding curve % tracking   │
│ - spike detection        │              │ - migration ETA estimation   │
└────────────┬─────────────┘              └───────────────┬───────────────┘
             │                                             │
             └─────────────────────┬───────────────────────┘
                                    ▼
                     ┌───────────────────────────┐
                     │  juniper_timing_oracle.py   │
                     │  - historical aggregation    │
                     │  - best-hour / best-day heat  │
                     └───────────────┬───────────────┘
                                     ▼
                          alerts / logs / dashboard
```

---

## 📂 Repo Layout

```
juniper/
├── README.md                      ← you are here
├── GROKME_BUILD_NOTES.md          ← what's scaffolded here vs. built in grok.me
├── juniper_agent.py                ← main entrypoint / orchestrator
├── src/
│   ├── juniper_volume_pulse.py     ← volume tracking engine
│   ├── juniper_migration_radar.py  ← migration detection engine
│   ├── juniper_timing_oracle.py    ← best-time-to-trade analytics
│   ├── juniper_config.py           ← config + constants
│   └── juniper_alerts.py           ← alert dispatch (console/webhook/discord)
├── data/
│   └── .gitkeep
├── .github/workflows/juniper_ci.yml
├── requirements.txt
├── .env.example
├── .gitignore
└── LICENSE
```

---

## 🚀 Quickstart

```bash
git clone https://github.com/YOUR_USERNAME/juniper.git
cd juniper
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # already pre-filled with sane public defaults
python juniper_agent.py
```

Juniper will start polling pump.fun for new token launches, streaming volume data, and logging migration candidates to `data/juniper_migrations.log`.

---

## ⚙️ Configuration

All tunables live in `src/juniper_config.py`:

- `POLL_INTERVAL_SECONDS` — how often Juniper checks for new data
- `VOLUME_SPIKE_MULTIPLIER` — how far above rolling average counts as a "spike"
- `MIGRATION_THRESHOLD_PCT` — bonding curve completion % that triggers a migration alert
- `TIMING_WINDOW_DAYS` — lookback window (in days) for the best-time-to-trade heatmap

---

## 🗺️ Roadmap

- [x] Repo scaffold + module boundaries (this repo)
- [ ] Live pump.fun WebSocket ingestion (in progress on grok.me)
- [ ] Migration prediction model v1 (in progress on grok.me)
- [ ] Best-time-to-trade heatmap dashboard
- [ ] Discord/Telegram alert bot
- [ ] Backtesting harness against historical migrations

---

## ⚠️ Disclaimer

Juniper is a research/tooling project for tracking public on-chain data. It is **not financial advice**, does not execute trades on its own, and pump.fun tokens are extremely high-risk, high-volatility assets. Nothing here guarantees profitability. DYOR.

---

## 📜 License

MIT — see [`LICENSE`](./LICENSE).

---

<p align="center">🌿 <b>Juniper</b> — scaffolded here, sharpened on <a href="https://grok.me">grok.me</a>.</p>
