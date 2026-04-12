import React from 'react';
import { X, Palette, Tag, Trash2 } from 'lucide-react';
import { Board } from '../../types';
import { useBoardStore } from '../../stores/boardStore';
import { useUIStore } from '../../stores/uiStore';
import { BOARD_BACKGROUNDS } from '../../utils/colors';
import { useNavigate } from 'react-router-dom';
import './board.css';

interface BoardMenuProps {
  board: Board;
}

const BoardMenu: React.FC<BoardMenuProps> = ({ board }) => {
  const updateBoard = useBoardStore(s => s.updateBoard);
  const deleteBoard = useBoardStore(s => s.deleteBoard);
  const { closeBoardMenu } = useUIStore();
  const navigate = useNavigate();

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this board? This cannot be undone.')) {
      deleteBoard(board.id);
      closeBoardMenu();
      navigate('/');
    }
  };

  return (
    <div className="board-menu">
      <div className="board-menu-header">
        <h3>Menu</h3>
        <button className="board-menu-close" onClick={closeBoardMenu}>
          <X size={16} />
        </button>
      </div>
      <div className="board-menu-content">
        <div className="board-menu-section">
          <div className="board-menu-section-title">
            <Palette size={14} style={{ display: 'inline', marginRight: 4 }} />
            Change background
          </div>
          <div className="board-menu-bg-grid">
            {BOARD_BACKGROUNDS.map(bg => (
              <button
                key={bg.id}
                className={`board-menu-bg-option ${board.background.value === bg.value ? 'board-menu-bg-option--selected' : ''}`}
                style={{ background: bg.value }}
                onClick={() => updateBoard(board.id, { background: { type: bg.type, value: bg.value } })}
                title={bg.name}
              />
            ))}
          </div>
        </div>

        <div className="board-menu-section">
          <div className="board-menu-section-title">
            <Tag size={14} style={{ display: 'inline', marginRight: 4 }} />
            Labels
          </div>
          {board.labels.map(label => (
            <div key={label.id} className="board-menu-btn" style={{ gap: 8 }}>
              <div style={{ width: 40, height: 8, borderRadius: 4, backgroundColor: label.color }} />
              <span>{label.name || 'Unnamed'}</span>
            </div>
          ))}
        </div>

        <div className="board-menu-section" style={{ borderTop: '1px solid #DFE1E6', paddingTop: 12 }}>
          <button className="board-menu-btn board-menu-btn--danger" onClick={handleDelete}>
            <Trash2 size={16} />
            Delete board
          </button>
        </div>
      </div>
    </div>
  );
};

export default BoardMenu;
