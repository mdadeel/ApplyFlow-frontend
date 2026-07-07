export interface Tab {
  id: string;
  label: string;
  count?: number;
}

export type TabsVariant = 'underline' | 'pill';

export interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
  variant?: TabsVariant;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, variant = 'underline', className = '' }: TabsProps) {
  if (variant === 'pill') {
    return (
      <div className={`flex flex-wrap gap-1 ${className}`}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-meta font-medium transition-colors duration-150
              ${activeTab === tab.id
                ? 'bg-primary text-white'
                : 'bg-surface-secondary text-text-tertiary hover:bg-surface-tertiary'
              }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className={`px-1.5 py-0.5 rounded-full text-meta ${activeTab === tab.id ? 'text-white' : 'bg-surface-tertiary text-text-tertiary'}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={`flex border-b border-border ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`inline-flex items-center gap-2 px-4 py-3 text-caption font-medium transition-colors duration-150 border-b-2 -mb-px relative
            ${activeTab === tab.id
              ? 'border-primary text-primary'
              : 'border-transparent text-text-tertiary hover:text-text-primary'
            }`}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className={`px-1.5 py-0.5 rounded-full text-meta ${activeTab === tab.id ? 'bg-surface-tertiary text-primary' : 'bg-surface-tertiary text-text-tertiary'}`}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
