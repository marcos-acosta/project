import styles from "./Heap.module.css";
import {
  MaybeMonthPeriod,
  TaskData,
  UpDownDirection,
} from "@/interfaces/Interfaces";
import VerticallyCenteredList from "@/components/VerticallyCenteredList";
import TaskList from "@/components/heap/TaskList";
import { useEffect, useState } from "react";
import useKeyboardControl, {
  KeyboardHook,
  TypedKey,
} from "react-keyboard-control";
import { v4 as uuidv4 } from "uuid";
import {
  addMonths,
  clip,
  currentMonthPeriod,
  formatMonthYear,
  getNowInSeconds,
} from "@/util";
import DetailPanel from "@/components/heap/DetailPanel";
import {
  addTaskToDatabase,
  deleteTaskFromDatabase,
  editTaskInDatabase,
} from "@/firebase/heap-service";

const TASK_HEIGHT_IN_VH = 6;
const MONTH_YEAR_TITLE_HEIGHT_IN_VH = 6;

const sortUncompletedTasks = (a: TaskData, b: TaskData) =>
  b.sortingTime - a.sortingTime;

const sortCompletedTasks = (a: TaskData, b: TaskData) =>
  a.completionTime && b.completionTime
    ? b.completionTime - a.completionTime
    : 0;

const sortTasks = (a: TaskData, b: TaskData) =>
  a.isCompleted && b.isCompleted
    ? sortCompletedTasks(a, b)
    : !a.isCompleted && !b.isCompleted
    ? sortUncompletedTasks(a, b)
    : Number(a.isCompleted) - Number(b.isCompleted);

const selectFirstTaskIfPossible = (tasks: TaskData[]) =>
  tasks.length > 0 ? tasks[0].taskId : null;

const getTaskIndexIfPossible = (tasks: TaskData[], taskId: string | null) => {
  if (!taskId) {
    return null;
  }
  const index = tasks.findIndex((task) => task.taskId === taskId);
  return index === -1 ? null : index;
};

interface HeapProps {
  unsortedTasks: TaskData[];
  showDetails: boolean;
  setShowDetails: (b: boolean) => void;
  viewKeyhooks: KeyboardHook[];
  setCurrentSequence: (s: TypedKey[]) => void;
  monthPeriod: MaybeMonthPeriod;
  setMonthPeriod: (m: MaybeMonthPeriod) => void;
}

export default function Heap(props: HeapProps) {
  const [currentText, setCurrentText] = useState("");
  const [inEditMode, setInEditMode] = useState(false);
  const [temporaryTask, setTemporaryTask] = useState(null as TaskData | null);
  const [currentNotes, setCurrentNotes] = useState("");
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  const sortedTasks = props.unsortedTasks.sort(sortTasks);

  const tasks = temporaryTask ? [temporaryTask, ...sortedTasks] : sortedTasks;

  const [selectedId, setSelectedId] = useState(
    selectFirstTaskIfPossible(sortedTasks)
  );

  const selectedIndex = getTaskIndexIfPossible(tasks, selectedId);
  const selectedTask = selectedIndex != null ? tasks[selectedIndex] : null;
  const hasTaskSelected =
    selectedId != null && selectedIndex != null && selectedTask != null;

  const scrollAmount = -(
    (props.monthPeriod ? MONTH_YEAR_TITLE_HEIGHT_IN_VH : 0) +
    (selectedTask ? tasks.indexOf(selectedTask) * TASK_HEIGHT_IN_VH : 0)
  );

  const navigateTasks = (direction: number) => {
    if (!hasTaskSelected) {
      return;
    }
    setSelectedId(
      tasks[clip(selectedIndex + direction, 0, tasks.length - 1)].taskId
    );
  };

  const navigateAfterToggleCompletion = () => {
    if (!hasTaskSelected) {
      return;
    }
    // Only move to next task if we are *completing* a task.
    if (!selectedTask.isCompleted) {
      if (selectedId === tasks[0].taskId) {
        if (tasks.length > 1) {
          navigateTasks(1);
        }
      } else {
        navigateTasks(-1);
      }
    }
  };

  const jumpTo = (direction: UpDownDirection) => {
    if (tasks.length === 0) {
      return;
    }
    setSelectedId(
      tasks[direction === UpDownDirection.UP ? 0 : tasks.length - 1].taskId
    );
  };

  const swapTask = (swapDirection: UpDownDirection) => {
    if (!hasTaskSelected) {
      return;
    }
    if (
      (swapDirection === UpDownDirection.UP &&
        selectedId === tasks[0].taskId) ||
      (swapDirection === UpDownDirection.DOWN &&
        selectedId === tasks[tasks.length - 1].taskId)
    ) {
      return;
    }
    const indexDifference = swapDirection === UpDownDirection.UP ? -1 : 1;
    const otherTask = tasks[selectedIndex + indexDifference];
    const selectedSortingTime = selectedTask.sortingTime;
    const otherTaskId = otherTask.taskId;
    const otherSortingTime = otherTask.sortingTime;
    editTaskInDatabase(selectedId, { sortingTime: otherSortingTime });
    editTaskInDatabase(otherTaskId, { sortingTime: selectedSortingTime });
  };

  const toggleCompletion = () => {
    if (!hasTaskSelected) {
      return;
    }
    const willBeCompleted = !selectedTask.isCompleted;
    const newTask: Partial<TaskData> = {
      isCompleted: willBeCompleted,
      completionTime: willBeCompleted
        ? getNowInSeconds()
        : selectedTask.completionTime,
      sortingTime: selectedTask.sortingTime,
    };
    navigateAfterToggleCompletion();
    editTaskInDatabase(selectedId, newTask);
  };

  const beginEditing = () => {
    if (!hasTaskSelected) {
      return;
    }
    setInEditMode(true);
    setCurrentText(selectedTask.taskText);
  };

  const finishEditing = () => {
    if (!hasTaskSelected) {
      return;
    }
    if (temporaryTask) {
      const newTask: TaskData = {
        ...temporaryTask,
        taskText: currentText,
      };
      setTemporaryTask(null);
      setSelectedId(selectedId);
      addTaskToDatabase(selectedId, newTask);
    } else {
      editTaskInDatabase(selectedId, {
        taskText: currentText,
      });
    }
    setInEditMode(false);
    setCurrentText("");
  };

  const addTask = () => {
    const new_id = uuidv4();
    setTemporaryTask({
      taskText: "",
      isCompleted: false,
      isBlocked: false,
      creationTime: getNowInSeconds(),
      sortingTime:
        tasks.length > 0 ? tasks[0].sortingTime + 1 : getNowInSeconds(),
      completionTime: null,
      taskId: new_id,
      notes: "",
    });
    setInEditMode(true);
    setSelectedId(new_id);
    setCurrentText("");
  };

  const navigateWhenTaskDisappears = () => {
    if (!hasTaskSelected || tasks.length <= 1) {
      return;
    }
    if (selectedIndex === tasks.length - 1) {
      if (tasks.length > 1) {
        setSelectedId(tasks[selectedIndex - 1].taskId);
      }
    } else {
      setSelectedId(tasks[selectedIndex + 1].taskId);
    }
  };

  const cancelEditOrCreate = () => {
    if (temporaryTask) {
      setTemporaryTask(null);
      setSelectedId(selectFirstTaskIfPossible(sortedTasks));
    }
    setInEditMode(false);
    setCurrentText("");
    setIsEditingNotes(false);
    setCurrentNotes("");
  };

  const deleteTask = () => {
    if (!hasTaskSelected) {
      return;
    }
    navigateWhenTaskDisappears();
    deleteTaskFromDatabase(selectedId);
  };

  const beginEditingNotes = () => {
    if (!hasTaskSelected) {
      return;
    }
    props.setShowDetails(true);
    setIsEditingNotes(true);
    setCurrentNotes(selectedTask.notes);
  };

  const finishEditingNotes = () => {
    if (!hasTaskSelected) {
      return;
    }
    editTaskInDatabase(selectedId, { notes: currentNotes });
    setIsEditingNotes(false);
    setCurrentNotes("");
  };

  const toggleTaskBlocked = () => {
    if (!hasTaskSelected) {
      return;
    }
    editTaskInDatabase(selectedId, {
      isBlocked: !selectedTask.isBlocked,
    });
  };

  const keyboardHooks: KeyboardHook[] = [
    ...props.viewKeyhooks,
    {
      keyboardEvent: { key: "k" },
      callback: () => navigateTasks(-1),
      allowWhen: hasTaskSelected,
    },
    {
      keyboardEvent: { key: "j" },
      callback: () => navigateTasks(1),
      allowWhen: hasTaskSelected,
    },
    {
      keyboardEvent: { key: "w" },
      callback: () => jumpTo(UpDownDirection.UP),
    },
    {
      keyboardEvent: { key: "s" },
      callback: () => jumpTo(UpDownDirection.DOWN),
    },
    {
      keyboardEvent: { key: " " },
      callback: toggleCompletion,
      allowWhen: hasTaskSelected,
    },
    {
      keyboardEvent: { key: "J" },
      callback: () => swapTask(UpDownDirection.DOWN),
      allowWhen: hasTaskSelected && !props.monthPeriod,
    },
    {
      keyboardEvent: { key: "K" },
      callback: () => swapTask(UpDownDirection.UP),
      allowWhen: hasTaskSelected && !props.monthPeriod,
    },
    {
      keyboardEvent: [{ key: "e" }, { key: "t" }],
      callback: beginEditing,
      allowWhen: !inEditMode && !isEditingNotes && hasTaskSelected,
      preventDefault: true,
    },
    {
      keyboardEvent: { key: "Enter", metaKey: true },
      callback: finishEditing,
      allowWhen: inEditMode && currentText.length > 0 && hasTaskSelected,
      allowOnTextInput: true,
    },
    {
      keyboardEvent: { key: "a" },
      callback: addTask,
      preventDefault: true,
      allowWhen: !props.monthPeriod,
    },
    {
      keyboardEvent: { key: "Escape" },
      callback: cancelEditOrCreate,
      allowOnTextInput: true,
    },
    {
      keyboardEvent: [{ key: "d" }, { key: "d" }],
      callback: deleteTask,
      allowWhen: hasTaskSelected,
    },
    {
      keyboardEvent: { key: "q" },
      callback: () => props.setShowDetails(!props.showDetails),
    },
    {
      keyboardEvent: [{ key: "e" }, { key: "d" }],
      callback: beginEditingNotes,
      allowWhen: !isEditingNotes && hasTaskSelected,
      preventDefault: true,
    },
    {
      keyboardEvent: { key: "Enter", metaKey: true },
      callback: finishEditingNotes,
      allowWhen: isEditingNotes && hasTaskSelected,
      allowOnTextInput: true,
    },
    {
      keyboardEvent: { key: "m" },
      callback: () => props.setMonthPeriod(addMonths(props.monthPeriod, 1)),
      allowWhen: Boolean(props.monthPeriod),
    },
    {
      keyboardEvent: { key: "M" },
      callback: () => props.setMonthPeriod(addMonths(props.monthPeriod, -1)),
      allowWhen: Boolean(props.monthPeriod),
    },
    {
      keyboardEvent: { key: "." },
      callback: () => props.setMonthPeriod(currentMonthPeriod()),
      allowWhen: Boolean(props.monthPeriod),
    },
    {
      keyboardEvent: { key: "@" },
      callback: toggleTaskBlocked,
      allowWhen: hasTaskSelected && !selectedTask.isCompleted,
    },
    {
      keyboardEvent: { key: "," },
      callback: () =>
        props.setMonthPeriod(props.monthPeriod ? null : currentMonthPeriod()),
    },
  ];

  const currentSequence = useKeyboardControl(keyboardHooks);
  useEffect(() => {
    props.setCurrentSequence(currentSequence);
  }, [props.setCurrentSequence, currentSequence]);

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
            {props.monthPeriod && (
              <div className={styles.monthDisplay}>
                {formatMonthYear(props.monthPeriod)} ({tasks.length})
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
    </div>
  );
}
