import React from 'react';
import { Bot } from 'lucide-react';
import { getInitials } from '../../utils/helpers';
import './avatar.css';

interface AvatarProps {
  name: string;
  color: string;
  size?: 'sm' | 'md' | 'lg';
  isAI?: boolean;
  onClick?: () => void;
}

const iconSize = { sm: 14, md: 18, lg: 22 };

const Avatar: React.FC<AvatarProps> = ({ name, color, size = 'md', isAI, onClick }) => {
  return (
    <div
      className={`avatar avatar--${size} ${isAI ? 'avatar--ai' : ''}`}
      style={{ backgroundColor: color }}
      onClick={onClick}
      title={name}
    >
      {isAI ? <Bot size={iconSize[size]} /> : getInitials(name)}
    </div>
  );
};

export default Avatar;
