import { useState, useId, type ReactNode, type KeyboardEvent } from 'react';

interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
  defaultTab?: string;
  className?: string;
}

export function Tabs({ tabs, defaultTab, className = '' }: TabsProps) {
  const [active, setActive] = useState<string>(defaultTab ?? tabs[0]?.id ?? '');
  const panelId = useId();

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next = index;
    if (e.key === 'ArrowRight') next = (index + 1) % tabs.length;
    else if (e.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = tabs.length - 1;
    else return;

    e.preventDefault();
    const target = tabs[next];
    if (target) {
      setActive(target.id);
      // Move focus to the newly activated tab
      const tabEl = document.getElementById(`tab-${panelId}-${target.id}`);
      tabEl?.focus();
    }
  };

  const activeTab = tabs.find((t) => t.id === active);

  return (
    <div className={className}>
      <div
        role="tablist"
        aria-label="Content tabs"
        className="flex border-b border-line gap-0 overflow-x-auto"
      >
        {tabs.map((tab, i) => (
          <button
            key={tab.id}
            id={`tab-${panelId}-${tab.id}`}
            role="tab"
            aria-selected={active === tab.id}
            aria-controls={`panel-${panelId}-${tab.id}`}
            tabIndex={active === tab.id ? 0 : -1}
            onClick={() => setActive(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${
              active === tab.id
                ? 'border-accent text-accent'
                : 'border-transparent text-ink-muted hover:text-ink hover:border-line-strong'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {activeTab && (
        <div
          id={`panel-${panelId}-${activeTab.id}`}
          role="tabpanel"
          aria-labelledby={`tab-${panelId}-${activeTab.id}`}
          tabIndex={0}
          className="focus-visible:outline-none"
        >
          {activeTab.content}
        </div>
      )}
    </div>
  );
}
