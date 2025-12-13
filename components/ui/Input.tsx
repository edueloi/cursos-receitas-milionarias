import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  endIcon?: React.ReactNode;
  onEndIconClick?: () => void;
}

const Input: React.FC<InputProps> = ({ label, error, endIcon, onEndIconClick, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          className={`
            w-full px-4 py-3 rounded-lg border bg-white
            focus:ring-2 focus:ring-rm-gold focus:border-transparent outline-none transition-all
            placeholder-gray-400 text-gray-800
            ${error ? 'border-red-500' : 'border-gray-300'}
            ${endIcon ? 'pr-10' : ''}
            ${className}
          `}
          {...props}
        />
        {endIcon && (
          <button
            type="button"
            onClick={onEndIconClick}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-rm-green transition-colors"
          >
            {endIcon}
          </button>
        )}
      </div>
      {error && <span className="text-xs text-red-500 mt-1">{error}</span>}
    </div>
  );
};

export default Input;