"use client";

import {
  QueryDocumentSnapshot,
  Timestamp,
  addDoc,
  deleteDoc,
  doc,
  getFirestore,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { collection, getDocs } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { DatabaseTaskData, TaskData } from "@/interfaces/Task";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_MEASUREMENT_ID,
};
const USER_ID_REMOVE_THIS = "QLxM7sNafoUJyooxiqYuJBQCtLG3";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const heapCollection = collection(db, "user_data", USER_ID_REMOVE_THIS, "heap");

const taskDataToDatabaseTask = (taskData: TaskData): DatabaseTaskData => {
  return {
    taskText: taskData.taskText,
    isCompleted: taskData.isCompleted,
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
