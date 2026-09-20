// src/app/TopBar.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Sun, Moon, Sparkles, X, Home, LayoutDashboard } from 'lucide-react';
import { useTheme } from './useTheme';
import { REGISTRY } from '@core/registry';
import { Badge } from '@components/Badge';

export function TopBar() {
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const searchResults = searchQuery.trim()
    ? REGISTRY.filter(
        (m) =>
          m.searchable &&
          (m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.scopeLabel.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  const handleSelectModule = (track: string, id: string) => {
    navigate(`/${track}/${id}`);
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--color-border)] bg-[var(--color-surface)]/90 backdrop-blur-md">
      <div className="flex h-14 items-center justify-between px-4 sm:px-6">
        {/* Left: Brand / Logo & Primary Top Navigation Links */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 font-bold text-base tracking-tight text-[var(--color-text)] hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] rounded"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-black shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="hidden sm:inline font-black">Ai EduEngine</span>
          </Link>

          {/* Top Navigation Bar Tabs */}
          <nav aria-label="Main Navigation" className="flex items-center gap-1 p-1 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)]">
            <Link
              to="/"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                location.pathname === '/'
                  ? 'bg-[var(--color-surface)] text-[var(--color-accent)] shadow-xs border border-[var(--color-border)]'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]'
              }`}
            >
              <Home className="w-3.5 h-3.5 text-indigo-500" />
              <span className="hidden xs:inline sm:inline">Home Website</span>
            </Link>

            <Link
              to="/dashboard"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                location.pathname === '/dashboard'
                  ? 'bg-[var(--color-surface)] text-[var(--color-accent)] shadow-xs border border-[var(--color-border)]'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-[var(--color-accent)]" />
              <span className="hidden xs:inline sm:inline">Dashboard Overview</span>
            </Link>
          </nav>
        </div>

        {/* Center: Global Search */}
        <div ref={searchRef} className="relative w-full max-w-xs sm:max-w-md mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)] pointer-events-none" />
            <input
              type="text"
              role="combobox"
              aria-expanded={isSearchOpen}
              aria-controls="search-results-list"
              aria-label="Search modules and topics"
              placeholder="Search 14 active modules, topics..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              className="w-full h-9 pl-9 pr-8 text-xs sm:text-sm rounded-xl bg-[var(--color-surface-subtle)] text-[var(--color-text)] border border-[var(--color-border)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => {
                  setSearchQuery('');
                  setIsSearchOpen(false);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Dropdown */}
          {isSearchOpen && searchQuery.trim().length > 0 && (
            <div
              id="search-results-list"
              role="listbox"
              className="absolute left-0 right-0 top-full mt-1.5 max-h-80 overflow-y-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-2 shadow-xl z-50"
            >
              <div className="text-[11px] font-semibold text-[var(--color-text-muted)] px-2.5 py-1 uppercase tracking-wider">
                Modules Matching "{searchQuery}"
              </div>
              {searchResults.length === 0 ? (
                <div className="p-4 text-center text-xs text-[var(--color-text-muted)]">
                  No modules match your query.
                </div>
              ) : (
                searchResults.map((m) => {
                  const targetTrack = m.track === 'both' ? 'school' : m.track;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => handleSelectModule(targetTrack, m.id)}
                      className="w-full text-left p-2.5 rounded-lg hover:bg-[var(--color-surface-hover)] flex items-start justify-between gap-3 transition-colors group focus-visible:outline-none focus-visible:bg-[var(--color-surface-hover)]"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-xs sm:text-sm text-[var(--color-text)] group-hover:text-[var(--color-accent)] truncate">
                            {m.title}
                          </span>
                          <Badge label={m.tier} variant="tier" />
                        </div>
                        <p className="text-xs text-[var(--color-text-muted)] truncate mt-0.5">
                          {m.scopeLabel}
                        </p>
                      </div>
                      <Badge label={m.track} variant="track" />
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
            className="p-2 rounded-xl text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] border border-transparent hover:border-[var(--color-border)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4 text-[var(--color-text)]" />
            ) : (
              <Sun className="w-4 h-4 text-[var(--color-text)]" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
