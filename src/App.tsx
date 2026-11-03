import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  ANGLES,
  GalleryEntry,
  PAGE_SIZE,
  PoseGroup,
  PoseItem,
  ViewMode,
} from './types';
import { Header } from './components/Header';
import { Controls } from './components/Controls';
import { PoseCard } from './components/PoseCard';
import { SingleCard } from './components/SingleCard';
import { ViewerModal } from './components/ViewerModal';
import { InfoDialog, InfoType } from './components/InfoDialog';
import { Footer } from './components/Footer';

function groupKey(item: PoseItem): string {
  return `${item.system}|${item.number || item.id}`;
}

export const App: React.FC = () => {
  const [data, setData] = useState<PoseItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [selectedLine, setSelectedLine] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedAngle, setSelectedAngle] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<ViewMode>('pose');
  const [shownCount, setShownCount] = useState<number>(PAGE_SIZE.pose);

  // Dialogs and Viewer
  const [infoModal, setInfoModal] = useState<InfoType | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState<boolean>(false);
  const [viewerIndex, setViewerIndex] = useState<number>(0);
  const [viewerItem, setViewerItem] = useState<PoseItem | null>(null);

  // Theme state
  const [theme, setTheme] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme');
      if (stored) return stored;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Sync theme
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Fetch initial pose data
  useEffect(() => {
    setLoading(true);
    fetch('/data/pose-en.json')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((items: PoseItem[]) => {
        // Pre-compute search string
        items.forEach((item) => {
          item._search = `${item.name} ${item.id} ${item.category} ${item.number}`.toLowerCase();
        });
        setData(items);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load pose-en.json', err);
        setError('Could not load pose data. Ensure data/pose-en.json is accessible.');
        setLoading(false);
      });
  }, []);

  // Compute unique series lines
  const lines = useMemo(() => {
    return Array.from(new Set(data.map((item) => item.system)));
  }, [data]);

  // Compute groups and group map
  const { groups, groupMap } = useMemo(() => {
    const map = new Map<string, PoseGroup>();
    const grps: PoseGroup[] = [];

    data.forEach((item) => {
      const key = groupKey(item);
      if (!map.has(key)) {
        const group: PoseGroup = {
          key,
          system: item.system,
          number: item.number,
          name: item.name,
          category: item.category,
          items: [],
          angles: {},
          order: [],
        };
        map.set(key, group);
        grps.push(group);
      }
      const group = map.get(key)!;
      group.items.push(item);
      if (item.angle && !group.angles[item.angle]) {
        group.angles[item.angle] = item;
      }
    });

    grps.sort(
      (a, b) =>
        lines.indexOf(a.system) - lines.indexOf(b.system) ||
        String(a.number).localeCompare(String(b.number))
    );

    grps.forEach((group) => {
      group.order = ANGLES.map((angle) => group.angles[angle]).filter(Boolean);
      group.items.forEach((item) => {
        if (!group.order.includes(item)) group.order.push(item);
      });
    });

    return { groups: grps, groupMap: map };
  }, [data, lines]);

  // Compute available categories for currently selected line
  const categories = useMemo(() => {
    const set = new Set<string>();
    data.forEach((item) => {
      if (!selectedLine || item.system === selectedLine) {
        if (item.category) set.add(item.category);
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'en-US'));
  }, [data, selectedLine]);

  // Handle line change
  const handleSelectLine = (line: string) => {
    setSelectedLine(line);
    setSelectedCategory('');
    setShownCount(PAGE_SIZE[viewMode]);
  };

  // Handle category change
  const handleSelectCategory = (cat: string) => {
    setSelectedCategory(cat);
    setShownCount(PAGE_SIZE[viewMode]);
  };

  // Handle angle change
  const handleSelectAngle = (ang: string) => {
    setSelectedAngle(ang);
    setShownCount(PAGE_SIZE[viewMode]);
  };

  // Handle view switch
  const handleSelectViewMode = (mode: ViewMode) => {
    setViewMode(mode);
    setShownCount(PAGE_SIZE[mode]);
  };

  // Handle search query
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setShownCount(PAGE_SIZE[viewMode]);
  };

  // Reset all filters
  const handleResetAll = () => {
    setSelectedLine('');
    setSelectedCategory('');
    setSelectedAngle('');
    setSearchQuery('');
    setViewMode('pose');
    setShownCount(PAGE_SIZE.pose);
  };

  // Clear single filter chip
  const handleClearFilter = (key: string) => {
    if (key === 'line') {
      setSelectedLine('');
      setSelectedCategory('');
    } else if (key === 'category') {
      setSelectedCategory('');
    } else if (key === 'angle') {
      setSelectedAngle('');
    } else if (key === 'query') {
      setSearchQuery('');
    } else if (key === 'view') {
      setViewMode('pose');
    }
    setShownCount(PAGE_SIZE[viewMode]);
  };

  // Filter criteria checker
  const hit = useCallback(
    (item: PoseItem) => {
      const q = searchQuery.trim().toLowerCase();
      return (
        (!selectedLine || item.system === selectedLine) &&
        (!selectedCategory || item.category === selectedCategory) &&
        (!selectedAngle || item.angle === selectedAngle) &&
        (!q || (item._search ? item._search.includes(q) : false))
      );
    },
    [selectedLine, selectedCategory, selectedAngle, searchQuery]
  );

  // Compute matched list
  const currentList: GalleryEntry[] = useMemo(() => {
    if (!data.length) return [];
    if (viewMode === 'single') {
      return data.filter(hit).map((item) => ({
        group: groupMap.get(groupKey(item))!,
        item,
        matched: 1,
      }));
    }

    return groups
      .filter((group) => group.items.some(hit))
      .map((group) => ({
        group,
        item: (selectedAngle && group.angles[selectedAngle]) || group.order[0],
        matched: group.items.filter(hit).length,
      }));
  }, [data, groups, groupMap, viewMode, hit, selectedAngle]);

  const visibleList = useMemo(() => {
    return currentList.slice(0, shownCount);
  }, [currentList, shownCount]);

  const totalMatches = currentList.length;
  const totalImagesMatched = useMemo(() => {
    if (viewMode === 'single') return totalMatches;
    return currentList.reduce((sum, entry) => sum + entry.matched, 0);
  }, [currentList, viewMode, totalMatches]);

  // Open Viewer
  const handleOpenViewer = (index: number, item: PoseItem) => {
    setViewerIndex(index);
    setViewerItem(item);
    setIsViewerOpen(true);
  };

  const handleCloseViewer = () => {
    setIsViewerOpen(false);
  };

  const handleChangeViewerItem = (newIndex: number, newItem: PoseItem) => {
    setViewerIndex(newIndex);
    setViewerItem(newItem);
  };

  // Global keydown for '/' shortcut to search
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (isViewerOpen || infoModal !== null) return;
      if (
        e.key === '/' &&
        !['INPUT', 'TEXTAREA', 'SELECT'].includes(
          (document.activeElement?.tagName || '').toUpperCase()
        )
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isViewerOpen, infoModal]);

  return (
    <>
      <Header
        poseCount={groups.length}
        imageCount={data.length}
        onOpenInfo={(type) => setInfoModal(type)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <Controls
        lines={lines}
        data={data}
        groups={groups}
        selectedLine={selectedLine}
        onSelectLine={handleSelectLine}
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
        selectedAngle={selectedAngle}
        onSelectAngle={handleSelectAngle}
        viewMode={viewMode}
        onSelectViewMode={handleSelectViewMode}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onResetAll={handleResetAll}
        searchInputRef={searchInputRef}
        onClearFilter={handleClearFilter}
      />

      <main className="shell">
        <h2 className="sr-only">Pose gallery</h2>

        <div className="result-head">
          <div className="result-summary">
            <strong>
              {loading
                ? 'Loading gallery…'
                : viewMode === 'pose'
                ? `${totalMatches.toLocaleString('en-US')} poses · ${totalImagesMatched.toLocaleString('en-US')} images`
                : `${totalMatches.toLocaleString('en-US')} images`}
            </strong>
            {!loading && (
              <span>
                {totalMatches > shownCount
                  ? `Showing ${visibleList.length.toLocaleString('en-US')} / ${totalMatches.toLocaleString('en-US')}`
                  : `${totalMatches.toLocaleString('en-US')} total`}
              </span>
            )}
          </div>
          <div className="result-hint">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
            >
              <path d="M8 3H3v5m13-5h5v5M8 21H3v-5m13 5h5v-5" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            Hover thumbnails to switch angle · click to view full size
          </div>
        </div>

        <div className="grid" aria-live="polite">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="pose-card skeleton">
                <div className="card-image" />
                <div className="skeleton-line" />
                <div className="skeleton-line short" />
              </div>
            ))
          ) : error ? (
            <div className="empty">
              <h3>Could not load pose data</h3>
              <p>{error}</p>
              <button type="button" onClick={() => window.location.reload()}>
                Reload
              </button>
            </div>
          ) : totalMatches === 0 ? (
            <div className="empty">
              <div className="empty-icon">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                >
                  <circle cx="10.8" cy="10.8" r="6.8" />
                  <path d="m20 20-4.2-4.2" />
                </svg>
              </div>
              <h3>No matching poses</h3>
              <p>Try a different keyword or fewer filters.</p>
              <button type="button" onClick={handleResetAll}>
                Clear all filters
              </button>
            </div>
          ) : (
            visibleList.map((entry, idx) =>
              viewMode === 'pose' ? (
                <PoseCard
                  key={entry.group.key}
                  entry={entry}
                  index={idx}
                  onOpenViewer={handleOpenViewer}
                />
              ) : (
                <SingleCard
                  key={entry.item.id}
                  entry={entry}
                  index={idx}
                  onOpenViewer={handleOpenViewer}
                />
              )
            )
          )}
        </div>

        {!loading && totalMatches > shownCount && (
          <button
            className="load-more"
            type="button"
            onClick={() =>
              setShownCount((prev) =>
                Math.min(prev + PAGE_SIZE[viewMode], totalMatches)
              )
            }
          >
            Load more ({(totalMatches - shownCount).toLocaleString('en-US')}{' '}
            {viewMode === 'pose' ? 'poses' : 'images'} left)
          </button>
        )}
      </main>

      <Footer />

      {viewerItem && (
        <ViewerModal
          isOpen={isViewerOpen}
          onClose={handleCloseViewer}
          currentIndex={viewerIndex}
          currentItem={viewerItem}
          currentList={currentList}
          onChangeItem={handleChangeViewerItem}
        />
      )}

      <InfoDialog type={infoModal} onClose={() => setInfoModal(null)} />
    </>
  );
};

export default App;
