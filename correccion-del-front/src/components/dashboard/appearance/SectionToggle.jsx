
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const SectionToggle = ({ id, label, checked, onCheckedChange, description }) => {
  return (
    <div className="flex items-center justify-between space-x-4 p-3 rounded-lg border border-slate-100 bg-white hover:bg-slate-50 transition-colors">
      <div className="flex-1 space-y-1">
        <Label htmlFor={id} className="text-sm font-medium leading-none cursor-pointer">
          {label}
        </Label>
        {description && (
          <p className="text-xs text-slate-500">
            {description}
          </p>
        )}
      </div>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
      />
    </div>
  );
};

export default SectionToggle;
