import React from 'react';
import { UrgencyLevel, ReportStatus, SafetyClearance } from '../../types';
import { AlertTriangle, ShieldAlert, CheckCircle2, Clock, Activity, ShieldCheck, Heart } from 'lucide-react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'forest' | 'gold';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  icon,
  className = '',
}) => {
  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
  };

  const variantStyles = {
    default: 'bg-sage-100 text-slate-700 dark:bg-night-700 dark:text-slate-300 border border-sage-200 dark:border-night-600',
    forest: 'bg-forest-100 text-forest-900 dark:bg-forest-950/70 dark:text-forest-200 border border-forest-300 dark:border-forest-800',
    success: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800',
    warning: 'bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800',
    danger: 'bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800 font-semibold',
    info: 'bg-sky-50 text-sky-800 dark:bg-sky-950/50 dark:text-sky-300 border border-sky-200 dark:border-sky-800',
    gold: 'bg-gold-50 text-gold-700 dark:bg-gold-700/20 dark:text-gold-300 border border-gold-200 dark:border-gold-600/40',
  };

  return (
    <span className={`inline-flex items-center rounded-full ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}>
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};

export const UrgencyBadge: React.FC<{ urgency: UrgencyLevel; size?: 'sm' | 'md' }> = ({ urgency, size = 'md' }) => {
  switch (urgency) {
    case 'critical':
      return (
        <Badge variant="danger" size={size} icon={<AlertTriangle className="w-3.5 h-3.5 text-rose-600 animate-pulse" />}>
          Critical Urgency
        </Badge>
      );
    case 'high':
      return (
        <Badge variant="warning" size={size} icon={<AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}>
          High Priority
        </Badge>
      );
    case 'medium':
      return (
        <Badge variant="gold" size={size} icon={<Clock className="w-3.5 h-3.5 text-gold-600" />}>
          Standard Priority
        </Badge>
      );
    case 'low':
      return (
        <Badge variant="forest" size={size} icon={<Heart className="w-3.5 h-3.5 text-forest-600" />}>
          Routine Care
        </Badge>
      );
  }
};

export const StatusBadge: React.FC<{ status: ReportStatus; size?: 'sm' | 'md' }> = ({ status, size = 'md' }) => {
  switch (status) {
    case 'submitted':
      return (
        <Badge variant="info" size={size} icon={<Clock className="w-3.5 h-3.5" />}>
          Submitted
        </Badge>
      );
    case 'under_review':
      return (
        <Badge variant="gold" size={size} icon={<Activity className="w-3.5 h-3.5" />}>
          Under Review
        </Badge>
      );
    case 'task_created':
      return (
        <Badge variant="forest" size={size} icon={<Activity className="w-3.5 h-3.5" />}>
          Task Created
        </Badge>
      );
    case 'worker_assigned':
    case 'in_progress':
      return (
        <Badge variant="warning" size={size} icon={<Activity className="w-3.5 h-3.5" />}>
          In Progress
        </Badge>
      );
    case 'resolved':
      return (
        <Badge variant="success" size={size} icon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}>
          Resolved
        </Badge>
      );
    case 'escalated':
      return (
        <Badge variant="danger" size={size} icon={<ShieldAlert className="w-3.5 h-3.5 text-rose-600 animate-pulse" />}>
          Escalated to Govt/Vet
        </Badge>
      );
  }
};

export const SafetyClearanceBadge: React.FC<{ clearance: SafetyClearance; size?: 'sm' | 'md' }> = ({ clearance, size = 'md' }) => {
  switch (clearance) {
    case 'community_safe':
      return (
        <Badge variant="success" size={size} icon={<ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />}>
          Community Safe
        </Badge>
      );
    case 'trained_only':
      return (
        <Badge variant="warning" size={size} icon={<ShieldAlert className="w-3.5 h-3.5 text-amber-600" />}>
          Certified Handler Only
        </Badge>
      );
    case 'vet_escort_required':
      return (
        <Badge variant="info" size={size} icon={<Activity className="w-3.5 h-3.5 text-sky-600" />}>
          Vet Escort Required
        </Badge>
      );
    case 'emergency_escalation':
      return (
        <Badge variant="danger" size={size} icon={<ShieldAlert className="w-3.5 h-3.5 text-rose-600" />}>
          Critical Escalation: Do Not Approach
        </Badge>
      );
  }
};
