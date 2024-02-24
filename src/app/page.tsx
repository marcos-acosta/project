"use client";

import styles from "./page.module.css";
import { TaskData } from "@/interfaces/Task";
import VerticallyCenteredList from "@/components/VerticallyCenteredList";
import TaskList from "@/components/TaskList";
import { useState } from "react";
import useKeyboardControl, { KeyboardHook } from "react-keyboard-control";
import { clip, mod } from "@/util";

const INITIAL_TASKS: TaskData[] = [
  {
    taskText: "argue with pigeons",
    taskId: "klm",
    orderScore: 11,
    isCompleted: false,
  },
  {
    taskText: "water doug",
    taskId: "def",
    orderScore: 5,
    isCompleted: true,
  },
  {
    taskText: "watch paint dry",
    taskId: "nop",
    orderScore: 4,
    isCompleted: true,
  },
  {
    taskText: "catch up with schwartz-san",
    taskId: "ghi",
    orderScore: 7,
    isCompleted: false,
  },
  {
    taskText: "perfectly toast bread",
    taskId: "qrs",
    orderScore: 12,
    isCompleted: true,
  },
  {
    taskText: "pet doggo",
    taskId: "abc",
    orderScore: 3,
    isCompleted: false,
  },
];

const TASK_HEIGHT_IN_VH = 6;
const DIVIDER_HEIGHT_IN_VH = 3;

enum JumpDirection {
  TOP,
  BOTTOM,
}

export default function Home() {
  const [selectedId, setSelectedId] = useState("abc");
  const [unsortedTasks, setUnsortedTasks] = useState(INITIAL_TASKS);
  const sortedTasks = unsortedTasks.sort((a, b) => a.orderScore - b.orderScore);
  const uncompletedTasks = sortedTasks.filter((task) => !task.isCompleted);
  const completedTasks = sortedTasks.filter((task) => task.isCompleted);
  const tasks = [...completedTasks, ...uncompletedTasks];

  const selectedIndex = tasks.findIndex((task) => task.taskId === selectedId);
  const selectedTask = selectedIndex >= 0 ? tasks[selectedIndex] : null;
  const dividerPresent = completedTasks.length > 0;
  const scrollAmount = selectedTask
    ? -(
        tasks.indexOf(selectedTask) * TASK_HEIGHT_IN_VH +
        (dividerPresent && !selectedTask.isCompleted ? DIVIDER_HEIGHT_IN_VH : 0)
      )
    : 0;

  const navigateTasks = (direction: number) => {
    if (selectedIndex === null) {
      return;
    }
    setSelectedId(
      tasks[clip(selectedIndex + direction, 0, tasks.length - 1)].taskId
    );
  };

  const jumpTo = (direction: JumpDirection) => {
    if (!selectedTask) {
      return;
    }
    const taskListOfInterest = selectedTask.isCompleted
      ? completedTasks
      : uncompletedTasks;
    const index =
      direction === JumpDirection.TOP ? 0 : taskListOfInterest.length - 1;
    setSelectedId(taskListOfInterest[index].taskId);
  };

  const completeTask = () => {
    setUnsortedTasks(
      unsortedTasks.map((task) =>
        task.taskId === selectedId
          ? { ...task, isCompleted: !task.isCompleted }
          : task
      )
    );
    navigateTasks(-1);
  };

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
      callback: () => jumpTo(JumpDirection.BOTTOM),
    },
    {
      keyboardEvent: { key: "T" },
      callback: () => jumpTo(JumpDirection.TOP),
    },
    {
      keyboardEvent: { key: "Enter", metaKey: true },
      callback: completeTask,
    },
  ];

  useKeyboardControl(keyboardHooks);

  return (
    <div className={styles.taskContainer}>
      <VerticallyCenteredList scrollAmount={`${scrollAmount}vh`}>
        <TaskList tasks={tasks} selectedTaskId={selectedId} />
      </VerticallyCenteredList>
    </div>
  );
}
