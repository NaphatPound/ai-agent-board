import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Star, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useBoardStore } from '../../stores/boardStore';
import { useUIStore } from '../../stores/uiStore';
import './sidebar.css';

interface SidebarProps {
  onCreateBoard: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onCreateBoard }) => {
  const { isSidebarOpen, toggleSidebar } = useUIStore();
  const boards = useBoardStore(s => s.boards);
  const workspace = useBoardStore(s => s.workspace);
  const starBoard = useBoardStore(s => s.starBoard);
  const boardsList = workspace.boardIds.map(id => boards[id]).filter(Boolean);
  const starredBoards = boardsList.filter(b => b.isStarred);

  return (
    <>
      <aside className={`sidebar ${isSidebarOpen ? 'sidebar--open' : 'sidebar--closed'}`}>
        <div className="sidebar-header">
          <div className="sidebar-workspace">
            <div className="sidebar-workspace-icon">
              {workspace.name.charAt(0).toUpperCase()}
            </div>
            <div className="sidebar-workspace-info">
              <span className="sidebar-workspace-name truncate">{workspace.name}</span>
              <span className="sidebar-workspace-type">Free</span>
            </div>
          </div>
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            <ChevronLeft size={18} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/" end className="sidebar-link">
            <LayoutDashboard size={16} />
            <span>Boards</span>
          </NavLink>

          {starredBoards.length > 0 && (
            <div className="sidebar-section">
              <div className="sidebar-section-header">
                <Star size={14} />
                <span>Starred</span>
              </div>
              {starredBoards.map(board => (
                <NavLink key={board.id} to={`/board/${board.id}`} className="sidebar-board-link">
                  <div
                    className="sidebar-board-thumb"
                    style={{ background: board.background.value }}
                  />
                  <span className="truncate">{board.title}</span>
                </NavLink>
              ))}
            </div>
          )}

          <div className="sidebar-section">
            <div className="sidebar-section-header">
              <span>Your boards</span>
              <button className="sidebar-add-btn" onClick={onCreateBoard} title="Create board">
                <Plus size={14} />
              </button>
            </div>
            {boardsList.map(board => (
              <NavLink key={board.id} to={`/board/${board.id}`} className="sidebar-board-link">
                <div
                  className="sidebar-board-thumb"
                  style={{ background: board.background.value }}
                />
                <span className="truncate">{board.title}</span>
                <button
                  className={`sidebar-star ${board.isStarred ? 'sidebar-star--active' : ''}`}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); starBoard(board.id); }}
                >
                  <Star size={14} fill={board.isStarred ? 'currentColor' : 'none'} />
                </button>
              </NavLink>
            ))}
          </div>
        </nav>
      </aside>

      {!isSidebarOpen && (
        <button className="sidebar-expand" onClick={toggleSidebar}>
          <ChevronRight size={18} />
        </button>
      )}
    </>
  );
};

export default Sidebar;
