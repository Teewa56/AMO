import { useState, useEffect, useCallback } from "react";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
const API = (base) => `${base}/api/v1/transactions`;
const fmt = (n) => Number(n).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ─── PURE SVG ICONS ───────────────────────────────────────────────────────────
const Icons = {
  Transfer: () => <svg fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>,
  Airtime: () => <svg fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>,
  Data: () => <svg fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" /></svg>,
  Bills: () => <svg fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  Check: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>,
  Bell: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>,
  Shield: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  ArrowUp: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0H5m7 0v7" /></svg>,
  ArrowDown: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" transform="scale(0.7)" /></svg>,
  ChevronLeft: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>,
  Info: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  SquadLogo: () => (
    <svg width="100" height="32" viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <text x="10" y="28" fill="currentColor" fontFamily="'Inter', sans-serif" fontSize="26" fontWeight="800" letterSpacing="-1.2">squad</text>
      <circle cx="96" cy="28" r="4" fill="#dd4f05" />
    </svg>
  )
};

// ─── WEB-NATIVE UI STYLES ─────────────────────────────────────────────────────
const css = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

:root {
  --gt-orange: #dd4f05;
  --bg-main: #f2f2f7; 
  --surface: #ffffff;
  --text-main: #000000;
  --text-muted: #8e8e93; 
  --border: #e5e5ea;
  --green: #34c759;
  --red: #ff3b30;
  --font: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

/* ── VIBRANT COLORFUL BACKGROUND ── */
body {
  font-family: var(--font);
  background: linear-gradient(-45deg, #dd4f05, #8a2387, #e94057, #f27121);
  background-size: 400% 400%;
  animation: gradientBG 15s ease infinite;
  color: #111;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  -webkit-font-smoothing: antialiased;
  margin: 0;
}

@keyframes gradientBG {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.demo-wrapper {
  display: flex; flex: 1; align-items: center; justify-content: center; padding: 40px 20px;
}

/* ── MODERN WEB APP CONTAINER ── */
.web-app-container {
  width: 100%;
  max-width: 440px;
  height: 85vh;
  min-height: 650px;
  max-height: 900px;
  background: var(--bg-main);
  border-radius: 32px;
  box-shadow: 0 25px 50px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.1); 
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  color: var(--text-main);
}

.view-container {
  flex: 1; display: flex; flex-direction: column; overflow: hidden; position: relative; background: var(--bg-main);
  animation: slideInRight 0.3s cubic-bezier(0.32, 0.72, 0, 1);
}
@keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

/* ── HEADERS ── */
.app-header { background: var(--surface); padding: 24px 20px 20px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border); z-index: 10; }
.back-btn { background: none; border: none; cursor: pointer; color: var(--gt-orange); display: flex; align-items: center; font-size: 15px; font-weight: 600;}
.header-title { font-size: 17px; font-weight: 700; color: var(--text-main); }

.home-header { background: var(--gt-orange); color: white; padding: 30px 24px 30px; position: relative; z-index: 10; }
.bank-logo-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.bank-logo { font-weight: 800; font-size: 20px; letter-spacing: -0.5px; display: flex; align-items: center; gap: 8px; }
.bank-logo-box { background: white; color: var(--gt-orange); padding: 4px 10px; border-radius: 6px; font-size: 16px; }
.bell-btn { width: 40px; height: 40px; border-radius: 12px; background: rgba(255,255,255,0.2); border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; color: white; transition: 0.2s;}
.bell-btn:hover { background: rgba(255,255,255,0.3); }
.user-greeting { font-size: 14px; opacity: 0.9; margin-bottom: 2px; font-weight: 500; }
.user-name { font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }

/* ── BALANCE CARD ── */
.balance-wrapper { padding: 0 20px; margin-top: -24px; position: relative; z-index: 20; }
.balance-card { background: var(--surface); border-radius: 20px; padding: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.06); }
.bal-label { font-size: 13px; color: var(--text-muted); font-weight: 500; margin-bottom: 8px; }
.bal-amount { font-size: 34px; font-weight: 800; color: var(--text-main); letter-spacing: -1px; }
.acct-details-row { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border); }
.acct-num { font-size: 14px; font-weight: 600; font-family: 'SF Mono', monospace; color: var(--text-main); }
.acct-bank-label { font-size: 11px; font-weight: 600; color: var(--gt-orange); margin-top: 4px; }
.acct-type { font-size: 11px; color: var(--gt-orange); background: rgba(221, 79, 5, 0.1); padding: 6px 12px; border-radius: 20px; font-weight: 700; }

/* ── QUICK ACTIONS ── */
.quick-actions { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; padding: 24px 20px 10px; }
.action-btn { display: flex; flex-direction: column; align-items: center; gap: 8px; background: none; border: none; cursor: pointer; }
.action-icon { width: 58px; height: 58px; background: var(--surface); border-radius: 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.03); transition: transform 0.2s;}
.action-btn:hover .action-icon { transform: scale(1.05); }
.action-label { font-size: 12px; font-weight: 600; color: var(--text-main); }
.action-icon svg { width: 26px; height: 26px; stroke: var(--gt-orange); }

/* ── FORMS & UX ── */
.scroll-area { flex: 1; overflow-y: auto; padding: 20px; }
.scroll-area::-webkit-scrollbar { width: 6px; }
.scroll-area::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
.section-title { font-size: 18px; font-weight: 700; color: var(--text-main); margin-bottom: 20px; letter-spacing: -0.3px; }

.ux-card { background: var(--surface); border-radius: 24px; padding: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.03); margin-bottom: 24px; }
.amount-input-wrapper { text-align: center; margin-bottom: 30px; }
.amount-symbol { font-size: 28px; font-weight: 700; color: var(--text-main); vertical-align: top; margin-right: 4px; }
.amount-input { width: 100%; text-align: center; font-size: 48px; font-weight: 800; color: var(--text-main); border: none; background: transparent; outline: none; letter-spacing: -1px; }
.amount-input::placeholder { color: #d1d1d6; }

.ios-input-group { background: var(--bg-main); border-radius: 16px; padding: 10px 16px; margin-bottom: 16px; border: 1px solid transparent; transition: border 0.2s; }
.ios-input-group:focus-within { border-color: var(--gt-orange); }
.ios-label { font-size: 11px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px; }
.ios-input { width: 100%; border: none; background: transparent; font-size: 16px; font-weight: 600; color: var(--text-main); outline: none; font-family: var(--font); }
select.ios-input { appearance: none; color: var(--gt-orange); font-weight: 700; cursor: pointer; }

.resolved-name { font-size: 13px; font-weight: 700; color: var(--green); margin-top: -8px; margin-bottom: 16px; padding-left: 16px; display: flex; align-items: center; gap: 4px; }

.btn-primary { width: 100%; background: var(--gt-orange); color: white; border: none; padding: 20px; border-radius: 16px; font-size: 17px; font-weight: 700; cursor: pointer; transition: transform 0.2s, background 0.2s; }
.btn-primary:hover { background: var(--gt-orange-dark); }
.btn-primary:active { transform: scale(0.96); }

/* ── HISTORY LIST ── */
.history-list { display: flex; flex-direction: column; gap: 16px; }
.history-item { display: flex; align-items: center; gap: 16px; background: var(--surface); padding: 16px; border-radius: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.02);}
.history-icon { width: 48px; height: 48px; border-radius: 16px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.history-icon.credit { background: rgba(52, 199, 89, 0.1); color: var(--green); }
.history-icon.debit { background: rgba(255, 59, 48, 0.1); color: var(--red); }
.history-icon.info { background: rgba(0, 122, 255, 0.1); color: #007aff; }
.history-details { flex: 1; min-width: 0;}
.history-name { font-size: 15px; font-weight: 600; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;}
.history-date { font-size: 12px; color: var(--text-muted); }
.history-amount { font-size: 16px; font-weight: 700; white-space: nowrap;}

/* ── AUTH TABS ── */
.auth-tabs { display: flex; background: var(--border); border-radius: 12px; padding: 4px; margin-bottom: 30px; }
.auth-tab { flex: 1; text-align: center; padding: 12px; font-size: 14px; font-weight: 600; color: var(--text-muted); cursor: pointer; border-radius: 8px; transition: 0.2s; }
.auth-tab.active { background: var(--surface); color: var(--text-main); box-shadow: 0 2px 8px rgba(0,0,0,0.05); }

.onboard-logo { text-align: center; margin-bottom: 30px; }
.onboard-logo-box { display: inline-block; background: var(--gt-orange); color: white; padding: 12px 24px; border-radius: 16px; font-size: 32px; font-weight: 900; letter-spacing: -1px; }
.onboard-title { font-size: 24px; font-weight: 800; text-align: center; margin-bottom: 30px; letter-spacing: -0.5px; }

/* ── SQUAD API OVERLAY (SILENT) ── */
.full-overlay { position: absolute; inset: 0; background: rgba(255,255,255,0.95); backdrop-filter: blur(15px); z-index: 200; display: flex; flex-direction: column; align-items: center; justify-content: center; animation: fadeIn 0.3s ease; }
.loader-ring { width: 40px; height: 40px; border: 4px solid var(--border); border-top-color: var(--gt-orange); border-radius: 50%; animation: spin 0.8s linear infinite; margin-top: 30px; }

/* ── AI MODAL ── */
.ai-modal-bg { position: absolute; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(8px); z-index: 300; display: flex; flex-direction: column; justify-content: flex-end; }
.ai-modal { background: var(--surface); width: 100%; border-radius: 40px 40px 0 0; padding: 40px 30px 50px; box-shadow: 0 -10px 40px rgba(0,0,0,0.1); animation: slideUp 0.4s cubic-bezier(0.32, 0.72, 0, 1); }
.ai-modal-header { font-size: 14px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 30px; display: flex; align-items: center; justify-content: center; gap: 8px; }
.ai-status-row { display: flex; justify-content: space-between; align-items: center; font-size: 15px; padding: 16px 0; border-bottom: 1px solid var(--border); }
.ai-status-label { color: var(--text-main); font-weight: 500; }
.ai-status-val { font-weight: 700; }
.ai-status-val.pending { color: var(--gt-orange); }
.ai-status-val.safe { color: var(--green); }
.ai-status-val.risk { color: var(--red); }
.ai-decision-box { margin-top: 30px; padding: 20px; border-radius: 20px; text-align: center; font-weight: 800; font-size: 16px; }
.ai-decision-box.approved { background: rgba(52, 199, 89, 0.1); color: var(--green); }
.ai-decision-box.blocked { background: rgba(255, 59, 48, 0.1); color: var(--red); }
.ai-decision-box.pending { background: rgba(255, 159, 10, 0.12); color: #d97706; }

/* ── TOASTS ── */
.toast-wrap { position: absolute; bottom: 40px; left: 0; right: 0; z-index: 400; display: flex; flex-direction: column; align-items: center; gap: 10px; pointer-events: none; }
.toast { padding: 16px 30px; font-size: 14px; font-weight: 600; border-radius: 30px; background: rgba(0,0,0,0.85); backdrop-filter: blur(10px); color: white; box-shadow: 0 10px 30px rgba(0,0,0,0.15); animation: toastFloat 0.3s cubic-bezier(0.32, 0.72, 0, 1); }

@keyframes spin { to { transform: rotate(360deg); } }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
@keyframes toastFloat { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
`;

// ─── WEB APP COMPONENT ────────────────────────────────────────────────────────
function AOMWebApp() {
  const [view, setView] = useState("auth"); 
  const [authMode, setAuthMode] = useState("login"); 

  const [account, setAccount] = useState(null);
  
  // Clean inputs for a live demo
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  
  const [squadState, setSquadState] = useState("idle");
  const [aiState, setAiState] = useState("idle");

  const [transferBank, setTransferBank] = useState("AOM Bank");
  const [recipientAcct, setRecipientAcct] = useState("");
  const [resolvedName, setResolvedName] = useState("");
  const [amount, setAmount] = useState("");
  const [remark, setRemark] = useState("");
  
  const [transactions, setTransactions] = useState([]);
  const [notifications] = useState([
    { id: 'n1', type: 'info', name: 'New Login Detected', date: new Date().toLocaleString('en-NG'), amount: null }
  ]);

  const [toasts, setToasts] = useState([]);
  const toast = useCallback((msg) => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
  }, []);

  // Smart Name Resolution (Isolated for Single Tab demo)
  useEffect(() => {
    const acctStr = String(recipientAcct || "");
    if (acctStr.length >= 10) {
      // Simulate real-time bank resolution for the pitch
      setResolvedName("Verified Beneficiary");
    } else {
      setResolvedName("");
    }
  }, [recipientAcct]);

  // Fetch real history from SQLite endpoint
  async function fetchHistory(accNum) {
    try {
      const res = await fetch(`${API(BASE_URL)}/history/${accNum}`);
      if (res.ok) {
        const data = await res.json();
        if (data.transactions && Array.isArray(data.transactions)) {
          const formatted = data.transactions.map(t => ({
            id: t.id || Math.random(),
            type: t.recipient_account === accNum ? 'credit' : 'debit',
            name: t.recipient_name || t.recipient_account || "Transfer",
            date: new Date(t.created_at).toLocaleString('en-NG'),
            amount: t.amount
          }));
          setTransactions(formatted);
        }
      }
    } catch(e) {
      console.log("History fetch failed");
    }
  }

  async function handleAuth() {
    if (!name || !email) return toast("Fill in required details");
    setSquadState("loading");
    
    setTimeout(async () => {
      try {
        const res = await fetch(`${API(BASE_URL)}/receive`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ full_name: name, email }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error("API Auth Failed");
        
        // Force "Squad" overlay to hide Wema/GTBank demo strings
        const acct = {
          name, email,
          account_number: data.account_number,
          bank_name: "Squad",
          balance: data.starting_balance !== undefined ? data.starting_balance : (data.balance !== undefined ? data.balance : 150000)
        };
        
        setAccount(acct);
        fetchHistory(acct.account_number);
        
        setSquadState("idle");
        setView("home");

      } catch (err) {
        toast("Connection Error");
        setSquadState("idle");
      }
    }, 1200);
  }

  async function sendMoney() {
    if (!recipientAcct || !amount) return toast("Fill required fields");
    const amountNum = parseFloat(amount);
    if (amountNum > account.balance) return toast("Insufficient balance");

    setAiState("scanning");

    setTimeout(async () => {
      try {
        const res = await fetch(`${API(BASE_URL)}/send`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sender_account: account.account_number,
            account_number: recipientAcct,
            nip_code: transferBank === "AOM Bank" ? "000000" : "000014",
            amount: amountNum,
            account_name: resolvedName || "Beneficiary",
            remark: remark || "Transfer",
          }),
        });
        const data = await res.json();

        if (!res.ok) {
          setAiState("blocked");
          setTimeout(() => { setAiState("idle"); toast(data.detail || "Blocked by AI Shield"); }, 2500);
          return;
        }

        if (data.status === "pending") {
          setAiState("pending");
          setTimeout(() => { setAiState("idle"); toast(data.message || "Transaction on hold pending review"); }, 2500);
          return;
        }

        if (data.status !== "success") {
          setAiState("blocked");
          setTimeout(() => { setAiState("idle"); toast(data.message || "Transaction could not be completed"); }, 2500);
          return;
        }

        setAiState("approved");
        
        const newTxn = {
          id: Date.now(), type: "debit", name: `Transfer to ${resolvedName || recipientAcct}`,
          date: new Date().toLocaleString('en-NG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
          amount: amountNum
        };
        
        setTimeout(() => {
          setAccount(a => ({ ...a, balance: data.new_balance }));
          setTransactions(t => [newTxn, ...t]);
          setAiState("idle");
          setAmount("");
          setRemark("");
          setRecipientAcct("");
          setView("home");
          toast("Transfer successful");
        }, 1200);

      } catch (err) {
        setAiState("blocked");
        setTimeout(() => { setAiState("idle"); toast("Network Error"); }, 2000);
      }
    }, 2500);
  }

  // Real-time Balance Polling for the active Tab
  useEffect(() => {
    if (!account) return;
    const checkInterval = setInterval(async () => {
      try {
        const res = await fetch(`${API(BASE_URL)}/balance/${account.account_number}`);
        if (res.ok) {
          const data = await res.json();
          if (data.balance > account.balance) {
            const diff = data.balance - account.balance;
            const newTxn = {
              id: Date.now(), type: "credit", name: "Transfer received",
              date: new Date().toLocaleString('en-NG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
              amount: diff
            };
            setAccount(a => ({ ...a, balance: data.balance }));
            setTransactions(t => [newTxn, ...t]);
            toast(`₦${fmt(diff)} received`);
          }
        }
      } catch (err) {}
    }, 3000);
    return () => clearInterval(checkInterval);
  }, [account, toast]);

  const renderView = () => {
    if (view === "auth") {
      return (
        <div className="view-container" style={{ padding: '40px 24px', justifyContent: 'center' }}>
          <div className="onboard-logo"><div className="onboard-logo-box">AOM</div></div>
          <div className="onboard-title">Welcome to AOM</div>

          <div className="auth-tabs">
            <div className={`auth-tab ${authMode === 'login' ? 'active' : ''}`} onClick={() => setAuthMode('login')}>Sign In</div>
            <div className={`auth-tab ${authMode === 'register' ? 'active' : ''}`} onClick={() => setAuthMode('register')}>Create Account</div>
          </div>
          
          <div className="ios-input-group">
            <div className="ios-label">Full Name</div>
            <input className="ios-input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Chukwuemeka Adesanya" />
          </div>
          <div className="ios-input-group">
            <div className="ios-label">Email Address</div>
            <input className="ios-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email" />
          </div>
          
          <button className="btn-primary" onClick={handleAuth} style={{marginTop: 10}}>
            {authMode === 'login' ? 'Sign In Securely' : 'Generate Account'}
          </button>
        </div>
      );
    }

    if (view === "home") {
      return (
        <div className="view-container">
          <div className="home-header">
            <div className="bank-logo-row">
              <div className="bank-logo"><span className="bank-logo-box">A</span> AOM Bank</div>
              <button className="bell-btn" onClick={() => setView('notifications')}><Icons.Bell /></button>
            </div>
            <div className="user-greeting">Good morning,</div>
            <div className="user-name">{account.name.split(" ")[0]}</div>
          </div>

          <div className="balance-wrapper">
            <div className="balance-card">
              <div className="bal-label">Available Balance</div>
              <div className="bal-amount">₦{fmt(account.balance)}</div>
              <div className="acct-details-row">
                <div>
                  <div className="acct-num">{account.account_number}</div>
                  <div className="acct-bank-label">{account.bank_name}</div>
                </div>
                <div className="acct-type">Tier 3</div>
              </div>
            </div>
          </div>

          <div className="quick-actions">
            <button className="action-btn" onClick={() => setView('transfer')}>
              <div className="action-icon"><Icons.Transfer /></div><span className="action-label">Transfer</span>
            </button>
            <button className="action-btn" onClick={() => toast("Airtime Services Coming Soon")}>
              <div className="action-icon"><Icons.Airtime /></div><span className="action-label">Airtime</span>
            </button>
            <button className="action-btn" onClick={() => toast("Data Services Coming Soon")}>
              <div className="action-icon"><Icons.Data /></div><span className="action-label">Data</span>
            </button>
            <button className="action-btn" onClick={() => toast("Bill Payments Coming Soon")}>
              <div className="action-icon"><Icons.Bills /></div><span className="action-label">Bills</span>
            </button>
          </div>

          <div className="scroll-area">
            {transactions.length > 0 ? (
              <div className="history-list">
                <div style={{fontSize: 14, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4}}>Recent Activity</div>
                {transactions.slice(0,3).map(txn => (
                  <div key={txn.id} className="history-item">
                    <div className={`history-icon ${txn.type}`}>
                      {txn.type === 'credit' ? <Icons.ArrowDown /> : <Icons.ArrowUp />}
                    </div>
                    <div className="history-details">
                      <div className="history-name">{txn.name}</div>
                      <div className="history-date">{txn.date}</div>
                    </div>
                    <div className="history-amount" style={{color: txn.type === 'credit' ? 'var(--green)' : 'var(--text-main)'}}>
                      {txn.type === 'credit' ? '+' : '-'}₦{fmt(txn.amount)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{textAlign: 'center', padding: 40, color: 'var(--text-muted)'}}>
                <Icons.Info />
                <div style={{fontSize: 13, marginTop: 8}}>No recent activity</div>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (view === "transfer") {
      return (
        <div className="view-container">
          <div className="app-header">
            <button className="back-btn" onClick={() => setView("home")}><Icons.ChevronLeft /> Back</button>
            <div className="header-title">Send Money</div>
            <div style={{width: 60}}></div>
          </div>
          
          <div className="scroll-area" style={{background: 'var(--bg-main)'}}>
            <div className="ux-card">
              <div className="amount-input-wrapper">
                <span className="amount-symbol">₦</span>
                <input className="amount-input" type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" />
              </div>
              
              <div className="ios-input-group">
                <div className="ios-label">Select Bank</div>
                <select className="ios-input" value={transferBank} onChange={e => setTransferBank(e.target.value)}>
                  <option>AOM Bank</option>
                  <option>Squad</option>
                </select>
              </div>

              <div className="ios-input-group" style={{marginBottom: resolvedName ? 8 : 24}}>
                <div className="ios-label">Recipient Account</div>
                <input className="ios-input" type="number" value={recipientAcct} onChange={e => setRecipientAcct(e.target.value)} placeholder="10-digit account number" />
              </div>

              {resolvedName && (
                <div className="resolved-name">
                  <Icons.Check /> {resolvedName}
                </div>
              )}

              <div className="ios-input-group">
                <div className="ios-label">Remark / Narration</div>
                <input className="ios-input" value={remark} onChange={e => setRemark(e.target.value)} placeholder="What is this for?" />
              </div>

              <button className="btn-primary" onClick={sendMoney}>
                Transfer Securely
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (view === "notifications") {
      const allAlerts = [...notifications, ...transactions].sort((a, b) => b.id - a.id);
      return (
        <div className="view-container">
          <div className="app-header">
            <button className="back-btn" onClick={() => setView("home")}><Icons.ChevronLeft /> Back</button>
            <div className="header-title">Notifications</div>
            <div style={{width: 60}}></div>
          </div>
          
          <div className="scroll-area">
            <div className="history-list">
              {allAlerts.map(item => (
                <div key={item.id} className="history-item">
                  <div className={`history-icon ${item.type}`}>
                    {item.type === 'credit' ? <Icons.ArrowDown /> : item.type === 'debit' ? <Icons.ArrowUp /> : <Icons.Info />}
                  </div>
                  <div className="history-details">
                    <div className="history-name">{item.name}</div>
                    <div className="history-date">{item.date}</div>
                  </div>
                  {item.amount && (
                    <div className="history-amount" style={{color: item.type === 'credit' ? 'var(--green)' : 'var(--text-main)'}}>
                      {item.type === 'credit' ? '+' : '-'}₦{fmt(item.amount)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="web-app-container">
        
      {/* Squad API Loader */}
      {squadState !== "idle" && (
        <div className="full-overlay">
          {squadState === "loading" ? (
            <>
              <Icons.SquadLogo />
              <div className="loader-ring"></div>
            </>
          ) : (
            <div style={{color: 'var(--text-main)', fontWeight: 700}}>Authenticating...</div>
          )}
        </div>
      )}

      {/* AI Shield Intercept Modal */}
      {aiState !== "idle" && (
        <div className="ai-modal-bg">
          <div className="ai-modal">
            <div className="ai-modal-header">
              <Icons.Shield /> AOM AI Secure
            </div>
            <div className="ai-status-row">
              <span className="ai-status-label">Behavioral Matrix</span>
              <span className={`ai-status-val ${aiState === 'scanning' ? 'pending' : 'safe'}`}>
                {aiState === 'scanning' ? 'ANALYZING...' : 'VERIFIED'}
              </span>
            </div>
            <div className="ai-status-row">
              <span className="ai-status-label">Beneficiary Graph</span>
              <span className={`ai-status-val ${aiState === 'scanning' ? 'pending' : (aiState === 'blocked' ? 'risk' : (aiState === 'pending' ? 'pending' : 'safe'))}`}>
                {aiState === 'scanning' ? 'ANALYZING...' : (aiState === 'blocked' ? 'HIGH RISK' : (aiState === 'pending' ? 'PENDING REVIEW' : 'CLEAN'))}
              </span>
            </div>
            <div className="ai-status-row">
              <span className="ai-status-label">Integrity Verification</span>
              <span className={`ai-status-val ${aiState === 'scanning' ? 'pending' : (aiState === 'pending' ? 'pending' : 'safe')}`}>
                {aiState === 'scanning' ? 'ANALYZING...' : (aiState === 'pending' ? 'PENDING' : 'VERIFIED')}
              </span>
            </div>

            {aiState === 'scanning' && (
              <div style={{textAlign: 'center', marginTop: 24, fontSize: 13, color: 'var(--text-muted)'}}>
                Processing via Inference Engine...
              </div>
            )}
            {aiState === 'approved' && <div className="ai-decision-box approved">TRANSACTION CLEARED</div>}
            {aiState === 'blocked' && <div className="ai-decision-box blocked">TRANSACTION BLOCKED</div>}
            {aiState === 'pending' && <div className="ai-decision-box pending">TRANSACTION PENDING REVIEW</div>}
          </div>
        </div>
      )}

      {renderView()}

      <div className="toast-wrap">
        {toasts.map(t => <div key={t.id} className="toast">{t.msg}</div>)}
      </div>

    </div>
  );
}

// ─── APP SHELL ────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <>
      <style>{css}</style>
      <div className="demo-wrapper">
        <AOMWebApp />
      </div>
    </>
  );
}