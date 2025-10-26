import './MintButton.css'

interface MintButtonProps {
  isLoading: boolean
  disabled: boolean
  onClick: () => void
}

export default function MintButton({ isLoading, disabled, onClick }: MintButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="mint-button"
    >
      {isLoading ? 'ミント中...' : 'NFTをミント'}
    </button>
  )
}
