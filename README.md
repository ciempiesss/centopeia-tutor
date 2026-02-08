# 🐛 CENTOPEIA TUTOR

Tutor de programación AUDHD-optimized con interfaz de terminal.

## 🎯 Características

- **Interfaz Terminal**: Estilo hacker Linux, tema dark Matrix
- **AUDHD Optimized**: 
  - Focus Sprints (Pomodoro 15/5)
  - Body Doubling virtual
  - Feedback RSD-safe
  - Anti-paralysis system
- **IA Integrada**: Groq LLM (Llama 3.3 70B)
- **Multiplataforma**: Web + Android (Capacitor)
- **Offline-first**: Persistencia local con sync opcional

## 🚀 Inicio Rápido

### Web (Desarrollo)
```bash
npm install
npm run dev
```

### Android
```bash
# Build y sincronizar
npm run build
npx cap sync

# Abrir en Android Studio
npx cap open android
```

## 📋 Comandos Disponibles

| Comando | Descripción |
|---------|-------------|
| `/help` | Muestra ayuda |
| `/focus [min]` | Inicia sprint de concentración |
| `/role [qa/dev/data]` | Cambia rol principal |
| `/learn [tema]` | Inicia aprendizaje |
| `/stats` | Muestra estadísticas |
| `/config apikey [key]` | Configura API de Groq |

## 🔑 Configurar API Key

1. Obtén API key gratis en [console.groq.com](https://console.groq.com)
2. En la app, escribe: `/config apikey TU_API_KEY`
3. Reinicia la app

## 🏗️ Arquitectura

```
src/
├── core/
│   ├── agent/
│   │   ├── LLMClient.ts      # Cliente Groq
│   │   └── ContextManager.ts # Gestión de contexto
│   └── audhd/
│       ├── FocusSprint.ts    # Pomodoro adaptado
│       └── useNetworkStatus.ts
├── ui/terminal/
│   ├── Terminal.tsx
│   ├── InputLine.tsx
│   ├── OutputBuffer.tsx
│   ├── StatusBar.tsx
│   └── commands/
└── storage/
    └── Database.ts           # Persistencia local
```

## 📦 Scripts

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Build de producción
- `npm run preview` - Preview del build
- `npx cap sync` - Sincronizar con Android
- `npx cap open android` - Abrir Android Studio

## 🎨 Tema

Tema "Dark Hacker" con colores:
- **Primary**: `#00ff41` (Matrix green)
- **Secondary**: `#00f0ff` (Cyan)
- **Background**: `#0a0a0a` (Negro)
- **Error**: `#ff3333` (Rojo suave)

## 📄 Licencia

MIT - Open Source
