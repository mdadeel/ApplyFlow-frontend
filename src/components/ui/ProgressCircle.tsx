type ProgressCircleColor = 'primary' | 'success' | 'warning' | 'error';

interface ProgressCircleProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  color?: ProgressCircleColor;
  className?: string;
}

const colorMap: Record<ProgressCircleColor, string> = {
  primary: '#2563eb',
  success: '#059669',
  warning: '#d97706',
  error: '#dc2626',
};

export function ProgressCircle({ value, size = 80, strokeWidth = 6, color = 'primary', className = '' }: ProgressCircleProps) {
  const clampedValue = Math.min(100, Math.max(0, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clampedValue / 100) * circumference;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e2e7ff"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colorMap[color]}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      <span className="absolute text-label-sm font-medium text-on-surface">
        {Math.round(clampedValue)}%
      </span>
    </div>
  );
}
