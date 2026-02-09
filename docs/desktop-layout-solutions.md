# Desktop Layout Solutions - Centopeia Tutor

## Problema
- Mobile: ✓ Se ve bien, bottom nav funciona
- Desktop: ✗ Solo usa 1/3 de pantalla, mucho espacio desperdiciado

## Solución Recomendada: "Split Terminal Layout"

### Desktop Layout (Ancho > 1024px)
```
┌─────────────────────────────────────────────────────────────┐
│  HEADER: CENTOPEIA | Terminal Interactiva        [Cambiar]  │
├──────────────┬──────────────────────────────┬───────────────┤
│              │                              │               │
│  LEFT PANEL  │      CENTER: TERMINAL        │  RIGHT PANEL  │
│  (25% width) │      (50% width)             │  (25% width)  │
│              │                              │               │
│  📊 Stats    │   ┌──────────────────────┐   │  📚 Learning  │
│  ├ Sprints   │   │   ASCII Art          │   │  ├ Progress   │
│  ├ Modules   │   │   Welcome msg        │   │  ├ Next Topic │
│  └ Streak    │   │                      │   │  ├ Quick Quiz │
│              │   │   > _                │   │  └ Resources  │
│  🎯 Focus    │   │                      │   │               │
│  [Start 15]  │   │   Messages...        │   │  🏆 Achieve   │
│              │   │                      │   │  [Badges]     │
│              │   └──────────────────────┘   │               │
│              │                              │               │
├──────────────┴──────────────────────────────┴───────────────┤
│  Status Bar: 🔴 Recording | 47m session | 3 modules done     │
└─────────────────────────────────────────────────────────────┘
```

### Mobile Layout (Ancho < 768px)
```
┌─────────────────────────────┐
│  HEADER: CENTOPEIA          │
├─────────────────────────────┤
│                             │
│    FULL TERMINAL            │
│    (100% width)             │
│                             │
│  ┌──────────────────────┐   │
│  │   ASCII Art          │   │
│  │   Welcome msg        │   │
│  │                      │   │
│  │   > _                │   │
│  │                      │   │
│  └──────────────────────┘   │
│                             │
├─────────────────────────────┤
│  🖥️  📚  📊  (Bottom Nav)   │
└─────────────────────────────┘
```

## Componentes Nuevos para Desktop

### 1. LeftPanel - Stats & Quick Actions
- Focus sprint controls
- Today's stats (modules completed, time studied)
- Quick actions (/focus, /practice buttons)
- Mini calendar/streak

### 2. RightPanel - Learning Dashboard
- Progress bar del path actual
- Next module preview
- Quick quiz access
- Achievement badges
- Resource links

### 3. Adaptive Behavior
```typescript
// useResponsive hook
const { isMobile, isTablet, isDesktop } = useResponsive();

// Desktop: Show side panels
// Tablet: Show only one panel (collapsible)
// Mobile: Hide panels, use bottom nav
```

## Implementación

### Opción A: CSS Grid (Recomendado)
```css
/* Desktop */
.app-layout {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  grid-template-areas: 
    "header header header"
    "left center right"
    "footer footer footer";
}

/* Mobile */
@media (max-width: 768px) {
  .app-layout {
    grid-template-columns: 1fr;
    grid-template-areas: 
      "header"
      "center"
      "footer";
  }
  .left-panel, .right-panel {
    display: none;
  }
}
```

### Opción B: Flexbox con Sidebar
```css
.app-layout {
  display: flex;
}

.sidebar {
  width: 300px;
  flex-shrink: 0;
}

.main-content {
  flex: 1;
  max-width: 900px;
  margin: 0 auto;
}

@media (max-width: 1024px) {
  .sidebar {
    display: none;
  }
}
```

## Features Adicionales para Desktop

1. **Keyboard Shortcuts Panel** (visible en desktop)
   - Ctrl+1: Terminal
   - Ctrl+2: Learning Path
   - Ctrl+3: Stats
   - etc.

2. **Multi-panel Mode**
   - Arrastrar y soltar paneles
   - Redimensionar paneles
   - Guardar layout preferido

3. **Picture-in-Picture**
   - Terminal en pequeño flotante mientras estudias
   - Similar a VS Code's terminal

4. **Split View**
   - Terminal arriba
   - Learning content abajo
   - Draggable divider

## Tech Implementation

```typescript
// New hooks
export function useResponsive() {
  const [breakpoint, setBreakpoint] = useState('mobile');
  
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) setBreakpoint('mobile');
      else if (width < 1024) setBreakpoint('tablet');
      else setBreakpoint('desktop');
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return {
    isMobile: breakpoint === 'mobile',
    isTablet: breakpoint === 'tablet',
    isDesktop: breakpoint === 'desktop',
    breakpoint,
  };
}

// App.tsx structure
function App() {
  const { isDesktop } = useResponsive();
  
  return (
    <div className="app-layout">
      <Header />
      {isDesktop && <LeftPanel />}
      <MainContent>
        {currentView === 'terminal' && <Terminal />}
        {currentView === 'paths' && <PathSelector />}
        {/* ... */}
      </MainContent>
      {isDesktop && <RightPanel />}
      {!isDesktop && <BottomNav />}
      <StatusBar />
    </div>
  );
}
```

## Estilo Visual (Mantener Hacker Theme)

```css
/* Hacker colors */
--hacker-bg: #0a0a0a;
--hacker-bg-secondary: #111111;
--hacker-border: #1a1a1a;
--hacker-primary: #00ff41;
--hacker-text: #e0e0e0;
--hacker-text-dim: #888888;

/* Panel styles */
.panel {
  background: var(--hacker-bg-secondary);
  border: 1px solid var(--hacker-border);
  border-radius: 8px;
  padding: 16px;
}

/* Terminal glow effect */
.terminal-glow {
  box-shadow: 0 0 20px rgba(0, 255, 65, 0.1);
}
```

## Ventajas

1. **Desktop**: Aprovecha todo el espacio, más información visible
2. **Mobile**: Se mantiene exactamente igual (no se rompe)
3. **Performance**: Los paneles laterales se renderizan solo en desktop
4. **UX**: Menos clicks para ver información importante
5. **Estilo**: Mantiene la estética hacker/cyberpunk

## Plan de Implementación

### Phase 1: Core Layout
1. Crear useResponsive hook
2. Modificar App.tsx para layout grid
3. Hacer que sidebars se oculten en mobile

### Phase 2: Side Panels
1. Crear LeftPanel con stats
2. Crear RightPanel con learning progress
3. Agregar contenido real

### Phase 3: Polish
1. Animaciones de transición
2. Persistir preferencias de layout
3. Keyboard shortcuts panel

**¿Qué opción prefieres?**
- A: Implementar el Split Terminal Layout (recomendado)
- B: Solo ajustar el ancho del terminal actual al 100%
- C: Otra idea que tengas
