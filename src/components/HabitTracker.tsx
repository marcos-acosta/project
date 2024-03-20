import { HabitDefinition, HabitTrackerDate } from "@/interfaces/Interfaces";
import {
  addDays,
  formatDateToIso,
  formatDateToLocaleDate,
  getDateRange,
} from "@/util";
import React, { useEffect, useState } from "react";
import useKeyboardControl, {
  KeyboardHook,
  TypedKey,
} from "react-keyboard-control";
import styles from "./HabitTracker.module.css";
import HabitTrackerDateRow from "./HabitTrackerDateRow";

interface HabitTrackerProps {
  viewKeyhooks: KeyboardHook[];
  setCurrentSequence: (s: TypedKey[]) => void;
  habitDates: HabitTrackerDate[];
  habitDefinitions: HabitDefinition[];
}

export default function HabitTracker(props: HabitTrackerProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const selectedDateIso = formatDateToIso(selectedDate);
  const dateRange = getDateRange(selectedDate, 14);

  const keyboardHooks: KeyboardHook[] = [
    ...props.viewKeyhooks,
    {
      keyboardEvent: { key: "j" },
      callback: () => setSelectedDate(addDays(selectedDate, 1)),
    },
    {
      keyboardEvent: { key: "k" },
      callback: () => setSelectedDate(addDays(selectedDate, -1)),
    },
  ];

  const currentSequence = useKeyboardControl(keyboardHooks);

  useEffect(() => {
    props.setCurrentSequence(currentSequence);
  }, [props.setCurrentSequence, currentSequence]);

  return (
    <div className={styles.habitTrackerContainer}>
      <div className={styles.habitTrackerHorizontalCenter}>
        <table className={styles.habitTrackerTable}>
          <thead>
            <tr className={styles.habitTrackerHeader}>
              <td />
              {props.habitDefinitions.map((definition) => (
                <td key={`header-${definition.habitId}`}>
                  {definition.habitName}
                </td>
              ))}
            </tr>
          </thead>
          <tbody>
            {dateRange.map((date) => (
              <HabitTrackerDateRow
                dateString={formatDateToLocaleDate(date, false)}
                dateIso={formatDateToIso(date)}
                isRowSelected={formatDateToIso(date) === selectedDateIso}
                habitDefinitions={props.habitDefinitions}
                habitDates={props.habitDates}
                key={formatDateToIso(date)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
