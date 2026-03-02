'use client';

import { useState } from 'react';
import type { CreateTimerInput, Timer } from '@/domain/timer/types';
import { createTimerSchema } from '@/domain/timer/validation';
import { TIMER_TEMPLATES } from '@/lib/timer-templates';
import { TIMER_TYPE_LABELS } from '@/lib/timer-type-labels';
import { buildInitialState, buildDefaultForType, buildFromTemplate } from '@/lib/timer-form-helpers';
import { TypeSpecificFields } from '@/components/timer-form-fields/type-specific-fields';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const TIMER_TYPE_VALUES = Object.keys(TIMER_TYPE_LABELS) as CreateTimerInput['type'][];

interface TimerFormProps {
  existingTimer?: Timer;
  onSubmit: (input: CreateTimerInput) => void;
  onCancel: () => void;
}

export function TimerForm({ existingTimer, onSubmit, onCancel }: TimerFormProps) {
  const [formData, setFormData] = useState<CreateTimerInput>(() =>
    existingTimer
      ? buildInitialState(existingTimer)
      : { name: '', type: 'countdown', targetDate: '' },
  );
  const [errors, setErrors] = useState<string[]>([]);

  const handleTypeChange = (newType: CreateTimerInput['type']) => {
    setFormData(buildDefaultForType(newType, new Date()));
    setErrors([]);
  };

  const handleTemplateSelect = (templateIndex: number) => {
    const template = TIMER_TEMPLATES[templateIndex];
    setFormData(buildFromTemplate(template, new Date()));
    setErrors([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = createTimerSchema.safeParse(formData);
    if (!result.success) {
      setErrors(result.error.issues.map((issue) => issue.message));
      return;
    }
    onSubmit(formData);
  };

  const isEditMode = existingTimer !== undefined;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {!isEditMode && (
        <div>
          <Label className="mb-2 block">テンプレートから選択</Label>
          <div className="flex flex-wrap gap-2">
            {TIMER_TEMPLATES.map((template, index) => (
              <Button
                key={template.label}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleTemplateSelect(index)}
              >
                {template.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {!isEditMode && (
        <div>
          <Label className="mb-2 block">種別</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => handleTypeChange(value as CreateTimerInput['type'])}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIMER_TYPE_VALUES.map((type) => (
                <SelectItem key={type} value={type}>
                  {TIMER_TYPE_LABELS[type]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div>
        <Label className="mb-2 block">名前</Label>
        <Input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value } as CreateTimerInput)}
          required
        />
      </div>

      <TypeSpecificFields formData={formData} onChange={setFormData} />

      {errors.length > 0 && (
        <div className="rounded bg-red-50 p-3">
          {errors.map((error, i) => (
            <p key={i} className="text-sm text-red-600">{error}</p>
          ))}
        </div>
      )}

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          キャンセル
        </Button>
        <Button type="submit">
          {isEditMode ? '更新' : '作成'}
        </Button>
      </div>
    </form>
  );
}
