import React, { useState } from 'react';
import { Plus, X, Sparkles, Loader2 } from 'lucide-react';
import { useBoardStore } from '../../stores/boardStore';
import { generateCardFromDescription } from '../../services/ai';
import './card.css';

interface AddCardProps {
  listId: string;
  boardId: string;
}

const AddCard: React.FC<AddCardProps> = ({ listId, boardId }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const createCard = useBoardStore(s => s.createCard);
  const updateCard = useBoardStore(s => s.updateCard);
  const addChecklist = useBoardStore(s => s.addChecklist);
  const addChecklistItem = useBoardStore(s => s.addChecklistItem);
  const createLabel = useBoardStore(s => s.createLabel);
  const boards = useBoardStore(s => s.boards);

  const handleAdd = () => {
    if (!title.trim()) return;
    createCard(listId, boardId, title.trim());
    setTitle('');
  };

  const handleAiGenerate = async () => {
    if (!title.trim()) return;
    setIsAiLoading(true);
    setAiError('');

    try {
      const board = boards[boardId];
      const existingLabels = board?.labels.map(l => ({ name: l.name, color: l.color })) || [];
      const suggestion = await generateCardFromDescription(title.trim(), existingLabels);
      const card = createCard(listId, boardId, suggestion.title);

      // Resolve AI-suggested labels: reuse existing or create new ones
      const labelIds: string[] = [];
      if (suggestion.labels && suggestion.labels.length > 0) {
        const currentBoard = useBoardStore.getState().boards[boardId];
        for (const aiLabel of suggestion.labels) {
          const existing = currentBoard?.labels.find(
            l => l.name.toLowerCase() === aiLabel.name.toLowerCase()
          );
          if (existing) {
            labelIds.push(existing.id);
          } else {
            const newLabel = createLabel(boardId, aiLabel.name, aiLabel.color);
            labelIds.push(newLabel.id);
          }
        }
      }

      // Update with AI-generated description, labels, and assign AI member
      updateCard(card.id, {
        description: suggestion.description,
        labelIds,
        memberIds: ['member-ai'],
      });

      // Add checklist with AI-generated items
      if (suggestion.checklist.length > 0) {
        addChecklist(card.id, 'Tasks');
        const updatedCards = useBoardStore.getState().cards;
        const updatedCard = updatedCards[card.id];
        if (updatedCard && updatedCard.checklists.length > 0) {
          const checklistId = updatedCard.checklists[0].id;
          for (const item of suggestion.checklist) {
            addChecklistItem(card.id, checklistId, item);
          }
        }
      }

      setTitle('');
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'AI generation failed');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleCancel = () => {
    setTitle('');
    setAiError('');
    setIsAdding(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAdd();
    }
    if (e.key === 'Escape') handleCancel();
  };

  if (!isAdding) {
    return (
      <button className="add-card-btn" onClick={() => setIsAdding(true)}>
        <Plus size={16} />
        Add a card
      </button>
    );
  }

  return (
    <div className="add-card-form">
      <textarea
        className="add-card-textarea"
        placeholder="Enter a title or describe a task for AI..."
        value={title}
        onChange={e => { setTitle(e.target.value); setAiError(''); }}
        onKeyDown={handleKeyDown}
        autoFocus
        disabled={isAiLoading}
      />
      {aiError && <div className="ai-error">{aiError}</div>}
      <div className="add-card-actions">
        <button className="add-card-submit" onClick={handleAdd} disabled={isAiLoading}>
          Add card
        </button>
        <button
          className="add-card-ai-btn"
          onClick={handleAiGenerate}
          disabled={isAiLoading || !title.trim()}
          title="Use AI to generate a detailed card from your description"
        >
          {isAiLoading ? <Loader2 size={16} className="ai-spinner" /> : <Sparkles size={16} />}
          {isAiLoading ? 'Generating...' : 'AI Generate'}
        </button>
        <button className="add-card-cancel" onClick={handleCancel}>
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default AddCard;
