import { doc, getDoc, setDoc, updateDoc, increment, onSnapshot } from "firebase/firestore";
import { db } from "./firebase"; // Ensure your Firebase SDK is properly initialized and db is imported

export const initializeUnreadCount = async () => {
  const countRef = doc(db, "counters", "unreadCount"); // specifies the path to the document
  const docSnap = await getDoc(countRef);

  if (!docSnap.exists()) {
    // If the document does not exist, create it with the initial count of 0
    await setDoc(countRef, { count: 0 });
    console.log("Unread count initialized.");
  } else {
    console.log("Unread count already exists.");
  }
};

export const incrementMessageCount = async () => {
  const countRef = doc(db, "counters", "unreadCount");
  await updateDoc(countRef, {
    count: increment(1),
  });
};

export function changeTitle() {
  const counterRef = doc(db, "counters", "unreadCount");
  onSnapshot(
    counterRef,
    (doc) => {
      if (doc.exists()) {
        const unreadCount = doc.data().count;
        if (unreadCount > 0) {
          document.title = `[${unreadCount}] gb-mail`; // Show count if greater than 0
        } else {
          document.title = "gb-mail"; // Default title when count is 0
        }
      } else {
        console.error("Counter document does not exist!");
      }
    },
    (error) => {
      console.error("Error listening to the counter:", error);
    }
  );
}

initializeUnreadCount(); // Call this function on app initialization or as needed
