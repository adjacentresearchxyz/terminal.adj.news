import React, { useState, useEffect } from 'react';
import { Upload, RefreshCw, Table as TableIcon, X, Download } from 'lucide-react';

interface DataTableWidgetProps {
  title: string;
  onRemove: () => void;
}

export const DataTableWidget: React.FC<DataTableWidgetProps> = ({ title, onRemove }) => {
  const [data, setData] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [source, setSource] = useState('https://v2.api.data.adj.news/api/volatile');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load default data on mount
    handleUrlSubmit();
  }, []);

  const parseCSV = (text: string) => {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const rows = lines.slice(1).map(line => 
      line.split(',').reduce((obj, val, idx) => ({
        ...obj,
        [headers[idx]]: val.trim()
      }), {})
    );
    setColumns(headers);
    setData(rows);
  };

  const parseJSON = (text: string) => {
    try {
      let parsed = JSON.parse(text);
      // If the JSON is not an array, wrap it in an array
      if (!Array.isArray(parsed)) {
        parsed = [parsed];
      }
      
      if (parsed.length > 0) {
        // Get all unique columns from all objects
        const allColumns = new Set<string>();
        parsed.forEach(item => {
          Object.keys(item).forEach(key => allColumns.add(key));
        });
        
        setColumns(Array.from(allColumns));
        setData(parsed);
      }
    } catch (error) {
      console.error('Error parsing JSON:', error);
      throw new Error('Invalid JSON format');
    }
  };

  const formatCellValue = (value: any): string => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'boolean') return value.toString();
    if (typeof value === 'object') {
      if (Array.isArray(value)) {
        return value.join(', ');
      }
      return JSON.stringify(value);
    }
    if (value instanceof Date || (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}T/))) {
      return new Date(value).toLocaleString();
    }
    return value.toString();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const text = await file.text();
      if (file.name.endsWith('.csv')) {
        parseCSV(text);
      } else if (file.name.endsWith('.json')) {
        parseJSON(text);
      }
    } catch (error) {
      console.error('Error parsing file:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUrlSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!source) return;

    setIsLoading(true);
    try {
      const response = await fetch(source);
      const text = await response.text();
      
      if (source.endsWith('.csv')) {
        parseCSV(text);
      } else {
        parseJSON(text);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!source) return;

    try {
      const response = await fetch(source);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      // Extract filename from URL or use default
      const filename = source.split('/').pop() || 'data';
      const extension = source.endsWith('.csv') ? '.csv' : '.json';
      a.download = filename + extension;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading data:', error);
    }
  };

  const renderLoadingSpinner = () => (
    <div className="h-full flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-neutral-400"></div>
    </div>
  );

  const renderEmptyState = () => (
    <div className="h-full flex items-center justify-center text-neutral-500">
      Upload a CSV/JSON file or enter a URL to load data
    </div>
  );

  const renderTable = () => (
    <div className="overflow-x-auto">
      <table className="terminal-table w-full">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column} className="whitespace-nowrap px-4 py-2 text-left">
                {column.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              {columns.map((column) => (
                <td key={column} className="px-4 py-2 whitespace-nowrap">
                  {formatCellValue(row[column])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="terminal-widget p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TableIcon className="text-neutral-400 h-5 w-5" />
          <h2 className="terminal-header">{title}</h2>
        </div>
        <div className="flex gap-2">
          <label className="widget-button cursor-pointer">
            <Upload className="h-5 w-5" />
            <input
              type="file"
              accept=".csv,.json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
          <button
            onClick={handleDownload}
            className="widget-button text-neutral-400 hover:text-white"
            disabled={!source}
          >
            <Download className="h-5 w-5" />
          </button>
          <button 
            onClick={() => {
              setData([]);
              setColumns([]);
              setSource('');
            }}
            className="widget-button text-neutral-400 hover:text-white"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
          <button onClick={onRemove} className="widget-button text-red-400 hover:text-red-300">
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <form onSubmit={handleUrlSubmit} className="mb-4">
        <div className="flex gap-2">
          <input
            type="url"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="terminal-input flex-1"
            placeholder={isLoading ? "Loading..." : "Enter CSV/JSON URL"}
            disabled={isLoading}
          />
          <button type="submit" className="terminal-button" disabled={isLoading}>
            {isLoading ? "Loading..." : "Load"}
          </button>
        </div>
      </form>

      <div className="flex-1 overflow-auto">
        {isLoading ? renderLoadingSpinner() : 
         data.length > 0 ? renderTable() : 
         renderEmptyState()}
      </div>
    </div>
  );
};