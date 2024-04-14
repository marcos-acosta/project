import { HabitDefinition } from "@/interfaces/Interfaces";
import React, { useState } from "react";
import styles from "./HabitDescriptionBox.module.css";
import { classnames, moveCaratToEnd } from "@/util";
import ReactTextareaAutosize from "react-textarea-autosize";

interface HabitDescriptionBoxProps {
  habitDefinition: HabitDefinition;
  isInEditMode: boolean;
  tempDescriptionText: string;
  setTempDescriptionText: (t: string) => void;
  cancel: () => void;
}

export default function HabitDescriptionBox(props: HabitDescriptionBoxProps) {
  return (
    <div className={styles.habitDefinitionBoxContainer}>
      {props.isInEditMode ? (
        <ReactTextareaAutosize
          className={styles.descriptionTextArea}
          value={props.tempDescriptionText}
          onChange={(e) => props.setTempDescriptionText(e.target.value)}
          onFocus={moveCaratToEnd}
          onBlur={props.cancel}
          autoFocus
        />
      ) : (
        <div className={styles.habitDescription}>
          {props.habitDefinition.habitDescription.length > 0 ? (
            props.habitDefinition.habitDescription
          ) : (
            <span className={styles.noHabitDescription}>
              (no habit description)
            </span>
          )}
        </div>
      )}
      <div className={styles.habitSchedule}>
        {props.habitDefinition.habitSchedule}
      </div>
    </div>
  );
}
