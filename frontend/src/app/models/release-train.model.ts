export type ReleaseTrainStatus = 'WAITING' | 'IN_PROGRESS' | 'PAUSED' | 'CANCELLED' | 'STEPPED_BACK' | 'FINISHED';

export interface ReleaseTrain {
  id: string;
  name: string;
  status: ReleaseTrainStatus;
  startAt: string;
  endAt: string | null;
  isPaused: boolean;
  isSteppedBack: boolean;
}
