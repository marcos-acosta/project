import { TaskData, View } from "@/interfaces/Interfaces";
import React, { useState } from "react";
import Heap from "./Heap";
import { KeyboardHook, TypedKey } from "react-keyboard-control";

interface HeapProviderProps {
  unsortedTasks: TaskData[];
  view: View;
  setCurrentSequence: (s: TypedKey[]) => void;
  viewKeyhooks: KeyboardHook[];
}

export default function HeapProvider(props: HeapProviderProps) {
  const [showDetails, setShowDetails] = useState(false);
  return (
    <Heap
      unsortedTasks={props.unsortedTasks}
      showDetails={showDetails}
      setShowDetails={setShowDetails}
      inArchive={props.view === View.HEAP_ARCHIVE}
      viewKeyhooks={props.viewKeyhooks}
      setCurrentSequence={props.setCurrentSequence}
      key={props.view}
    />
  );
}
