import React from 'react';
import { TrendingUp, TrendingDown, X } from 'lucide-react';

interface StockData {
  symbol: string;
  price: number;
  change: number;
  volume: string;
}

const stocks: StockData[] = [
  { symbol: 'AAPL', price: 173.25, change: 1.25, volume: '52.3M' },
  { symbol: 'MSFT', price: 378.85, change: -2.15, volume: '28.1M' },
  { symbol: 'GOOGL', price: 142.65, change: 0.75, volume: '15.7M' },
  { symbol: 'AMZN', price: 178.35, change: -1.45, volume: '31.2M' },
  { symbol: 'NVDA', price: 721.28, change: 2.35, volume: '42.1M' },
  { symbol: 'META', price: 484.15, change: -0.85, volume: '19.8M' },
  { symbol: 'TSLA', price: 193.57, change: -1.75, volume: '35.6M' },
  { symbol: 'BRK.B', price: 412.63, change: 0.95, volume: '12.4M' }
];

interface MarketOverviewProps {
  onRemove: () => void;
}

export const MarketOverview: React.FC<MarketOverviewProps> = ({ onRemove }) => {
  return (
    <div className="terminal-widget p-4 h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="terminal-header">Market Overview <span className="text-neutral-600">|</span> NYSE</div>
        <button onClick={onRemove} className="widget-button text-red-400 hover:text-red-300">
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {stocks.map((stock) => (
          <div key={stock.symbol} className="bg-neutral-900/50 p-3 border border-neutral-800">
            <div className="flex justify-between items-center">
              <span className="terminal-value font-semibold">{stock.symbol}</span>
              {stock.change >= 0 ? (
                <TrendingUp className="text-green-400 h-4 w-4" />
              ) : (
                <TrendingDown className="text-red-400 h-4 w-4" />
              )}
            </div>
            <div className="text-lg terminal-value">${stock.price.toFixed(2)}</div>
            <div className="flex justify-between items-center mt-1">
              <span className={`text-sm ${stock.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {stock.change > 0 ? '+' : ''}{stock.change}%
              </span>
              <span className="text-sm text-neutral-400">VOL {stock.volume}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};