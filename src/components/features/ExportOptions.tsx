import { useState } from 'react';
import { FileText, FileSpreadsheet, FileCode } from '../../lib/icons';

export interface ExportFormat {
  format: string;
  label: string;
  description: string;
  icon: typeof FileText;
}

const defaultFormats: ExportFormat[] = [
  { format: 'pdf', label: 'PDF', description: 'Printable document, best for submissions', icon: FileText },
  { format: 'docx', label: 'DOCX', description: 'Editable Word document', icon: FileSpreadsheet },
  { format: 'md', label: 'Markdown', description: 'Plain text with formatting', icon: FileCode },
];

interface ExportOptionsProps {
  onExport: (format: string) => void;
  loading?: boolean;
  formats?: ExportFormat[];
  defaultFormat?: string;
}

export function ExportOptions({ onExport, loading, formats, defaultFormat }: ExportOptionsProps) {
  const exportFormats = formats ?? defaultFormats
  const [selected, setSelected] = useState<string | null>(defaultFormat ?? exportFormats[0]?.format ?? null);

  const handleExport = (format: string) => {
    setSelected(format);
    onExport(format);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {exportFormats.map((fmt) => {
        const isSelected = selected === fmt.format;
        const Icon = fmt.icon;
        return (
          <button
            key={fmt.format}
            type="button"
            onClick={() => handleExport(fmt.format)}
            disabled={loading}
            className={`flex flex-col items-center gap-3 p-md rounded-xl border text-left transition-all duration-150
              ${isSelected
                ? 'border-primary bg-primary-container text-on-primary-container'
                : 'border-outline-variant bg-surface text-on-surface hover:border-outline'
              }
              ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <div className={`p-2.5 rounded-xl ${isSelected ? 'bg-primary-fixed' : 'bg-surface-container-low'}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="text-center">
              <p className="text-body-md font-semibold">{fmt.label}</p>
              <p className={`text-label-sm mt-0.5 ${isSelected ? 'text-on-primary-container' : 'text-on-surface-variant'}`}>
                {fmt.description}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
