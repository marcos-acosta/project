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
  habitScheduleIncludesDateIso,
} from "@/util";
import React, { useEffect, useState } from "react";
import useKeyboardControl, {
  KeyboardHook,
  TypedKey,
} from "react-keyboard-control";
import styles from "./HabitTracker.module.css";
import HabitTrackerDateRow from "./HabitTrackerDateRow";
import {
  updateHabitDefinitionInDatabase,
  updateTrackerInDatabase,
  updateTrackerValuesInDatabase,
} from "@/firebase/habit-tracker-service";

interface HabitTrackerProps {
  viewKeyhooks: KeyboardHook[];
  setCurrentSequence: (s: TypedKey[]) => void;
  habitDates: HabitTrackerDate[];
  habitDefinitions: HabitDefinition[];
}

const selectFirstHabitIfPossible = (
  habits: HabitDefinition[],
  selectedDateIso: string
) => {
  const habitId = habits.find((habit) =>
    habitScheduleIncludesDateIso(habit.habitSchedule, selectedDateIso)
  )?.habitId;
  return habitId ? habitId : null;
};

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
  const selectedHabit =
    selectedHabitIndex != null
      ? props.habitDefinitions[selectedHabitIndex]
      : null;
  const hasHabitSelected =
    selectedHabitId != null &&
    selectedHabitIndex != null &&
    selectedHabit != null;

  const toggleInputMode = () => {
    if (!isInInputMode) {
      setSelectedHabitId(
        selectFirstHabitIfPossible(habitDefinitions, selectedDateIso)
      );
    } else {
      setSelectedHabitId(null);
    }
    setIsInInputMode(!isInInputMode);
  };

  const scrollHabits = (
    direction: LeftRightDirection,
    selectedDate: string
  ) => {
    if (!hasHabitSelected) {
      return;
    }
    const habitsToSearch =
      direction === LeftRightDirection.LEFT
        ? habitDefinitions.slice(0, selectedHabitIndex).reverse()
        : habitDefinitions.slice(selectedHabitIndex + 1);
    const nextHabit = habitsToSearch.find((definition) =>
      habitScheduleIncludesDateIso(definition.habitSchedule, selectedDate)
    );
    if (nextHabit) {
      setSelectedHabitId(nextHabit.habitId);
    }
  };

  const updateTrackerWithNotApplicableValues = (
    trackerValue: TrackerValue,
    selectedDate: string
  ) => {
    if (!hasHabitSelected) {
      return;
    }
    let newTracker = {} as { [key: string]: string };
    habitDefinitions.forEach((definition) => {
      if (
        !habitScheduleIncludesDateIso(definition.habitSchedule, selectedDate)
      ) {
        newTracker[definition.habitId] = TrackerValue.NOT_APPLICABLE;
      }
    });
    newTracker[selectedHabitId] = trackerValue;
    updateTrackerValuesInDatabase(selectedDateIso, newTracker);
    scrollHabits(LeftRightDirection.RIGHT, selectedDate);
  };

  const swapHabitsOrder = (swapDirection: LeftRightDirection) => {
    if (!hasHabitSelected) {
      return;
    }
    if (
      (swapDirection === LeftRightDirection.LEFT && selectedHabitIndex === 0) ||
      (swapDirection === LeftRightDirection.RIGHT &&
        selectedHabitIndex === props.habitDefinitions.length - 1)
    ) {
      return;
    }
    const swappedHabit =
      props.habitDefinitions[
        selectedHabitIndex +
          (swapDirection === LeftRightDirection.LEFT ? -1 : 1)
      ];
    updateHabitDefinitionInDatabase(
      selectedHabitId,
      "order_value",
      swappedHabit.orderValue
    );
    updateHabitDefinitionInDatabase(
      swappedHabit.habitId,
      "order_value",
      selectedHabit.orderValue
    );
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
      callback: () => scrollHabits(LeftRightDirection.LEFT, selectedDateIso),
      allowWhen: isInInputMode,
    },
    {
      keyboardEvent: { key: "l" },
      callback: () => scrollHabits(LeftRightDirection.RIGHT, selectedDateIso),
      allowWhen: isInInputMode,
    },
    {
      keyboardEvent: { key: "y" },
      callback: () =>
        updateTrackerWithNotApplicableValues(TrackerValue.YES, selectedDateIso),
      allowWhen: isInInputMode,
    },
    {
      keyboardEvent: { key: "n" },
      callback: () =>
        updateTrackerWithNotApplicableValues(TrackerValue.NO, selectedDateIso),
      allowWhen: isInInputMode,
    },
    {
      keyboardEvent: { key: "k" },
      callback: () =>
        updateTrackerWithNotApplicableValues(
          TrackerValue.KINDA,
          selectedDateIso
        ),
      allowWhen: isInInputMode,
    },
    {
      keyboardEvent: { key: "?" },
      callback: () =>
        updateTrackerWithNotApplicableValues(
          TrackerValue.NOT_APPLICABLE,
          selectedDateIso
        ),
      allowWhen: isInInputMode,
    },
    {
      keyboardEvent: { key: "x" },
      callback: () =>
        updateTrackerWithNotApplicableValues(
          TrackerValue.UNKNOWN,
          selectedDateIso
        ),
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
    {
      keyboardEvent: { key: "H" },
      callback: () => swapHabitsOrder(LeftRightDirection.LEFT),
      allowWhen: isInInputMode,
    },
    {
      keyboardEvent: { key: "L" },
      callback: () => swapHabitsOrder(LeftRightDirection.RIGHT),
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
