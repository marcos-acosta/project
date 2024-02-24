import React from "react";
import styles from "./Task.module.css";
import { classnames } from "@/util";
import { TaskData } from "@/interfaces/Task";

export interface TaskProps {
  taskData: TaskData;
  isSelected: boolean;
  isLastCompletedTask: boolean;
}

export default function Task(props: TaskProps) {
  return (
    <div
      className={classnames(
        styles.taskContainer,
        props.isLastCompletedTask && styles.extraBottomMargin
      )}
    >
      <div
        className={classnames(styles.task, props.isSelected && styles.selected)}
      >
        <span
          className={classnames(props.taskData.isCompleted && styles.completed)}
        >
          {props.taskData.taskText}
        </span>
      </div>
    </div>
  );
}
