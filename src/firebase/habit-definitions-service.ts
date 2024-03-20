import { QueryDocumentSnapshot } from "firebase/firestore";
import { collection, getDocs } from "firebase/firestore";
import { HabitDefinition } from "@/interfaces/Interfaces";
import { USER_ID_REMOVE_THIS, firestore_db } from "./firebase";

const habitDefinitionsCollection = collection(
  firestore_db,
  "user_data",
  USER_ID_REMOVE_THIS,
  "habit_definitions"
);

const documentToHabitDefinition = (
  doc: QueryDocumentSnapshot
): HabitDefinition => {
  const docData = doc.data();
  return {
    habitId: doc.id,
    habitName: docData.habit_name,
    habitDescription: docData.habit_description,
    habitScbedule: docData.habit_schedule,
  };
};

export { habitDefinitionsCollection, documentToHabitDefinition };
