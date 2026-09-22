// src/app/TopBar.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  Sun,
  Moon,
  Sparkles,
  X,
  Home,
  LayoutDashboard,
  User as UserIcon,
  LogOut,
  ChevronDown,
  School,
  GraduationCap,
} from 'lucide-react';
import { useTheme } from './useTheme';
import { REGISTRY } from '@core/registry';
import { Badge } from '@components/Badge';
import { useAuth, type SchoolClassLevel } from '@core/auth';

export function TopBar() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout, updateClass } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsProfileMenuOpen(false);
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
    <header className="sticky top-0 z-40 w-full shrink-0 border-b border-[var(--color-border)] bg-[var(--color-surface)]/80 backdrop-blur-sm">
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

          {/* User Profile & Class Badge / Login Button */}
          {user ? (
            <div ref={profileRef} className="relative">
              <button
                type="button"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1 rounded-xl bg-[var(--color-surface-subtle)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] transition-all"
              >
                <div className="w-6 h-6 rounded-lg bg-[var(--color-accent)] text-white flex items-center justify-center text-xs font-bold shrink-0">
                  {user.avatar || '🎓'}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold text-[var(--color-text)] leading-tight truncate max-w-[100px]">
                    {user.name}
                  </span>
                  {user.track === 'school' && user.classLevel && (
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
                      Class {user.classLevel}th
                    </span>
                  )}
                  {user.track === 'college' && (
                    <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 truncate max-w-[100px]">
                      {user.collegeBranch?.includes('(')
                        ? user.collegeBranch.match(/\(([^)]+)\)/)?.[1] || user.collegeBranch.split(' ')[0]
                        : user.collegeBranch || 'College Track'}
                    </span>
                  )}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xl p-3 z-50 space-y-3">
                  <div className="p-2 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)]">
                    <p className="text-xs font-bold text-[var(--color-text)]">{user.name}</p>
                    <p className="text-[11px] text-[var(--color-text-muted)] truncate">{user.email}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[var(--color-accent-subtle)] text-[var(--color-accent)]">
                        {user.track === 'school' ? `Class ${user.classLevel || '10'}th` : 'College Track'}
                      </span>
                      {user.track === 'college' && user.collegeYear && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400">
                          {user.collegeYear}
                        </span>
                      )}
                    </div>
                    {user.track === 'college' && user.collegeBranch && (
                      <p className="text-[10px] font-medium text-[var(--color-text-muted)] mt-1 truncate">
                        {user.collegeBranch}
                      </p>
                    )}
                  </div>

                  {/* Class Switcher (Class 9, 10, 11, 12) for School */}
                  {user.track === 'school' && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] block px-1">
                        Switch Class Level:
                      </span>
                      <div className="grid grid-cols-4 gap-1">
                        {(['9', '10', '11', '12'] as SchoolClassLevel[]).map((cls) => (
                          <button
                            key={cls}
                            type="button"
                            onClick={() => {
                              updateClass(cls);
                              setIsProfileMenuOpen(false);
                            }}
                            className={`py-1 px-1.5 rounded-lg text-xs font-bold transition-all ${
                              user.classLevel === cls
                                ? 'bg-[var(--color-accent)] text-white shadow-xs'
                                : 'bg-[var(--color-surface-subtle)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text)] border border-[var(--color-border)]'
                            }`}
                          >
                            {cls}th
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t border-[var(--color-border)]">
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setIsProfileMenuOpen(false);
                        navigate('/login');
                      }}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-xs font-bold shadow-xs transition-all"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
