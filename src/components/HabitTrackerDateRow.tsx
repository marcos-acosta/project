import { classnames } from "@/util";
import React from "react";
import styles from "./HabitTrackerDateRow.module.css";
import { HabitDefinition, HabitTrackerDate } from "@/interfaces/Interfaces";

export interface HabitTrackerDateRowProps {
  dateString: string;
  dateIso: string;
  isRowSelected: boolean;
  habitDefinitions: HabitDefinition[];
  habitDates: HabitTrackerDate[];
}

export default function HabitTrackerDateRow(props: HabitTrackerDateRowProps) {
  const selectedDateData = props.habitDates.find(
    (habitDate) => habitDate.dateString === props.dateIso
  );

  return (
    <tr className={classnames(props.isRowSelected && styles.selectedDate)}>
      <td className={styles.trackerCell}>{props.dateString}</td>
      {props.habitDefinitions.map((definition) => (
        <td className={styles.trackerCell} key={definition.habitId}>
          {selectedDateData?.habitLog[definition.habitId]}
        </td>
      ))}
    </tr>
  );
}
