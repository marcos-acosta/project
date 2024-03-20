import {
  QueryDocumentSnapshot,
  Timestamp,
  deleteDoc,
  doc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { collection, getDocs } from "firebase/firestore";
import { DatabaseTaskData, TaskData } from "@/interfaces/Interfaces";
import { USER_ID_REMOVE_THIS, firestore_db } from "./firebase";

const heapCollection = collection(
  firestore_db,
  "user_data",
  USER_ID_REMOVE_THIS,
  "heap"
);

const taskDataToDatabaseTask = (taskData: TaskData): DatabaseTaskData => {
  return {
    taskText: taskData.taskText,
    isCompleted: taskData.isCompleted,
    isBlocked: taskData.isBlocked,
    creationTime: new Timestamp(taskData.creationTime, 0),
    sortingTime: new Timestamp(taskData.sortingTime, 0),
    completionTime: taskData.completionTime
      ? new Timestamp(taskData.completionTime, 0)
      : null,
    notes: taskData.notes,
  };
};

const partialTaskDataToDatabaseTask = (
  partialTaskData: Partial<TaskData>
): Partial<DatabaseTaskData> => {
  let databaseTask: Partial<DatabaseTaskData> = {};
  if (partialTaskData.taskText !== undefined) {
    databaseTask.taskText = partialTaskData.taskText;
  }
  if (partialTaskData.isCompleted !== undefined) {
    databaseTask.isCompleted = partialTaskData.isCompleted;
  }
  if (partialTaskData.isBlocked !== undefined) {
    databaseTask.isBlocked = partialTaskData.isBlocked;
  }
  if (partialTaskData.creationTime) {
    databaseTask.creationTime = new Timestamp(partialTaskData.creationTime, 0);
  }
  if (partialTaskData.sortingTime) {
    databaseTask.sortingTime = new Timestamp(partialTaskData.sortingTime, 0);
  }
  if (partialTaskData.completionTime !== undefined) {
    databaseTask.completionTime = partialTaskData.completionTime
      ? new Timestamp(partialTaskData.completionTime, 0)
      : null;
  }
  if (partialTaskData.notes !== undefined) {
    databaseTask.notes = partialTaskData.notes;
  }
  return databaseTask;
};

const documentToTaskData = (doc: QueryDocumentSnapshot): TaskData => {
  const docData = doc.data();
  return {
    taskText: docData.taskText,
    taskId: doc.id,
    isCompleted: docData.isCompleted,
    isBlocked: docData.isBlocked,
    creationTime: docData.creationTime.seconds,
    sortingTime: docData.sortingTime.seconds,
    completionTime: docData.completionTime
      ? docData.completionTime.seconds
      : null,
    notes: docData.notes,
  };
};

const getAllTasks = async (): Promise<TaskData[]> => {
  return getDocs(heapCollection).then((querySnapshot) =>
    querySnapshot.docs.map(documentToTaskData)
  );
};

const addTaskToDatabase = async (id: string, newTaskData: TaskData) => {
  try {
    await setDoc(doc(heapCollection, id), taskDataToDatabaseTask(newTaskData));
  } catch (e) {
    console.error("Error adding document: ", e);
  }
};

const editTaskInDatabase = async (
  id: string,
  newTaskData: Partial<TaskData>
) => {
  try {
    await updateDoc(
      doc(heapCollection, id),
      partialTaskDataToDatabaseTask(newTaskData)
    );
  } catch (e) {
    console.error("Error editing document: ", e);
  }
};

const deleteTaskFromDatabase = async (id: string) => {
  try {
    await deleteDoc(doc(heapCollection, id));
  } catch (e) {
    console.log("Error deleting document: ", e);
  }
};

export {
  getAllTasks,
  addTaskToDatabase,
  heapCollection,
  documentToTaskData,
  deleteTaskFromDatabase,
  editTaskInDatabase,
};
