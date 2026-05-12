import { useState, useEffect, useCallback, useRef } from "react";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const BASE_URL_DEFAULT = "http://localhost:8000";
const API = (base) => `${base}/api/v1/transactions`;
const fmt = (n) => Number(n).toLocaleString("en-NG", { minimumFractionDigits: 2 });

const MODULE_LABELS = {
  behavioral_transformer: "Behavioral Transformer",
  graph_analyzer: "Graph Analyzer",
  graph_relationship_analyzer: "Graph Analyzer",
  payload_verifier: "Payload Verifier",
  payload_integrity_verifier: "Payload Verifier",
  sim_swap_detector: "SIM Swap Detector",
  kyc_verifier: "KYC Verifier",
  kyc_forgery_detector: "KYC Verifier",
};

const SCANNING_STEPS = [
  { icon: "⚡", label: "Behavioral Transformer", sub: "Analysing spending rhythm & velocity..." },
  { icon: "🕸️", label: "Graph Relationship Analyzer", sub: "Mapping account network clusters..." },
  { icon: "🔍", label: "Payload Integrity Verifier", sub: "Checking transaction consistency..." },
  { icon: "📱", label: "SIM Swap Detector", sub: "Verifying device & session signals..." },
  { icon: "🪪", label: "KYC Forgery Detector", sub: "Validating identity documents..." },
];

// ─── STYLES ───────────────────────────────────────────────────────────────────
const css = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=Geist+Mono:wght@400;500;600&display=swap');

:root {
  --bg:        #0C0A09;
  --surface:   #141210;
  --surface2:  #1C1916;
  --surface3:  #242018;
  --border:    #2A2520;
  --border2:   #352E28;
  --orange:    #F97316;
  --tomato:    #EF4444;
  --amber:     #F59E0B;
  --orange-dim: rgba(249,115,22,0.10);
  --tomato-dim: rgba(239,68,68,0.10);
  --amber-dim:  rgba(245,158,11,0.10);
  --green:     #22C55E;
  --green-dim: rgba(34,197,94,0.10);
  --text:      #F5F0EA;
  --text2:     #B8AFA6;
  --muted:     #6B6058;
  --muted2:    #3D3530;
  --mono:      'Geist Mono', monospace;
  --sans:      'Sora', sans-serif;
  --grad:      linear-gradient(135deg, #F97316 0%, #EF4444 100%);
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: var(--sans);
  background: var(--bg);
  color: var(--text);
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
}

/* Subtle grain */
body::before {
  content: '';
  position: fixed; inset: 0; z-index: 0; pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.025'/%3E%3C/svg%3E");
}

.app { position: relative; z-index: 1; display: flex; flex-direction: column; min-height: 100vh; }

/* ── TOPBAR ── */
.topbar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 28px; height: 56px;
  background: var(--surface); border-bottom: 1px solid var(--border);
  position: sticky; top: 0; z-index: 50;
}
.topbar-logo { display: flex; align-items: center; gap: 10px; }
.logo-pill {
  width: 28px; height: 28px; border-radius: 6px;
  background: var(--grad); display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: 13px; color: #fff;
}
.logo-name { font-size: 15px; font-weight: 700; letter-spacing: -0.3px; }
.logo-name span { background: var(--grad); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.topbar-center {
  display: flex; align-items: center; gap: 6px;
  padding: 4px 12px; border: 1px solid var(--border2);
  background: var(--surface2); border-radius: 4px;
}
.topbar-center span { font-size: 9px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: var(--orange); }
.topbar-right { display: flex; align-items: center; gap: 8px; }
.url-input {
  background: var(--surface2); border: 1px solid var(--border);
  color: var(--text2); font-family: var(--mono); font-size: 11px;
  padding: 6px 10px; border-radius: 4px; width: 210px; outline: none;
  transition: border-color 0.2s;
}
.url-input:focus { border-color: var(--orange); color: var(--text); }
.sandbox-badge {
  font-size: 9px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;
  padding: 4px 10px; border-radius: 3px;
  background: var(--amber-dim); color: var(--amber);
  border: 1px solid rgba(245,158,11,0.2);
}

/* ── STATS BAR ── */
.statsbar {
  display: flex; align-items: center; gap: 0;
  background: var(--surface); border-bottom: 1px solid var(--border);
  overflow: hidden;
}
.stat-item {
  flex: 1; padding: 10px 20px; border-right: 1px solid var(--border);
  display: flex; align-items: center; gap: 10px;
}
.stat-item:last-child { border-right: none; }
.stat-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
.stat-val { font-family: var(--mono); font-size: 14px; font-weight: 600; }
.stat-label { font-size: 10px; color: var(--muted); letter-spacing: 0.5px; }

/* ── MAIN LAYOUT ── */
.workspace {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 0; flex: 1;
  border-top: none;
}
.panel {
  border-right: 1px solid var(--border);
  padding: 24px 28px;
  min-height: calc(100vh - 100px);
}
.panel:last-child { border-right: none; }

/* ── PANEL HEADER ── */
.panel-top {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 20px;
}
.panel-label {
  font-size: 9px; font-weight: 700; letter-spacing: 2.5px;
  text-transform: uppercase; color: var(--muted);
}
.status-badge {
  font-size: 8.5px; font-weight: 700; letter-spacing: 1.5px;
  text-transform: uppercase; padding: 3px 9px; border-radius: 3px;
}
.status-idle { background: var(--muted2); color: var(--muted); }
.status-live { background: var(--green-dim); color: var(--green); border: 1px solid rgba(34,197,94,0.2); }

/* ── ONBOARDING FORM ── */
.onboard-title { font-size: 20px; font-weight: 700; letter-spacing: -0.4px; margin-bottom: 4px; }
.onboard-sub { font-size: 12px; color: var(--text2); margin-bottom: 24px; line-height: 1.5; }

.field { margin-bottom: 14px; }
.field-label {
  display: block; font-size: 9px; font-weight: 700;
  letter-spacing: 2px; text-transform: uppercase;
  color: var(--muted); margin-bottom: 6px;
}
.field-input {
  width: 100%; padding: 10px 13px;
  background: var(--surface2); border: 1px solid var(--border);
  color: var(--text); font-family: var(--sans); font-size: 13px;
  border-radius: 4px; outline: none; transition: border-color 0.2s, background 0.2s;
}
.field-input:focus { border-color: var(--orange); background: var(--surface3); }
.field-input::placeholder { color: var(--muted); }

.btn-create {
  width: 100%; padding: 12px 16px; border: none; border-radius: 4px;
  background: var(--grad); color: #fff;
  font-family: var(--sans); font-weight: 700; font-size: 13px;
  cursor: pointer; transition: opacity 0.2s, transform 0.15s;
  display: flex; align-items: center; justify-content: center; gap: 8px;
}
.btn-create:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
.btn-create:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

/* ── ACCOUNT CARD ── */
.acct-card {
  background: var(--surface2); border: 1px solid var(--border2);
  border-radius: 8px; padding: 18px 20px; margin-bottom: 20px;
  position: relative; overflow: hidden;
}
.acct-card::after {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
  background: var(--grad);
}
.acct-card-top {
  display: flex; align-items: flex-start; justify-content: space-between;
  margin-bottom: 14px;
}
.acct-name { font-size: 14px; font-weight: 600; }
.gtco-tag {
  font-size: 8px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;
  padding: 3px 8px; border-radius: 3px;
  background: var(--orange-dim); color: var(--orange);
  border: 1px solid rgba(249,115,22,0.2);
}
.acct-num-label { font-size: 9px; color: var(--muted); letter-spacing: 1px; text-transform: uppercase; margin-bottom: 4px; }
.acct-num {
  font-family: var(--mono); font-size: 20px; font-weight: 600;
  background: var(--grad); -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  letter-spacing: 2px; margin-bottom: 3px;
}
.acct-bank { font-size: 10px; color: var(--muted); margin-bottom: 14px; }
.acct-balance-row {
  display: flex; align-items: flex-end; justify-content: space-between;
  padding-top: 14px; border-top: 1px solid var(--border);
}
.balance-label { font-size: 9px; color: var(--muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 3px; }
.balance-val {
  font-family: var(--mono); font-size: 24px; font-weight: 700;
}
.balance-cur { font-size: 12px; color: var(--muted); margin-right: 2px; }
.btn-refresh {
  background: var(--surface3); border: 1px solid var(--border2);
  color: var(--text2); font-size: 11px; font-weight: 600;
  padding: 6px 12px; border-radius: 4px; cursor: pointer;
  transition: all 0.15s; font-family: var(--sans);
}
.btn-refresh:hover { border-color: var(--orange); color: var(--orange); }
.btn-copy {
  background: transparent; border: 1px solid var(--border);
  color: var(--muted); font-size: 9px; font-weight: 600; letter-spacing: 1px;
  padding: 3px 9px; border-radius: 3px; cursor: pointer; transition: all 0.15s;
  font-family: var(--sans); text-transform: uppercase;
}
.btn-copy:hover { border-color: var(--orange); color: var(--orange); }

/* ── TABS ── */
.tabs {
  display: flex; gap: 0; border-bottom: 1px solid var(--border); margin-bottom: 18px;
}
.tab-btn {
  padding: 8px 14px; font-size: 11px; font-weight: 600; letter-spacing: 0.5px;
  cursor: pointer; background: none; border: none; color: var(--muted);
  border-bottom: 2px solid transparent; margin-bottom: -1px;
  transition: all 0.15s; font-family: var(--sans);
}
.tab-btn:hover { color: var(--text2); }
.tab-btn.active { color: var(--orange); border-bottom-color: var(--orange); }

/* ── SEND FORM ── */
.field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.section-divider {
  font-size: 9px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;
  color: var(--muted); margin-bottom: 12px;
  display: flex; align-items: center; gap: 8px;
}
.section-divider::after { content: ''; flex: 1; height: 1px; background: var(--border); }

.btn-send {
  width: 100%; padding: 12px; margin-top: 4px; border-radius: 4px;
  background: var(--surface3); border: 1px solid var(--border2);
  color: var(--text); font-family: var(--sans); font-weight: 700; font-size: 13px;
  cursor: pointer; transition: all 0.2s;
  display: flex; align-items: center; justify-content: center; gap: 8px;
}
.btn-send:hover:not(:disabled) { border-color: var(--orange); color: var(--orange); background: var(--orange-dim); }
.btn-send:disabled { opacity: 0.4; cursor: not-allowed; }
.btn-send.loading { border-color: var(--amber); color: var(--amber); }

/* ── SQUAD OVERLAY ── */
.squad-overlay {
  position: fixed; inset: 0; z-index: 100;
  background: rgba(12,10,9,0.88); backdrop-filter: blur(16px);
  display: flex; align-items: center; justify-content: center;
  opacity: 0; pointer-events: none; transition: opacity 0.25s;
}
.squad-overlay.open { opacity: 1; pointer-events: all; }
.squad-modal {
  background: var(--surface); border: 1px solid var(--border2);
  border-radius: 10px; width: 360px; padding: 32px 28px;
  position: relative; overflow: hidden;
  box-shadow: 0 32px 80px rgba(0,0,0,0.6);
}
.squad-modal-top { position: absolute; top: 0; left: 0; right: 0; height: 2px; background: var(--grad); }
.squad-icon-wrap {
  width: 56px; height: 56px; border-radius: 50%; margin: 0 auto 16px;
  background: var(--orange-dim); border: 1.5px solid rgba(249,115,22,0.3);
  display: flex; align-items: center; justify-content: center; position: relative;
}
.squad-icon-wrap.spinning::after {
  content: ''; position: absolute; inset: -3px;
  border: 2px solid transparent; border-top-color: var(--orange);
  border-radius: 50%; animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.squad-icon { font-size: 22px; }
.squad-status-text {
  font-size: 9.5px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;
  color: var(--orange); text-align: center; margin-bottom: 6px;
}
.squad-title { font-size: 18px; font-weight: 700; text-align: center; margin-bottom: 4px; letter-spacing: -0.3px; }
.squad-desc { font-size: 12px; color: var(--text2); text-align: center; margin-bottom: 22px; line-height: 1.5; }
.squad-step {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 0; border-bottom: 1px solid var(--border);
  font-size: 12px; color: var(--muted); transition: color 0.3s;
}
.squad-step:last-child { border-bottom: none; }
.squad-step.active { color: var(--text); }
.squad-step.done { color: var(--green); }
.step-num {
  width: 22px; height: 22px; border-radius: 4px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 10px; font-weight: 700; background: var(--border); color: var(--muted);
  transition: all 0.3s;
}
.squad-step.active .step-num { background: var(--orange-dim); color: var(--orange); border: 1px solid rgba(249,115,22,0.3); }
.squad-step.done .step-num { background: var(--green-dim); color: var(--green); border: 1px solid rgba(34,197,94,0.3); }
.squad-success { text-align: center; padding-top: 8px; }
.success-circle {
  width: 52px; height: 52px; border-radius: 50%; margin: 0 auto 12px;
  background: var(--green-dim); border: 2px solid var(--green);
  display: flex; align-items: center; justify-content: center; font-size: 22px;
  animation: pop 0.4s cubic-bezier(0.34,1.56,0.64,1);
}
@keyframes pop { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }
.success-label { font-size: 13px; font-weight: 700; color: var(--green); margin-bottom: 4px; letter-spacing: 1px; }
.success-ref { font-family: var(--mono); font-size: 10px; color: var(--muted); }

/* ── FRAUD PANEL ── */
.fraud-panel {
  background: var(--surface2); border: 1px solid var(--border);
  border-radius: 6px; padding: 14px; margin-top: 14px;
  animation: fadeUp 0.25s ease-out;
}
@keyframes fadeUp { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
.fraud-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.fraud-score-big { font-family: var(--mono); font-size: 34px; font-weight: 700; line-height: 1; }
.fraud-score-big.safe { color: var(--green); }
.fraud-score-big.risky { color: var(--tomato); }
.fraud-score-label { font-size: 9px; color: var(--muted); text-transform: uppercase; letter-spacing: 1px; margin-top: 2px; }
.decision-pill {
  font-size: 9px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;
  padding: 5px 12px; border-radius: 4px;
}
.dec-approved { background: var(--green-dim); color: var(--green); border: 1px solid rgba(34,197,94,0.2); }
.dec-blocked { background: var(--tomato-dim); color: var(--tomato); border: 1px solid rgba(239,68,68,0.2); }
.dec-flagged { background: var(--amber-dim); color: var(--amber); border: 1px solid rgba(245,158,11,0.2); }
.dec-scanning { background: var(--orange-dim); color: var(--orange); border: 1px solid rgba(249,115,22,0.2); }

.mod-row {
  display: flex; align-items: center; gap: 8px;
  padding: 6px 0; border-bottom: 1px solid var(--border); font-size: 11px;
}
.mod-row:last-child { border-bottom: none; }
.mod-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }
.mod-name { flex: 1; color: var(--text2); }
.mod-pct { font-family: var(--mono); font-size: 10px; color: var(--muted); width: 28px; text-align: right; }
.mod-badge {
  font-size: 8px; font-weight: 700; padding: 1px 7px; border-radius: 3px; letter-spacing: 0.5px;
}
.fraud-explain {
  font-size: 11px; color: var(--muted); line-height: 1.5;
  padding-top: 10px; margin-top: 8px; border-top: 1px solid var(--border);
}
.scan-row {
  display: flex; align-items: center; gap: 8px; padding: 7px 0;
  border-bottom: 1px solid var(--border); font-size: 11px; color: var(--muted);
  animation: scanPulse 1.2s ease-in-out infinite;
}
@keyframes scanPulse { 0%,100%{opacity:0.4} 50%{opacity:1} }

/* ── HISTORY ── */
.tx-item {
  display: flex; align-items: center; gap: 12px; padding: 11px 0;
  border-bottom: 1px solid var(--border); animation: fadeUp 0.2s ease-out;
}
.tx-item:last-child { border-bottom: none; }
.tx-icon {
  width: 34px; height: 34px; border-radius: 8px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center; font-size: 13px;
}
.tx-icon.out { background: var(--tomato-dim); }
.tx-icon.in { background: var(--green-dim); }
.tx-body { flex: 1; min-width: 0; }
.tx-name { font-size: 12px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.tx-time { font-size: 10px; color: var(--muted); margin-top: 1px; }
.tx-right { text-align: right; flex-shrink: 0; }
.tx-amt { font-family: var(--mono); font-size: 13px; font-weight: 600; }
.tx-amt.out { color: var(--tomato); }
.tx-amt.in { color: var(--green); }
.tx-risk { font-size: 8.5px; font-weight: 700; padding: 1px 7px; border-radius: 3px; margin-top: 3px; display: inline-block; }

.empty-state { text-align: center; padding: 32px 0; font-size: 12px; color: var(--muted); }

/* ── TOAST ── */
.toast-wrap { position: fixed; bottom: 20px; right: 20px; z-index: 200; display: flex; flex-direction: column; gap: 8px; }
.toast {
  padding: 11px 16px; font-size: 12px; font-weight: 500; border-radius: 6px;
  background: var(--surface2); border: 1px solid var(--border2);
  max-width: 300px; animation: toastIn 0.3s ease-out;
  box-shadow: 0 8px 24px rgba(0,0,0,0.4);
}
.toast.ok { border-left: 3px solid var(--green); }
.toast.err { border-left: 3px solid var(--tomato); }
@keyframes toastIn { from { transform: translateX(110%); opacity:0; } to { transform: translateX(0); opacity:1; } }

/* ── MISC ── */
.spinner { display: inline-block; width: 12px; height: 12px; border: 2px solid rgba(255,255,255,0.15); border-top-color: currentColor; border-radius: 50%; animation: spin 0.6s linear infinite; }

@media (max-width: 860px) {
  .workspace { grid-template-columns: 1fr; }
  .panel { border-right: none; border-bottom: 1px solid var(--border); }
  .statsbar { flex-wrap: wrap; }
  .stat-item { min-width: 50%; }
}
`;

// ─── SQUAD OVERLAY COMPONENT ──────────────────────────────────────────────────
function SquadOverlay({ open, title, desc, steps, activeStep, success, successLabel, successRef }) {
  return (
    <div className={`squad-overlay ${open ? "open" : ""}`}>
      <div className="squad-modal">
        <div className="squad-modal-top" />
        {!success ? (
          <>
            <div className={`squad-icon-wrap ${open && !success ? "spinning" : ""}`}>
              <span className="squad-icon">🛡️</span>
            </div>
            <div className="squad-status-text">Squad API · Processing</div>
            <div className="squad-title">{title}</div>
            <div className="squad-desc">{desc}</div>
            <div>
              {steps.map((s, i) => (
                <div key={i} className={`squad-step ${i < activeStep ? "done" : i === activeStep ? "active" : ""}`}>
                  <div className="step-num">{i < activeStep ? "✓" : i + 1}</div>
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="squad-success">
            <div className="success-circle">✓</div>
            <div className="squad-status-text" style={{color:"var(--green)"}}>Completed via Squad</div>
            <div className="squad-title">{successLabel}</div>
            <div className="success-ref">{successRef}</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── FRAUD PANEL COMPONENT ────────────────────────────────────────────────────
function FraudPanel({ state: fraudState, metrics, decision, errorMsg }) {
  if (fraudState === "idle") return null;

  if (fraudState === "scanning") {
    return (
      <div className="fraud-panel">
        <div className="fraud-top">
          <div>
            <div className="fraud-score-big safe">···</div>
            <div className="fraud-score-label">AI Fraud Score</div>
          </div>
          <div className="decision-pill dec-scanning">SCANNING</div>
        </div>
        {SCANNING_STEPS.map((s, i) => (
          <div className="scan-row" key={i}>
            <span>{s.icon}</span>
            <span style={{color:"var(--text2)",fontWeight:500}}>{s.label}</span>
            <span style={{marginLeft:"auto",fontSize:10}}>—</span>
          </div>
        ))}
      </div>
    );
  }

  const score = metrics?.risk_score ?? (decision === "BLOCKED" ? 0.85 : 0.12);
  const isRisky = score > 0.5;
  const isFlagged = decision === "FLAGGED";
  const isBlocked = decision === "BLOCKED" || decision === "ERROR";
  const decClass = isBlocked ? "dec-blocked" : isFlagged ? "dec-flagged" : "dec-approved";

  const modules = metrics?.modules || {
    behavioral_transformer: { score: 0.08, status: "NORMAL" },
    graph_analyzer: { score: 0.06, status: "CLEAN" },
    payload_verifier: { score: 0.04, status: "CLEAN" },
    sim_swap_detector: { score: 0.03, status: "NORMAL" },
    kyc_verifier: { score: 0.02, status: "VERIFIED" },
  };

  return (
    <div className="fraud-panel">
      <div className="fraud-top">
        <div>
          <div className={`fraud-score-big ${isRisky ? "risky" : "safe"}`}>
            {(score * 100).toFixed(0)}
          </div>
          <div className="fraud-score-label">AI Fraud Score / 100</div>
        </div>
        <div className={`decision-pill ${decClass}`}>{decision}</div>
      </div>
      <div>
        {Object.entries(modules).map(([key, val]) => {
          const risky = val.score > 0.5;
          const label = MODULE_LABELS[key] || key;
          return (
            <div className="mod-row" key={key}>
              <div className="mod-dot" style={{background: risky ? "var(--tomato)" : "var(--green)"}} />
              <span className="mod-name">{label}</span>
              <span className="mod-pct">{(val.score * 100).toFixed(0)}%</span>
              <span className="mod-badge" style={{
                background: risky ? "var(--tomato-dim)" : "var(--green-dim)",
                color: risky ? "var(--tomato)" : "var(--green)"
              }}>{val.status}</span>
            </div>
          );
        })}
      </div>
      <div className="fraud-explain">{errorMsg || metrics?.explanation || "All 5 AI modules completed analysis."}</div>
      {metrics?.scan_time_ms && (
        <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"var(--muted)",marginTop:8,paddingTop:8,borderTop:"1px solid var(--border)"}}>
          <span>Processing time</span>
          <span style={{color:"var(--green)",fontFamily:"var(--mono)",fontWeight:600}}>{metrics.scan_time_ms.toFixed(0)}ms</span>
        </div>
      )}
    </div>
  );
}

// ─── ACCOUNT PANEL ────────────────────────────────────────────────────────────
function AccountPanel({ num, baseUrl, otherAccount, onCreated, onSent, stats, setStats }) {
  const [account, setAccount] = useState(null);
  const [name, setName] = useState(num === 1 ? "Chukwuemeka Adesanya" : "Taiwo Olayinka");
  const [email, setEmail] = useState(num === 1 ? "chukwu@aom.ng" : "taiwo@aom.ng");
  const [creating, setCreating] = useState(false);
  const [tab, setTab] = useState("send");
  const [history, setHistory] = useState([]);

  // Send form
  const [recipientAcct, setRecipientAcct] = useState("");
  const [bankCode, setBankCode] = useState("000014");
  const [amount, setAmount] = useState("5000");
  const [recipientName, setRecipientName] = useState("");
  const [remark, setRemark] = useState("Payment");
  const [sending, setSending] = useState(false);
  const [fraudState, setFraudState] = useState("idle");
  const [fraudMetrics, setFraudMetrics] = useState(null);
  const [fraudDecision, setFraudDecision] = useState("");
  const [fraudError, setFraudError] = useState("");

  // Squad overlay
  const [overlay, setOverlay] = useState({ open: false, title: "", desc: "", steps: [], activeStep: 0, success: false, successLabel: "", successRef: "" });

  const [toasts, setToasts] = useState([]);
  const toast = useCallback((msg, type = "ok") => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);

  // Auto-fill recipient when other account is available
  useEffect(() => {
    if (otherAccount) {
      setRecipientAcct(otherAccount.account_number);
      setRecipientName(otherAccount.name);
    }
  }, [otherAccount]);

  function showOverlay(title, desc, steps, onComplete) {
    setOverlay({ open: true, title, desc, steps, activeStep: 0, success: false, successLabel: "", successRef: "" });
    let step = 0;
    const iv = setInterval(() => {
      if (step >= steps.length) {
        clearInterval(iv);
        onComplete();
        return;
      }
      setOverlay(o => ({ ...o, activeStep: step }));
      step++;
    }, 620);
  }

  function showSuccess(label, ref) {
    setOverlay(o => ({ ...o, success: true, successLabel: label, successRef: ref }));
    setTimeout(() => setOverlay(o => ({ ...o, open: false })), 2000);
  }

  async function createAccount() {
    if (!name || !email) return toast("Fill in name and email", "err");
    setCreating(true);
    showOverlay(
      "Creating Virtual Account",
      "Squad is generating a virtual account number.",
      ["Authenticating with Squad API", "Generating virtual account", "Assigning GTCo bank details", "Activating account"],
      async () => {
        try {
          const res = await fetch(`${API(baseUrl)}/receive`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ full_name: name, email }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.detail || "Failed");
          const acct = { name, email, account_number: data.account_number, bank_name: data.bank_name, balance: data.balance || data.starting_balance || 150000 };
          setAccount(acct);
          onCreated(acct);
          showSuccess("Virtual Account Created", `Acct: ${data.account_number}`);
          toast(`Account ${num} created — ${data.account_number}`);
        } catch (err) {
          setOverlay(o => ({ ...o, open: false }));
          toast(err.message, "err");
        } finally {
          setCreating(false);
        }
      }
    );
  }

  async function refreshBalance() {
    if (!account) return;
    try {
      const res = await fetch(`${API(baseUrl)}/balance/${account.account_number}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail);
      setAccount(a => ({ ...a, balance: data.balance }));
      toast(`Balance: ₦${fmt(data.balance)}`);
    } catch (err) { toast(err.message, "err"); }
  }

  async function sendMoney() {
    if (!account) return toast("Create account first", "err");
    if (!recipientAcct || !bankCode || !amount || !recipientName) return toast("Fill all fields", "err");

    setSending(true);
    setFraudState("scanning");
    setFraudMetrics(null);
    setFraudDecision("");
    setFraudError("");

    showOverlay(
      "Processing Transfer",
      "Squad is securing and verifying your payment.",
      ["AI fraud engine analysing transaction", "Authenticating with Squad API", "Processing payout request", "Syncing account balances"],
      async () => {
        try {
          const res = await fetch(`${API(baseUrl)}/send`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sender_account: account.account_number,
              account_number: recipientAcct,
              nip_code: bankCode,
              amount: parseFloat(amount),
              account_name: recipientName,
              remark: remark || "AOM Transfer",
            }),
          });
          const data = await res.json();

          if (!res.ok) {
            setFraudState("done");
            setFraudDecision("BLOCKED");
            setFraudError(data.detail);
            setOverlay(o => ({ ...o, open: false }));
            toast(data.detail, "err");
            return;
          }

          setAccount(a => ({ ...a, balance: data.new_balance }));
          setFraudState("done");
          setFraudMetrics(data.metrics);
          setFraudDecision(data.metrics?.decision || "APPROVED");

          setStats(s => ({
            total: s.total + 1,
            blocked: s.blocked + (data.metrics?.decision === "BLOCKED" ? 1 : 0),
            scores: [...s.scores, (data.metrics?.risk_score || 0) * 100],
          }));

          onSent();
          loadHistory();
          showSuccess("Transfer Successful", `Ref: ${data.reference}`);
          toast(`✓ Transfer successful`);
        } catch (err) {
          setFraudState("done");
          setFraudDecision("ERROR");
          setFraudError(err.message);
          setOverlay(o => ({ ...o, open: false }));
          toast(err.message, "err");
        } finally {
          setSending(false);
        }
      }
    );
  }

  async function loadHistory() {
    if (!account) return;
    try {
      const res = await fetch(`${API(baseUrl)}/history/${account.account_number}`);
      const data = await res.json();
      if (res.ok) setHistory(data.transactions || []);
    } catch (e) {}
  }

  useEffect(() => { if (tab === "history" && account) loadHistory(); }, [tab]);

  function copyAcct() {
    if (!account) return;
    navigator.clipboard.writeText(account.account_number).catch(() => {});
    toast(`Copied: ${account.account_number}`);
  }

  const label = num === 1 ? "Account 01 — Sender" : "Account 02 — Receiver";

  return (
    <div className="panel">
      <div className="panel-top">
        <span className="panel-label">{label}</span>
        <span className={`status-badge ${account ? "status-live" : "status-idle"}`}>
          {account ? "Active" : "Inactive"}
        </span>
      </div>

      {!account ? (
        <>
          <div className="onboard-title">Create Virtual Account</div>
          <div className="onboard-sub">Squad API will generate a unique account number for this user instantly.</div>
          <div className="field">
            <label className="field-label">Full Name</label>
            <input className="field-input" value={name} onChange={e => setName(e.target.value)} placeholder="Enter full name" />
          </div>
          <div className="field">
            <label className="field-label">Email Address</label>
            <input className="field-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" />
          </div>
          <button type="button" className="btn-create" onClick={createAccount} disabled={creating}>
            {creating ? <span className="spinner" /> : "🛡️"}
            {creating ? "Creating via Squad..." : "Create via Squad API"}
          </button>
        </>
      ) : (
        <>
          <div className="acct-card">
            <div className="acct-card-top">
              <div className="acct-name">{account.name}</div>
              <div className="gtco-tag">Squad · GTCo</div>
            </div>
            <div className="acct-num-label">Virtual Account Number</div>
            <div className="acct-num">{account.account_number}</div>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
              <button type="button" className="btn-copy" onClick={copyAcct}>Copy</button>
              <span className="acct-bank">{account.bank_name}</span>
            </div>
            <div className="acct-balance-row">
              <div>
                <div className="balance-label">Available Balance</div>
                <div className="balance-val">
                  <span className="balance-cur">₦</span>
                  {fmt(account.balance)}
                </div>
              </div>
              <button type="button" className="btn-refresh" onClick={refreshBalance}>↻ Refresh</button>
            </div>
          </div>

          <div className="tabs">
            {[["send","Send Money"],["history","History"]].map(([id,lbl]) => (
              <button key={id} type="button" className={`tab-btn ${tab===id?"active":""}`} onClick={() => setTab(id)}>{lbl}</button>
            ))}
          </div>

          {tab === "send" && (
            <>
              <div className="section-divider">Transfer Details</div>
              <div className="field">
                <label className="field-label">Recipient Account Number</label>
                <input className="field-input" value={recipientAcct} onChange={e => setRecipientAcct(e.target.value)} placeholder="10-digit account number" maxLength={10} />
              </div>
              <div className="field-row">
                <div className="field">
                  <label className="field-label">Bank Code (NIP)</label>
                  <input className="field-input" value={bankCode} onChange={e => setBankCode(e.target.value)} placeholder="e.g. 000014" />
                </div>
                <div className="field">
                  <label className="field-label">Amount (₦)</label>
                  <input className="field-input" type="number" value={amount} onChange={e => setAmount(e.target.value)} min="1" />
                </div>
              </div>
              <div className="field">
                <label className="field-label">Recipient Name</label>
                <input className="field-input" value={recipientName} onChange={e => setRecipientName(e.target.value)} placeholder="Account holder name" />
              </div>
              <div className="field">
                <label className="field-label">Remark</label>
                <input className="field-input" value={remark} onChange={e => setRemark(e.target.value)} placeholder="Optional note" />
              </div>
              <button type="button" className={`btn-send ${sending?"loading":""}`} onClick={sendMoney} disabled={sending}>
                {sending ? <><span className="spinner" /> AI Scanning...</> : "Send Money →"}
              </button>
              <FraudPanel state={fraudState} metrics={fraudMetrics} decision={fraudDecision} errorMsg={fraudError} />
            </>
          )}

          {tab === "history" && (
            <>
              <div className="section-divider">Transaction History</div>
              {history.length === 0 ? (
                <div className="empty-state">No transactions yet</div>
              ) : (
                history.map((tx, i) => {
                  const score = (tx.risk_score || 0) * 100;
                  const blocked = tx.decision !== "APPROVED";
                  return (
                    <div className="tx-item" key={i}>
                      <div className="tx-icon out">↑</div>
                      <div className="tx-body">
                        <div className="tx-name">{tx.recipient_name}</div>
                        <div className="tx-time" style={{fontFamily:"var(--mono)"}}>{tx.recipient_account} · {new Date(tx.created_at).toLocaleTimeString()}</div>
                      </div>
                      <div className="tx-right">
                        <div className="tx-amt out">-₦{fmt(tx.amount)}</div>
                        <div className="tx-risk" style={{background:blocked?"var(--tomato-dim)":"var(--green-dim)",color:blocked?"var(--tomato)":"var(--green)"}}>
                          {score.toFixed(0)}% · {tx.decision}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </>
          )}
        </>
      )}

      <SquadOverlay {...overlay} />

      <div className="toast-wrap">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type}`}>{t.msg}</div>
        ))}
      </div>
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [baseUrl, setBaseUrl] = useState(BASE_URL_DEFAULT);
  const [account1, setAccount1] = useState(null);
  const [account2, setAccount2] = useState(null);
  const [stats, setStats] = useState({ total: 0, blocked: 0, scores: [] });
  const [refreshTick, setRefreshTick] = useState(0);

  const avgScore = stats.scores.length
    ? (stats.scores.reduce((a, b) => a + b, 0) / stats.scores.length).toFixed(0) + "%"
    : "—";

  // When either side sends, refresh the other side's balance
  function handleSent(fromNum) {
    setRefreshTick(t => t + 1);
  }

  return (
    <>
      <style>{css}</style>
      <div className="app">
        {/* Topbar */}
        <div className="topbar">
          <div className="topbar-logo">
            <div className="logo-pill">A</div>
            <div className="logo-name">AOM <span>SecurePay</span></div>
          </div>
          <div className="topbar-center">
            <span>AI Fraud Intelligence Platform</span>
          </div>
          <div className="topbar-right">
            <input className="url-input" value={baseUrl} onChange={e => setBaseUrl(e.target.value)} placeholder="http://localhost:8000" />
            <span className="sandbox-badge">Sandbox</span>
          </div>
        </div>

        {/* Stats bar */}
        <div className="statsbar">
          {[
            { dot: "var(--orange)", val: stats.total, label: "Total Transactions", color: "var(--orange)" },
            { dot: "var(--tomato)", val: stats.blocked, label: "Blocked by AI", color: "var(--tomato)" },
            { dot: "var(--green)", val: stats.total - stats.blocked, label: "Approved", color: "var(--green)" },
            { dot: "var(--amber)", val: avgScore, label: "Avg Risk Score", color: "var(--amber)" },
          ].map((s, i) => (
            <div className="stat-item" key={i}>
              <div className="stat-dot" style={{background:s.dot}} />
              <div>
                <div className="stat-val" style={{color:s.color}}>{s.val}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Main workspace — two panels side by side */}
        <div className="workspace">
          <AccountPanel
            num={1}
            baseUrl={baseUrl}
            otherAccount={account2}
            onCreated={setAccount1}
            onSent={() => handleSent(1)}
            stats={stats}
            setStats={setStats}
          />
          <AccountPanel
            num={2}
            baseUrl={baseUrl}
            otherAccount={account1}
            onCreated={setAccount2}
            onSent={() => handleSent(2)}
            stats={stats}
            setStats={setStats}
          />
        </div>
      </div>
    </>
  );
}