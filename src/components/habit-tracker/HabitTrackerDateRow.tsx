import {
  classnames,
  habitScheduleIncludesDateIso,
  trackerValueIsNoKindaYes,
} from "@/util";
import React from "react";
import styles from "./HabitTrackerDateRow.module.css";
import {
  HabitDefinition,
  HabitTrackerDate,
  TrackerValue,
} from "@/interfaces/Interfaces";
import HabitDescriptionBox from "./HabitDescriptionBox";

export interface HabitTrackerDateRowProps {
  dateString: string;
  dateIso: string;
  isRowSelected: boolean;
  habitDefinitions: HabitDefinition[];
  habitDates: HabitTrackerDate[];
  selectedHabitId: string | null;
  isLastRow: boolean;
  isEditingDescription: boolean;
  tempDescriptionText: string;
  setTempDescriptionText: (t: string) => void;
  cancel: () => void;
}

const TRACKER_VALUE_TO_CLASSNAME: { [key: string]: string } = {
  Y: styles.completed,
  K: styles.kindaCompleted,
  N: styles.notCompleted,
  "N/A": styles.notApplicable,
};

const getColorFromTrackerValue = (
  trackerDate: HabitTrackerDate | undefined,
  habitDefinition: HabitDefinition,
  dateIso: string
) => {
  const hasValue =
    trackerDate &&
    Object.hasOwn(
      TRACKER_VALUE_TO_CLASSNAME,
      trackerDate.habitLog[habitDefinition.habitId]
    );
  const inSchedule = habitScheduleIncludesDateIso(
    habitDefinition.habitSchedule,
    dateIso
  );
  if (
    hasValue &&
    (inSchedule ||
      trackerValueIsNoKindaYes(trackerDate.habitLog[habitDefinition.habitId]))
  ) {
    return TRACKER_VALUE_TO_CLASSNAME[
      trackerDate.habitLog[habitDefinition.habitId]
    ];
  } else if (!inSchedule) {
    return styles.ignored;
  } else {
    return styles.tbd;
  }
};

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
        <td className={styles.trackerTableCell} key={definition.habitId}>
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
                getColorFromTrackerValue(
                  selectedDateData,
                  definition,
                  props.dateIso
                )
              )}
            ></div>
          </div>
          {definition.habitId === props.selectedHabitId && props.isLastRow && (
            <div className={styles.descriptionContainer}>
              <HabitDescriptionBox
                habitDefinition={definition}
                isInEditMode={props.isEditingDescription}
                tempDescriptionText={props.tempDescriptionText}
                setTempDescriptionText={props.setTempDescriptionText}
                cancel={props.cancel}
              />
            </div>
          )}
        </td>
      ))}
    </tr>
  );
}
