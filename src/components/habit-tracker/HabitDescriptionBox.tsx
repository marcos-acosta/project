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

const PLACEHOLDER_TEXT = "habit description";

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
          placeholder={PLACEHOLDER_TEXT}
          autoFocus
        />
      ) : (
        <div className={styles.habitDescription}>
          {props.habitDefinition.habitDescription}
        </div>
      )}
      <div className={styles.habitSchedule}>
        {props.habitDefinition.habitSchedule}
      </div>
    </div>
  );
}
