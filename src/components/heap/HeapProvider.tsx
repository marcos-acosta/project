import { MaybeMonthPeriod, TaskData, View } from "@/interfaces/Interfaces";
import React, { useState } from "react";
import Heap from "./Heap";
import { KeyboardHook, TypedKey } from "react-keyboard-control";
import { isSecondsInMonth } from "@/util";

interface HeapProviderProps {
  unsortedTasks: TaskData[];
  setCurrentSequence: (s: TypedKey[]) => void;
  viewKeyhooks: KeyboardHook[];
}

export default function HeapProvider(props: HeapProviderProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [monthPeriod, setMonthPeriod] = useState(null as MaybeMonthPeriod);

  const tasks = monthPeriod
    ? props.unsortedTasks.filter(
        (task) =>
          task.isCompleted && isSecondsInMonth(task.completionTime, monthPeriod)
      )
    : props.unsortedTasks.filter((task) => !task.isCompleted);

  return (
    <Heap
      unsortedTasks={tasks}
      showDetails={showDetails}
      setShowDetails={setShowDetails}
      viewKeyhooks={props.viewKeyhooks}
      setCurrentSequence={props.setCurrentSequence}
      monthPeriod={monthPeriod}
      setMonthPeriod={setMonthPeriod}
      key={monthPeriod ? `${monthPeriod.month}:${monthPeriod.year}` : "heap"}
    />
  );
}
