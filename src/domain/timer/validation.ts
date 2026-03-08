import { z } from 'zod';

const SCHEDULE_TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

const isCurrentWithinMax = (data: {
  currentValue: number;
  maxValue: number;
}): boolean => data.currentValue <= data.maxValue;

const CURRENT_EXCEEDS_MAX_MSG = 'currentValue cannot exceed maxValue';

const priorityField = z.number().int().min(1).max(4).optional();

const countdownTimerBase = z.object({
  name: z.string().min(1),
  type: z.literal('countdown'),
  targetDate: z.string().datetime(),
  priority: priorityField,
});

const elapsedTimerBase = z.object({
  name: z.string().min(1),
  type: z.literal('elapsed'),
  startDate: z.string().datetime(),
  priority: priorityField,
});

const countdownElapsedTimerBase = z.object({
  name: z.string().min(1),
  type: z.literal('countdown-elapsed'),
  targetDate: z.string().datetime(),
  priority: priorityField,
});

const staminaTimerBase = z.object({
  name: z.string().min(1),
  type: z.literal('stamina'),
  currentValue: z.number().int().min(0),
  maxValue: z.number().int().min(1),
  recoveryIntervalMinutes: z.number().positive(),
  lastUpdatedAt: z.string().datetime(),
  priority: priorityField,
});

const periodicIncrementTimerBase = z.object({
  name: z.string().min(1),
  type: z.literal('periodic-increment'),
  currentValue: z.number().int().min(0),
  maxValue: z.number().int().min(1),
  incrementAmount: z.number().int().min(1),
  scheduleTimes: z.array(z.string().regex(SCHEDULE_TIME_PATTERN)).min(1),
  lastUpdatedAt: z.string().datetime(),
  priority: priorityField,
});

export const countdownTimerSchema = countdownTimerBase;

export const elapsedTimerSchema = elapsedTimerBase;

export const countdownElapsedTimerSchema = countdownElapsedTimerBase;

export const staminaTimerSchema = staminaTimerBase.refine(
  isCurrentWithinMax,
  { message: CURRENT_EXCEEDS_MAX_MSG },
);

export const periodicIncrementTimerSchema = periodicIncrementTimerBase.refine(
  isCurrentWithinMax,
  { message: CURRENT_EXCEEDS_MAX_MSG },
);

export const createTimerSchema = z
  .discriminatedUnion('type', [
    countdownTimerBase,
    elapsedTimerBase,
    countdownElapsedTimerBase,
    staminaTimerBase,
    periodicIncrementTimerBase,
  ])
  .superRefine((data, ctx) => {
    if (data.type === 'stamina' || data.type === 'periodic-increment') {
      if (!isCurrentWithinMax(data)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: CURRENT_EXCEEDS_MAX_MSG,
          path: ['currentValue'],
        });
      }
    }
  });
