import React from "react";
import styles from "./Task.module.css";
import { classnames } from "@/util";

export interface TaskProps {
  taskText: string;
  isSelected: boolean;
}

export default function Task(props: TaskProps) {
  return (
    <div className={styles.taskContainer}>
      <div
        className={classnames(styles.task, props.isSelected && styles.selected)}
      >
        <span>{props.taskText}</span>
      </div>
    </div>
  );
}
