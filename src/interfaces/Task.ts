export type EpochMillis = number;

export interface TaskData {
  taskText: string;
  taskId: string;
  isCompleted: boolean;
  creationTime: EpochMillis;
  sortingTime: EpochMillis;
  completionTime: EpochMillis | null;
  notes: string;
}
