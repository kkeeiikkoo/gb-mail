// store/index.js
import { createStore } from "vuex";
import { db } from "../service/firebase";
import { collection, getDocs, addDoc, serverTimestamp, deleteDoc, query, where } from "firebase/firestore";
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
    async fetchDataFromFirebase({ commit }) {
      const querySnapshot = await getDocs(collection(db, "messages"));
      const messages: string[] = [];
      querySnapshot.forEach((doc: any) => {
        messages.push({
          id: doc.id,
          ...doc.data(),
          // createdAt: doc.data().createdAt.toDate(), // Convert timestamp to Date object if needed
        });
      });
      commit("setMessages", messages);
    },
    async deleteMessagesWithTitle({ commit }, targetTitle) {
      const messagesRef = collection(db, "messages");
      const q = query(messagesRef, where("title", "==", targetTitle));

      const querySnapshot = await getDocs(q);
      const deletePromises: any[] = [];

      querySnapshot.forEach((doc) => {
        // console.log(`Deleting doc id ${doc.id} with title ${targetTitle}`);
        deletePromises.push(deleteDoc(doc.ref)); // Delete each document
      });

      // Wait for all deletions to complete
      await Promise.all(deletePromises);

      // Optional: Commit any mutations to Vuex state if necessary
      commit("removeDeletedMessages", targetTitle);
    },
    async sendMessage({ commit, dispatch }, { messageContent, additionalData }) {
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
  },
});
