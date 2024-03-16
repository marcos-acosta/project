import { TaskData, View } from "@/interfaces/Interfaces";
import React, { useState } from "react";
import Heap from "./Heap";
import { TypedKey } from "react-keyboard-control";

interface HeapProviderProps {
  unsortedTasks: TaskData[];
  view: View;
  setView: (v: View) => void;
  setCurrentSequence: (s: TypedKey[]) => void;
}

export default function HeapProvider(props: HeapProviderProps) {
  const [showDetails, setShowDetails] = useState(false);
  return (
    <Heap
      unsortedTasks={props.unsortedTasks}
      showDetails={showDetails}
      setShowDetails={setShowDetails}
      inArchive={props.view === View.HEAP_ARCHIVE}
      setView={props.setView}
      setCurrentSequence={props.setCurrentSequence}
      key={props.view}
    />
  );
}
