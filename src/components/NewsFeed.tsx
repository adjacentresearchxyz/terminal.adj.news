import React, { useState, useEffect } from 'react';
import { Newspaper, Settings2, Plus, X, RefreshCw } from 'lucide-react';

interface NewsItem {
  id: number;
  title: string;
  source: string;
  time: string;
  link: string;
}

interface RSSFeed {
  id: string;
  name: string;
  url: string;
  items: NewsItem[];
  isLoading: boolean;
  error?: string;
}

interface NewsFeedProps {
  onRemove: () => void;
}

const defaultFeeds: RSSFeed[] = [
  {
    id: 'adj-news',
    name: 'Adjacent News',
    url: 'https://adj.news/rss',
    items: [],
    isLoading: true
  }
];

export const NewsFeed: React.FC<NewsFeedProps> = ({ onRemove }) => {
  const [showManageFeeds, setShowManageFeeds] = useState(false);
  const [feeds, setFeeds] = useState<RSSFeed[]>(defaultFeeds);
  const [newFeedUrl, setNewFeedUrl] = useState('');
  const [newFeedName, setNewFeedName] = useState('');

  const fetchFeed = async (feed: RSSFeed) => {
    try {
      const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}`);
      const data = await response.json();
      
      if (data.status === 'ok') {
        return data.items.map((item: any, index: number) => ({
          id: index,
          title: item.title,
          source: item.author || feed.name,
          time: new Date(item.pubDate).toLocaleString(),
          link: item.link
        }));
      }
      throw new Error('Failed to parse feed');
    } catch (error) {
      console.error(`Error fetching feed ${feed.name}:`, error);
      throw error;
    }
  };

  const refreshFeeds = async () => {
    setFeeds(feeds.map(feed => ({ ...feed, isLoading: true, error: undefined })));
    
    const updatedFeeds = await Promise.all(
      feeds.map(async (feed) => {
        try {
          const items = await fetchFeed(feed);
          return { ...feed, items, isLoading: false };
        } catch (error) {
          return { ...feed, items: [], isLoading: false, error: 'Failed to load feed' };
        }
      })
    );
    
    setFeeds(updatedFeeds);
  };

  useEffect(() => {
    refreshFeeds();
    const interval = setInterval(refreshFeeds, 5 * 60 * 1000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []); // Empty dependency array for initial load only

  const addFeed = async () => {
    if (newFeedUrl && newFeedName) {
      const newFeed: RSSFeed = {
        id: Date.now().toString(),
        name: newFeedName,
        url: newFeedUrl,
        items: [],
        isLoading: true
      };
      
      setFeeds([...feeds, newFeed]);
      setNewFeedUrl('');
      setNewFeedName('');
      
      try {
        const items = await fetchFeed(newFeed);
        setFeeds(currentFeeds => 
          currentFeeds.map(feed => 
            feed.id === newFeed.id ? { ...feed, items, isLoading: false } : feed
          )
        );
      } catch (error) {
        setFeeds(currentFeeds => 
          currentFeeds.map(feed => 
            feed.id === newFeed.id ? { ...feed, isLoading: false, error: 'Failed to load feed' } : feed
          )
        );
      }
    }
  };

  const removeFeed = (id: string) => {
    setFeeds(feeds.filter(feed => feed.id !== id));
  };

  if (showManageFeeds) {
    return (
      <div className="terminal-widget p-4 h-full overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Settings2 className="text-blue-400 h-5 w-5" />
            <h2 className="terminal-header">Manage Feeds</h2>
          </div>
          <button
            onClick={() => setShowManageFeeds(false)}
            className="text-gray-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="bg-[#0A192F]/50 p-4 border border-blue-900/30">
            <h3 className="terminal-header mb-2">Add New Feed</h3>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Feed Name"
                value={newFeedName}
                onChange={(e) => setNewFeedName(e.target.value)}
                className="terminal-input w-full px-3 py-2"
              />
              <input
                type="url"
                placeholder="RSS Feed URL"
                value={newFeedUrl}
                onChange={(e) => setNewFeedUrl(e.target.value)}
                className="terminal-input w-full px-3 py-2"
              />
              <button
                onClick={addFeed}
                className="flex items-center gap-2 bg-blue-900 text-white px-4 py-2 hover:bg-blue-800"
              >
                <Plus className="h-4 w-4" />
                Add Feed
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {feeds.map((feed) => (
              <div key={feed.id} className="flex items-center justify-between bg-[#0A192F]/50 p-3 border border-blue-900/30">
                <div>
                  <div className="terminal-value">{feed.name}</div>
                  <div className="text-gray-400 text-sm font-mono">{feed.url}</div>
                </div>
                <button
                  onClick={() => removeFeed(feed.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="terminal-widget p-4 h-full overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Newspaper className="text-blue-400 h-5 w-5" />
          <h2 className="terminal-header">Market News</h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={refreshFeeds} 
            className="text-gray-400 hover:text-white"
            title="Refresh feeds"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
          <button
            onClick={() => setShowManageFeeds(true)}
            className="text-gray-400 hover:text-white"
            title="Manage feeds"
          >
            <Settings2 className="h-5 w-5" />
          </button>
          <button onClick={onRemove} className="text-red-400 hover:text-red-300">
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div className="space-y-4 overflow-y-auto h-[calc(100%-3rem)]">
        {feeds.map((feed) => (
          <div key={feed.id} className="bg-[#0A192F]/50 p-3 border border-blue-900/30">
            <div className="text-white mb-1 font-mono">{feed.name}</div>
            <div className="space-y-3">
              {feed.isLoading ? (
                <div className="border-l-2 border-blue-500 pl-3">
                  <h3 className="terminal-value">Loading feed content...</h3>
                  <div className="text-sm text-white mt-1 font-mono">Fetching latest updates</div>
                </div>
              ) : feed.error ? (
                <div className="border-l-2 border-red-500 pl-3">
                  <h3 className="terminal-value text-red-400">{feed.error}</h3>
                </div>
              ) : (
                feed.items.map(item => (
                  <div key={item.id} className="border-l-2 border-blue-500 pl-3">
                    <a href={item.link} target="_blank" rel="noopener noreferrer" className="terminal-value text-white hover:text-gray-300">
                      {item.title}
                    </a>
                    <div className="text-sm text-white mt-1 font-mono">
                      {item.source} • {item.time}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};