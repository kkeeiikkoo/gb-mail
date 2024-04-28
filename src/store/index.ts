// store/index.js
import { createStore } from "vuex";
import { db } from "../service/firebase";
import { collection, getDocs, addDoc, serverTimestamp, deleteDoc, query, where, orderBy, doc } from "firebase/firestore";
import { incrementMessageCount } from "@/service/firebaseInit";

// Define an interface for what a message looks like
interface Message {
  id: string;
  text: string;
  createdAt: Date | null; // Use Date or null if timestamp might initially be absent
}

// Define the state structure
interface State {
  messages: Message[];
}

export default createStore({
  state: (): State => ({
    messages: [],
  }),
  mutations: {
    setMessages(state, payload: Message[]) {
      state.messages = payload;
    },
    addMessage(state, message: Message) {
      state.messages.push(message);
    },
    removeDeletedMessages(state, title) {
      state.messages = state.messages.filter((message: any) => message.title !== title);
    },
  },
  actions: {
    // when loading the app, fetch data from Firebase
    async fetchDataFromFirebase({ commit }) {
      const messagesRef = collection(db, "messages");

      const q = query(messagesRef, orderBy("createdAt", "asc")); // 'desc' sorts from newest to oldest

      try {
        const querySnapshot = await getDocs(q);
        const messages = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt.toDate(), // Ensure createdAt is a Firestore Timestamp
        }));
        commit("setMessages", messages);
      } catch (error) {
        console.error("Error fetching sorted messages:", error);
        // Handle error appropriately
      }
    },

    // Send a message to Firebase
    async sendMessage({ commit }, { messageContent, additionalData }) {
      try {
        const docRef = await addDoc(collection(db, "messages"), {
          text: messageContent,
          ...additionalData, // Spread additional data into the document fields
          createdAt: serverTimestamp(),
        });
        commit("addMessage", {
          id: docRef.id,
          text: messageContent,
          ...additionalData, // Also spread it into the state for Vuex
          createdAt: new Date(), // Temporary until the server timestamp is fetched
        });
        await incrementMessageCount(); // Increment the message count
      } catch (error) {
        console.error("Error adding message:", error);
      }
    },

    // Detect messages with a specific title and delete them (all messages with the same title are deleted)
    // If the target title is 'removeAll', then delete all messages
    async deleteMessagesWithTitle({ commit }, target): Promise<void> {
      const messagesRef = collection(db, "messages");
      let querySnapshot;

      if (target === "removeAll") {
        // Fetch all documents to delete everything
        querySnapshot = await getDocs(messagesRef);
        commit("setMessages", []);
      } else {
        // Initially fetch documents that match the specified title
        const q = query(messagesRef, where("title", "==", target));
        querySnapshot = await getDocs(q);

        // If no documents found by title and target seems like an ID, attempt deletion by ID
        if (querySnapshot.empty) {
          const docRef = doc(messagesRef, target); // Get a reference to the document by ID
          await deleteDoc(docRef); // Attempt to delete the document
          return; // Exit the function after handling by ID
        }
      }

      const deletePromises = querySnapshot.docs.map((doc) => deleteDoc(doc.ref));

      // Wait for all deletions to complete
      await Promise.all(deletePromises);

      // Commit removal action to Vuex store
      if (target !== "removeAll") {
        commit("removeDeletedMessages", target);
      }
    },
  },
});
