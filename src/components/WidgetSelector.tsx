import React from 'react';
import { Globe, Table, Database, TrendingUp } from 'lucide-react';

interface WidgetSelectorProps {
  onSelect: (type: 'iframe' | 'table' | 'sql' | 'market') => void;
  onClose: () => void;
}

export const WidgetSelector: React.FC<WidgetSelectorProps> = ({ onSelect, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="terminal-widget p-6 min-w-[300px]" onClick={e => e.stopPropagation()}>
        <h2 className="terminal-header mb-4">Add Widget</h2>
        <div className="space-y-2">
          <button
            onClick={() => onSelect('market')}
            className="terminal-button w-full flex items-center gap-3 justify-start"
          >
            <TrendingUp className="h-5 w-5" />
            Market Overview (In Progress)
          </button>
          <button
            onClick={() => onSelect('iframe')}
            className="terminal-button w-full flex items-center gap-3 justify-start"
          >
            <Globe className="h-5 w-5" />
            Embedded Website
          </button>
          <button
            onClick={() => onSelect('table')}
            className="terminal-button w-full flex items-center gap-3 justify-start"
          >
            <Table className="h-5 w-5" />
            Data Table
          </button>
          <button
            onClick={() => onSelect('sql')}
            className="terminal-button w-full flex items-center gap-3 justify-start"
          >
            <Database className="h-5 w-5" />
            SQL Query (In Progress)
          </button>
        </div>
      </div>
    </div>
  );
};