import { v4 as uuidv4 } from 'uuid';
import { Board, List, Card, Workspace, Member } from '../types';
import { LABEL_COLORS } from './colors';

const defaultMember: Member = {
  id: 'member-1',
  name: 'You',
  avatar: '',
  color: '#0079BF',
};

export const aiMember: Member = {
  id: 'member-ai',
  name: 'AI Assistant',
  avatar: '',
  color: '#8B5CF6',
};

export function createDemoData(): {
  workspace: Workspace;
  boards: Record<string, Board>;
  lists: Record<string, List>;
  cards: Record<string, Card>;
} {
  const workspaceId = uuidv4();

  // Board IDs
  const board1Id = uuidv4();

  // List IDs
  const list1Id = uuidv4();
  const list2Id = uuidv4();
  const list3Id = uuidv4();
  const list4Id = uuidv4();

  // Card IDs
  const card1Id = uuidv4();
  const card2Id = uuidv4();
  const card3Id = uuidv4();
  const card4Id = uuidv4();
  const card5Id = uuidv4();
  const card6Id = uuidv4();
  const card7Id = uuidv4();
  const card8Id = uuidv4();

  // Labels
  const labels = [
    { id: uuidv4(), name: 'Priority', color: LABEL_COLORS[3].color },
    { id: uuidv4(), name: 'Feature', color: LABEL_COLORS[0].color },
    { id: uuidv4(), name: 'Bug', color: LABEL_COLORS[1].color },
    { id: uuidv4(), name: 'Design', color: LABEL_COLORS[4].color },
    { id: uuidv4(), name: 'Backend', color: LABEL_COLORS[5].color },
    { id: uuidv4(), name: 'Frontend', color: LABEL_COLORS[6].color },
  ];

  const now = new Date().toISOString();
  const tomorrow = new Date(Date.now() + 86400000).toISOString();
  const yesterday = new Date(Date.now() - 86400000).toISOString();
  const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString();

  const workspace: Workspace = {
    id: workspaceId,
    name: 'My Workspace',
    description: 'Default workspace for managing projects',
    boardIds: [board1Id],
    createdAt: now,
  };

  const boards: Record<string, Board> = {
    [board1Id]: {
      id: board1Id,
      workspaceId,
      title: 'Project Management',
      background: { type: 'gradient', value: 'linear-gradient(135deg, #0079BF, #5BA4CF)' },
      listIds: [list1Id, list2Id, list3Id, list4Id],
      labels,
      members: [defaultMember, aiMember],
      isStarred: true,
      createdAt: now,
      updatedAt: now,
    },
  };

  const lists: Record<string, List> = {
    [list1Id]: { id: list1Id, boardId: board1Id, title: 'To Do', cardIds: [card1Id, card2Id, card3Id], isArchived: false },
    [list2Id]: { id: list2Id, boardId: board1Id, title: 'In Progress', cardIds: [card4Id, card5Id], isArchived: false },
    [list3Id]: { id: list3Id, boardId: board1Id, title: 'Review', cardIds: [card6Id], isArchived: false },
    [list4Id]: { id: list4Id, boardId: board1Id, title: 'Done', cardIds: [card7Id, card8Id], isArchived: false },
  };

  const cards: Record<string, Card> = {
    [card1Id]: {
      id: card1Id, listId: list1Id, boardId: board1Id,
      title: 'Research competitor features',
      description: 'Analyze competitor products and document their key features for reference.',
      labelIds: [labels[1].id, labels[3].id],
      memberIds: ['member-1'],
      checklists: [{
        id: uuidv4(), title: 'Competitors', items: [
          { id: uuidv4(), text: 'Analyze Asana', isChecked: true },
          { id: uuidv4(), text: 'Analyze Monday.com', isChecked: true },
          { id: uuidv4(), text: 'Analyze Jira', isChecked: false },
          { id: uuidv4(), text: 'Create comparison doc', isChecked: false },
        ],
      }],
      dueDate: nextWeek, isDueDateComplete: false,
      attachments: [], comments: [
        { id: uuidv4(), memberId: 'member-1', text: 'Started looking into this! Great progress so far.', createdAt: now },
      ],
      coverColor: '#0079BF', isArchived: false, position: 0, createdAt: now, updatedAt: now,
    },
    [card2Id]: {
      id: card2Id, listId: list1Id, boardId: board1Id,
      title: 'Design wireframes for dashboard',
      description: 'Create initial wireframe mockups for the main dashboard view.',
      labelIds: [labels[3].id],
      memberIds: [], checklists: [], dueDate: tomorrow, isDueDateComplete: false,
      attachments: [], comments: [],
      coverColor: '#C377E0', isArchived: false, position: 1, createdAt: now, updatedAt: now,
    },
    [card3Id]: {
      id: card3Id, listId: list1Id, boardId: board1Id,
      title: 'Set up project repository',
      description: 'Initialize Git repository with proper folder structure and CI/CD pipeline.',
      labelIds: [labels[4].id],
      memberIds: ['member-1'], checklists: [{
        id: uuidv4(), title: 'Setup Tasks', items: [
          { id: uuidv4(), text: 'Create GitHub repo', isChecked: true },
          { id: uuidv4(), text: 'Add .gitignore', isChecked: true },
          { id: uuidv4(), text: 'Configure CI/CD', isChecked: true },
        ],
      }],
      dueDate: undefined, isDueDateComplete: false,
      attachments: [], comments: [],
      isArchived: false, position: 2, createdAt: now, updatedAt: now,
    },
    [card4Id]: {
      id: card4Id, listId: list2Id, boardId: board1Id,
      title: 'Build authentication flow',
      description: 'Implement user login, registration, and password reset functionality.',
      labelIds: [labels[0].id, labels[4].id, labels[5].id],
      memberIds: ['member-1'], checklists: [{
        id: uuidv4(), title: 'Auth Features', items: [
          { id: uuidv4(), text: 'Login page', isChecked: true },
          { id: uuidv4(), text: 'Registration page', isChecked: true },
          { id: uuidv4(), text: 'Password reset', isChecked: false },
          { id: uuidv4(), text: 'Social login', isChecked: false },
        ],
      }],
      dueDate: yesterday, isDueDateComplete: false,
      attachments: [], comments: [
        { id: uuidv4(), memberId: 'member-1', text: 'Login and registration pages are complete. Working on password reset next.', createdAt: now },
      ],
      coverColor: '#EB5A46', isArchived: false, position: 0, createdAt: now, updatedAt: now,
    },
    [card5Id]: {
      id: card5Id, listId: list2Id, boardId: board1Id,
      title: 'Create database schema',
      description: 'Design and implement the database schema for all entities.',
      labelIds: [labels[4].id],
      memberIds: [], checklists: [], dueDate: nextWeek, isDueDateComplete: false,
      attachments: [], comments: [],
      isArchived: false, position: 1, createdAt: now, updatedAt: now,
    },
    [card6Id]: {
      id: card6Id, listId: list3Id, boardId: board1Id,
      title: 'Code review: API endpoints',
      description: 'Review pull request #42 — REST API endpoint implementations.',
      labelIds: [labels[0].id, labels[4].id],
      memberIds: ['member-1'], checklists: [{
        id: uuidv4(), title: 'Review Checklist', items: [
          { id: uuidv4(), text: 'Check error handling', isChecked: false },
          { id: uuidv4(), text: 'Verify auth middleware', isChecked: false },
          { id: uuidv4(), text: 'Test response formats', isChecked: false },
        ],
      }],
      dueDate: tomorrow, isDueDateComplete: false,
      attachments: [], comments: [],
      isArchived: false, position: 0, createdAt: now, updatedAt: now,
    },
    [card7Id]: {
      id: card7Id, listId: list4Id, boardId: board1Id,
      title: 'Project kickoff meeting',
      description: 'Initial planning meeting with all stakeholders.',
      labelIds: [labels[1].id],
      memberIds: ['member-1'], checklists: [], dueDate: yesterday, isDueDateComplete: true,
      attachments: [], comments: [
        { id: uuidv4(), memberId: 'member-1', text: 'Meeting went great! Everyone is aligned on the project goals.', createdAt: yesterday },
      ],
      coverColor: '#61BD4F', isArchived: false, position: 0, createdAt: yesterday, updatedAt: now,
    },
    [card8Id]: {
      id: card8Id, listId: list4Id, boardId: board1Id,
      title: 'Define tech stack',
      description: 'Finalize the technology stack for the project.',
      labelIds: [labels[1].id, labels[4].id, labels[5].id],
      memberIds: ['member-1'], checklists: [{
        id: uuidv4(), title: 'Stack Decision', items: [
          { id: uuidv4(), text: 'Frontend framework', isChecked: true },
          { id: uuidv4(), text: 'Backend framework', isChecked: true },
          { id: uuidv4(), text: 'Database choice', isChecked: true },
          { id: uuidv4(), text: 'Hosting platform', isChecked: true },
        ],
      }],
      dueDate: yesterday, isDueDateComplete: true,
      attachments: [], comments: [],
      isArchived: false, position: 1, createdAt: yesterday, updatedAt: now,
    },
  };

  return { workspace, boards, lists, cards };
}
