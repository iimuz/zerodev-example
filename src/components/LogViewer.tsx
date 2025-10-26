import './LogViewer.css'
import { LogEntry } from '../types'

interface LogViewerProps {
  logs: LogEntry[]
  onClear: () => void
}

export default function LogViewer({ logs, onClear }: LogViewerProps) {
  if (logs.length === 0) return null

  return (
    <div className="logs-container">
      <div className="logs-header">
        <h3>実行ログ</h3>
        <button onClick={onClear} className="clear-button">クリア</button>
      </div>
      <div className="logs">
        {logs.map((log, index) => (
          <div key={index} className={`log-entry log-${log.type}`}>
            <span className="log-icon">
              {log.type === 'success' ? '✓' : log.type === 'error' ? '✗' : 'ℹ'}
            </span>
            <span className="log-message">{log.message}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
