import {
  DaysOfWeek,
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
  getNDaysUpToSelectedDate,
  habitScheduleIncludesDateIso,
  toggleScheduleDay,
} from "@/util";
import React, { useEffect, useState } from "react";
import useKeyboardControl, {
  KeyboardHook,
  TypedKey,
} from "react-keyboard-control";
import styles from "./HabitTracker.module.css";
import HabitTrackerDateRow from "./HabitTrackerDateRow";
import {
  HABIT_DESCRIPTION,
  HABIT_NAME,
  HABIT_SCHEDULE,
  ORDER_VALUE,
  updateHabitDefinitionInDatabase,
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
  const [tempDescriptionText, setTempDescriptionText] = useState("");
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [tempHabitName, setTempHabitName] = useState("");
  const [isEditingHabitName, setIsEditingHabitName] = useState(false);

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
      ORDER_VALUE,
      swappedHabit.orderValue
    );
    updateHabitDefinitionInDatabase(
      swappedHabit.habitId,
      ORDER_VALUE,
      selectedHabit.orderValue
    );
  };

  const updateHabitSchedule = (day: DaysOfWeek) => {
    if (!hasHabitSelected) {
      return;
    }
    updateHabitDefinitionInDatabase(
      selectedHabitId,
      HABIT_SCHEDULE,
      toggleScheduleDay(selectedHabit.habitSchedule, day)
    );
  };

  const beginEditingDescription = () => {
    if (!hasHabitSelected) {
      return;
    }
    setIsEditingDescription(true);
    setTempDescriptionText(selectedHabit.habitDescription);
  };

  const beginEditingHabitName = () => {
    if (!hasHabitSelected) {
      return;
    }
    setIsEditingHabitName(true);
    setTempHabitName(selectedHabit.habitName);
  };

  const cancelEditOrCreate = () => {
    setIsEditingDescription(false);
    setTempDescriptionText("");
    setIsEditingHabitName(false);
    setTempHabitName("");
  };

  const finishEditing = () => {
    if (!hasHabitSelected) {
      return;
    }
    if (isEditingDescription) {
      updateHabitDefinitionInDatabase(
        selectedHabitId,
        HABIT_DESCRIPTION,
        tempDescriptionText
      );
      cancelEditOrCreate();
    } else if (isEditingHabitName && tempHabitName.length > 0) {
      updateHabitDefinitionInDatabase(
        selectedHabitId,
        HABIT_NAME,
        tempHabitName
      );
      cancelEditOrCreate();
    }
  };

  const keyboardHooks: KeyboardHook[] = [
    ...props.viewKeyhooks.map((keyhook) => ({
      ...keyhook,
      allowWhen: !isInInputMode,
    })),
    {
      keyboardEvent: { key: "j" },
      callback: () => setSelectedDate(addDays(selectedDate, 1)),
      allowWhen: !isInInputMode,
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
      keyboardEvent: { key: "+" },
      callback: () =>
        updateTrackerWithNotApplicableValues(TrackerValue.YES, selectedDateIso),
      allowWhen: isInInputMode,
    },
    {
      keyboardEvent: { key: "-" },
      callback: () =>
        updateTrackerWithNotApplicableValues(TrackerValue.NO, selectedDateIso),
      allowWhen: isInInputMode,
    },
    {
      keyboardEvent: { key: "=" },
      callback: () =>
        updateTrackerWithNotApplicableValues(
          TrackerValue.KINDA,
          selectedDateIso
        ),
      allowWhen: isInInputMode,
    },
    {
      keyboardEvent: { key: "_" },
      callback: () =>
        updateTrackerWithNotApplicableValues(
          TrackerValue.NOT_APPLICABLE,
          selectedDateIso
        ),
      allowWhen: isInInputMode,
    },
    {
      keyboardEvent: { key: "?" },
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
      keyboardEvent: { key: "m" },
      callback: () => setSelectedDate(addDays(selectedDate, 28)),
      allowWhen: !isInInputMode,
    },
    {
      keyboardEvent: { key: "M" },
      callback: () => setSelectedDate(addDays(selectedDate, -28)),
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
    {
      keyboardEvent: { key: "u" },
      callback: () => updateHabitSchedule(DaysOfWeek.SUNDAY),
      allowWhen: isInInputMode,
    },
    {
      keyboardEvent: { key: "m" },
      callback: () => updateHabitSchedule(DaysOfWeek.MONDAY),
      allowWhen: isInInputMode,
    },
    {
      keyboardEvent: { key: "t" },
      callback: () => updateHabitSchedule(DaysOfWeek.TUESDAY),
      allowWhen: isInInputMode,
    },
    {
      keyboardEvent: { key: "w" },
      callback: () => updateHabitSchedule(DaysOfWeek.WEDNESDAY),
      allowWhen: isInInputMode,
    },
    {
      keyboardEvent: { key: "r" },
      callback: () => updateHabitSchedule(DaysOfWeek.THURSDAY),
      allowWhen: isInInputMode,
    },
    {
      keyboardEvent: { key: "f" },
      callback: () => updateHabitSchedule(DaysOfWeek.FRIDAY),
      allowWhen: isInInputMode,
    },
    {
      keyboardEvent: { key: "s" },
      callback: () => updateHabitSchedule(DaysOfWeek.SATURDAY),
      allowWhen: isInInputMode,
    },
    {
      keyboardEvent: [{ key: "e" }, { key: "d" }],
      callback: beginEditingDescription,
      allowWhen: isInInputMode,
      preventDefault: true,
    },
    {
      keyboardEvent: [{ key: "e" }, { key: "h" }],
      callback: beginEditingHabitName,
      allowWhen: isInInputMode,
      preventDefault: true,
    },
    {
      keyboardEvent: { key: "Escape" },
      callback: cancelEditOrCreate,
      allowWhen: isEditingDescription || isEditingHabitName,
      allowOnTextInput: true,
    },
    {
      keyboardEvent: { key: "Enter", metaKey: true },
      callback: finishEditing,
      allowWhen: isEditingDescription || isEditingHabitName,
      allowOnTextInput: true,
    },
  ];

  const currentSequence = useKeyboardControl(keyboardHooks);

  useEffect(() => {
    props.setCurrentSequence(currentSequence);
  }, [props.setCurrentSequence, currentSequence]);

  const HABIT_NAME_PLACEHOLDER_TEXT = "???";

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
                    {isEditingHabitName &&
                    definition.habitId === selectedHabitId ? (
                      <input
                        className={styles.habitNameInput}
                        size={
                          tempHabitName.length
                            ? Math.max(tempHabitName.length, 1)
                            : HABIT_NAME_PLACEHOLDER_TEXT.length
                        }
                        placeholder={HABIT_NAME_PLACEHOLDER_TEXT}
                        value={tempHabitName}
                        onChange={(e) => setTempHabitName(e.target.value)}
                        autoFocus
                      />
                    ) : (
                      <div className={styles.habitNameText}>
                        {definition.habitName}
                      </div>
                    )}
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
                isEditingDescription={isEditingDescription}
                tempDescriptionText={tempDescriptionText}
                setTempDescriptionText={setTempDescriptionText}
                cancel={cancelEditOrCreate}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
