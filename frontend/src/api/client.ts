const BASE = import.meta.env.VITE_API_URL ?? ''

async function req<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const text = await res.text()
    let message = text
    try {
      const json = JSON.parse(text) as { detail?: string }
      message = json.detail ?? text
    } catch { /* empty */ }
    throw new Error(message)
  }
  return res.json() as Promise<T>
}

export interface WalletResponse {
  status: string
  account_number: string
  bank_name: string
  starting_balance: number
}

export interface BalanceResponse {
  account_number: string
  balance: number
  bank_name: string
  email: string
}

export interface SendRequest {
  amount: number
  sender_account: string
  nip_code: string
  account_number: string
  account_name: string
  remark: string
}

export interface SendResponse {
  status: string
  new_balance: number
  reference: string
  metrics: {
    risk_score: number
    decision: string
    modules: Record<string, unknown>
    explanation: string
    scan_time_ms: number
  }
}

export interface Transaction {
  id: number
  recipient_account: string
  recipient_name: string
  amount: number
  remark: string
  reference: string
  risk_score: number
  decision: string
  status: string
  created_at: string
}

export interface HistoryResponse {
  account_number: string
  total: number
  transactions: Transaction[]
}

export const api = {
  createWallet: (fullName: string, email: string) =>
    req<WalletResponse>('/api/v1/transactions/receive', {
      method: 'POST',
      body: JSON.stringify({ full_name: fullName, email }),
    }),

  sendMoney: (data: SendRequest) =>
    req<SendResponse>('/api/v1/transactions/send', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getHistory: (accountNumber: string) =>
    req<HistoryResponse>(`/api/v1/transactions/history/${accountNumber}`),

  getBalance: (accountNumber: string) =>
    req<BalanceResponse>(`/api/v1/transactions/balance/${accountNumber}`),
}
