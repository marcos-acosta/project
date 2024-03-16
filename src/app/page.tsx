"use client";

import { TaskData, View } from "@/interfaces/Interfaces";
import React, { useState } from "react";
import { useCollection } from "react-firebase-hooks/firestore";
import { documentToTaskData, heapCollection } from "@/firebase/heap";
import Heap from "@/components/Heap";
import { TypedKey } from "react-keyboard-control";
import KeypressDisplay from "@/components/KeypressDisplay";
import styles from "./page.module.css";
import HeapProvider from "@/components/HeapProvider";

export default function page() {
  const [heapDocs, heapLoading, heapError] = useCollection(heapCollection);
  const [view, setView] = useState(View.HEAP_HOME);
  const [currentSequence, setCurrentSequence] = useState([] as TypedKey[]);
  const heapTasks: TaskData[] = heapDocs
    ? heapDocs.docs.map(documentToTaskData)
    : [];
  const heapReady = !heapLoading && !heapError;

  return (
    <>
      {heapReady && (
        <HeapProvider
          unsortedTasks={heapTasks}
          view={view}
          setView={setView}
          setCurrentSequence={setCurrentSequence}
        />
      )}
      {currentSequence.length > 0 && (
        <div className={styles.keypressDisplayContainer}>
          <KeypressDisplay currentSequence={currentSequence} />
        </div>
      )}
    </>
  );
}
