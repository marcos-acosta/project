"use client";

import { TaskData, View } from "@/interfaces/Task";
import React, { useState } from "react";
import Heap from "./Heap";

interface HeapProviderProps {
  tasks: TaskData[];
}

export default function HeapProvider(props: HeapProviderProps) {
  const [view, setView] = useState(View.HEAP_HOME);
  const [showDetails, setShowDetails] = useState(false);

  return (
    <Heap
      unsortedTasks={props.tasks}
      view={view}
      setView={setView}
      showDetails={showDetails}
      setShowDetails={setShowDetails}
      key={view}
    />
  );
}
