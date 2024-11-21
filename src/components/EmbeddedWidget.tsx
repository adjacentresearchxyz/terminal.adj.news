import React, { useState } from 'react';
import { ExternalLink, RefreshCw, X } from 'lucide-react';

interface EmbeddedWidgetProps {
  url: string;
  title: string;
  onUrlChange?: (url: string) => void;
  onRemove: () => void;
}

export const EmbeddedWidget: React.FC<EmbeddedWidgetProps> = ({ url: initialUrl, title, onUrlChange, onRemove }) => {
  const [url, setUrl] = useState(initialUrl);
  const [key, setKey] = useState(0);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUrlChange?.(url);
    setKey(prev => prev + 1);
  };

  const handleRefresh = () => {
    setKey(prev => prev + 1);
  };

  return (
    <div className="terminal-widget p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="terminal-header">{title}</h2>
        <div className="flex gap-2">
          <button 
            onClick={handleRefresh}
            className="text-neutral-400 hover:text-white"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
          <a 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-neutral-400 hover:text-white"
          >
            <ExternalLink className="h-5 w-5" />
          </a>
          <button onClick={onRemove} className="text-red-400 hover:text-red-300">
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex gap-2">
          <input
            type="url"
            value={url}
            onChange={handleUrlChange}
            className="terminal-input flex-1"
            placeholder="Enter URL"
          />
          <button type="submit" className="terminal-button">
            Load
          </button>
        </div>
      </form>
      <div className="flex-1 bg-white">
        <iframe
          key={key}
          src={url}
          className="w-full h-full"
          title={title}
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </div>
  );
};