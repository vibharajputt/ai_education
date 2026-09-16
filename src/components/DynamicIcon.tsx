import React from 'react';
import * as Icons from 'lucide-react';

interface DynamicIconProps {
  name: string;
  className?: string;
}

export function DynamicIcon({ name, className = 'w-4 h-4' }: DynamicIconProps) {
  // Look up icon from lucide-react, falling back to BookOpen
  const IconComponent = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[name] || Icons.BookOpen;
  return <IconComponent className={className} />;
}
