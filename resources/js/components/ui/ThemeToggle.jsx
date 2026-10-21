import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function ThemeToggle({ className = '' }) {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border transition-colors ${
                isDark
                    ? 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                    : 'border-gray-200 bg-white text-gray-500 shadow-sm hover:bg-gray-50 hover:text-gray-900'
            } ${className}`}
        >
            {isDark ? <Sun size={17} /> : <Moon size={17} />}
        </button>
    );
}
