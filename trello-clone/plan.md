# Trello Clone - React TypeScript Implementation Plan

## Project Overview

Build a full-featured Trello clone web application using React and TypeScript. The app replicates Trello's core project management interface with boards, lists, and cards — featuring drag-and-drop functionality, labels, checklists, due dates, member assignment, and a premium modern UI.

## Tech Stack

| Technology | Purpose |
|---|---|
| **React 18+** | UI framework |
| **TypeScript** | Type safety |
| **Vite** | Build tool & dev server |
| **React Router v6** | Client-side routing |
| **@dnd-kit/core** | Drag and drop (boards ↔ lists ↔ cards) |
| **Zustand** | Lightweight state management |
| **date-fns** | Date formatting & manipulation |
| **lucide-react** | Modern icon library |
| **uuid** | Unique ID generation |
| **localStorage** | Data persistence (no backend) |

---

## Phase 1: Project Setup & Design System

### Step 1.1 — Initialize Project

```bash
npx -y create-vite@latest ./ -- --template react-ts
npm install
npm install react-router-dom @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities zustand date-fns lucide-react uuid
npm install -D @types/uuid
```

### Step 1.2 — Project Structure

```
src/
├── assets/                    # Static assets
├── components/
│   ├── common/                # Shared UI components
│   │   ├── Avatar.tsx
│   │   ├── Button.tsx
│   │   ├── Modal.tsx
│   │   ├── Dropdown.tsx
│   │   ├── ColorPicker.tsx
│   │   ├── ConfirmDialog.tsx
│   │   └── Tooltip.tsx
│   ├── layout/
│   │   ├── AppHeader.tsx      # Top navigation bar
│   │   ├── Sidebar.tsx        # Workspace sidebar
│   │   └── Layout.tsx         # Main layout wrapper
│   ├── board/
│   │   ├── BoardView.tsx      # Main board Kanban view
│   │   ├── BoardHeader.tsx    # Board title, star, members, filter
│   │   ├── BoardMenu.tsx      # Board settings side panel
│   │   └── BoardBackground.tsx
│   ├── list/
│   │   ├── List.tsx           # Single list column
│   │   ├── ListHeader.tsx     # List title + actions menu
│   │   ├── AddList.tsx        # "+ Add another list" button
│   │   └── ListActions.tsx    # Copy, move, archive list
│   ├── card/
│   │   ├── Card.tsx           # Card preview in list
│   │   ├── CardDetail.tsx     # Full card modal
│   │   ├── CardLabels.tsx     # Label badges on card
│   │   ├── CardChecklist.tsx  # Checklist with progress
│   │   ├── CardDueDate.tsx    # Due date badge
│   │   ├── CardMembers.tsx    # Member avatars
│   │   ├── CardDescription.tsx # Description editor
│   │   ├── CardComments.tsx   # Comment section
│   │   ├── CardAttachments.tsx # File attachments
│   │   ├── AddCard.tsx        # "+ Add a card" button
│   │   └── CardActions.tsx    # Move, copy, archive card
│   ├── workspace/
│   │   ├── WorkspaceView.tsx  # Workspace home page
│   │   ├── WorkspaceBoards.tsx # Board grid/list
│   │   └── CreateBoard.tsx    # Create board modal
│   └── label/
│       ├── LabelManager.tsx   # Create/edit/delete labels
│       └── LabelPicker.tsx    # Select labels for card
├── hooks/
│   ├── useDragAndDrop.ts      # DnD logic hook
│   ├── useClickOutside.ts     # Click outside handler
│   └── useLocalStorage.ts     # LocalStorage sync hook
├── stores/
│   ├── boardStore.ts          # Board state (Zustand)
│   ├── workspaceStore.ts      # Workspace state
│   └── uiStore.ts             # UI state (modals, sidebar)
├── types/
│   └── index.ts               # All TypeScript interfaces
├── utils/
│   ├── colors.ts              # Color palette constants
│   ├── defaults.ts            # Default board/list templates
│   └── helpers.ts             # Utility functions
├── pages/
│   ├── HomePage.tsx           # Landing / workspace selector
│   ├── BoardPage.tsx          # Board view page
│   └── NotFoundPage.tsx       # 404 page
├── styles/
│   ├── index.css              # Global styles & CSS variables
│   ├── components/            # Component-specific CSS files
│   │   ├── header.css
│   │   ├── sidebar.css
│   │   ├── board.css
│   │   ├── list.css
│   │   ├── card.css
│   │   ├── modal.css
│   │   ├── label.css
│   │   └── workspace.css
│   └── animations.css         # Keyframe animations
├── App.tsx
├── main.tsx
└── vite-env.d.ts
```

### Step 1.3 — TypeScript Types (`src/types/index.ts`)

```typescript
export interface Workspace {
  id: string;
  name: string;
  description?: string;
  boardIds: string[];
  createdAt: string;
}

export interface Board {
  id: string;
  workspaceId: string;
  title: string;
  background: BoardBackground;
  listIds: string[];           // ordered list IDs
  labels: Label[];
  members: Member[];
  isStarred: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BoardBackground {
  type: 'color' | 'gradient' | 'image';
  value: string;
}

export interface List {
  id: string;
  boardId: string;
  title: string;
  cardIds: string[];           // ordered card IDs
  isArchived: boolean;
}

export interface Card {
  id: string;
  listId: string;
  boardId: string;
  title: string;
  description?: string;
  labelIds: string[];
  memberIds: string[];
  checklists: Checklist[];
  dueDate?: string;
  isDueDateComplete: boolean;
  attachments: Attachment[];
  comments: Comment[];
  coverColor?: string;
  coverImage?: string;
  isArchived: boolean;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface Label {
  id: string;
  name: string;
  color: string;               // hex color
}

export interface Checklist {
  id: string;
  title: string;
  items: ChecklistItem[];
}

export interface ChecklistItem {
  id: string;
  text: string;
  isChecked: boolean;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  addedAt: string;
}

export interface Comment {
  id: string;
  memberId: string;
  text: string;
  createdAt: string;
  editedAt?: string;
}

export interface Member {
  id: string;
  name: string;
  avatar: string;              // initials or image URL
  color: string;               // avatar background color
}
```

### Step 1.4 — Design System (CSS Variables)

```css
:root {
  /* Colors - Trello Blue Theme */
  --color-primary: #0079BF;
  --color-primary-hover: #026AA7;
  --color-primary-light: #E4F0F6;
  --color-secondary: #5BA4CF;

  /* Background */
  --bg-main: #0079BF;
  --bg-sidebar: #026AA7;
  --bg-board: transparent;
  --bg-list: #F1F2F4;
  --bg-card: #FFFFFF;
  --bg-header: rgba(0, 0, 0, 0.32);

  /* Text */
  --text-primary: #172B4D;
  --text-secondary: #5E6C84;
  --text-light: #FFFFFF;
  --text-link: #0079BF;

  /* Card Labels - Trello's 6 default colors */
  --label-green: #61BD4F;
  --label-yellow: #F2D600;
  --label-orange: #FF9F1A;
  --label-red: #EB5A46;
  --label-purple: #C377E0;
  --label-blue: #0079BF;
  --label-sky: #00C2E0;
  --label-lime: #51E898;
  --label-pink: #FF78CB;
  --label-black: #344563;

  /* Shadows */
  --shadow-card: 0 1px 0 rgba(9, 30, 66, 0.25);
  --shadow-card-hover: 0 4px 8px rgba(9, 30, 66, 0.25);
  --shadow-modal: 0 8px 16px rgba(9, 30, 66, 0.25);
  --shadow-dropdown: 0 8px 16px -4px rgba(9, 30, 66, 0.25);

  /* Border Radius */
  --radius-sm: 3px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;

  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 12px;
  --spacing-lg: 16px;
  --spacing-xl: 24px;

  /* Typography */
  --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans', Ubuntu, 'Droid Sans', 'Helvetica Neue', sans-serif;
  --font-size-xs: 12px;
  --font-size-sm: 14px;
  --font-size-md: 16px;
  --font-size-lg: 20px;
  --font-size-xl: 24px;

  /* Transitions */
  --transition-fast: 85ms ease;
  --transition-normal: 200ms ease;
  --transition-slow: 300ms ease;

  /* Z-index layers */
  --z-dropdown: 100;
  --z-modal-backdrop: 200;
  --z-modal: 300;
  --z-tooltip: 400;
  --z-drag: 500;
}
```

---

## Phase 2: Core Layout & Navigation

### Step 2.1 — App Header (`AppHeader.tsx`)

- Trello logo (left)
- Create button (opens create board modal)
- Search bar (filter boards/cards)
- Notification bell icon
- User avatar dropdown
- Dark semi-transparent background bar

### Step 2.2 — Sidebar (`Sidebar.tsx`)

- Workspace name & settings
- Boards list with star toggle
- Create new board button
- Collapsible sidebar with smooth animation

### Step 2.3 — Routing (`App.tsx`)

```typescript
Routes:
  /                    → HomePage (workspace overview)
  /board/:boardId      → BoardPage (kanban board)
  /*                   → NotFoundPage
```

---

## Phase 3: Workspace & Board Management

### Step 3.1 — Workspace Home (`WorkspaceView.tsx`)

- Starred boards section (top)
- Recently viewed boards
- All boards grid with hover animations
- Each board card shows:
  - Background color/gradient preview
  - Board title
  - Star toggle (favorite)
  - Last activity indicator

### Step 3.2 — Create Board Modal (`CreateBoard.tsx`)

- Board title input
- Background picker:
  - 9 preset background colors/gradients
  - Custom color picker
- Workspace selector dropdown
- Create button with validation
- Live preview of board thumbnail

---

## Phase 4: Board View (Core Kanban)

### Step 4.1 — Board View (`BoardView.tsx`)

- Full-width horizontal scrolling board
- Dynamic background (color/gradient/image)
- Lists rendered horizontally with overflow scroll
- "+ Add another list" button at the end
- Board header with title, star, members, filter, menu

### Step 4.2 — Board Header (`BoardHeader.tsx`)

- Editable board title (click to edit, inline)
- Star/unstar toggle
- Member avatars (show first 5 + "+N" overflow)
- Filter dropdown (by label, member, due date)
- Board menu button (opens side panel)

### Step 4.3 — Board Menu (`BoardMenu.tsx`)

- Slide-in panel from right
- Sections:
  - About this board
  - Change background
  - Labels manager
  - Archived items
  - Close board

---

## Phase 5: Lists

### Step 5.1 — List Component (`List.tsx`)

- Fixed width (272px like Trello)
- Rounded corners, subtle shadow
- Scrollable card area (vertical)
- Drag handle at top
- Minimum height maintained even when empty

### Step 5.2 — List Header (`ListHeader.tsx`)

- Editable title (click to edit inline)
- "..." menu button (ListActions)
- Actions: Copy list, Move all cards, Sort cards, Archive list

### Step 5.3 — Add List (`AddList.tsx`)

- "+ Add another list" placeholder button
- Expands to text input + "Add list" / "X" buttons
- Auto-focus on expand
- Transparent/semi-transparent styling

### Step 5.4 — Drag & Drop Lists

- Horizontal drag between lists using @dnd-kit
- Visual placeholder/ghost during drag
- Smooth reorder animation

---

## Phase 6: Cards

### Step 6.1 — Card Preview (`Card.tsx`)

- Card title text
- Cover color/image at top (optional)
- Label color badges (compact)
- Due date badge with status colors:
  - Green: completed
  - Yellow: due soon
  - Red: overdue
  - Default: upcoming
- Checklist progress (icon + "2/5")
- Description icon (if has description)
- Comments count icon
- Attachment count icon
- Member avatars (bottom right)
- Hover: subtle lift shadow + edit pencil icon
- Click: opens CardDetail modal

### Step 6.2 — Card Detail Modal (`CardDetail.tsx`)

Full-screen overlay modal with:

**Header:**
- Cover color/image area
- Card title (editable inline)
- "in list [List Name]" subtitle
- Close button (X)

**Left Column (main content, ~67%):**
- **Members** — avatar row + "Join" button
- **Labels** — color badges, click to manage
- **Due Date** — date display with complete checkbox
- **Description** — rich text area with save/cancel
- **Checklists** — multiple checklists with progress bars
  - Add item input
  - Check/uncheck items
  - Delete items
  - Progress percentage bar
- **Comments** — comment input + comment history
  - Avatar + name + timestamp
  - Edit/delete own comments

**Right Column (actions sidebar, ~33%):**
- Add to card:
  - Members
  - Labels
  - Checklist
  - Due Date
  - Attachment
  - Cover
- Actions:
  - Move
  - Copy
  - Archive
  - Delete (with confirmation)

### Step 6.3 — Add Card (`AddCard.tsx`)

- "+ Add a card" button at bottom of list
- Expands to textarea + "Add card" / "X" buttons
- Auto-focus textarea
- Enter to submit, Shift+Enter for newline

### Step 6.4 — Drag & Drop Cards

- Vertical drag within same list
- Cross-list drag (move card between lists)
- Visual drop indicator line
- Smooth animation with @dnd-kit

---

## Phase 7: Labels System

### Step 7.1 — Label Manager (`LabelManager.tsx`)

- Board-level label management
- 10 preset colors (Trello palette)
- Create label: name + color
- Edit existing labels
- Delete labels (with warning)
- Search/filter labels

### Step 7.2 — Label Picker (`LabelPicker.tsx`)

- Dropdown from card detail
- Checkbox selection (multi-select)
- Create new label inline
- Search labels
- Color dot + label name

### Step 7.3 — Card Label Display

- Compact colored bars on card preview
- Click to expand showing label names
- Full label pills in card detail

---

## Phase 8: Due Dates

### Step 8.1 — Date Picker

- Calendar date picker popup
- Set start date + due date
- Time selection
- Reminder options (1 day before, etc.)
- Clear date option

### Step 8.2 — Due Date Display

- Badge on card with smart formatting:
  - "Dec 25" for future dates
  - "Tomorrow" / "Today" for near dates
  - Color coding:
    - No color: >24 hours away
    - Yellow bg: due within 24 hours
    - Red bg: overdue
    - Green bg: completed
- Checkbox to mark complete

---

## Phase 9: Checklists

### Step 9.1 — Checklist Component

- Title (editable)
- Progress bar (percentage)
- "Hide checked items" toggle
- Items list with checkboxes
- "+ Add an item" input
- Drag to reorder items
- Delete checklist button
- Convert item to card

### Step 9.2 — Multiple Checklists

- Add multiple checklists to a card
- Each with independent title and progress
- Delete individual checklists

---

## Phase 10: State Management (Zustand)

### Step 10.1 — Board Store (`boardStore.ts`)

```typescript
interface BoardState {
  boards: Record<string, Board>;
  lists: Record<string, List>;
  cards: Record<string, Card>;

  // Board actions
  createBoard: (data: Partial<Board>) => Board;
  updateBoard: (id: string, data: Partial<Board>) => void;
  deleteBoard: (id: string) => void;
  starBoard: (id: string) => void;

  // List actions
  createList: (boardId: string, title: string) => List;
  updateList: (id: string, data: Partial<List>) => void;
  deleteList: (id: string) => void;
  moveList: (boardId: string, fromIndex: number, toIndex: number) => void;

  // Card actions
  createCard: (listId: string, title: string) => Card;
  updateCard: (id: string, data: Partial<Card>) => void;
  deleteCard: (id: string) => void;
  moveCard: (cardId: string, fromListId: string, toListId: string, newIndex: number) => void;
  archiveCard: (id: string) => void;

  // Label actions
  createLabel: (boardId: string, data: Partial<Label>) => Label;
  updateLabel: (boardId: string, labelId: string, data: Partial<Label>) => void;
  deleteLabel: (boardId: string, labelId: string) => void;

  // Checklist actions
  addChecklist: (cardId: string, title: string) => void;
  deleteChecklist: (cardId: string, checklistId: string) => void;
  addChecklistItem: (cardId: string, checklistId: string, text: string) => void;
  toggleChecklistItem: (cardId: string, checklistId: string, itemId: string) => void;

  // Comment actions
  addComment: (cardId: string, text: string) => void;
  editComment: (cardId: string, commentId: string, text: string) => void;
  deleteComment: (cardId: string, commentId: string) => void;

  // Persistence
  loadFromStorage: () => void;
  saveToStorage: () => void;
}
```

### Step 10.2 — localStorage Persistence

- Auto-save on every state change (debounced 500ms)
- Load on app startup
- Key: `trello-clone-data`
- Include sample/demo board on first load

---

## Phase 11: Polish & UX

### Step 11.1 — Animations & Micro-interactions

- Card hover: lift shadow + brightness
- List appear: slide in from right
- Card add: fade in + slide down
- Modal: fade + scale in
- Sidebar: slide left/right
- Drag: opacity change + scale + shadow
- Button hover: color transitions
- Star toggle: bounce animation
- Checklist check: strikethrough animation
- Progress bar: smooth width transition

### Step 11.2 — Keyboard Shortcuts

- `N` — New card in focused list
- `B` — Open board selector
- `Esc` — Close any modal/dropdown
- `Enter` — Submit edit forms

### Step 11.3 — Responsive Design

- Desktop: full board view with sidebar
- Tablet: collapsible sidebar, smaller cards
- Mobile: stacked lists, swipe between lists

### Step 11.4 — Demo Data

Create a pre-populated demo board on first load:

```
Board: "Project Management"
  List: "To Do"
    - Card: "Research competitor features"
    - Card: "Design wireframes"
    - Card: "Set up project repository"
  List: "In Progress"
    - Card: "Build authentication flow"
    - Card: "Create database schema"
  List: "Review"
    - Card: "Code review: API endpoints"
  List: "Done"
    - Card: "Project kickoff meeting"
    - Card: "Define tech stack"
```

Each card includes sample labels, checklists, comments, and due dates.

---

## Phase 12: Advanced Features

### Step 12.1 — Board Backgrounds

- 9 preset color/gradient backgrounds
- Gradient options:
  - Blue Ocean: `linear-gradient(135deg, #0079BF, #5BA4CF)`
  - Sunset: `linear-gradient(135deg, #EB5A46, #FF9F1A)`
  - Forest: `linear-gradient(135deg, #61BD4F, #519839)`
  - Purple Haze: `linear-gradient(135deg, #C377E0, #8B5CF6)`
  - Night Sky: `linear-gradient(135deg, #344563, #091E42)`
  - Coral Reef: `linear-gradient(135deg, #FF78CB, #EB5A46)`
  - Arctic: `linear-gradient(135deg, #00C2E0, #0079BF)`
  - Autumn: `linear-gradient(135deg, #FF9F1A, #F2D600)`
  - Midnight: `linear-gradient(135deg, #172B4D, #344563)`

### Step 12.2 — Card Covers

- Select cover color from palette
- Cover displays as colored bar at top of card
- Remove cover option

### Step 12.3 — Search & Filter

- Global search across all boards/cards
- Board-level filtering:
  - By label (multi-select)
  - By member
  - By due date (overdue, due today, due this week, no date)
- Filter badge showing active filters count
- Clear all filters button

### Step 12.4 — Board Activity Log (Optional)

- Track recent actions on the board
- Show in board menu side panel
- Format: "[Member] [action] [target] [time ago]"

---

## Execution Order (For Claude Code)

> [!IMPORTANT]
> Execute these steps in order. Each step should be a complete, working commit.

### Batch 1: Foundation
1. Initialize Vite + React + TypeScript project
2. Install all dependencies
3. Set up project folder structure
4. Create TypeScript type definitions
5. Create CSS design system (variables, globals, animations)

### Batch 2: State & Routing
6. Implement Zustand stores (boardStore, workspaceStore, uiStore)
7. Set up React Router with pages
8. Implement localStorage persistence with demo data
9. Create Layout component with AppHeader

### Batch 3: Board Core
10. Build Sidebar component
11. Build WorkspaceView (home page with board grid)
12. Build CreateBoard modal
13. Build BoardView with BoardHeader
14. Build BoardMenu slide-in panel

### Batch 4: Lists
15. Build List component
16. Build ListHeader with inline editing
17. Build AddList component
18. Implement list drag-and-drop (horizontal reorder)

### Batch 5: Cards
19. Build Card preview component
20. Build AddCard component
21. Build CardDetail modal (description, title editing)
22. Implement card drag-and-drop (vertical + cross-list)

### Batch 6: Card Features
23. Build Labels system (LabelManager + LabelPicker)
24. Build Checklist system with progress
25. Build Due Date picker and display
26. Build Comments section
27. Build Card members and cover

### Batch 7: Polish
28. Add all animations and micro-interactions
29. Add keyboard shortcuts
30. Implement search and filter
31. Add responsive design breakpoints
32. Final UI polish, testing, and bug fixes

---

## Design References

### Color Palette

| Element | Color | Hex |
|---|---|---|
| Primary Blue | Trello Blue | `#0079BF` |
| Header BG | Dark overlay | `rgba(0,0,0,0.32)` |
| List BG | Light Gray | `#F1F2F4` |
| Card BG | White | `#FFFFFF` |
| Text Primary | Dark Blue | `#172B4D` |
| Text Secondary | Gray | `#5E6C84` |
| Green Label | Success | `#61BD4F` |
| Yellow Label | Warning | `#F2D600` |
| Red Label | Danger | `#EB5A46` |
| Orange Label | Caution | `#FF9F1A` |
| Purple Label | Info | `#C377E0` |
| Blue Label | Primary | `#0079BF` |

### Key UI Dimensions

| Element | Size |
|---|---|
| Header height | 44px |
| Sidebar width | 260px |
| List width | 272px |
| Card min-height | 20px |
| Card border-radius | 8px |
| Card gap | 8px |
| Modal max-width | 768px |
| Label badge height | 8px (compact) / 32px (expanded) |

---

## Notes for Claude Code

1. **No backend required** — All data persists in localStorage
2. **No authentication** — Single user mode with demo member
3. **Use semantic HTML** — `<main>`, `<nav>`, `<section>`, `<article>`
4. **Accessibility** — ARIA labels, keyboard navigation, focus management
5. **Error boundaries** — Wrap major sections in React error boundaries
6. **Performance** — Use `React.memo`, `useCallback`, `useMemo` where appropriate
7. **Git commits** — Make atomic commits after each batch is complete
8. **Testing** — Focus on getting the UI working first, tests can be added later
9. **CSS** — Use vanilla CSS with CSS modules or scoped CSS files (NO Tailwind)
10. **Icons** — Use lucide-react for all icons (consistent style)
