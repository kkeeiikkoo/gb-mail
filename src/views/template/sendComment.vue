<template>
  <div>
    <el-input v-model="messageContent" style="width: 250px" autosize type="textarea" placeholder="コメントはこちら" />
    <div class="flex">
      <el-button class="button" type="primary" @click="editComfirm(mailTitle, mailDate)">コメント発送</el-button>
      <el-button class="button" type="danger" @click="deleteSpecificTitle(mailTitle)">コメント削除</el-button>
    </div>
  </div>
</template>

<script>
import { mapActions } from "vuex";

export default {
  name: "SendComment",
  props: {
    mailDate: String,
    mailTitle: String,
    mailIndex: Number,
  },
  data() {
    return {
      messageContent: "",
    };
  },
  methods: {
    ...mapActions(["sendMessage", "deleteMessagesWithTitle"]),
    editComfirm(mailTitle, mailDate) {
      if (this.messageContent.trim()) {
        this.sendMessage({
          messageContent: this.messageContent,
          additionalData: {
            title: mailTitle,
            date: mailDate,
          },
        });
        this.messageContent = "";
        this.$emit("dataChanged");
      } else {
        alert("コメントを入力してください。");
      }
    },
    deleteSpecificTitle(mailTitle) {
      this.$store.dispatch("deleteMessagesWithTitle", mailTitle);
      this.$emit("dataChanged");
    },
  },
};
</script>

<style lang="scss" scoped>
.button {
  margin-top: 10px;
}

.flex {
  display: flex;
}
</style>
