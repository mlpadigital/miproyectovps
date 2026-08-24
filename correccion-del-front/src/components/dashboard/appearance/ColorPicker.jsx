
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const ColorPicker = ({ label, value, onChange, description }) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
        </Label>
        {value && (
          <span className="text-xs font-mono text-slate-500 uppercase">{value}</span>
        )}
      </div>
      
      <div className="flex gap-3">
        <div className="relative flex-1">
          <div 
            className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded border border-slate-200 shadow-sm"
            style={{ backgroundColor: value }}
          />
          <Input 
            value={value} 
            onChange={(e) => onChange(e.target.value)} 
            className="pl-12 font-mono uppercase"
            maxLength={7}
          />
        </div>
        
        <div className="relative w-10 h-10 shrink-0 overflow-hidden rounded-md border border-slate-200 shadow-sm cursor-pointer hover:scale-105 transition-transform">
           <Input 
             type="color" 
             value={value} 
             onChange={(e) => onChange(e.target.value)}
             className="absolute -top-2 -left-2 w-16 h-16 p-0 border-0 opacity-0 cursor-pointer z-10" 
           />
           <div 
             className="w-full h-full"
             style={{ backgroundColor: value }}
           />
        </div>
      </div>
      
      {description && (
        <p className="text-[0.8rem] text-slate-500">{description}</p>
      )}
    </div>
  );
};

export default ColorPicker;
