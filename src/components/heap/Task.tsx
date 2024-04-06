import React from "react";
import styles from "./Task.module.css";
import { classnames } from "@/util";
import { TaskData } from "@/interfaces/Interfaces";

export interface TaskProps {
  taskData: TaskData;
  isSelected: boolean;
  isLastCompletedTask: boolean;
  inEditMode: boolean;
  currentText: string;
  setCurrentText: (newCurrentText: string) => void;
  finishEditing: () => void;
  cancel: () => void;
}

const PLACEHOLDER_TEXT = "task name";

export default function Task(props: TaskProps) {
  const isThisTaskBeingEdited = props.isSelected && props.inEditMode;

  return (
    <div
      className={classnames(
        styles.taskContainer,
        props.isLastCompletedTask && styles.extraBottomMargin
      )}
    >
      <div
        className={classnames(
          styles.task,
          props.isSelected && styles.selected,
          isThisTaskBeingEdited && styles.beingEdited
        )}
      >
        {isThisTaskBeingEdited ? (
          <input
            value={props.currentText}
            onChange={(e) => props.setCurrentText(e.target.value)}
            size={
              props.currentText.length
                ? Math.max(props.currentText.length, 1)
                : PLACEHOLDER_TEXT.length
            }
            onBlur={props.cancel}
            placeholder={PLACEHOLDER_TEXT}
            autoFocus
          />
        ) : (
          <span
            className={classnames(
              props.taskData.isCompleted && styles.completed,
              props.taskData.isBlocked && styles.blocked
            )}
          >
            {props.taskData.isBlocked && "("}
            {props.taskData.taskText}
            {props.taskData.isBlocked && ")"}
          </span>
        )}
      </div>
    </div>
  );
}
