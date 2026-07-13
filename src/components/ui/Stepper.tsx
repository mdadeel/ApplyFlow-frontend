import { Check } from '../../lib/icons';

interface Step {
  label: string;
  status: 'completed' | 'active' | 'pending';
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export function Stepper({ steps, currentStep, className = '' }: StepperProps) {
  const displaySteps = steps.map((step, index) => ({
    label: step.label,
    status: index < currentStep ? 'completed' as const : index === currentStep ? 'active' as const : 'pending' as const,
  }));

  return (
    <div className={`flex items-center ${className}`}>
      {displaySteps.map((step, index) => (          <div key={index} className="flex items-center flex-1 last:flex-none" aria-current={step.status === 'active' ? 'step' : undefined}>
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center justify-center h-8 w-8 rounded-full text-label-sm font-medium transition-colors duration-200 shrink-0
                ${step.status === 'completed'
                  ? 'bg-primary text-on-primary'
                  : step.status === 'active'
                  ? 'bg-primary-container text-on-primary border-2 border-primary'
                  : 'bg-surface-container text-on-surface-variant border border-outline-variant'
                }`}
              aria-label={step.status === 'completed' ? `Step ${index + 1}: ${step.label} (completed)` : step.status === 'active' ? `Step ${index + 1}: ${step.label} (current)` : `Step ${index + 1}: ${step.label}`}
            >
              {step.status === 'completed' ? (
                <Check className="h-4 w-4" />
              ) : (
                <span>{index + 1}</span>
              )}
            </div>
            <span className={`text-label-sm font-medium ${step.status === 'active' ? 'text-primary' : step.status === 'completed' ? 'text-on-surface' : 'text-on-surface-variant'}`}>
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className={`flex-1 h-0.5 mx-3 ${step.status === 'completed' ? 'bg-primary' : 'bg-outline-variant'}`} />
          )}
        </div>
      ))}
    </div>
  );
}
