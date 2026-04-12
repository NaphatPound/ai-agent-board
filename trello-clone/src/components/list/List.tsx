import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MoreHorizontal, X } from 'lucide-react';
import { List as ListType, Board } from '../../types';
import { useBoardStore } from '../../stores/boardStore';
import { useUIStore } from '../../stores/uiStore';
import Card from '../card/Card';
import AddCard from '../card/AddCard';
import './list.css';

interface ListProps {
  list: ListType;
  board: Board;
}

const List: React.FC<ListProps> = ({ list, board }) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(list.title);
  const [showMenu, setShowMenu] = useState(false);
  const updateList = useBoardStore(s => s.updateList);
  const deleteList = useBoardStore(s => s.deleteList);
  const cards = useBoardStore(s => s.cards);
  const { filterLabels, searchQuery } = useUIStore();

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: list.id,
    data: { type: 'list' },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleSaveTitle = () => {
    if (editTitle.trim()) {
      updateList(list.id, { title: editTitle.trim() });
    } else {
      setEditTitle(list.title);
    }
    setIsEditingTitle(false);
  };

  const handleDeleteList = () => {
    if (window.confirm(`Delete "${list.title}" and all its cards?`)) {
      deleteList(list.id);
    }
    setShowMenu(false);
  };

  // Filter cards
  let listCards = list.cardIds.map(id => cards[id]).filter(Boolean).filter(c => !c.isArchived);

  if (filterLabels.length > 0) {
    listCards = listCards.filter(card => card.labelIds.some(lid => filterLabels.includes(lid)));
  }
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    listCards = listCards.filter(card => card.title.toLowerCase().includes(q) || card.description?.toLowerCase().includes(q));
  }

  return (
    <div ref={setNodeRef} style={style} className="list" {...attributes}>
      <div className="list-header" {...listeners}>
        {isEditingTitle ? (
          <input
            type="text"
            className="list-title-input"
            value={editTitle}
            onChange={e => setEditTitle(e.target.value)}
            onBlur={handleSaveTitle}
            onKeyDown={e => e.key === 'Enter' && handleSaveTitle()}
            autoFocus
            onClick={e => e.stopPropagation()}
          />
        ) : (
          <h3 className="list-title" onClick={() => setIsEditingTitle(true)}>
            {list.title}
          </h3>
        )}
        <div style={{ position: 'relative' }}>
          <button className="list-menu-btn" onClick={() => setShowMenu(!showMenu)}>
            <MoreHorizontal size={16} />
          </button>
          {showMenu && (
            <div className="list-menu" onClick={e => e.stopPropagation()}>
              <div className="list-menu-header">
                <span>List actions</span>
                <button onClick={() => setShowMenu(false)}><X size={14} /></button>
              </div>
              <button className="list-menu-item" onClick={handleDeleteList}>Delete list</button>
            </div>
          )}
        </div>
      </div>
      <div className="list-cards">
        <SortableContext items={list.cardIds} strategy={verticalListSortingStrategy}>
          {listCards.map(card => (
            <Card key={card.id} card={card} board={board} />
          ))}
        </SortableContext>
      </div>
      <AddCard listId={list.id} boardId={board.id} />
    </div>
  );
};

export default List;
