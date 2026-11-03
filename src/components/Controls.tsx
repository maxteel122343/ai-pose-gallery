import React, { useState } from 'react';
import { ANGLES, PoseGroup, PoseItem, ViewMode } from '../types';

interface ControlsProps {
  lines: string[];
  data: PoseItem[];
  groups: PoseGroup[];
  selectedLine: string;
  onSelectLine: (line: string) => void;
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  selectedAngle: string;
  onSelectAngle: (angle: string) => void;
  viewMode: ViewMode;
  onSelectViewMode: (view: ViewMode) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onResetAll: () => void;
  searchInputRef: React.RefObject<HTMLInputElement>;
  onClearFilter: (key: string) => void;
}

export const Controls: React.FC<ControlsProps> = ({
  lines,
  data,
  groups,
  selectedLine,
  onSelectLine,
  categories,
  selectedCategory,
  onSelectCategory,
  selectedAngle,
  onSelectAngle,
  viewMode,
  onSelectViewMode,
  searchQuery,
  onSearchChange,
  onResetAll,
  searchInputRef,
  onClearFilter,
}) => {
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filter badge count
  const filterCount =
    [selectedCategory, selectedAngle].filter(Boolean).length +
    (viewMode === 'single' ? 1 : 0);

  // Tabs
  const tabs = [
    { value: '', label: 'All', images: data.length, poses: groups.length },
    ...lines.map((line) => ({
      value: line,
      label: line,
      images: data.filter((item) => item.system === line).length,
      poses: groups.filter((group) => group.system === line).length,
    })),
  ];

  // Active filters list
  const activeFilters: { key: string; label: string }[] = [];
  if (selectedLine) activeFilters.push({ key: 'line', label: `Series: ${selectedLine}` });
  if (selectedCategory) activeFilters.push({ key: 'category', label: `Category: ${selectedCategory}` });
  if (selectedAngle) activeFilters.push({ key: 'angle', label: `Angle: ${selectedAngle}` });
  if (searchQuery) activeFilters.push({ key: 'query', label: `Search: ${searchQuery}` });
  if (viewMode === 'single') activeFilters.push({ key: 'view', label: 'Single images' });

  return (
    <section className="controls" aria-label="Gallery filters">
      <div className="shell controls-inner">
        <div className="line-tabs" role="tablist" aria-label="Series">
          {tabs.map((tab) => (
            <button
              key={tab.value || 'all'}
              className="line-tab"
              type="button"
              role="tab"
              aria-selected={selectedLine === tab.value}
              onClick={() => onSelectLine(tab.value)}
            >
              <span className="tab-name">{tab.label}</span>
              <span className="tab-count">
                {tab.images.toLocaleString('en-US')} images · {tab.poses.toLocaleString('en-US')} poses
              </span>
            </button>
          ))}
        </div>

        <div className="search-row">
          <label className="search-box">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <circle cx="10.8" cy="10.8" r="6.8" />
              <path d="m20 20-4.2-4.2" />
            </svg>
            <input
              ref={searchInputRef}
              id="searchInput"
              type="search"
              placeholder="Search pose name, number, ID or category"
              autoComplete="off"
              aria-label="Search poses"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            {searchQuery && (
              <button
                className="search-clear"
                type="button"
                aria-label="Clear search"
                onClick={() => {
                  onSearchChange('');
                  searchInputRef.current?.focus();
                }}
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="m6 6 12 12M18 6 6 18" />
                </svg>
              </button>
            )}
            <span className="search-key" aria-hidden="true">
              /
            </span>
          </label>
          <button
            className="filter-toggle"
            type="button"
            aria-expanded={mobileFilterOpen}
            aria-controls="filterPanel"
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
          >
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <path d="M4 6h16M7 12h10m-7 6h4" />
            </svg>
            Filters
            {filterCount > 0 && <span className="filter-badge">{filterCount}</span>}
          </button>
        </div>

        <div className={`filter-panel ${mobileFilterOpen ? 'open' : ''}`} id="filterPanel">
          <div className="filter-field">
            <label className="filter-label" htmlFor="categorySelect">
              Category
            </label>
            <div className="select-wrap">
              <select
                id="categorySelect"
                value={selectedCategory}
                onChange={(e) => onSelectCategory(e.target.value)}
              >
                <option value="">All categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="filter-field">
            <span className="filter-label">Angle</span>
            <div className="segmented" role="group" aria-label="Filter by angle">
              <button
                type="button"
                aria-pressed={selectedAngle === ''}
                onClick={() => onSelectAngle('')}
              >
                All angles
              </button>
              {ANGLES.map((angle) => (
                <button
                  key={angle}
                  type="button"
                  aria-pressed={selectedAngle === angle}
                  onClick={() => onSelectAngle(angle)}
                >
                  {angle}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-field view-field">
            <span className="filter-label">View</span>
            <div className="segmented" role="group" aria-label="Switch view">
              <button
                type="button"
                aria-pressed={viewMode === 'pose'}
                onClick={() => onSelectViewMode('pose')}
              >
                Group by pose
              </button>
              <button
                type="button"
                aria-pressed={viewMode === 'single'}
                onClick={() => onSelectViewMode('single')}
              >
                Single images
              </button>
            </div>
          </div>

          <button className="reset-btn" type="button" onClick={onResetAll}>
            Reset filters
          </button>
        </div>

        {activeFilters.length > 0 && (
          <div className="active-filters" aria-label="Active filters" style={{ marginTop: '12px' }}>
            {activeFilters.map((filter) => (
              <button
                key={filter.key}
                className="filter-chip"
                type="button"
                onClick={() => onClearFilter(filter.key)}
                title="Remove filter"
              >
                {filter.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
