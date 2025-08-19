'use client';

import { motion } from 'framer-motion';
import { FaSun, FaMoon } from 'react-icons/fa';
import { useTheme } from './ThemeProvider';

interface ThemeToggleProps {
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function ThemeToggle({ size = 'md', showLabel = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  const sizeClasses = {
    sm: 'w-10 h-6',
    md: 'w-12 h-7',
    lg: 'w-14 h-8'
  };

  const iconSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const thumbSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <div className="flex items-center gap-3">
      {showLabel && (
        <span className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
          {theme === 'light' ? 'Light' : 'Dark'}
        </span>
      )}
      
      <motion.button
        onClick={toggleTheme}
        className={`
          ${sizeClasses[size]} 
          relative rounded-full p-1 
          bg-gray-200 dark:bg-dark-tertiary 
          border-2 border-gray-300 dark:border-dark-border
          transition-all duration-300 ease-in-out
          hover:shadow-lg hover:scale-105
          focus:outline-none focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent
          group
        `}
        whileTap={{ scale: 0.95 }}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {/* Background gradient */}
        <div className={`
          absolute inset-1 rounded-full transition-all duration-300
          ${theme === 'dark' 
            ? 'bg-gradient-to-r from-indigo-500 to-purple-600' 
            : 'bg-gradient-to-r from-yellow-400 to-orange-500'
          }
        `} />
        
        {/* Sliding thumb */}
        <motion.div
          className={`
            ${thumbSizeClasses[size]}
            relative z-10 rounded-full
            bg-white dark:bg-dark-primary
            shadow-lg
            flex items-center justify-center
            border-2 border-white dark:border-dark-border
          `}
          animate={{
            x: theme === 'dark' ? '100%' : '0%',
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30
          }}
        >
          {/* Icon */}
          <motion.div
            key={theme}
            initial={{ opacity: 0, rotate: -180 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 180 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-center"
          >
            {theme === 'light' ? (
              <FaSun className={`${iconSizeClasses[size]} text-yellow-500`} />
            ) : (
              <FaMoon className={`${iconSizeClasses[size]} text-indigo-400`} />
            )}
          </motion.div>
        </motion.div>
        
        {/* Glow effect */}
        <div className={`
          absolute inset-0 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300
          ${theme === 'dark' 
            ? 'bg-gradient-to-r from-indigo-500 to-purple-600' 
            : 'bg-gradient-to-r from-yellow-400 to-orange-500'
          }
          blur-xl
        `} />
      </motion.button>
    </div>
  );
} 