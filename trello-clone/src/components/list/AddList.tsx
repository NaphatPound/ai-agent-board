import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useBoardStore } from '../../stores/boardStore';
import './list.css';

interface AddListProps {
  boardId: string;
}

const AddList: React.FC<AddListProps> = ({ boardId }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const createList = useBoardStore(s => s.createList);

  const handleAdd = () => {
    if (!title.trim()) return;
    createList(boardId, title.trim());
    setTitle('');
  };

  const handleCancel = () => {
    setTitle('');
    setIsAdding(false);
  };

  if (!isAdding) {
    return (
      <div className="add-list">
        <button className="add-list-btn" onClick={() => setIsAdding(true)}>
          <Plus size={16} />
          Add another list
        </button>
      </div>
    );
  }

  return (
    <div className="add-list">
      <div className="add-list-form">
        <input
          type="text"
          className="add-list-input"
          placeholder="Enter list title..."
          value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') handleAdd();
            if (e.key === 'Escape') handleCancel();
          }}
          autoFocus
        />
        <div className="add-list-actions">
          <button className="add-list-submit" onClick={handleAdd}>Add list</button>
          <button className="add-list-cancel" onClick={handleCancel}>
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddList;
