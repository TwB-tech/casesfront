import React from 'react';
import { Button } from 'antd';
import { FileTextOutlined, TeamOutlined, FolderOutlined, CalendarOutlined, InboxOutlined, PlusOutlined } from '@ant-design/icons';
import { useTheme } from '../../contexts/ThemeContext';

const iconMap = {
  cases: FileTextOutlined,
  clients: TeamOutlined,
  documents: FolderOutlined,
  calendar: CalendarOutlined,
  tasks: InboxOutlined,
  invoices: FileTextOutlined,
  default: InboxOutlined,
};

const EmptyState = ({
  type = 'default',
  title,
  description,
  actionLabel,
  onAction,
  compact = false,
}) => {
  const { themeConfig, isFuturistic } = useTheme();
  const IconComponent = iconMap[type] || iconMap.default;

  if (compact) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className={`w-12 h-12 rounded-full ${isFuturistic ? 'bg-cyber-card' : 'bg-neutral-100'} flex items-center justify-center mb-4`}>
          <IconComponent className={`text-xl ${isFuturistic ? 'text-aurora-muted' : 'text-neutral-400'}`} />
        </div>
        <p className={`text-sm font-medium ${isFuturistic ? 'text-aurora-muted' : 'text-neutral-500'}`}>
          {title || 'No data yet'}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className={`relative mb-8`}>
        <div className={`w-24 h-24 rounded-2xl ${isFuturistic ? 'bg-cyber-card border border-cyber-border' : 'bg-neutral-100'} flex items-center justify-center ${isFuturistic ? 'shadow-glow-sm' : ''}`}>
          <IconComponent className={`text-4xl ${isFuturistic ? 'text-aurora-primary' : 'text-neutral-300'}`} />
        </div>
        {isFuturistic && (
          <div className="absolute inset-0 w-24 h-24 rounded-2xl animate-pulse-slow">
            <div className="w-full h-full rounded-2xl bg-aurora-primary/10" />
          </div>
        )}
      </div>
      
      <h3 className={`text-xl font-semibold mb-2 ${isFuturistic ? 'text-aurora-text' : 'text-neutral-700'}`}>
        {title || 'No records found'}
      </h3>
      
      <p className={`text-center max-w-md mb-8 ${isFuturistic ? 'text-aurora-muted' : 'text-neutral-500'}`}>
        {description || 'There are no records to display at this time. Get started by creating your first entry.'}
      </p>
      
      {actionLabel && onAction && (
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          onClick={onAction}
          className={isFuturistic ? 'futuristic-btn' : ''}
          style={{
            background: isFuturistic ? themeConfig.accent : undefined,
            borderColor: isFuturistic ? themeConfig.accent : undefined,
          }}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
