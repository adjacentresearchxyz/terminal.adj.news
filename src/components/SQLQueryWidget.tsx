import React, { useState, useEffect, useRef } from 'react';
import { Database } from '@duckdb/duckdb-wasm';
import { Play, X, BarChart, Table as TableIcon } from 'lucide-react';
import * as monaco from 'monaco-editor';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, BarChart as RechartsBarChart, Bar } from 'recharts';

interface SQLQueryWidgetProps {
  onRemove: () => void;
}

type ViewMode = 'table' | 'line' | 'bar';

export const SQLQueryWidget: React.FC<SQLQueryWidgetProps> = ({ onRemove }) => {
  const [query, setQuery] = useState('SELECT * FROM my_table LIMIT 10');
  const [results, setResults] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const editorRef = useRef<HTMLDivElement>(null);
  const monacoEditorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    if (editorRef.current && !monacoEditorRef.current) {
      monacoEditorRef.current = monaco.editor.create(editorRef.current, {
        value: query,
        language: 'sql',
        theme: 'vs-dark',
        minimap: { enabled: false },
        automaticLayout: true,
        fontSize: 14,
        lineNumbers: 'on',
      });

      monacoEditorRef.current.onDidChangeModelContent(() => {
        setQuery(monacoEditorRef.current?.getValue() || '');
      });
    }

    return () => {
      monacoEditorRef.current?.dispose();
    };
  }, []);

  const executeQuery = async () => {
    try {
      setError(null);
      // In a real implementation, this would connect to your remote DuckDB instance
      // For demo purposes, we'll simulate some data
      const mockData = [
        { date: '2024-01', value: 100, category: 'A' },
        { date: '2024-02', value: 150, category: 'A' },
        { date: '2024-03', value: 200, category: 'B' },
        { date: '2024-04', value: 180, category: 'B' },
        { date: '2024-05', value: 250, category: 'C' },
      ];
      setResults(mockData);
      setColumns(Object.keys(mockData[0]));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const renderVisualization = () => {
    switch (viewMode) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={results}>
              <XAxis dataKey="date" stroke="#4B5563" />
              <YAxis stroke="#4B5563" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0A192F',
                  border: '1px solid #1E40AF',
                  borderRadius: '0',
                }}
              />
              <Line type="monotone" dataKey="value" stroke="#FFD700" />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <RechartsBarChart data={results}>
              <XAxis dataKey="date" stroke="#4B5563" />
              <YAxis stroke="#4B5563" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0A192F',
                  border: '1px solid #1E40AF',
                  borderRadius: '0',
                }}
              />
              <Bar dataKey="value" fill="#FFD700" />
            </RechartsBarChart>
          </ResponsiveContainer>
        );
      case 'table':
      default:
        return (
          <div className="overflow-x-auto">
            <table className="terminal-table">
              <thead>
                <tr>
                  {columns.map((col) => (
                    <th key={col}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.map((row, i) => (
                  <tr key={i}>
                    {columns.map((col) => (
                      <td key={col}>{row[col]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
    }
  };

  return (
    <div className="terminal-widget p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="terminal-header">SQL Query</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('table')}
            className={`terminal-button p-2 ${viewMode === 'table' ? 'border-[#FFD700]' : ''}`}
          >
            <TableIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('line')}
            className={`terminal-button p-2 ${viewMode === 'line' ? 'border-[#FFD700]' : ''}`}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode('bar')}
            className={`terminal-button p-2 ${viewMode === 'bar' ? 'border-[#FFD700]' : ''}`}
          >
            <BarChart className="h-4 w-4" />
          </button>
          <button onClick={onRemove} className="text-red-400 hover:text-red-300">
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 mb-4 min-h-[200px] border border-neutral-800" ref={editorRef} />

      <div className="flex justify-between items-center mb-4">
        <button onClick={executeQuery} className="terminal-button flex items-center gap-2">
          <Play className="h-4 w-4" />
          Execute Query
        </button>
        {error && <div className="text-red-400">{error}</div>}
      </div>

      <div className="flex-1 overflow-auto">
        {results.length > 0 && renderVisualization()}
      </div>
    </div>
  );
};