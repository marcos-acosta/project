"use client";

import styles from "./page.module.css";
import { TaskData } from "@/interfaces/Task";
import VerticallyCenteredList from "@/components/VerticallyCenteredList";
import TaskList from "@/components/TaskList";
import { useState } from "react";
import useKeyboardControl, { KeyboardHook } from "react-keyboard-control";
import { mod } from "@/util";

const INITIAL_TASKS: TaskData[] = [
  {
    taskText: "pet doggo",
    taskId: "abc",
    orderScore: 3,
  },
  {
    taskText: "water doug",
    taskId: "def",
    orderScore: 5,
  },
  {
    taskText: "catch up with schwartz-san",
    taskId: "ghi",
    orderScore: 7,
  },
  {
    taskText: "argue with pigeons",
    taskId: "klm",
    orderScore: 11,
  },
];

const TASK_HEIGHT_IN_VH = 6;

export default function Home() {
  const [selectedId, setSelectedId] = useState("klm");
  const tasks = INITIAL_TASKS.sort((a, b) => a.orderScore - b.orderScore);

  const selectedIndex = tasks.findIndex((task) => task.taskId === selectedId);
  const selectedTask = selectedIndex >= 0 ? tasks[selectedIndex] : null;
  const scrollAmount = selectedTask
    ? tasks.indexOf(selectedTask) * TASK_HEIGHT_IN_VH
    : 0;

  const navigateTasks = (direction: number) => {
    if (selectedIndex === null) {
      return;
    }
    setSelectedId(tasks[mod(selectedIndex + direction, tasks.length)].taskId);
  };

  const jumpToTop = () => setSelectedId(tasks[0].taskId);
  const jumpToBottom = () => setSelectedId(tasks[tasks.length - 1].taskId);

  const keyboardHooks: KeyboardHook[] = [
    {
      keyboardEvent: { key: "k" },
      callback: () => navigateTasks(-1),
    },
    {
      keyboardEvent: { key: "j" },
      callback: () => navigateTasks(1),
    },
    {
      keyboardEvent: { key: "B" },
      callback: jumpToBottom,
    },
    {
      keyboardEvent: { key: "T" },
      callback: jumpToTop,
    },
  ];

  useKeyboardControl(keyboardHooks);

  return (
    <div className={styles.taskContainer}>
      <VerticallyCenteredList scrollAmount={`${-scrollAmount}vh`}>
        <TaskList tasks={INITIAL_TASKS} selectedTaskId={selectedId} />
      </VerticallyCenteredList>
    </div>
  );
}
