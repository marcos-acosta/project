import { Timestamp } from "firebase/firestore";

export type EpochSeconds = number;
export type MaybeId = string | null;
export type AddTaskFn = (t: TaskData) => Promise<MaybeId>;

export interface TaskData {
  taskText: string;
  taskId: string;
  isCompleted: boolean;
  creationTime: EpochSeconds;
  sortingTime: EpochSeconds;
  completionTime: EpochSeconds | null;
  notes: string;
}

export interface DatabaseTaskData {
  taskText: string;
  isCompleted: boolean;
  creationTime: Timestamp;
  sortingTime: Timestamp;
  completionTime: Timestamp | null;
  notes: string;
}

export const enum View {
  HEAP_HOME,
  HEAP_ARCHIVE,
}
