import React from "react";
import Task from "./Task";
import { TaskData } from "@/interfaces/Task";

interface TaskListProps {
  tasks: TaskData[];
  selectedTaskId: string;
}

export default function TaskList(props: TaskListProps) {
  return (
    <div>
      {props.tasks.map((task) => (
        <Task
          taskText={task.taskText}
          key={task.taskId}
          isSelected={props.selectedTaskId === task.taskId}
        />
      ))}
    </div>
  );
}
