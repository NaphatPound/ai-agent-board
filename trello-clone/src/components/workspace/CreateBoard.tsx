import React, { useState } from 'react';
import Modal from '../common/Modal';
import { useBoardStore } from '../../stores/boardStore';
import { BOARD_BACKGROUNDS } from '../../utils/colors';
import { useNavigate } from 'react-router-dom';
import './workspace.css';

interface CreateBoardProps {
  onClose: () => void;
}

const CreateBoard: React.FC<CreateBoardProps> = ({ onClose }) => {
  const [title, setTitle] = useState('');
  const [selectedBg, setSelectedBg] = useState(BOARD_BACKGROUNDS[0]);
  const createBoard = useBoardStore(s => s.createBoard);
  const navigate = useNavigate();

  const handleCreate = () => {
    if (!title.trim()) return;
    const board = createBoard(title.trim(), { type: selectedBg.type, value: selectedBg.value });
    onClose();
    navigate(`/board/${board.id}`);
  };

  return (
    <Modal isOpen onClose={onClose} width="400px">
      <div className="create-board">
        <div className="create-board-preview" style={{ background: selectedBg.value }}>
          <span className="create-board-preview-text">{title || 'Board title'}</span>
        </div>
        <div className="create-board-form">
          <label className="create-board-label">Board title *</label>
          <input
            type="text"
            className="create-board-input"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Enter board title..."
            autoFocus
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
          />
          <label className="create-board-label">Background</label>
          <div className="create-board-backgrounds">
            {BOARD_BACKGROUNDS.map(bg => (
              <button
                key={bg.id}
                className={`create-board-bg-btn ${selectedBg.id === bg.id ? 'create-board-bg-btn--selected' : ''}`}
                style={{ background: bg.value }}
                onClick={() => setSelectedBg(bg)}
                title={bg.name}
              />
            ))}
          </div>
          <button
            className="create-board-submit"
            onClick={handleCreate}
            disabled={!title.trim()}
          >
            Create board
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default CreateBoard;
