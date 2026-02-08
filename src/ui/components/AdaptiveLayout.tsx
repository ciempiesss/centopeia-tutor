import React, { useState } from 'react';
import { usePlatform } from '../../hooks/usePlatform';
export { usePlatform };
import { Menu, X, BookOpen, Target, Code, BarChart3, Settings } from 'lucide-react';

interface AdaptiveLayoutProps {
  children: React.ReactNode;
  sidebarContent?: React.ReactNode;
  showSidebar?: boolean;
}

// Navegación para móvil (bottom tabs)
function MobileNavigation({ 
  activeTab, 
  onTabChange 
}: { 
  activeTab: string; 
  onTabChange: (tab: string) => void;
}) {
  const tabs = [
    { id: 'terminal', icon: Code, label: 'Terminal' },
    { id: 'learn', icon: BookOpen, label: 'Aprender' },
    { id: 'path', icon: Target, label: 'Ruta' },
    { id: 'stats', icon: BarChart3, label: 'Progreso' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-hacker-bgSecondary border-t border-hacker-border
                    pb-safe-b z-50">
      <div className="flex justify-around items-center h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full
                         transition-colors duration-200 min-h-[44px]
                         ${isActive ? 'text-hacker-primary' : 'text-hacker-textMuted'}`}
              aria-label={tab.label}
            >
              <Icon className="w-5 h-5 mb-1" aria-hidden="true" />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

// Sidebar para desktop
function DesktopSidebar({ 
  activeTab, 
  onTabChange,
  children 
}: { 
  activeTab: string; 
  onTabChange: (tab: string) => void;
  children?: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const tabs = [
    { id: 'terminal', icon: Code, label: 'Terminal' },
    { id: 'learn', icon: BookOpen, label: 'Aprender' },
    { id: 'path', icon: Target, label: 'Mi Ruta' },
    { id: 'stats', icon: BarChart3, label: 'Progreso' },
    { id: 'settings', icon: Settings, label: 'Config' },
  ];

  return (
    <aside className={`flex flex-col bg-hacker-bgSecondary border-r border-hacker-border
                      transition-all duration-300 h-screen
                      ${isCollapsed ? 'w-16' : 'w-64'}`}>
      {/* Logo area */}
      <div className="flex items-center justify-between p-4 border-b border-hacker-border">
        {!isCollapsed && (
          <span className="font-bold text-hacker-primary text-lg">CENTOPEIA</span>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded hover:bg-hacker-bgTertiary transition-colors"
          aria-label={isCollapsed ? 'Expandir sidebar' : 'Contraer sidebar'}
        >
          {isCollapsed ? <Menu className="w-5 h-5" aria-hidden="true" /> : <X className="w-5 h-5" aria-hidden="true" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`w-full flex items-center gap-3 px-4 py-3
                       transition-colors duration-200
                       ${isActive 
                         ? 'bg-hacker-primary/10 text-hacker-primary border-r-2 border-hacker-primary' 
                         : 'text-hacker-textMuted hover:bg-hacker-bgTertiary hover:text-hacker-text'
                       }
                       ${isCollapsed ? 'justify-center' : ''}`}
            aria-label={tab.label}
          >
            <Icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
            {!isCollapsed && <span className="font-medium">{tab.label}</span>}
          </button>
          );
        })}
      </nav>

      {/* Extra content (solo cuando expandido) */}
      {!isCollapsed && children && (
        <div className="p-4 border-t border-hacker-border">
          {children}
        </div>
      )}

      {/* Keyboard shortcuts hint */}
      {!isCollapsed && (
        <div className="p-4 text-xs text-hacker-textDim border-t border-hacker-border">
          <p className="mb-1">Atajos:</p>
          <p>Ctrl+1-5 Cambiar pestaña</p>
          <p>Ctrl+K Limpiar terminal</p>
          <p>Ctrl+/ Ayuda</p>
        </div>
      )}
    </aside>
  );
}

// Layout principal adaptativo
export function AdaptiveLayout({ children }: AdaptiveLayoutProps) {
  const { isMobile, isDesktop } = usePlatform();
  const [activeTab, setActiveTab] = useState('terminal');

  return (
    <div className="flex h-screen bg-hacker-bg overflow-hidden">
      {isDesktop ? (
        // Desktop: Sidebar + Content
        <>
          <DesktopSidebar 
            activeTab={activeTab} 
            onTabChange={setActiveTab}
          />
          <main className="flex-1 flex flex-col min-w-0">
            {children}
          </main>
        </>
      ) : (
        // Mobile: Full screen content + Bottom nav
        <>
          <main className="flex-1 flex flex-col pb-16">
            {children}
          </main>
          <MobileNavigation 
            activeTab={activeTab} 
            onTabChange={setActiveTab}
          />
        </>
      )}
    </div>
  );
}

// Wrapper para views que cambian según plataforma
interface PlatformViewProps {
  mobile: React.ReactNode;
  desktop: React.ReactNode;
  tablet?: React.ReactNode;
}

export function PlatformView({ mobile, desktop, tablet }: PlatformViewProps) {
  const { isMobile, isTablet, isDesktop } = usePlatform();

  if (isDesktop) return <>{desktop}</>;
  if (isTablet && tablet) return <>{tablet}</>;
  return <>{mobile}</>;
}

// Split pane para desktop (master-detail)
interface SplitPaneProps {
  left: React.ReactNode;
  right: React.ReactNode;
  splitRatio?: number; // 0.3 = 30% left, 70% right
}

export function DesktopSplitPane({ left, right, splitRatio = 0.35 }: SplitPaneProps) {
  const { isDesktop } = usePlatform();

  if (!isDesktop) {
    // En móvil, solo mostrar el contenido derecho (detalle)
    return <>{right}</>;
  }

  return (
    <div className="flex h-full">
      <div 
        className="border-r border-hacker-border overflow-y-auto"
        style={{ width: `${splitRatio * 100}%` }}
      >
        {left}
      </div>
      <div 
        className="overflow-hidden"
        style={{ width: `${(1 - splitRatio) * 100}%` }}
      >
        {right}
      </div>
    </div>
  );
}
