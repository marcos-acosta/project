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
  getNowInSeconds,
  habitScheduleIncludesDateIso,
  toggleScheduleDay,
} from "@/util";
import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
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
  addHabitToDatabase,
  deleteHabitFromDatabase,
  updateHabitDefinitionInDatabase,
  updateTrackerValuesInDatabase,
} from "@/firebase/habit-tracker-service";

interface HabitTrackerProps {
  viewKeyhooks: KeyboardHook[];
  setCurrentSequence: (s: TypedKey[]) => void;
  habitDates: HabitTrackerDate[];
  habitDefinitions: HabitDefinition[];
}

const selectFirstHabitIdIfPossible = (habits: HabitDefinition[]) =>
  habits.length === 0 ? null : habits[0].habitId;

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
  const [tempDescriptionText, setTempDescriptionText] = useState("");
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [tempHabitName, setTempHabitName] = useState("");
  const [isEditingHabitName, setIsEditingHabitName] = useState(false);
  const [temporaryHabit, setTemporaryHabit] = useState(
    null as HabitDefinition | null
  );

  const habitDefinitionsWithoutTempHabit = temporaryHabit
    ? [temporaryHabit, ...props.habitDefinitions]
    : props.habitDefinitions;
  const habitDefinitions = habitDefinitionsWithoutTempHabit.sort(
    (a, b) => a.orderValue - b.orderValue
  );
  const selectedDateIso = formatDateToIso(selectedDate);
  const dateRange = getNDaysUpToSelectedDate(selectedDate, 8);

  const [selectedHabitId, setSelectedHabitId] = useState(
    selectFirstHabitIdIfPossible(habitDefinitions)
  );

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

  const scrollHabits = (
    direction: LeftRightDirection,
    selectedDate: string,
    obeySchedule: boolean
  ) => {
    if (!hasHabitSelected) {
      return;
    }
    const habitsToSearch =
      direction === LeftRightDirection.LEFT
        ? habitDefinitions.slice(0, selectedHabitIndex).reverse()
        : habitDefinitions.slice(selectedHabitIndex + 1);
    const nextHabit = habitsToSearch.find(
      (definition) =>
        !obeySchedule ||
        habitScheduleIncludesDateIso(definition.habitSchedule, selectedDate)
    );
    if (nextHabit) {
      setSelectedHabitId(nextHabit.habitId);
    }
  };

  const jumpToSide = (direction: LeftRightDirection) => {
    if (!hasHabitSelected) {
      return;
    }
    if (direction === LeftRightDirection.LEFT) {
      setSelectedHabitId(habitDefinitions[0].habitId);
    } else {
      setSelectedHabitId(habitDefinitions[habitDefinitions.length - 1].habitId);
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
    scrollHabits(LeftRightDirection.RIGHT, selectedDate, true);
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
    if (temporaryHabit) {
      setTemporaryHabit(null);
    }
    setIsEditingDescription(false);
    setTempDescriptionText("");
    setIsEditingHabitName(false);
    setTempHabitName("");
  };

  const finishEditing = () => {
    if (temporaryHabit) {
      const newHabitDefinition: HabitDefinition = {
        ...temporaryHabit,
        habitName: tempHabitName,
      };
      setTemporaryHabit(null);
      addHabitToDatabase(newHabitDefinition);
      cancelEditOrCreate();
      setSelectedHabitId(newHabitDefinition.habitId);
    }
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

  const getNextOrderValue = () => {
    if (
      !hasHabitSelected ||
      selectedHabitIndex === habitDefinitions.length - 1
    ) {
      return getNowInSeconds() * 1000;
    } else {
      return (
        (habitDefinitions[selectedHabitIndex].orderValue +
          habitDefinitions[selectedHabitIndex + 1].orderValue) /
        2
      );
    }
  };

  const addHabit = () => {
    const new_id = uuidv4();
    setTemporaryHabit({
      habitName: "",
      habitDescription: "",
      orderValue: getNextOrderValue(),
      habitId: new_id,
      habitSchedule: "umtwrfs",
    });
    setSelectedHabitId(new_id);
    setIsEditingHabitName(true);
    setTempHabitName("");
  };

  const navigateAfterDeletingHabit = () => {
    if (!hasHabitSelected) {
      return;
    }
    if (habitDefinitions.length === 1) {
      setSelectedHabitId(null);
    } else {
      if (selectedHabitIndex === 0) {
        scrollHabits(LeftRightDirection.RIGHT, selectedDateIso, false);
      } else {
        scrollHabits(LeftRightDirection.LEFT, selectedDateIso, false);
      }
    }
  };

  const deleteHabit = () => {
    if (!hasHabitSelected) {
      return;
    }
    deleteHabitFromDatabase(selectedHabitId);
    navigateAfterDeletingHabit();
  };

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
    {
      keyboardEvent: { key: "h" },
      callback: () =>
        scrollHabits(LeftRightDirection.LEFT, selectedDateIso, false),
    },
    {
      keyboardEvent: { key: "l" },
      callback: () =>
        scrollHabits(LeftRightDirection.RIGHT, selectedDateIso, false),
    },
    {
      keyboardEvent: { key: "<" },
      callback: () =>
        scrollHabits(LeftRightDirection.LEFT, selectedDateIso, true),
    },
    {
      keyboardEvent: { key: ">" },
      callback: () =>
        scrollHabits(LeftRightDirection.RIGHT, selectedDateIso, true),
    },
    {
      keyboardEvent: { key: "[" },
      callback: () => jumpToSide(LeftRightDirection.LEFT),
    },
    {
      keyboardEvent: { key: "]" },
      callback: () => jumpToSide(LeftRightDirection.RIGHT),
    },
    {
      keyboardEvent: { key: "+" },
      callback: () =>
        updateTrackerWithNotApplicableValues(TrackerValue.YES, selectedDateIso),
    },
    {
      keyboardEvent: { key: "-" },
      callback: () =>
        updateTrackerWithNotApplicableValues(TrackerValue.NO, selectedDateIso),
    },
    {
      keyboardEvent: { key: "=" },
      callback: () =>
        updateTrackerWithNotApplicableValues(
          TrackerValue.KINDA,
          selectedDateIso
        ),
    },
    {
      keyboardEvent: { key: "_" },
      callback: () =>
        updateTrackerWithNotApplicableValues(
          TrackerValue.NOT_APPLICABLE,
          selectedDateIso
        ),
    },
    {
      keyboardEvent: { key: "?" },
      callback: () =>
        updateTrackerWithNotApplicableValues(
          TrackerValue.UNKNOWN,
          selectedDateIso
        ),
    },
    {
      keyboardEvent: { key: "." },
      callback: () => setSelectedDate(new Date()),
    },
    {
      keyboardEvent: { key: "w" },
      callback: () => setSelectedDate(addDays(selectedDate, 7)),
    },
    {
      keyboardEvent: { key: "W" },
      callback: () => setSelectedDate(addDays(selectedDate, -7)),
    },
    {
      keyboardEvent: { key: "m" },
      callback: () => setSelectedDate(addDays(selectedDate, 28)),
    },
    {
      keyboardEvent: { key: "M" },
      callback: () => setSelectedDate(addDays(selectedDate, -28)),
    },
    {
      keyboardEvent: { key: "H" },
      callback: () => swapHabitsOrder(LeftRightDirection.LEFT),
    },
    {
      keyboardEvent: { key: "L" },
      callback: () => swapHabitsOrder(LeftRightDirection.RIGHT),
    },
    {
      keyboardEvent: [{ key: "s" }, { key: "u" }],
      callback: () => updateHabitSchedule(DaysOfWeek.SUNDAY),
    },
    {
      keyboardEvent: [{ key: "s" }, { key: "m" }],
      callback: () => updateHabitSchedule(DaysOfWeek.MONDAY),
    },
    {
      keyboardEvent: [{ key: "s" }, { key: "t" }],
      callback: () => updateHabitSchedule(DaysOfWeek.TUESDAY),
    },
    {
      keyboardEvent: [{ key: "s" }, { key: "w" }],
      callback: () => updateHabitSchedule(DaysOfWeek.WEDNESDAY),
    },
    {
      keyboardEvent: [{ key: "s" }, { key: "r" }],
      callback: () => updateHabitSchedule(DaysOfWeek.THURSDAY),
    },
    {
      keyboardEvent: [{ key: "s" }, { key: "f" }],
      callback: () => updateHabitSchedule(DaysOfWeek.FRIDAY),
    },
    {
      keyboardEvent: [{ key: "s" }, { key: "s" }],
      callback: () => updateHabitSchedule(DaysOfWeek.SATURDAY),
    },
    {
      keyboardEvent: { key: "a" },
      callback: addHabit,
      preventDefault: true,
    },
    {
      keyboardEvent: [{ key: "e" }, { key: "d" }],
      callback: beginEditingDescription,
      preventDefault: true,
    },
    {
      keyboardEvent: [{ key: "e" }, { key: "h" }],
      callback: beginEditingHabitName,
      preventDefault: true,
    },
    {
      keyboardEvent: [{ key: "d" }, { key: "d" }],
      callback: deleteHabit,
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
