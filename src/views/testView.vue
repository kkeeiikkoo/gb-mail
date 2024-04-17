<template>
  <div class="message-form">
    <h2>Send Message to Firestore</h2>
    <div>
      <label>Message:</label>
      <input v-model="messageContent" placeholder="Enter message" />
    </div>
    <div>
      <label>Sheet Reference:</label>
      <input v-model="additionalData.sheetReference" placeholder="Enter sheet reference" />
    </div>
    <div>
      <label>Other Data:</label>
      <input v-model="additionalData.other" placeholder="Enter other data" />
    </div>
    <div>
      <label>More Data:</label>
      <input v-model="additionalData.other2" placeholder="Enter more data" />
    </div>
    <button @click="send">Send to Firestore</button>
  </div>
</template>

<script>
import { mapActions } from "vuex";

export default {
  data() {
    return {
      messageContent: "",
      additionalData: {
        sheetReference: "",
        other: "",
        other2: "",
      },
    };
  },
  methods: {
    ...mapActions(["sendMessage"]),
    send() {
      if (this.messageContent.trim()) {
        this.sendMessage({
          messageContent: this.messageContent,
          additionalData: this.additionalData,
        });
        this.messageContent = ""; // Clear the fields after sending
        this.additionalData = { sheetReference: "", other: "", other2: "" };
      } else {
        alert("Please enter a message before sending.");
      }
    },
  },
};
</script>

<style scoped>
.message-form {
  display: flex;
  flex-direction: column;
  max-width: 400px;
  margin: 20px;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  margin: auto;
}

.message-form div {
  margin-bottom: 10px;
}

.message-form label {
  font-weight: bold;
}

.message-form input {
  width: 100%;
  padding: 8px;
  margin-top: 5px;
}

.message-form button {
  padding: 10px 20px;
  cursor: pointer;
}
</style>
