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
  isLastRow: boolean;
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

const getBorderStyles = (
  isSelectedByRow: boolean,
  isSelectedByColumn: boolean,
  isLastRow: boolean,
  isLastColumn: boolean
) => {
  if (!isSelectedByRow && isSelectedByColumn && isLastRow) {
    return styles.bottomCornersRounded;
  } else if (isSelectedByRow && !isSelectedByColumn && isLastColumn) {
    return styles.rightCornersRounded;
  } else if (
    isSelectedByRow &&
    isSelectedByColumn &&
    isLastRow &&
    isLastColumn
  ) {
    return styles.bottomRightCornerRounded;
  } else {
    return "";
  }
};

export default function HabitTrackerDateRow(props: HabitTrackerDateRowProps) {
  const selectedDateData = props.habitDates.find(
    (habitDate) => habitDate.dateString === props.dateIso
  );

  return (
    <tr>
      <td
        className={classnames(
          styles.dateCell,
          props.isRowSelected && styles.selected
        )}
      >
        {props.dateString}
      </td>
      {props.habitDefinitions.map((definition, i) => (
        <td key={definition.habitId}>
          <div
            className={classnames(
              styles.trackerCellContainer,
              (props.isRowSelected ||
                definition.habitId === props.selectedHabitId) &&
                styles.selected,
              getBorderStyles(
                props.isRowSelected,
                definition.habitId === props.selectedHabitId,
                props.isLastRow,
                i === props.habitDefinitions.length - 1
              )
            )}
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
          </div>
        </td>
      ))}
    </tr>
  );
}
