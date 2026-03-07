# Portfolio Application - Architecture Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Technical Stack](#technical-stack)
3. [Architecture Patterns](#architecture-patterns)
4. [Directory Structure](#directory-structure)
5. [Component Architecture](#component-architecture)
6. [Routing Architecture](#routing-architecture)
7. [State Management](#state-management)
8. [Styling Architecture](#styling-architecture)
9. [Testing Strategy](#testing-strategy)
10. [Build & Development](#build--development)
11. [Accessibility & SEO](#accessibility--seo)
12. [Future Considerations](#future-considerations)

---

## System Overview

### Purpose
A personal portfolio website showcasing professional experience, projects, skills, and contact information. Built as a modern single-page application (SPA) with client-side routing and theme customization.

### Key Features
- **Multi-page Navigation**: 5 distinct routes (Home, About, Projects, Skills, Contact)
- **Theme Switching**: Dark/Light mode toggle with localStorage persistence
- **Responsive Design**: Mobile-first approach with hamburger menu for small screens
- **Accessibility**: WCAG-compliant with skip links, ARIA labels, and semantic HTML
- **SEO Optimized**: Meta tags, Open Graph tags, and semantic structure
- **Performance**: Optimized build with Vite, code splitting via React Router

---

## Technical Stack

### Core Technologies
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.2.0 | UI framework |
| **React Router DOM** | 6.20.0 | Client-side routing |
| **TypeScript/JSX** | ES2020 | Language (mixed TS/JS with JSX) |
| **Vite** | 5.0.0 | Build tool and dev server |
| **Node.js** | - | Runtime environment |
| **npm** | - | Package management |

### Development Tools
| Tool | Version | Purpose |
|------|---------|---------|
| **Vitest** | 4.0.18 | Unit testing framework |
| **Testing Library** | 16.3.2 | React component testing |
| **ESLint** | 8.55.0 | Code linting |
| **Playwright** | 1.58.2 | E2E/visual testing |
| **jsdom** | 28.1.0 | DOM simulation for tests |

### Build Configuration
- **Bundler**: Vite with React plugin
- **Output Directory**: `dist/`
- **Dev Server Port**: 3000 (configurable)
- **Source Maps**: Disabled in production
- **Module System**: ES Modules (type: "module")

---

## Architecture Patterns

### 1. Component-Based Architecture
- **Functional Components**: All components use React hooks (no class components)
- **Named Exports**: Components exported as named exports for better tree-shaking
- **Single Responsibility**: Each component has one clear purpose
- **Composition**: Components composed together rather than inherited

### 2. File Co-location
```
ComponentName/
├── ComponentName.jsx     # Component logic
├── ComponentName.css     # Component styles
└── ComponentName.test.jsx # Component tests
```
Or simplified flat structure:
```
ComponentName.jsx
ComponentName.css
ComponentName.test.jsx
```

### 3. Separation of Concerns
- **Pages**: Route-level components (`/src/pages/`)
- **Components**: Reusable UI components (`/src/components/`)
- **Sections**: Legacy section components (`/src/sections/`)
- **Styles**: Co-located CSS with component files

### 4. Data Flow
- **Unidirectional Data Flow**: Props flow down, events flow up
- **Local State**: Component-level state via `useState`
- **Browser State**: Theme preference in localStorage
- **Navigation State**: Managed by React Router

---

## Directory Structure

```
eunomia-portfolio/
├── public/                    # Static assets
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── Navbar.jsx
│   │   ├── Navbar.css
│   │   ├── Navbar.test.jsx
│   │   ├── Footer.jsx
│   │   ├── Footer.css
│   │   ├── Footer.test.jsx
│   │   ├── ThemeToggle.jsx
│   │   ├── ThemeToggle.css
│   │   └── ThemeToggle.test.jsx
│   ├── pages/                # Route-level components
│   │   ├── Home.jsx
│   │   ├── Home.css
│   │   ├── About.jsx
│   │   ├── About.css
│   │   ├── Projects.jsx
│   │   ├── Projects.css
│   │   ├── Skills.jsx
│   │   ├── Skills.css
│   │   ├── Contact.jsx
│   │   └── Contact.css
│   ├── sections/             # Section components (legacy)
│   │   ├── Contact.jsx
│   │   ├── Contact.css
│   │   └── *.test.jsx
│   ├── test/                 # Test configuration
│   │   └── setup.js
│   ├── App.jsx               # Root component
│   ├── App.css               # App-level styles
│   ├── App.test.jsx          # App tests
│   ├── main.jsx              # Application entry point
│   └── index.css             # Global styles & design tokens
├── .eunomia/                 # Eunomia pipeline artifacts
│   ├── screenshots/          # Visual regression screenshots
│   └── tasks.json            # Task graph
├── dist/                     # Build output (generated)
├── index.html                # HTML template
├── package.json              # Dependencies & scripts
├── vite.config.js            # Vite configuration
├── vitest.config.js          # Vitest configuration
├── tsconfig.json             # TypeScript configuration
├── .eslintrc.json            # ESLint rules
└── CLAUDE.md                 # Project instructions for AI agents
```

### Key Files

#### `src/main.jsx`
Application entry point. Renders the root `App` component into the DOM with React Strict Mode.

#### `src/App.jsx`
Root component containing:
- React Router setup (`BrowserRouter`)
- Route definitions (5 routes)
- Persistent layout (Navbar, Footer)
- Main content area

#### `src/index.css`
Global styles containing:
- CSS Custom Properties (design tokens)
- Light/Dark theme definitions
- Typography system
- Base resets

#### `vite.config.js`
Vite build configuration:
- React plugin
- Dev server settings (port 3000)
- Build output directory

#### `vitest.config.js`
Test configuration:
- jsdom environment
- Global test utilities
- Setup files

---

## Component Architecture

### Layout Components

#### **Navbar** (`src/components/Navbar.jsx`)
**Responsibilities:**
- Site navigation with React Router Links
- Mobile menu toggle (hamburger)
- Theme toggle integration
- Responsive breakpoints

**State:**
- `isMobileMenuOpen`: Boolean for mobile menu visibility

**Key Features:**
- Sticky positioning
- Accessible hamburger button (ARIA labels)
- Overlay backdrop for mobile menu
- Auto-close on route navigation

#### **Footer** (`src/components/Footer.jsx`)
**Responsibilities:**
- Copyright notice (dynamic year)
- Social media links
- Consistent bottom layout

**Features:**
- External links with `rel="noopener noreferrer"`
- ARIA labels for social links

#### **ThemeToggle** (`src/components/ThemeToggle.jsx`)
**Responsibilities:**
- Toggle between light/dark themes
- Persist theme preference to localStorage
- Update document root class

**State:**
- `theme`: Current theme ('light' | 'dark')

**Implementation:**
- Reads initial theme from localStorage (defaults to 'light')
- Sets `document.documentElement.className` to `${theme}-theme`
- SVG icons for sun/moon

**Storage:**
```javascript
localStorage.getItem('theme') // Read
localStorage.setItem('theme', theme) // Write
```

### Page Components

All page components follow a consistent pattern:
```jsx
export const PageName = () => {
  return (
    <section className="page-name">
      <div className="page-container">
        {/* Page content */}
      </div>
    </section>
  )
}
```

#### **Home** (`src/pages/Home.jsx`)
- Hero section with name, title, summary
- CTA button navigating to Contact page
- Uses `useNavigate()` hook for programmatic navigation

#### **About** (`src/pages/About.jsx`)
- Professional background and bio
- Skills overview

#### **Projects** (`src/pages/Projects.jsx`)
- Project grid/list display
- Project cards with:
  - Title, description
  - Tech stack tags
  - Live demo & GitHub links
- Data stored as local array (hardcoded for now)

#### **Skills** (`src/pages/Skills.jsx`)
- Technical skills categorization
- Skill proficiency levels

#### **Contact** (`src/pages/Contact.jsx`)
- Contact form
- Social links
- Email/phone information

---

## Routing Architecture

### Route Configuration
```jsx
<Router>
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/about" element={<About />} />
    <Route path="/projects" element={<Projects />} />
    <Route path="/skills" element={<Skills />} />
    <Route path="/contact" element={<Contact />} />
  </Routes>
</Router>
```

### Navigation Methods
1. **Declarative**: `<Link to="/path">` (in Navbar)
2. **Programmatic**: `useNavigate()` hook (in Home CTA button)

### URL Structure
- **Base URL**: `/`
- **Routes**:
  - `/` - Home
  - `/about` - About
  - `/projects` - Projects
  - `/skills` - Skills
  - `/contact` - Contact

### Route Guards
None currently implemented (public portfolio site).

---

## State Management

### Local Component State
**useState Hook**: Used for ephemeral UI state
- Navbar mobile menu toggle
- Theme preference
- Form inputs (in Contact page)

### Browser Storage
**localStorage**: Theme persistence
```javascript
// Read theme
const savedTheme = localStorage.getItem('theme') || 'light'

// Write theme
localStorage.setItem('theme', 'dark')
```

### No Global State Management
- No Redux, Zustand, or Context API currently in use
- State requirements are minimal (theme + UI toggles)
- Future: May add Context for theme if needed across many components

---

## Styling Architecture

### CSS Custom Properties (Design Tokens)
Defined in `src/index.css`:

```css
:root {
  /* Colors */
  --color-primary: #6366f1;
  --color-primary-dark: #4f46e5;
  --color-primary-light: #818cf8;

  /* Light Theme */
  --color-text-primary: #1e293b;
  --color-background: #ffffff;
  /* ... */
}

.dark-theme {
  /* Dark Theme Overrides */
  --color-text-primary: #f8fafc;
  --color-background: #0f172a;
  /* ... */
}
```

### Theme Switching Mechanism
1. User clicks ThemeToggle button
2. Component updates state and localStorage
3. `useEffect` sets `document.documentElement.className = '${theme}-theme'`
4. CSS variables re-evaluate based on `.dark-theme` class
5. All components update automatically

### Styling Conventions
- **Co-located CSS**: Each component has its own CSS file
- **BEM-like naming**: `.component-name`, `.component-name__element`
- **No preprocessors**: Plain CSS only
- **No CSS-in-JS**: External CSS files
- **Mobile-first**: Base styles for mobile, media queries for desktop

### Responsive Breakpoints
```css
/* Mobile-first approach */
/* Base: 0-768px */

@media (min-width: 768px) {
  /* Tablet */
}

@media (min-width: 1024px) {
  /* Desktop */
}
```

---

## Testing Strategy

### Test Framework
**Vitest** + **Testing Library (React)**

### Test Environment
- **jsdom**: Simulates browser DOM
- **Global test utilities**: `describe`, `it`, `expect` available globally
- **Setup file**: `src/test/setup.js`

### Test Setup (`src/test/setup.js`)
```javascript
import '@testing-library/jest-dom'

// Mock localStorage
beforeEach(() => {
  global.localStorage = {
    getItem: vi.fn(() => 'light'),
    setItem: vi.fn(),
    clear: vi.fn(),
    // ...
  }
  document.documentElement.className = ''
})
```

### Testing Patterns

#### Component Tests
```javascript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Component } from './Component'

describe('Component', () => {
  it('renders correctly', () => {
    render(<Component />)
    expect(screen.getByText('...')).toBeInTheDocument()
  })
})
```

#### Router Tests
Components using React Router wrapped in `BrowserRouter` or `MemoryRouter`:
```javascript
import { BrowserRouter } from 'react-router-dom'

render(
  <BrowserRouter>
    <Navbar />
  </BrowserRouter>
)
```

#### User Interaction Tests
```javascript
import { render, screen, fireEvent } from '@testing-library/react'

it('toggles menu on click', () => {
  render(<Navbar />)
  const button = screen.getByLabelText('Toggle mobile menu')
  fireEvent.click(button)
  // Assert menu state changed
})
```

### Test Coverage
- **Unit Tests**: All components have co-located test files
- **Integration Tests**: Route navigation, theme switching
- **E2E Tests**: Playwright for visual regression (screenshots in `.eunomia/screenshots/`)

### Running Tests
```bash
# Run all tests
npm test

# Run with coverage
npm run test -- --coverage

# Run in watch mode
npm run test -- --watch
```

---

## Build & Development

### Development Workflow
```bash
# Install dependencies
npm install

# Start dev server (port 3000)
npm run dev

# Run tests
npm test

# Lint code
npm run lint
```

### Build Process
```bash
# Production build
npm run build

# Preview production build
npm run preview
```

**Build Output**:
- Location: `dist/`
- Assets: Hashed filenames for cache busting
- HTML: Minified with inlined critical CSS
- JS: Bundled, minified, code-split by route

### Vite Configuration Highlights
```javascript
{
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: false  // Fallback if port busy
  },
  build: {
    outDir: 'dist',
    sourcemap: false   // No source maps in prod
  }
}
```

### Code Quality

#### ESLint Configuration
- **Extends**: `eslint:recommended`, `plugin:react/recommended`
- **Plugins**: `react`, `react-hooks`
- **Rules**:
  - `no-unused-vars`: warn
  - `react/prop-types`: off (using TypeScript types instead)

#### TypeScript Configuration
- **Target**: ES2020
- **JSX**: `react-jsx` (new JSX transform)
- **Strict**: false (gradual TypeScript adoption)
- **Module**: ESNext

---

## Accessibility & SEO

### Accessibility Features

#### Keyboard Navigation
- **Skip Link**: `<a href="#main-content">Skip to main content</a>` in `index.html`
- **Focus Management**: All interactive elements focusable
- **Tab Order**: Logical tab sequence

#### ARIA Labels
```jsx
<button aria-label="Toggle mobile menu" aria-expanded={isOpen}>
  {/* Hamburger icon */}
</button>

<a href="..." aria-label="GitHub">GitHub</a>
```

#### Semantic HTML
- `<nav>`, `<main>`, `<footer>`, `<section>` for landmark regions
- Heading hierarchy (`<h1>`, `<h2>`, etc.)

#### Color Contrast
- Design tokens ensure WCAG AA compliance
- Both light and dark themes tested for contrast ratios

### SEO Optimization

#### Meta Tags (`index.html`)
```html
<meta name="description" content="Portfolio website..." />
<meta name="keywords" content="portfolio, web development..." />
<meta name="author" content="John Doe" />
```

#### Open Graph Tags
```html
<meta property="og:title" content="Eunomia Portfolio" />
<meta property="og:description" content="Full Stack Developer Portfolio" />
<meta property="og:type" content="website" />
```

#### Semantic Structure
- Proper heading hierarchy
- Alt text for images (when added)
- Descriptive link text

#### Performance
- Lazy loading via React Router code splitting
- Minimal dependencies
- Optimized build output

---

## Future Considerations

### Potential Enhancements

#### 1. Content Management
- **Problem**: Project data hardcoded in components
- **Solution**:
  - JSON data files in `/src/data/`
  - Or headless CMS integration (Contentful, Sanity)

#### 2. Global State Management
- **When**: If theme/user preferences grow complex
- **Options**: React Context API, Zustand
- **Use Case**: Share theme across deeply nested components

#### 3. Form Handling
- **Current**: Contact form likely uses local state
- **Enhancement**: Form validation library (React Hook Form, Formik)
- **Backend**: Form submission to backend API or service (FormSpree, Netlify Forms)

#### 4. Animation Library
- **Options**: Framer Motion, React Spring
- **Use Cases**: Page transitions, scroll animations, micro-interactions

#### 5. Image Optimization
- **Current**: No image handling visible
- **Enhancement**:
  - Next.js Image component (if migrating to Next.js)
  - Or lazy loading with Intersection Observer
  - WebP format with fallbacks

#### 6. Internationalization (i18n)
- **Library**: react-i18next
- **Use Case**: Multi-language portfolio

#### 7. Analytics
- **Options**: Google Analytics, Plausible, Fathom
- **Implementation**: Add script to `index.html` or component

#### 8. Progressive Web App (PWA)
- **Features**: Service worker, manifest.json
- **Benefits**: Offline support, install prompt

#### 9. Server-Side Rendering (SSR)
- **Migration**: Next.js or Remix
- **Benefits**: Better SEO, faster initial load

#### 10. Component Library
- **When**: Design system grows
- **Tool**: Storybook for component documentation

### Scalability Considerations

#### Code Organization
If codebase grows beyond 50+ components:
```
src/
├── features/           # Feature-based modules
│   ├── projects/
│   │   ├── components/
│   │   ├── pages/
│   │   └── data/
│   └── contact/
│       └── ...
├── shared/            # Shared utilities
│   ├── components/
│   ├── hooks/
│   └── utils/
└── core/              # Core app setup
    ├── App.jsx
    └── main.jsx
```

#### Performance Monitoring
- React DevTools Profiler
- Lighthouse CI in build pipeline
- Web Vitals tracking

#### CI/CD Pipeline
- GitHub Actions for automated testing
- Automated deployments to Netlify/Vercel
- Preview deployments for PRs

---

## Appendix

### Key Dependencies Reference

| Package | Purpose |
|---------|---------|
| `react` | Core UI library |
| `react-dom` | React DOM rendering |
| `react-router-dom` | Client-side routing |
| `@testing-library/react` | Component testing utilities |
| `@testing-library/jest-dom` | DOM matchers for tests |
| `vitest` | Test runner |
| `vite` | Build tool |
| `eslint` | Code linting |
| `playwright` | E2E/visual testing |

### Commands Reference

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm test` | Run tests |
| `npm run lint` | Lint code |

### External Resources
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [React Router Documentation](https://reactrouter.com)
- [Vitest Documentation](https://vitest.dev)
- [Testing Library Documentation](https://testing-library.com)

---

**Document Version**: 1.0
**Last Updated**: 2026-03-07
**Maintained By**: Development Team
