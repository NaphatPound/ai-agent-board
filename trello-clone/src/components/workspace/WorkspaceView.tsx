import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, LayoutDashboard, Plus } from 'lucide-react';
import { useBoardStore } from '../../stores/boardStore';
import CreateBoard from './CreateBoard';
import './workspace.css';

const WorkspaceView: React.FC = () => {
  const [showCreate, setShowCreate] = useState(false);
  const boards = useBoardStore(s => s.boards);
  const workspace = useBoardStore(s => s.workspace);
  const starBoard = useBoardStore(s => s.starBoard);
  const boardsList = workspace.boardIds.map(id => boards[id]).filter(Boolean);
  const starredBoards = boardsList.filter(b => b.isStarred);

  return (
    <div className="workspace-view">
      {starredBoards.length > 0 && (
        <div className="workspace-section">
          <h2 className="workspace-section-title">
            <Star size={18} />
            Starred boards
          </h2>
          <div className="workspace-boards-grid">
            {starredBoards.map(board => (
              <Link
                key={board.id}
                to={`/board/${board.id}`}
                className="workspace-board-card"
                style={{ background: board.background.value }}
              >
                <span className="workspace-board-card-title">{board.title}</span>
                <button
                  className={`workspace-board-star workspace-board-star--active`}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); starBoard(board.id); }}
                >
                  <Star size={14} fill="currentColor" />
                </button>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="workspace-section">
        <h2 className="workspace-section-title">
          <LayoutDashboard size={18} />
          Your boards
        </h2>
        <div className="workspace-boards-grid">
          {boardsList.map(board => (
            <Link
              key={board.id}
              to={`/board/${board.id}`}
              className="workspace-board-card"
              style={{ background: board.background.value }}
            >
              <span className="workspace-board-card-title">{board.title}</span>
              <button
                className={`workspace-board-star ${board.isStarred ? 'workspace-board-star--active' : ''}`}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); starBoard(board.id); }}
              >
                <Star size={14} fill={board.isStarred ? 'currentColor' : 'none'} />
              </button>
            </Link>
          ))}
          <button className="workspace-new-board" onClick={() => setShowCreate(true)}>
            <Plus size={16} style={{ marginRight: 4 }} />
            Create new board
          </button>
        </div>
      </div>

      {showCreate && <CreateBoard onClose={() => setShowCreate(false)} />}
    </div>
  );
};

export default WorkspaceView;
