type CountdownDefaults = {
  type: 'countdown';
  name: string;
  durationMinutes: number;
};

type ElapsedDefaults = {
  type: 'elapsed';
  name: string;
};

type CountdownElapsedDefaults = {
  type: 'countdown-elapsed';
  name: string;
  durationMinutes: number;
};

type StaminaDefaults = {
  type: 'stamina';
  name: string;
  currentValue: number;
  maxValue: number;
  recoveryIntervalMinutes: number;
};

type PeriodicIncrementDefaults = {
  type: 'periodic-increment';
  name: string;
  currentValue: number;
  maxValue: number;
  incrementAmount: number;
  scheduleTimes: string[];
};

type TemplateDefaults =
  | CountdownDefaults
  | ElapsedDefaults
  | CountdownElapsedDefaults
  | StaminaDefaults
  | PeriodicIncrementDefaults;

export interface TimerTemplate {
  label: string;
  description: string;
  defaults: TemplateDefaults;
}

export const TIMER_TEMPLATES: TimerTemplate[] = [
  {
    label: 'ポモドーロ 25分',
    description: '25分集中して5分休憩するポモドーロテクニック用カウントダウン',
    defaults: {
      type: 'countdown',
      name: 'ポモドーロ 25分',
      durationMinutes: 25,
    },
  },
  {
    label: '60分カウントダウン',
    description: '1時間の作業セッション用カウントダウン',
    defaults: {
      type: 'countdown',
      name: '60分カウントダウン',
      durationMinutes: 60,
    },
  },
  {
    label: '作業経過時間',
    description: '作業開始からの経過時間を計測するストップウォッチ',
    defaults: {
      type: 'elapsed',
      name: '作業経過時間',
    },
  },
  {
    label: '締め切りカウントダウン',
    description: '締め切りまでのカウントダウン。超過後は経過時間を表示',
    defaults: {
      type: 'countdown-elapsed',
      name: '締め切りカウントダウン',
      durationMinutes: 120,
    },
  },
  {
    label: 'スタミナ回復',
    description: 'ゲームのスタミナ回復タイマー。5分ごとに1回復',
    defaults: {
      type: 'stamina',
      name: 'スタミナ回復',
      currentValue: 0,
      maxValue: 200,
      recoveryIntervalMinutes: 5,
    },
  },
  {
    label: '日次タスクポイント',
    description: '毎日決まった時刻にポイントが加算される定期増加タイマー',
    defaults: {
      type: 'periodic-increment',
      name: '日次タスクポイント',
      currentValue: 0,
      maxValue: 100,
      incrementAmount: 10,
      scheduleTimes: ['09:00', '18:00'],
    },
  },
];
