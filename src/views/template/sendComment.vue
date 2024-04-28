<template>
  <div>
    <el-input class="input" v-model="messageContent" autosize type="textarea" placeholder="コメントはこちら" />
    <div class="flex">
      <div>
        <el-button class="button" type="primary" @click="editComfirm(mailTitle, mailDate)">コメント送信</el-button>
        <el-button class="button" type="danger" @click="deleteSpecificTitle(mailTitle)">コメント全削除</el-button>
      </div>
      <el-button class="button" plain @click="editComfirm(mailTitle, mailDate, 'これでOK!!')">許可する</el-button>
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

    // handle sending comment
    async editComfirm(mailTitle, mailDate, defaultContent = "") {
      if (defaultContent && !this.messageContent) {
        this.messageContent = defaultContent;
      }

      if (this.messageContent.trim()) {
        await this.sendMessage({
          messageContent: this.messageContent.replace(/\n/g, "<br>"),
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

    // handle deleting all comments with the same title
    async deleteSpecificTitle(mailTitle) {
      try {
        await this.$store.dispatch("deleteMessagesWithTitle", mailTitle);
        this.$emit("dataChanged");
      } catch (error) {
        console.error("Error deleting message title:", error);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.button {
  margin-top: 10px;

  @media screen and (max-width: 480px) {
    padding: 8px 12px;
  }
}

.flex {
  display: flex;
  justify-content: space-between;
}

.input {
  min-width: 400px;
  box-sizing: border-box;

  @media screen and (max-width: 480px) {
    min-width: 100%;
    border: 2px solid #1751ad;
  }
}

:deep(.el-textarea__inner) {
  height: 100px !important;

  @media screen and (max-width: 480px) {
    height: 150px !important;
  }
}

.el-button + .el-button {
  @media screen and (max-width: 480px) {
    margin-left: 8px;
  }
}
</style>
