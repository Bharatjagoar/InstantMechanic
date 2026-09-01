import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium"
      style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
      {theme === 'dark' ? 'Light mode' : 'Dark mode'}
    </button>
  )
}
