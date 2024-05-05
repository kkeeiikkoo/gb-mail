<template>
  <el-dialog :show-close="false">
    <template #header="{ close }">
      <div class="my-header">
        <div class="flex">
          <h4>
            文面： <el-button @click="showSimpleMailContent = !showSimpleMailContent">モード：{{ showSimpleMailContentButtonText }}</el-button>
          </h4>
        </div>
        <el-button type="danger" @click="close">
          <el-icon><Close /></el-icon> クローズ
        </el-button>
      </div>
    </template>

    <div class="dialog-content" style="overflow-y: auto">
      <div>
        <div class="mail-content-area">
          <div v-if="showSimpleMailContent" class="simple-mail-content">
            <div v-if="isLoading" class="loader"></div>

            <h2 v-if="showSimpleMailTitle" class="mb-3" v-html="formatMultiline(showSimpleMailTitle)"></h2>
            <div v-html="mailData[mailIndex].mailContent"></div>
          </div>
          <MailMagazine v-if="!showSimpleMailContent">
            <template v-slot:mail-contents>
              <div class="simple-mail-conten" v-html="mailData[mailIndex].mailContent"></div>
            </template>
          </MailMagazine>
        </div>
      </div>
    </div>

    <!-- <template #footer>
        <span class="dialog-footer">
          <el-button @click="visible = false">Cancel</el-button>
          <el-button type="primary" @click="visible = false">戻る</el-button>
        </span>
      </template> -->
  </el-dialog>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { Close } from "@element-plus/icons-vue";
import MailMagazine from "@/views/template/mailMagazine.vue";

export default defineComponent({
  name: "MailModal",
  components: {
    Close,
    MailMagazine,
  },

  props: {
    mailData: Array,
    mailIndex: Number,
    isLoading: Boolean,
    showSimpleMailTitle: String,
  },

  data() {
    return {
      showSimpleMailContent: true,
      showSimpleMailContentText: "簡易表示",
    };
  },

  setup() {
    return {
      Close,
    };
  },

  computed: {
    showSimpleMailContentButtonText(): string {
      return this.showSimpleMailContent ? "簡易表示" : "詳細表示";
    },
  },

  methods: {
    formatMultiline(text: string) {
      return text.replace(/\n/g, "<br>");
    },
  },
});
</script>

<style scoped lang="scss">
.my-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 50px;
}

.mail-content-area {
  background-color: #f6fafd;
  padding: 3rem;
  max-width: 960px;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;

  @media screen and (max-width: 480px) {
    padding: 1rem;
  }
}

.simple-mail-content {
  margin: 0 auto;
  text-align: left;
  padding: 2rem 3rem;
  background-color: #fff;
  box-sizing: border-box;

  @media screen and (max-width: 480px) {
    padding: 1rem;
  }
}
</style>
