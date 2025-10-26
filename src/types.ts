export interface LogEntry {
  type: 'info' | 'success' | 'error'
  message: string
}

export interface AccountData {
  address: string
  nftBalance: string
}
