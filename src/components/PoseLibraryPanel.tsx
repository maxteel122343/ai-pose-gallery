import React, { useState } from 'react';
import { ANGLES, GalleryEntry, PoseGroup, PoseItem, ViewMode } from '../types';

interface PoseLibraryPanelProps {
  data: PoseItem[];
  groups: PoseGroup[];
  lines: string[];
  selectedLine: string;
  onSelectLine: (line: string) => void;
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  selectedAngle: string;
  onSelectAngle: (angle: string) => void;
  viewMode: ViewMode;
  onSelectViewMode: (mode: ViewMode) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  currentList: GalleryEntry[];
  selectedPoseItem: PoseItem | null;
  onSelectPose: (item: PoseItem, group: PoseGroup) => void;
  onApplyPoseDirectly: (item: PoseItem) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const PoseLibraryPanel: React.FC<PoseLibraryPanelProps> = ({
  data,
  groups,
  lines,
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
  currentList,
  selectedPoseItem,
  onSelectPose,
  onApplyPoseDirectly,
  isCollapsed,
  onToggleCollapse,
}) => {
  const [activeCardPreview, setActiveCardPreview] = useState<Record<string, string>>({});

  return (
    <aside className={`pose-library-panel ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Panel Header */}
      <div className="library-header">
        <div className="header-top">
          <div className="brand-badge">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="5" r="2.4" />
              <path d="M12 8v6m0-3-4 2m4-2 4 2m-4 2-3 6m3-6 3 6" />
            </svg>
            <strong>Biblioteca de Poses</strong>
          </div>
          <button
            type="button"
            className="collapse-btn"
            onClick={onToggleCollapse}
            title={isCollapsed ? 'Expandir Galeria' : 'Recolher Galeria'}
          >
            {isCollapsed ? '▶' : '◀'}
          </button>
        </div>

        {!isCollapsed && (
          <>
            {/* Search Box */}
            <div className="lib-search-box">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="10.8" cy="10.8" r="6.8" />
                <path d="m20 20-4.2-4.2" />
              </svg>
              <input
                type="search"
                placeholder="Buscar poses (ex: sentado, braço, P001)..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
              />
              {searchQuery && (
                <button type="button" className="clear-search" onClick={() => onSearchChange('')}>
                  ×
                </button>
              )}
            </div>

            {/* Series Tabs */}
            <div className="lib-series-tabs">
              <button
                type="button"
                className={`series-tab ${selectedLine === '' ? 'active' : ''}`}
                onClick={() => onSelectLine('')}
              >
                Todas ({groups.length})
              </button>
              {lines.map((line) => (
                <button
                  key={line}
                  type="button"
                  className={`series-tab ${selectedLine === line ? 'active' : ''}`}
                  onClick={() => onSelectLine(line)}
                >
                  {line.replace('Full Body · ', '')}
                </button>
              ))}
            </div>

            {/* Category and Angle filters */}
            <div className="lib-filters-row">
              <div className="filter-select-wrap">
                <select
                  value={selectedCategory}
                  onChange={(e) => onSelectCategory(e.target.value)}
                >
                  <option value="">Todas Categorias</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="angle-quick-pills">
                <button
                  type="button"
                  className={`angle-pill ${selectedAngle === '' ? 'active' : ''}`}
                  onClick={() => onSelectAngle('')}
                >
                  Todos
                </button>
                {ANGLES.map((ang) => (
                  <button
                    key={ang}
                    type="button"
                    className={`angle-pill ${selectedAngle === ang ? 'active' : ''}`}
                    onClick={() => onSelectAngle(ang)}
                  >
                    {ang.replace(' angle', '')}
                  </button>
                ))}
              </div>
            </div>

            {/* Count summary */}
            <div className="lib-summary-bar">
              <span>{currentList.length} poses encontradas</span>
              <div className="view-mode-toggle">
                <button
                  type="button"
                  className={viewMode === 'pose' ? 'active' : ''}
                  onClick={() => onSelectViewMode('pose')}
                  title="Agrupado por Pose"
                >
                  Agrupado
                </button>
                <button
                  type="button"
                  className={viewMode === 'single' ? 'active' : ''}
                  onClick={() => onSelectViewMode('single')}
                  title="Fotos Individuais"
                >
                  Individual
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Scrollable Gallery Content */}
      {!isCollapsed && (
        <div className="library-scroll-area">
          {currentList.length === 0 ? (
            <div className="lib-empty">
              <p>Nenhuma pose encontrada com estes filtros.</p>
            </div>
          ) : (
            <div className="lib-grid">
              {currentList.map(({ group, item }) => {
                const currentAngle = activeCardPreview[group.key] || item.angle;
                const activeItem = group.angles[currentAngle] || item;
                const isCurrentActive = selectedPoseItem?.id === activeItem.id;

                return (
                  <div
                    key={group.key + activeItem.id}
                    className={`lib-card ${isCurrentActive ? 'selected' : ''}`}
                    onClick={() => onSelectPose(activeItem, group)}
                  >
                    <div className="card-thumb-wrap">
                      <img
                        src={activeItem.thumb}
                        alt={group.name}
                        loading="lazy"
                        className="card-thumb-img"
                      />
                      <span className="thumb-badge">{group.number}</span>
                      <span className="thumb-angle">{activeItem.angle}</span>
                      <button
                        type="button"
                        className="apply-overlay-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectPose(activeItem, group);
                          onApplyPoseDirectly(activeItem);
                        }}
                        title="Aplicar pose diretamente ao modelo 3D"
                      >
                        Aplicar
                      </button>
                    </div>

                    <div className="card-info">
                      <h4 title={group.name}>{group.name}</h4>
                      <span className="card-cat">{group.category}</span>
                    </div>

                    {/* 5 Angles miniature strip */}
                    <div className="card-angle-strip">
                      {ANGLES.filter((ang) => group.angles[ang]).map((ang) => {
                        const angItem = group.angles[ang];
                        const isAngOn = angItem.angle === activeItem.angle;
                        return (
                          <button
                            key={ang}
                            type="button"
                            className={`mini-ang ${isAngOn ? 'on' : ''}`}
                            title={ang}
                            onMouseEnter={() =>
                              setActiveCardPreview((prev) => ({
                                ...prev,
                                [group.key]: ang,
                              }))
                            }
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveCardPreview((prev) => ({
                                ...prev,
                                [group.key]: ang,
                              }));
                              onSelectPose(angItem, group);
                              onApplyPoseDirectly(angItem);
                            }}
                          >
                            <img src={angItem.thumb} alt={ang} />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </aside>
  );
};
