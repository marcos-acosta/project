import {
  QueryDocumentSnapshot,
  doc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { collection, getDocs } from "firebase/firestore";
import { HabitTrackerDate, TaskData } from "@/interfaces/Interfaces";
import { USER_ID_REMOVE_THIS, firestore_db } from "./firebase";
import { habitDefinitionsCollection } from "./habit-definitions-service";

const HABIT_SCHEDULE = "habit_schedule";
const ORDER_VALUE = "order_value";

const habitTrackerCollection = collection(
  firestore_db,
  "user_data",
  USER_ID_REMOVE_THIS,
  "habit_tracker"
);

const documentToHabitTrackerDate = (
  doc: QueryDocumentSnapshot
): HabitTrackerDate => {
  const docData = doc.data();
  return {
    dateString: doc.id,
    dateObject: new Date(doc.id),
    habitLog: docData.habit_log,
  };
};

const getAllHabitTrackerDates = async (): Promise<HabitTrackerDate[]> => {
  return getDocs(habitTrackerCollection).then((querySnapshot) =>
    querySnapshot.docs.map(documentToHabitTrackerDate)
  );
};

const updateTrackerInDatabase = async (
  date: string,
  habitId: string,
  value: string
) => {
  try {
    await setDoc(
      doc(habitTrackerCollection, date),
      {
        habit_log: { [habitId]: value },
      },
      { merge: true }
    );
  } catch (e) {
    console.error("Error editing document: ", e);
  }
};

const updateHabitDefinitionInDatabase = async (
  habitId: string,
  key: string,
  value: any
) => {
  try {
    await setDoc(
      doc(habitDefinitionsCollection, habitId),
      {
        [key]: value,
      },
      { merge: true }
    );
  } catch (e) {
    console.error("Error editing document: ", e);
  }
};

const updateTrackerValuesInDatabase = async (
  date: string,
  newTrackerValues: { [key: string]: string }
) => {
  try {
    await setDoc(
      doc(habitTrackerCollection, date),
      {
        habit_log: newTrackerValues,
      },
      { merge: true }
    );
  } catch (e) {
    console.error("Error editing document: ", e);
  }
};

export {
  habitTrackerCollection,
  HABIT_SCHEDULE,
  ORDER_VALUE,
  getAllHabitTrackerDates,
  documentToHabitTrackerDate,
  updateTrackerInDatabase,
  updateTrackerValuesInDatabase,
  updateHabitDefinitionInDatabase,
};
