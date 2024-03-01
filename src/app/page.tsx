"use client";

import Heap from "@/components/Heap";
import { TaskData, View } from "@/interfaces/Task";
import React, { useState } from "react";

const INITIAL_DATE = 1708661086000;

const INITIAL_TASKS: TaskData[] = [
  {
    taskText: "argue with pigeons",
    taskId: "klm",
    isCompleted: false,
    creationTime: INITIAL_DATE - 11,
    sortingTime: INITIAL_DATE - 11,
    completionTime: null,
    notes: "",
  },
  {
    taskText: "water doug",
    taskId: "def",
    isCompleted: true,
    creationTime: INITIAL_DATE - 5,
    sortingTime: INITIAL_DATE - 5,
    completionTime: INITIAL_DATE - 5,
    notes: "",
  },
  {
    taskText: "watch paint dry",
    taskId: "nop",
    isCompleted: true,
    creationTime: INITIAL_DATE - 4,
    sortingTime: INITIAL_DATE - 4,
    completionTime: INITIAL_DATE - 4,
    notes: "",
  },
  {
    taskText: "catch up with schwartz-san",
    taskId: "ghi",
    isCompleted: false,
    creationTime: INITIAL_DATE - 7,
    sortingTime: INITIAL_DATE - 7,
    completionTime: null,
    notes: "",
  },
  {
    taskText: "perfectly toast bread",
    taskId: "qrs",
    isCompleted: true,
    creationTime: INITIAL_DATE - 12,
    sortingTime: INITIAL_DATE - 12,
    completionTime: INITIAL_DATE - 12,
    notes: "",
  },
  {
    taskText: "pet doggo",
    taskId: "abc",
    isCompleted: false,
    creationTime: INITIAL_DATE - 3,
    sortingTime: INITIAL_DATE - 3,
    completionTime: null,
    notes: "",
  },
];

export default function page() {
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [view, setView] = useState(View.HEAP_HOME);
  const [showDetails, setShowDetails] = useState(false);

  return (
    <Heap
      unsortedTasks={tasks}
      setUnsortedTasks={setTasks}
      view={view}
      setView={setView}
      showDetails={showDetails}
      setShowDetails={setShowDetails}
      key={view}
    />
  );
}
