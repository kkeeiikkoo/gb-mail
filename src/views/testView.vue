<template>
  <div>
    <h1>スタッフ用管理画面</h1>
    <el-button class="button" type="primary" @click="resetCounter">メッセージを<br />既読にする</el-button>
    <p>※ページタイトルの未読メッセージの数を０にする</p>
  </div>
</template>

<script>
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../service/firebase"; // Make sure this path matches your Firebase config import

export default {
  name: "ResetCounterButton",
  methods: {
    async resetCounter() {
      const counterRef = doc(db, "counters", "unreadCount");
      try {
        await updateDoc(counterRef, {
          count: 0,
        });
        console.log("Counter reset to 0 successfully.");
      } catch (error) {
        console.error("Error resetting counter:", error);
      }
    },
  },
};
</script>

<style scoped>
.button {
  margin: 20px 0 10px;
  padding: 5px 25px;
  line-height: 1.35;
  height: unset;
}
</style>
