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
  new_tracker_values: { [key: string]: string }
) => {
  try {
    await setDoc(
      doc(habitTrackerCollection, date),
      {
        habit_log: new_tracker_values,
      },
      { merge: true }
    );
  } catch (e) {
    console.error("Error editing document: ", e);
  }
};

export {
  habitTrackerCollection,
  getAllHabitTrackerDates,
  documentToHabitTrackerDate,
  updateTrackerInDatabase,
  updateTrackerValuesInDatabase,
  updateHabitDefinitionInDatabase,
};
