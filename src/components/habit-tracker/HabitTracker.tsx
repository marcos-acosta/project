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
  getNDaysUpToSelectedDate,
} from "@/util";
import React, { useEffect, useState } from "react";
import useKeyboardControl, {
  KeyboardHook,
  TypedKey,
} from "react-keyboard-control";
import styles from "./HabitTracker.module.css";
import HabitTrackerDateRow from "./HabitTrackerDateRow";
import { updateTrackerInDatabase } from "@/firebase/habit-tracker-service";
import HabitDescriptionBox from "./HabitDescriptionBox";

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

  const habitDefinitions = props.habitDefinitions.sort(
    (a, b) => a.orderValue - b.orderValue
  );
  const selectedDateIso = formatDateToIso(selectedDate);
  const dateRange = getNDaysUpToSelectedDate(selectedDate, 7);
  const selectedHabitIndex = getHabitIndexIfPossible(
    habitDefinitions,
    selectedHabitId
  );
  const hasHabitSelected =
    selectedHabitId != null && selectedHabitIndex != null;

  const toggleInputMode = () => {
    if (!isInInputMode) {
      setSelectedHabitId(selectFirstHabitIfPossible(habitDefinitions));
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
        setSelectedHabitId(habitDefinitions[selectedHabitIndex - 1].habitId);
      }
    } else {
      if (selectedHabitIndex !== habitDefinitions.length - 1) {
        setSelectedHabitId(habitDefinitions[selectedHabitIndex + 1].habitId);
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
    {
      keyboardEvent: { key: "." },
      callback: () => setSelectedDate(new Date()),
      allowWhen: !isInInputMode,
    },
    {
      keyboardEvent: { key: "w" },
      callback: () => setSelectedDate(addDays(selectedDate, 7)),
      allowWhen: !isInInputMode,
    },
    {
      keyboardEvent: { key: "W" },
      callback: () => setSelectedDate(addDays(selectedDate, -7)),
      allowWhen: !isInInputMode,
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
              {habitDefinitions.map((definition) => (
                <td
                  key={`header-${definition.habitId}`}
                  className={styles.trackerHeader}
                >
                  <div
                    className={classnames(
                      styles.habitName,
                      definition.habitId === selectedHabitId && styles.selected,
                      selectedHabitId &&
                        definition.habitId !== selectedHabitId &&
                        styles.grayedOut
                    )}
                  >
                    <div className={styles.habitNameText}>
                      {definition.habitName}
                    </div>
                  </div>
                </td>
              ))}
            </tr>
          </thead>
          <tbody>
            {dateRange.map((date, i) => (
              <HabitTrackerDateRow
                dateString={formatDateToLocaleDate(date, false)}
                dateIso={formatDateToIso(date)}
                isRowSelected={formatDateToIso(date) === selectedDateIso}
                habitDefinitions={habitDefinitions}
                habitDates={props.habitDates}
                selectedHabitId={selectedHabitId}
                key={formatDateToIso(date)}
                isLastRow={i === dateRange.length - 1}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
