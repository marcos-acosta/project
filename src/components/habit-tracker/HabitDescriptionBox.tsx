import { HabitDefinition } from "@/interfaces/Interfaces";
import React from "react";
import styles from "./HabitDescriptionBox.module.css";

interface HabitDescriptionBoxProps {
  habitDefinition: HabitDefinition;
}

export default function HabitDescriptionBox(props: HabitDescriptionBoxProps) {
  return (
    <div className={styles.habitDefinitionBoxContainer}>
      <div>{props.habitDefinition.habitDescription}</div>
      <div className={styles.habitSchedule}>
        {props.habitDefinition.habitSchedule}
      </div>
    </div>
  );
}
