import React, { useState, useEffect } from 'react';
import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { MarketOverview } from './components/MarketOverview';
import { NewsFeed } from './components/NewsFeed';
import { EmbeddedWidget } from './components/EmbeddedWidget';
import { DataTableWidget } from './components/DataTableWidget';
import { SQLQueryWidget } from './components/SQLQueryWidget';
import { WidgetSelector } from './components/WidgetSelector';
import { Plus, X, ChevronDown } from 'lucide-react';

const timezones = [
  { id: 'nyc', name: 'New York', timezone: 'America/New_York' },
  { id: 'sf', name: 'San Francisco', timezone: 'America/Los_Angeles' },
  { id: 'london', name: 'London', timezone: 'Europe/London' }
];

function App() {
  const [widgets, setWidgets] = useState([
    // { i: 'market', x: 0, y: 0, w: 6, h: 8, component: 'market' },
    { i: 'data-table', x: 0, y: 0, w: 16, h: 12, component: 'table' },
    { i: 'news', x: 8, y: 6, w: 6, h: 16, component: 'news' },
    { i: 'tradingview', x: 0, y: 8, w: 6, h: 16, component: 'iframe', url: 'https://trade.adj.news' },
  ]);
  const [showWidgetSelector, setShowWidgetSelector] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedTimezone, setSelectedTimezone] = useState(timezones[0]);
  const [showTimezoneDropdown, setShowTimezoneDropdown] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const addWidget = (type: 'iframe' | 'table' | 'sql' | 'market') => {
    const id = `widget-${Date.now()}`;
    setWidgets([
      ...widgets,
      {
        i: id,
        x: (widgets.length * 2) % 12,
        y: Infinity,
        w: 6,
        h: 8,
        component: type,
        ...(type === 'iframe' ? { url: 'about:blank' } : {})
      }
    ]);
    setShowWidgetSelector(false);
  };

  const removeWidget = (id: string) => {
    setWidgets(widgets.filter(widget => widget.i !== id));
  };

  const formatTimeForTimezone = (date: Date, timezone: string) => {
    return date.toLocaleTimeString('en-US', {
      timeZone: timezone,
      hour12: true,
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const renderWidget = (widget: any) => {
    const props = {
      onRemove: () => removeWidget(widget.i)
    };

    switch (widget.component) {
      case 'market':
        return <MarketOverview {...props} />;
      case 'news':
        return <NewsFeed {...props} />;
      case 'iframe':
        return (
          <EmbeddedWidget 
            url={widget.url}
            title="Embedded View"
            onUrlChange={(url) => {
              setWidgets(widgets.map(w => 
                w.i === widget.i ? { ...w, url } : w
              ));
            }}
            {...props}
          />
        );
      case 'table':
        return <DataTableWidget title="Data Table" {...props} />;
      case 'sql':
        return <SQLQueryWidget {...props} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="terminal-header text-2xl">ADJACENT MARKET TERMINAL</h1>
        <div className="relative">
          <button
            onClick={() => setShowTimezoneDropdown(!showTimezoneDropdown)}
            className="text-[#FFD700] font-mono text-sm flex items-center gap-2 terminal-button"
          >
            {formatTimeForTimezone(currentTime, selectedTimezone.timezone)}
            <span className="text-xs">{selectedTimezone.name}</span>
            <ChevronDown className="h-4 w-4" />
          </button>
          
          {showTimezoneDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-black border border-neutral-800 shadow-lg z-50">
              {timezones.map((tz) => (
                <button
                  key={tz.id}
                  className="w-full text-left px-4 py-2 text-white hover:bg-neutral-800 font-mono text-sm"
                  onClick={() => {
                    setSelectedTimezone(tz);
                    setShowTimezoneDropdown(false);
                  }}
                >
                  {tz.name} - {formatTimeForTimezone(currentTime, tz.timezone)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <GridLayout
        className="layout"
        layout={widgets}
        cols={12}
        rowHeight={30}
        width={window.innerWidth - 32}
        isDraggable={true}
        isResizable={true}
        margin={[12, 12]}
        onLayoutChange={(layout) => {
          setWidgets(widgets.map(widget => {
            const updatedLayout = layout.find(l => l.i === widget.i);
            return updatedLayout ? { ...widget, ...updatedLayout } : widget;
          }));
        }}
      >
        {widgets.map((widget) => (
          <div key={widget.i}>
            {renderWidget(widget)}
          </div>
        ))}
      </GridLayout>
      <button
        onClick={() => setShowWidgetSelector(true)}
        className="add-widget-button"
        title="Add Widget"
      >
        <Plus className="h-6 w-6" />
      </button>
      {showWidgetSelector && (
        <WidgetSelector
          onSelect={addWidget}
          onClose={() => setShowWidgetSelector(false)}
        />
      )}
    </div>
  );
}

export default App;