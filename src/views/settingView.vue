<template>
  <div>
    <h1>スタッフ用管理画面</h1>

    <div class="container">
      <div class="block">
        <el-button class="block__button" type="primary" @click="resetCounter">メッセージを<br />既読にする</el-button>
        <p>ページタイトルの<br />未読メッセージの数を０にする</p>
      </div>

      <div class="block">
        <el-button class="block__button" type="danger" @click="deleteAllComment('removeAll')">コメントを<br />全て削除する</el-button>
        <p>メルマガ原稿確認にある<br />全てのコメントを削除</p>
      </div>
    </div>
  </div>
</template>

<script>
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../service/firebase"; // Make sure this path matches your Firebase config import
import { mapActions } from "vuex";

export default {
  name: "ResetCounterButton",
  methods: {
    ...mapActions(["deleteMessagesWithTitle"]),

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

    //delete all comments
    async deleteAllComment(removeAll) {
      try {
        await this.$store.dispatch("deleteMessagesWithTitle", removeAll);
      } catch (error) {
        console.error("Error deleting message title:", error);
      }
    },
  },
};
</script>

<style scoped>
.block {
  border-bottom: 1px solid #ebeef5;

  padding: 2rem 0;
}

.block__button {
  margin: 20px 0 10px;
  padding: 5px 25px;
  line-height: 1.35;
  height: unset;
}
</style>
