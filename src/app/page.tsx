"use client";

import styles from "./page.module.css";
import { TaskData } from "@/interfaces/Task";
import VerticallyCenteredList from "@/components/VerticallyCenteredList";
import TaskList from "@/components/TaskList";
import { useState } from "react";
import useKeyboardControl, { KeyboardHook } from "react-keyboard-control";
import { v4 as uuidv4 } from "uuid";
import { clip } from "@/util";
import DetailPanel from "@/components/DetailPanel";

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

const TASK_HEIGHT_IN_VH = 6;
const DIVIDER_HEIGHT_IN_VH = 3;

enum Direction {
  UP,
  DOWN,
}

const sortUncompletedTasks = (a: TaskData, b: TaskData) =>
  b.sortingTime - a.sortingTime;

const sortCompletedTasks = (a: TaskData, b: TaskData) =>
  a.completionTime && b.completionTime
    ? a.completionTime - b.completionTime
    : 0;

export default function Home() {
  const [selectedId, setSelectedId] = useState("abc");
  const [unsortedTasks, setUnsortedTasks] = useState(INITIAL_TASKS);
  const [currentText, setCurrentText] = useState("");
  const [inEditMode, setInEditMode] = useState(false);
  const [temporaryTask, setTemporaryTask] = useState(null as TaskData | null);
  const [showDetails, setShowDetails] = useState(false);
  const [currentNotes, setCurrentNotes] = useState("");
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const uncompletedTasks = unsortedTasks
    .filter((task) => !task.isCompleted)
    .sort(sortUncompletedTasks);
  const completedTasks = unsortedTasks
    .filter((task) => task.isCompleted)
    .sort(sortCompletedTasks);
  const tasks = temporaryTask
    ? [...completedTasks, temporaryTask, ...uncompletedTasks]
    : [...completedTasks, ...uncompletedTasks];

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

  const navigateAfterToggleCompletion = () => {
    if (!selectedTask) {
      return;
    }
    if (!selectedTask.isCompleted) {
      if (selectedId === uncompletedTasks[0].taskId) {
        if (uncompletedTasks.length > 1) {
          navigateTasks(1);
        }
      } else {
        navigateTasks(-1);
      }
    }
  };

  const jumpTo = (direction: Direction, absolute: boolean) => {
    if (!selectedTask) {
      return;
    }
    if (absolute) {
      setSelectedId(
        tasks[direction === Direction.UP ? 0 : tasks.length - 1].taskId
      );
    } else {
      const taskListOfInterest = selectedTask.isCompleted
        ? completedTasks
        : uncompletedTasks;
      const index =
        direction === Direction.UP ? 0 : taskListOfInterest.length - 1;
      setSelectedId(taskListOfInterest[index].taskId);
    }
  };

  const swapTask = (swapDirection: Direction) => {
    if (!selectedTask) {
      return;
    }
    if (
      (swapDirection === Direction.UP &&
        selectedId === uncompletedTasks[0].taskId) ||
      (swapDirection === Direction.DOWN &&
        selectedId === uncompletedTasks[uncompletedTasks.length - 1].taskId)
    ) {
      return;
    }
    const indexDifference = swapDirection === Direction.UP ? -1 : 1;
    const otherTask = tasks[selectedIndex + indexDifference];
    const selectedSortingTime = selectedTask.sortingTime;
    const otherTaskId = otherTask.taskId;
    const otherSortingTime = otherTask.sortingTime;
    setUnsortedTasks(
      unsortedTasks.map((task) =>
        task.taskId === selectedId
          ? { ...task, sortingTime: otherSortingTime }
          : task.taskId === otherTaskId
          ? { ...task, sortingTime: selectedSortingTime }
          : task
      )
    );
  };

  const completeTask = () => {
    setUnsortedTasks(
      unsortedTasks.map((task) =>
        task.taskId === selectedId
          ? {
              ...task,
              isCompleted: !task.isCompleted,
              completionTime: task.isCompleted
                ? task.completionTime
                : Date.now(),
              sortingTime: task.isCompleted
                ? uncompletedTasks.length > 0
                  ? uncompletedTasks[0].sortingTime + 1
                  : Date.now()
                : task.sortingTime,
            }
          : task
      )
    );
    navigateAfterToggleCompletion();
  };

  const beginEditing = () => {
    if (!selectedTask) {
      return;
    }
    setInEditMode(true);
    setCurrentText(selectedTask.taskText);
  };

  const finishEditing = () => {
    if (!selectedTask) {
      return;
    }
    if (temporaryTask) {
      setUnsortedTasks([
        ...unsortedTasks,
        { ...temporaryTask, taskText: currentText },
      ]);
      setTemporaryTask(null);
    } else {
      setUnsortedTasks(
        unsortedTasks.map((task) =>
          task.taskId === selectedId ? { ...task, taskText: currentText } : task
        )
      );
    }
    setInEditMode(false);
    setCurrentText("");
  };

  const addTask = () => {
    const new_id = uuidv4();
    setTemporaryTask({
      taskText: "",
      isCompleted: false,
      creationTime: Date.now(),
      sortingTime:
        uncompletedTasks.length > 0
          ? uncompletedTasks[0].sortingTime + 1
          : Date.now(),
      completionTime: null,
      taskId: new_id,
      notes: "",
    });
    setInEditMode(true);
    setSelectedId(new_id);
    setCurrentText("");
  };

  const navigateAfterTaskDisappears = () => {
    if (!selectedTask || tasks.length === 1) {
      return;
    }
    // If this is the very last task
    if (selectedIndex === tasks.length - 1) {
      // As long as there's at least 2 tasks, there is one before it
      if (tasks.length > 1) {
        setSelectedId(tasks[selectedIndex - 1].taskId);
      }
    }
    // Not the last task
    else {
      // If this is the last completed task, but there's another completed task before it
      if (
        selectedTask.isCompleted &&
        !tasks[selectedIndex + 1].isCompleted &&
        completedTasks.length > 1
      ) {
        setSelectedId(tasks[selectedIndex - 1].taskId);
      }
      // In all other cases, move down (safe b/c it's not the last task)
      else {
        setSelectedId(tasks[selectedIndex + 1].taskId);
      }
    }
  };

  const cancelEditOrCreate = () => {
    if (temporaryTask) {
      setTemporaryTask(null);
      if (uncompletedTasks.length > 0) {
        setSelectedId(uncompletedTasks[0].taskId);
      } else if (completedTasks && completedTasks.length > 0) {
        setSelectedId(completedTasks[completedTasks.length - 1].taskId);
      }
    }
    setInEditMode(false);
    setCurrentText("");
    setIsEditingNotes(false);
    setCurrentNotes("");
  };

  const deleteTask = () => {
    setUnsortedTasks(tasks.filter((task) => task.taskId !== selectedId));
    navigateAfterTaskDisappears();
  };

  const beginEditingNotes = () => {
    if (!selectedTask) {
      return;
    }
    setShowDetails(true);
    setIsEditingNotes(true);
    setCurrentNotes(selectedTask.notes);
  };

  const finishEditingNotes = () => {
    if (!selectedTask) {
      return;
    }
    setUnsortedTasks(
      unsortedTasks.map((task) =>
        task.taskId === selectedId ? { ...task, notes: currentNotes } : task
      )
    );
    setIsEditingNotes(false);
    setCurrentNotes("");
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
      keyboardEvent: { key: "b" },
      callback: () => jumpTo(Direction.DOWN, false),
    },
    {
      keyboardEvent: { key: "t" },
      callback: () => jumpTo(Direction.UP, false),
    },
    {
      keyboardEvent: { key: "B" },
      callback: () => jumpTo(Direction.DOWN, true),
    },
    {
      keyboardEvent: { key: "T" },
      callback: () => jumpTo(Direction.UP, true),
    },
    {
      keyboardEvent: { key: " " },
      callback: completeTask,
    },
    {
      keyboardEvent: { key: "J" },
      callback: () => swapTask(Direction.DOWN),
      allowWhen: selectedTask && !selectedTask.isCompleted,
    },
    {
      keyboardEvent: { key: "K" },
      callback: () => swapTask(Direction.UP),
      allowWhen: selectedTask && !selectedTask.isCompleted,
    },
    {
      keyboardEvent: [{ key: "e" }, { key: "t" }],
      callback: beginEditing,
      allowWhen: !inEditMode && !isEditingNotes,
      preventDefault: true,
    },
    {
      keyboardEvent: { key: "Enter", metaKey: true },
      callback: finishEditing,
      allowWhen: inEditMode && currentText.length > 0,
      allowOnTextInput: true,
    },
    {
      keyboardEvent: { key: "a" },
      callback: addTask,
      preventDefault: true,
    },
    {
      keyboardEvent: { key: "Escape" },
      callback: cancelEditOrCreate,
      allowOnTextInput: true,
    },
    {
      keyboardEvent: [{ key: "d" }, { key: "d" }],
      callback: deleteTask,
    },
    {
      keyboardEvent: { key: "q" },
      callback: () => setShowDetails(!showDetails),
    },
    {
      keyboardEvent: [{ key: "e" }, { key: "n" }],
      callback: beginEditingNotes,
      allowWhen: !isEditingNotes,
      preventDefault: true,
    },
    {
      keyboardEvent: { key: "Enter", metaKey: true },
      callback: finishEditingNotes,
      allowWhen: isEditingNotes,
      allowOnTextInput: true,
      preventDefault: true,
    },
  ];

  useKeyboardControl(keyboardHooks);

  return (
    <div>
      {showDetails && selectedTask && (
        <DetailPanel
          creationTime={selectedTask.creationTime}
          completionTime={selectedTask.completionTime}
          currentNotes={currentNotes}
          setCurrentNotes={setCurrentNotes}
          isEditingNotes={isEditingNotes}
          notes={selectedTask.notes}
          cancel={cancelEditOrCreate}
        />
      )}
      <div className={styles.taskContainer}>
        <VerticallyCenteredList scrollAmount={`${scrollAmount}vh`}>
          <TaskList
            tasks={tasks}
            selectedTaskId={selectedId}
            inEditMode={inEditMode}
            finishEditing={finishEditing}
            currentText={currentText}
            setCurrentText={setCurrentText}
            cancel={cancelEditOrCreate}
          />
        </VerticallyCenteredList>
      </div>
    </div>
  );
}
