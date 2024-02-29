import React from "react";
import Task from "./Task";
import { TaskData } from "@/interfaces/Task";
import styles from "./TaskList.module.css";

interface TaskListProps {
  tasks: TaskData[];
  selectedTaskId: string;
  inEditMode: boolean;
  currentText: string;
  setCurrentText: (newCurrentText: string) => void;
  finishEditing: () => void;
  cancel: () => void;
}

export default function TaskList(props: TaskListProps) {
  return (
    <div>
      {props.tasks.map((task, index) => (
        <Task
          taskData={task}
          key={task.taskId}
          isSelected={props.selectedTaskId === task.taskId}
          isLastCompletedTask={
            task.isCompleted &&
            index < props.tasks.length - 1 &&
            !props.tasks[index + 1].isCompleted
          }
          inEditMode={props.inEditMode}
          currentText={props.currentText}
          setCurrentText={props.setCurrentText}
          finishEditing={props.finishEditing}
          cancel={props.cancel}
        />
      ))}
      {props.tasks.length === 0 && (
        <div className={styles.noTasks}>no tasks to show</div>
      )}
    </div>
  );
}
