import { Timestamp } from "firebase/firestore";

export type EpochSeconds = number;
export type MaybeId = string | null;
export type AddTaskFn = (t: TaskData) => Promise<MaybeId>;

export interface TaskData {
  taskText: string;
  taskId: string;
  isCompleted: boolean;
  isBlocked: boolean;
  creationTime: EpochSeconds;
  sortingTime: EpochSeconds;
  completionTime: EpochSeconds | null;
  notes: string;
}

export interface DatabaseTaskData {
  taskText: string;
  isCompleted: boolean;
  isBlocked: boolean;
  creationTime: Timestamp;
  sortingTime: Timestamp;
  completionTime: Timestamp | null;
  notes: string;
}

export interface HabitTrackerDate {
  dateString: string;
  dateObject: Date;
  habitLog: { [habit_id: string]: string };
}

export interface HabitDefinition {
  habitId: string;
  habitName: string;
  habitDescription: string;
  habitSchedule: string;
  orderValue: number;
}

interface MonthPeriod {
  month: number;
  year: number;
}

export type MaybeMonthPeriod = MonthPeriod | null;

export const enum View {
  HEAP_HOME,
  HABIT_TRACKER,
}

export enum UpDownDirection {
  UP,
  DOWN,
}

export enum LeftRightDirection {
  LEFT,
  RIGHT,
}

export enum TrackerValue {
  YES = "Y",
  NO = "N",
  KINDA = "K",
  NOT_APPLICABLE = "N/A",
  UNKNOWN = "?",
}
