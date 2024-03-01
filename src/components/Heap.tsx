import styles from "./Heap.module.css";
import { TaskData, View } from "@/interfaces/Task";
import VerticallyCenteredList from "@/components/VerticallyCenteredList";
import TaskList from "@/components/TaskList";
import { useEffect, useState } from "react";
import useKeyboardControl, {
  KeyboardHook,
  TypedKey,
} from "react-keyboard-control";
import { v4 as uuidv4 } from "uuid";
import {
  clip,
  formatMonthYear,
  isMillisInMonth,
  nextMonth,
  previousMonth,
} from "@/util";
import DetailPanel from "@/components/DetailPanel";
import KeypressDisplay from "@/components/KeypressDisplay";

const TASK_HEIGHT_IN_VH = 6;
const DIVIDER_HEIGHT_IN_VH = 3;
const MONTH_YEAR_TITLE_HEIGHT_IN_VH = 6;
const RECENTLY_COMPLETED_TASKS_TO_KEEP = 10;

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

interface HeapProps {
  unsortedTasks: TaskData[];
  setUnsortedTasks: (newTasks: TaskData[]) => void;
  view: View;
  setView: (v: View) => void;
  showDetails: boolean;
  setShowDetails: (b: boolean) => void;
}

const getIdealFirstTask = (tasks: TaskData[]) => {
  if (tasks.length === 0) {
    return null;
  } else {
    const firstUncompleted = tasks.find((task) => !task.isCompleted);
    if (firstUncompleted) {
      return firstUncompleted.taskId;
    } else {
      return tasks[0].taskId;
    }
  }
};

export default function Heap(props: HeapProps) {
  const [currentText, setCurrentText] = useState("");
  const [inEditMode, setInEditMode] = useState(false);
  const [temporaryTask, setTemporaryTask] = useState(null as TaskData | null);
  const [currentNotes, setCurrentNotes] = useState("");
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [monthYear, setMonthYear] = useState([
    new Date().getMonth(),
    new Date().getFullYear(),
  ]);
  const uncompletedTasks = props.unsortedTasks
    .filter((task) => !task.isCompleted)
    .sort(sortUncompletedTasks);
  const completedTasks = props.unsortedTasks
    .filter((task) => task.isCompleted)
    .sort(sortCompletedTasks);
  const uncompletedTasksForView =
    props.view === View.HEAP_ARCHIVE ? [] : uncompletedTasks;
  const completedTasksForView =
    props.view === View.HEAP_ARCHIVE
      ? completedTasks.filter((task) =>
          isMillisInMonth(task.completionTime, monthYear)
        )
      : completedTasks.slice(-1 * RECENTLY_COMPLETED_TASKS_TO_KEEP);
  const tasks = temporaryTask
    ? [...completedTasksForView, temporaryTask, ...uncompletedTasksForView]
    : [...completedTasksForView, ...uncompletedTasksForView];

  const [selectedId_, setSelectedId] = useState(getIdealFirstTask(tasks));
  const selectedId = tasks.find((task) => task.taskId === selectedId_)
    ? selectedId_
    : getIdealFirstTask(tasks);

  const selectedIndex = tasks.findIndex((task) => task.taskId === selectedId);
  const selectedTask = selectedIndex >= 0 ? tasks[selectedIndex] : null;

  const dividerPresent = completedTasks.length > 0;
  const scrollAmount = selectedTask
    ? -(
        tasks.indexOf(selectedTask) * TASK_HEIGHT_IN_VH +
        (dividerPresent && !selectedTask.isCompleted
          ? DIVIDER_HEIGHT_IN_VH
          : 0) +
        (props.view === View.HEAP_ARCHIVE ? MONTH_YEAR_TITLE_HEIGHT_IN_VH : 0)
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
    props.setUnsortedTasks(
      props.unsortedTasks.map((task) =>
        task.taskId === selectedId
          ? { ...task, sortingTime: otherSortingTime }
          : task.taskId === otherTaskId
          ? { ...task, sortingTime: selectedSortingTime }
          : task
      )
    );
  };

  const completeTask = () => {
    props.setUnsortedTasks(
      props.unsortedTasks.map((task) =>
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
      props.setUnsortedTasks([
        ...props.unsortedTasks,
        { ...temporaryTask, taskText: currentText },
      ]);
      setTemporaryTask(null);
    } else {
      props.setUnsortedTasks(
        props.unsortedTasks.map((task) =>
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
    props.setUnsortedTasks(tasks.filter((task) => task.taskId !== selectedId));
    navigateAfterTaskDisappears();
  };

  const beginEditingNotes = () => {
    if (!selectedTask) {
      return;
    }
    props.setShowDetails(true);
    setIsEditingNotes(true);
    setCurrentNotes(selectedTask.notes);
  };

  const finishEditingNotes = () => {
    if (!selectedTask) {
      return;
    }
    props.setUnsortedTasks(
      props.unsortedTasks.map((task) =>
        task.taskId === selectedId ? { ...task, notes: currentNotes } : task
      )
    );
    setIsEditingNotes(false);
    setCurrentNotes("");
  };

  const keyboardHooks: KeyboardHook[] = [
    {
      keyboardEvent: [{ key: "h" }, { key: "h" }],
      callback: () => props.setView(View.HEAP_HOME),
    },
    {
      keyboardEvent: [{ key: "h" }, { key: "a" }],
      callback: () => props.setView(View.HEAP_ARCHIVE),
    },
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
      allowWhen:
        props.view === View.HEAP_HOME &&
        selectedTask &&
        !selectedTask.isCompleted,
    },
    {
      keyboardEvent: { key: "K" },
      callback: () => swapTask(Direction.UP),
      allowWhen:
        props.view === View.HEAP_HOME &&
        selectedTask &&
        !selectedTask.isCompleted,
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
      allowWhen: props.view === View.HEAP_HOME,
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
      callback: () => props.setShowDetails(!props.showDetails),
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
      allowWhen: isEditingNotes && currentNotes.length > 0,
      allowOnTextInput: true,
    },
    {
      keyboardEvent: { key: "m" },
      callback: () => setMonthYear(nextMonth(monthYear)),
      allowWhen: props.view === View.HEAP_ARCHIVE,
    },
    {
      keyboardEvent: { key: "M" },
      callback: () => setMonthYear(previousMonth(monthYear)),
      allowWhen: props.view === View.HEAP_ARCHIVE,
    },
    {
      keyboardEvent: { key: "." },
      callback: () =>
        setMonthYear([new Date().getMonth(), new Date().getFullYear()]),
      allowWhen: props.view === View.HEAP_ARCHIVE,
    },
  ];

  const currentSequence: TypedKey[] = useKeyboardControl(keyboardHooks);

  return (
    <div>
      {props.showDetails && selectedTask && (
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
          <>
            {props.view === View.HEAP_ARCHIVE && (
              <div className={styles.monthDisplay}>
                {formatMonthYear(monthYear)}
              </div>
            )}
            <TaskList
              tasks={tasks}
              selectedTaskId={selectedId}
              inEditMode={inEditMode}
              finishEditing={finishEditing}
              currentText={currentText}
              setCurrentText={setCurrentText}
              cancel={cancelEditOrCreate}
            />
          </>
        </VerticallyCenteredList>
      </div>
      {currentSequence.length > 0 && (
        <div className={styles.keypressDisplayContainer}>
          <KeypressDisplay currentSequence={currentSequence} />
        </div>
      )}
    </div>
  );
}