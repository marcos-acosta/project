import {
  HabitDefinition,
  HabitTrackerDate,
  LeftRightDirection,
  TrackerValue,
} from "@/interfaces/Interfaces";
import {
  addDays,
  classnames,
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
import { updateTrackerInDatabase } from "@/firebase/habit-tracker-service";

interface HabitTrackerProps {
  viewKeyhooks: KeyboardHook[];
  setCurrentSequence: (s: TypedKey[]) => void;
  habitDates: HabitTrackerDate[];
  habitDefinitions: HabitDefinition[];
}

const selectFirstHabitIfPossible = (habits: HabitDefinition[]) =>
  habits.length > 0 ? habits[0].habitId : null;

const getHabitIndexIfPossible = (
  habits: HabitDefinition[],
  habitId: string | null
) => {
  if (!habitId) {
    return null;
  }
  const index = habits.findIndex((habit) => habit.habitId === habitId);
  return index === -1 ? null : index;
};

export default function HabitTracker(props: HabitTrackerProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedHabitId, setSelectedHabitId] = useState(null as string | null);
  const [isInInputMode, setIsInInputMode] = useState(false);

  const selectedDateIso = formatDateToIso(selectedDate);
  const dateRange = getDateRange(selectedDate, 14);
  const selectedHabitIndex = getHabitIndexIfPossible(
    props.habitDefinitions,
    selectedHabitId
  );
  const hasHabitSelected =
    selectedHabitId != null && selectedHabitIndex != null;

  const toggleInputMode = () => {
    if (!isInInputMode) {
      setSelectedHabitId(selectFirstHabitIfPossible(props.habitDefinitions));
    } else {
      setSelectedHabitId(null);
    }
    setIsInInputMode(!isInInputMode);
  };

  const scrollHabits = (direction: LeftRightDirection) => {
    if (!hasHabitSelected) {
      return;
    }
    if (direction === LeftRightDirection.LEFT) {
      if (selectedHabitIndex !== 0) {
        setSelectedHabitId(
          props.habitDefinitions[selectedHabitIndex - 1].habitId
        );
      }
    } else {
      if (selectedHabitIndex !== props.habitDefinitions.length - 1) {
        setSelectedHabitId(
          props.habitDefinitions[selectedHabitIndex + 1].habitId
        );
      }
    }
  };

  const updateTracker = (trackerValue: TrackerValue) => {
    if (!hasHabitSelected) {
      return;
    }
    updateTrackerInDatabase(selectedDateIso, selectedHabitId, trackerValue);
    scrollHabits(LeftRightDirection.RIGHT);
  };

  const keyboardHooks: KeyboardHook[] = [
    ...props.viewKeyhooks,
    {
      keyboardEvent: { key: "j" },
      callback: () => setSelectedDate(addDays(selectedDate, 1)),
      allowWhen:
        !isInInputMode &&
        formatDateToIso(selectedDate) !== formatDateToIso(new Date()),
    },
    {
      keyboardEvent: { key: "k" },
      callback: () => setSelectedDate(addDays(selectedDate, -1)),
      allowWhen: !isInInputMode,
    },
    {
      keyboardEvent: { key: "Enter" },
      callback: toggleInputMode,
    },
    {
      keyboardEvent: { key: "h" },
      callback: () => scrollHabits(LeftRightDirection.LEFT),
      allowWhen: isInInputMode,
    },
    {
      keyboardEvent: { key: "l" },
      callback: () => scrollHabits(LeftRightDirection.RIGHT),
      allowWhen: isInInputMode,
    },
    {
      keyboardEvent: { key: "y" },
      callback: () => updateTracker(TrackerValue.YES),
      allowWhen: isInInputMode,
    },
    {
      keyboardEvent: { key: "n" },
      callback: () => updateTracker(TrackerValue.NO),
      allowWhen: isInInputMode,
    },
    {
      keyboardEvent: { key: "k" },
      callback: () => updateTracker(TrackerValue.KINDA),
      allowWhen: isInInputMode,
    },
    {
      keyboardEvent: { key: "?" },
      callback: () => updateTracker(TrackerValue.NOT_APPLICABLE),
      allowWhen: isInInputMode,
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
            <tr>
              <td />
              {props.habitDefinitions.map((definition) => (
                <td
                  className={classnames(
                    styles.habitName,
                    definition.habitId === selectedHabitId && styles.selected
                  )}
                  key={`header-${definition.habitId}`}
                >
                  <div className={styles.habitNameText}>
                    {definition.habitName}
                  </div>
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
                selectedHabitId={selectedHabitId}
                key={formatDateToIso(date)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
