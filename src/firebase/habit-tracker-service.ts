import { QueryDocumentSnapshot } from "firebase/firestore";
import { collection, getDocs } from "firebase/firestore";
import { HabitTrackerDate, TaskData } from "@/interfaces/Interfaces";
import { USER_ID_REMOVE_THIS, firestore_db } from "./firebase";

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

export {
  habitTrackerCollection,
  getAllHabitTrackerDates,
  documentToHabitTrackerDate,
};
