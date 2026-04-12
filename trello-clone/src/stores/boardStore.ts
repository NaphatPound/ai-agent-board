import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Board, List, Card, Label, Checklist, ChecklistItem, CardComment, Workspace } from '../types';
import { createDemoData, aiMember } from '../utils/defaults';

const STORAGE_KEY = 'trello-clone-data';

interface BoardState {
  workspace: Workspace;
  boards: Record<string, Board>;
  lists: Record<string, List>;
  cards: Record<string, Card>;

  // Board actions
  createBoard: (title: string, background: Board['background']) => Board;
  updateBoard: (id: string, data: Partial<Board>) => void;
  deleteBoard: (id: string) => void;
  starBoard: (id: string) => void;

  // List actions
  createList: (boardId: string, title: string) => List;
  updateList: (id: string, data: Partial<List>) => void;
  deleteList: (id: string) => void;
  moveList: (boardId: string, fromIndex: number, toIndex: number) => void;

  // Card actions
  createCard: (listId: string, boardId: string, title: string) => Card;
  updateCard: (id: string, data: Partial<Card>) => void;
  deleteCard: (id: string) => void;
  moveCard: (cardId: string, fromListId: string, toListId: string, newIndex: number) => void;
  archiveCard: (id: string) => void;

  // Label actions
  createLabel: (boardId: string, name: string, color: string) => Label;
  updateLabel: (boardId: string, labelId: string, data: Partial<Label>) => void;
  deleteLabel: (boardId: string, labelId: string) => void;

  // Checklist actions
  addChecklist: (cardId: string, title: string) => void;
  deleteChecklist: (cardId: string, checklistId: string) => void;
  addChecklistItem: (cardId: string, checklistId: string, text: string) => void;
  toggleChecklistItem: (cardId: string, checklistId: string, itemId: string) => void;
  deleteChecklistItem: (cardId: string, checklistId: string, itemId: string) => void;

  // Comment actions
  addComment: (cardId: string, text: string) => void;
  editComment: (cardId: string, commentId: string, text: string) => void;
  deleteComment: (cardId: string, commentId: string) => void;

  // Persistence
  loadFromStorage: () => void;
  saveToStorage: () => void;
}

function saveState(state: Pick<BoardState, 'workspace' | 'boards' | 'lists' | 'cards'>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      workspace: state.workspace,
      boards: state.boards,
      lists: state.lists,
      cards: state.cards,
    }));
  } catch (e) {
    console.error('Failed to save state:', e);
  }
}

const demoData = createDemoData();

export const useBoardStore = create<BoardState>((set, get) => ({
  workspace: demoData.workspace,
  boards: demoData.boards,
  lists: demoData.lists,
  cards: demoData.cards,

  createBoard: (title, background) => {
    const id = uuidv4();
    const now = new Date().toISOString();

    // Create default lists
    const defaultListTitles = ['Scheduled', 'To Do', 'In Progress', 'Review', 'Done'];
    const defaultLists: Record<string, List> = {};
    const defaultListIds: string[] = [];
    for (const listTitle of defaultListTitles) {
      const listId = uuidv4();
      defaultListIds.push(listId);
      defaultLists[listId] = { id: listId, boardId: id, title: listTitle, cardIds: [], isArchived: false };
    }

    const board: Board = {
      id, workspaceId: get().workspace.id, title, background,
      listIds: defaultListIds, labels: [], members: [{ id: 'member-1', name: 'You', avatar: '', color: '#0079BF' }, aiMember],
      isStarred: false, createdAt: now, updatedAt: now,
    };
    set(state => {
      const newState = {
        boards: { ...state.boards, [id]: board },
        lists: { ...state.lists, ...defaultLists },
        workspace: { ...state.workspace, boardIds: [...state.workspace.boardIds, id] },
      };
      saveState({ ...state, ...newState });
      return newState;
    });
    return board;
  },

  updateBoard: (id, data) => {
    set(state => {
      const board = state.boards[id];
      if (!board) return state;
      const newState = { boards: { ...state.boards, [id]: { ...board, ...data, updatedAt: new Date().toISOString() } } };
      saveState({ ...state, ...newState });
      return newState;
    });
  },

  deleteBoard: (id) => {
    set(state => {
      const { [id]: deleted, ...remainingBoards } = state.boards;
      if (!deleted) return state;
      // Remove all lists and cards for this board
      const newLists = { ...state.lists };
      const newCards = { ...state.cards };
      deleted.listIds.forEach(listId => {
        const list = newLists[listId];
        if (list) {
          list.cardIds.forEach(cardId => delete newCards[cardId]);
          delete newLists[listId];
        }
      });
      const newState = {
        boards: remainingBoards,
        lists: newLists,
        cards: newCards,
        workspace: { ...state.workspace, boardIds: state.workspace.boardIds.filter(bid => bid !== id) },
      };
      saveState({ ...state, ...newState });
      return newState;
    });
  },

  starBoard: (id) => {
    set(state => {
      const board = state.boards[id];
      if (!board) return state;
      const newState = { boards: { ...state.boards, [id]: { ...board, isStarred: !board.isStarred } } };
      saveState({ ...state, ...newState });
      return newState;
    });
  },

  createList: (boardId, title) => {
    const id = uuidv4();
    const list: List = { id, boardId, title, cardIds: [], isArchived: false };
    set(state => {
      const board = state.boards[boardId];
      if (!board) return state;
      const newState = {
        lists: { ...state.lists, [id]: list },
        boards: { ...state.boards, [boardId]: { ...board, listIds: [...board.listIds, id] } },
      };
      saveState({ ...state, ...newState });
      return newState;
    });
    return list;
  },

  updateList: (id, data) => {
    set(state => {
      const list = state.lists[id];
      if (!list) return state;
      const newState = { lists: { ...state.lists, [id]: { ...list, ...data } } };
      saveState({ ...state, ...newState });
      return newState;
    });
  },

  deleteList: (id) => {
    set(state => {
      const list = state.lists[id];
      if (!list) return state;
      const { [id]: _, ...remainingLists } = state.lists;
      const newCards = { ...state.cards };
      list.cardIds.forEach(cardId => delete newCards[cardId]);
      const board = state.boards[list.boardId];
      const newState = {
        lists: remainingLists,
        cards: newCards,
        boards: board ? { ...state.boards, [list.boardId]: { ...board, listIds: board.listIds.filter(lid => lid !== id) } } : state.boards,
      };
      saveState({ ...state, ...newState });
      return newState;
    });
  },

  moveList: (boardId, fromIndex, toIndex) => {
    set(state => {
      const board = state.boards[boardId];
      if (!board) return state;
      const newListIds = [...board.listIds];
      const [removed] = newListIds.splice(fromIndex, 1);
      newListIds.splice(toIndex, 0, removed);
      const newState = { boards: { ...state.boards, [boardId]: { ...board, listIds: newListIds } } };
      saveState({ ...state, ...newState });
      return newState;
    });
  },

  createCard: (listId, boardId, title) => {
    const id = uuidv4();
    const now = new Date().toISOString();
    const list = get().lists[listId];
    const card: Card = {
      id, listId, boardId, title, description: '', labelIds: [], memberIds: [],
      checklists: [], dueDate: undefined, isDueDateComplete: false,
      attachments: [], comments: [], isArchived: false,
      position: list ? list.cardIds.length : 0, createdAt: now, updatedAt: now,
    };
    set(state => {
      const currentList = state.lists[listId];
      if (!currentList) return state;
      const newState = {
        cards: { ...state.cards, [id]: card },
        lists: { ...state.lists, [listId]: { ...currentList, cardIds: [...currentList.cardIds, id] } },
      };
      saveState({ ...state, ...newState });
      return newState;
    });
    return card;
  },

  updateCard: (id, data) => {
    set(state => {
      const card = state.cards[id];
      if (!card) return state;
      const newState = { cards: { ...state.cards, [id]: { ...card, ...data, updatedAt: new Date().toISOString() } } };
      saveState({ ...state, ...newState });
      return newState;
    });
  },

  deleteCard: (id) => {
    set(state => {
      const card = state.cards[id];
      if (!card) return state;
      const { [id]: _, ...remainingCards } = state.cards;
      const list = state.lists[card.listId];
      const newState = {
        cards: remainingCards,
        lists: list ? { ...state.lists, [card.listId]: { ...list, cardIds: list.cardIds.filter(cid => cid !== id) } } : state.lists,
      };
      saveState({ ...state, ...newState });
      return newState;
    });
  },

  moveCard: (cardId, fromListId, toListId, newIndex) => {
    set(state => {
      const card = state.cards[cardId];
      const fromList = state.lists[fromListId];
      const toList = state.lists[toListId];
      if (!card || !fromList || !toList) return state;

      const newFromCardIds = fromList.cardIds.filter(id => id !== cardId);
      let newToCardIds: string[];

      if (fromListId === toListId) {
        newToCardIds = [...newFromCardIds];
        newToCardIds.splice(newIndex, 0, cardId);
        const newState = {
          cards: { ...state.cards, [cardId]: { ...card, listId: toListId, position: newIndex } },
          lists: { ...state.lists, [fromListId]: { ...fromList, cardIds: newToCardIds } },
        };
        saveState({ ...state, ...newState });
        return newState;
      } else {
        newToCardIds = [...toList.cardIds];
        newToCardIds.splice(newIndex, 0, cardId);
        const newState = {
          cards: { ...state.cards, [cardId]: { ...card, listId: toListId, position: newIndex } },
          lists: {
            ...state.lists,
            [fromListId]: { ...fromList, cardIds: newFromCardIds },
            [toListId]: { ...toList, cardIds: newToCardIds },
          },
        };
        saveState({ ...state, ...newState });
        return newState;
      }
    });
  },

  archiveCard: (id) => {
    const { updateCard } = get();
    updateCard(id, { isArchived: true });
  },

  createLabel: (boardId, name, color) => {
    const label: Label = { id: uuidv4(), name, color };
    set(state => {
      const board = state.boards[boardId];
      if (!board) return state;
      const newState = { boards: { ...state.boards, [boardId]: { ...board, labels: [...board.labels, label] } } };
      saveState({ ...state, ...newState });
      return newState;
    });
    return label;
  },

  updateLabel: (boardId, labelId, data) => {
    set(state => {
      const board = state.boards[boardId];
      if (!board) return state;
      const newState = {
        boards: {
          ...state.boards,
          [boardId]: { ...board, labels: board.labels.map(l => l.id === labelId ? { ...l, ...data } : l) },
        },
      };
      saveState({ ...state, ...newState });
      return newState;
    });
  },

  deleteLabel: (boardId, labelId) => {
    set(state => {
      const board = state.boards[boardId];
      if (!board) return state;
      // Remove label from all cards in this board
      const newCards = { ...state.cards };
      Object.values(newCards).forEach(card => {
        if (card.boardId === boardId && card.labelIds.includes(labelId)) {
          newCards[card.id] = { ...card, labelIds: card.labelIds.filter(id => id !== labelId) };
        }
      });
      const newState = {
        boards: { ...state.boards, [boardId]: { ...board, labels: board.labels.filter(l => l.id !== labelId) } },
        cards: newCards,
      };
      saveState({ ...state, ...newState });
      return newState;
    });
  },

  addChecklist: (cardId, title) => {
    set(state => {
      const card = state.cards[cardId];
      if (!card) return state;
      const checklist: Checklist = { id: uuidv4(), title, items: [] };
      const newState = {
        cards: { ...state.cards, [cardId]: { ...card, checklists: [...card.checklists, checklist] } },
      };
      saveState({ ...state, ...newState });
      return newState;
    });
  },

  deleteChecklist: (cardId, checklistId) => {
    set(state => {
      const card = state.cards[cardId];
      if (!card) return state;
      const newState = {
        cards: { ...state.cards, [cardId]: { ...card, checklists: card.checklists.filter(c => c.id !== checklistId) } },
      };
      saveState({ ...state, ...newState });
      return newState;
    });
  },

  addChecklistItem: (cardId, checklistId, text) => {
    set(state => {
      const card = state.cards[cardId];
      if (!card) return state;
      const item: ChecklistItem = { id: uuidv4(), text, isChecked: false };
      const newState = {
        cards: {
          ...state.cards,
          [cardId]: {
            ...card,
            checklists: card.checklists.map(c =>
              c.id === checklistId ? { ...c, items: [...c.items, item] } : c
            ),
          },
        },
      };
      saveState({ ...state, ...newState });
      return newState;
    });
  },

  toggleChecklistItem: (cardId, checklistId, itemId) => {
    set(state => {
      const card = state.cards[cardId];
      if (!card) return state;
      const newState = {
        cards: {
          ...state.cards,
          [cardId]: {
            ...card,
            checklists: card.checklists.map(c =>
              c.id === checklistId ? {
                ...c,
                items: c.items.map(i =>
                  i.id === itemId ? { ...i, isChecked: !i.isChecked } : i
                ),
              } : c
            ),
          },
        },
      };
      saveState({ ...state, ...newState });
      return newState;
    });
  },

  deleteChecklistItem: (cardId, checklistId, itemId) => {
    set(state => {
      const card = state.cards[cardId];
      if (!card) return state;
      const newState = {
        cards: {
          ...state.cards,
          [cardId]: {
            ...card,
            checklists: card.checklists.map(c =>
              c.id === checklistId ? { ...c, items: c.items.filter(i => i.id !== itemId) } : c
            ),
          },
        },
      };
      saveState({ ...state, ...newState });
      return newState;
    });
  },

  addComment: (cardId, text) => {
    set(state => {
      const card = state.cards[cardId];
      if (!card) return state;
      const comment: CardComment = { id: uuidv4(), memberId: 'member-1', text, createdAt: new Date().toISOString() };
      const newState = {
        cards: { ...state.cards, [cardId]: { ...card, comments: [comment, ...card.comments] } },
      };
      saveState({ ...state, ...newState });
      return newState;
    });
  },

  editComment: (cardId, commentId, text) => {
    set(state => {
      const card = state.cards[cardId];
      if (!card) return state;
      const newState = {
        cards: {
          ...state.cards,
          [cardId]: {
            ...card,
            comments: card.comments.map(c =>
              c.id === commentId ? { ...c, text, editedAt: new Date().toISOString() } : c
            ),
          },
        },
      };
      saveState({ ...state, ...newState });
      return newState;
    });
  },

  deleteComment: (cardId, commentId) => {
    set(state => {
      const card = state.cards[cardId];
      if (!card) return state;
      const newState = {
        cards: { ...state.cards, [cardId]: { ...card, comments: card.comments.filter(c => c.id !== commentId) } },
      };
      saveState({ ...state, ...newState });
      return newState;
    });
  },

  loadFromStorage: () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        set({ workspace: data.workspace, boards: data.boards, lists: data.lists, cards: data.cards });
      }
    } catch (e) {
      console.error('Failed to load state:', e);
    }
  },

  saveToStorage: () => {
    const state = get();
    saveState(state);
  },
}));

// Expose store in dev mode for testing
if (import.meta.env.DEV) {
  (window as unknown as Record<string, unknown>).__boardStore = useBoardStore;
}
