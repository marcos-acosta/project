"use client";

import {
  HabitDefinition,
  HabitTrackerDate,
  TaskData,
  View,
} from "@/interfaces/Interfaces";
import React, { useState } from "react";
import { useCollection } from "react-firebase-hooks/firestore";
import { documentToTaskData, heapCollection } from "@/firebase/heap-service";
import { TypedKey } from "react-keyboard-control";
import KeypressDisplay from "@/components/KeypressDisplay";
import styles from "./page.module.css";
import HeapProvider from "@/components/heap/HeapProvider";
import HabitTracker from "@/components/habit-tracker/HabitTracker";
import {
  documentToHabitTrackerDate,
  habitTrackerCollection,
} from "@/firebase/habit-tracker-service";
import {
  documentToHabitDefinition,
  habitDefinitionsCollection,
} from "@/firebase/habit-definitions-service";

export default function page() {
  const [heapDocs, heapLoading, heapError] = useCollection(heapCollection);
  const [habitTrackerDocs, habitTrackerLoading, habitTrackerError] =
    useCollection(habitTrackerCollection);
  const [habitDefinitionsDocs, habitDefinitionsLoading, habitDefinitionsError] =
    useCollection(habitDefinitionsCollection);
  const [view, setView] = useState(View.HABIT_TRACKER);
  const [currentSequence, setCurrentSequence] = useState([] as TypedKey[]);
  const heapTasks: TaskData[] = heapDocs
    ? heapDocs.docs.map(documentToTaskData)
    : [];
  const habitTrackerDates: HabitTrackerDate[] = habitTrackerDocs
    ? habitTrackerDocs.docs.map(documentToHabitTrackerDate)
    : [];
  const habitDefinitions: HabitDefinition[] = habitDefinitionsDocs
    ? habitDefinitionsDocs.docs.map(documentToHabitDefinition)
    : [];
  const heapReady = !heapLoading && !heapError;
  const habitTrackerReady = !habitTrackerLoading && !habitTrackerError;
  const habitDefinitionsReady =
    !habitDefinitionsLoading && !habitDefinitionsError;

  const viewKeyhooks = [
    {
      keyboardEvent: [{ key: "h" }, { key: "h" }],
      callback: () => setView(View.HEAP_HOME),
    },
    {
      keyboardEvent: [{ key: "t" }, { key: "t" }],
      callback: () => setView(View.HABIT_TRACKER),
    },
  ];

  return (
    <>
      {view === View.HEAP_HOME ? (
        heapReady && (
          <HeapProvider
            setCurrentSequence={setCurrentSequence}
            viewKeyhooks={viewKeyhooks}
            unsortedTasks={heapTasks}
          />
        )
      ) : view === View.HABIT_TRACKER ? (
        habitTrackerReady &&
        habitDefinitionsReady && (
          <HabitTracker
            setCurrentSequence={setCurrentSequence}
            viewKeyhooks={viewKeyhooks}
            habitDates={habitTrackerDates}
            habitDefinitions={habitDefinitions}
          />
        )
      ) : (
        <></>
      )}
      {currentSequence.length > 0 && (
        <div className={styles.keypressDisplayContainer}>
          <KeypressDisplay currentSequence={currentSequence} />
        </div>
      )}
    </>
  );
}
