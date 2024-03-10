"use client";

import { TaskData, View } from "@/interfaces/Interfaces";
import React, { useState } from "react";
import Heap from "./Heap";
import { useAppSelector } from "@/app/hooks";

interface HeapProviderProps {
  tasks: TaskData[];
}

export default function HeapProvider(props: HeapProviderProps) {
  const [showDetails, setShowDetails] = useState(false);
  const viewNew = useAppSelector((state) => state.view.view);

  return (
    <Heap
      unsortedTasks={props.tasks}
      showDetails={showDetails}
      setShowDetails={setShowDetails}
      key={viewNew}
    />
  );
}
