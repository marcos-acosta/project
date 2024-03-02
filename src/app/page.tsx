"use client";

import { TaskData } from "@/interfaces/Task";
import React from "react";
import HeapProvider from "@/components/HeapProvider";
import { useCollection } from "react-firebase-hooks/firestore";
import { documentToTaskData, heapCollection } from "@/firebase/heap";

export default function page() {
  const [heapDocs, heapLoading, heapError] = useCollection(heapCollection);
  const heapTasks: TaskData[] = heapDocs
    ? heapDocs.docs.map(documentToTaskData)
    : [];
  const heapReady = !heapLoading && !heapError;

  return heapReady && <HeapProvider tasks={heapTasks} />;
}
