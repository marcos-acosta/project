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
  selectedHabitId: string | null;
}

const TRACKER_VALUE_TO_CLASSNAME: { [key: string]: string } = {
  Y: styles.completed,
  K: styles.kindaCompleted,
  N: styles.notCompleted,
  "N/A": styles.notApplicable,
};

const getClassnameFromTrackerValue = (v: string | undefined) =>
  v && Object.hasOwn(TRACKER_VALUE_TO_CLASSNAME, v)
    ? TRACKER_VALUE_TO_CLASSNAME[v]
    : styles.tbd;

export default function HabitTrackerDateRow(props: HabitTrackerDateRowProps) {
  const selectedDateData = props.habitDates.find(
    (habitDate) => habitDate.dateString === props.dateIso
  );

  return (
    <tr className={classnames(props.isRowSelected && styles.selected)}>
      <td className={styles.dateCell}>{props.dateString}</td>
      {props.habitDefinitions.map((definition) => (
        <td
          className={classnames(
            styles.trackerCellContainer,
            definition.habitId === props.selectedHabitId && styles.selected
          )}
          key={definition.habitId}
        >
          <div
            className={classnames(
              styles.trackerCell,
              getClassnameFromTrackerValue(
                selectedDateData &&
                  selectedDateData.habitLog[definition.habitId]
              )
            )}
          ></div>
        </td>
      ))}
    </tr>
  );
}
