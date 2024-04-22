<template>
  <div class="about">
    <div>
      <h1>メルマガ原稿確認</h1>

      <div class="show-mail-by-date">
        <div class="show-mail-by-date__button" :class="{ 'show-mail-by-date__button--active': showMailByDate === 'all' }" @click="showMailByDate = 'all'">全て表示</div>
        <div class="show-mail-by-date__button" :class="{ 'show-mail-by-date__button--active': showMailByDate === 'soon' }" @click="showMailByDate = 'soon'">直近のみ</div>
        <div class="show-mail-by-date__button" :class="{ 'show-mail-by-date__button--active': showMailByDate === 'future' }" @click="showMailByDate = 'future'">未送信のみ</div>
      </div>

      <div v-if="isLoading" class="loader"></div>
      <div class="mail-table">
        <div class="mail-table__title">
          <p>メルマガ名</p>
          <p>配信対象<br class="pcdn" />（内容）</p>
          <p>予定配信日</p>
          <p>緊急度</p>
        </div>
        <div class="mail-table__list" :class="{ 'mail-table__list--active': index === mailIndex }" v-for="(mail, index) in mailData" :key="index">
          <template v-if="shouldShowMail(mail)">
            <div class="mail-table__grid mb-half pt-1">
              <p class="mail-table__list-title bold">
                <el-button class="mr-1" type="warning" :icon="Document" circle @click="handleRowClick(mail, index)" />
                ▋<span v-html="formatMultiline(mail.mailTitle)"></span>
              </p>
              <p><span class="pcdn bold pcdn--inline-block">・配信対象：</span>{{ mail.mailTarget }}</p>
              <p><span class="pcdn bold pcdn--inline-block">・予定配信日：</span>{{ mail.mailDate }}</p>
              <div class="mail-alert">
                <span class="pcdn bold pcdn--inline-block">・緊急度：</span>
                <p class="mail-alert__text inline-block" :class="getAlertClass(mail.mailAlert)">{{ mail.mailAlert }}</p>
              </div>
              <div class="mail-table__edit">
                <el-button class="edit-button" :icon="ChatLineSquare" circle @click="editClick(index)">
                  <span class="pcdn pcdn--inline-block white">コメントはこちら</span>
                </el-button>
              </div>
            </div>

            <div class="flex-comment mb-2">
              <div class="mail-feedback" v-if="mail.mailFeedback">
                <div class="mail-feedback__item mb-1" v-for="item in mail.mailFeedback" :key="item">
                  <span class="mail-feedback--small bold">【コメント】</span><br />
                  <span v-html="item"></span>
                </div>
              </div>
              <SendComment
                class="send-comment"
                @dataChanged="fetchData"
                v-if="index === mailIndex && isEditing"
                :mailDate="mail.mailDate"
                :mailTitle="mail.mailTitle"
                :mailIndex="index"
              ></SendComment>
            </div>
            <!-- <div class="feed-back mb-1"></div> -->
          </template>
        </div>
      </div>
    </div>

    <el-dialog v-model="visible" :show-close="false">
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
                <div v-html="mailData[mailIndex].mailContent"></div>
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
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { fetchSheetDataForColumns } from "@/service/sheets";

import { mapState } from "vuex";

import MailMagazine from "@/views/template/mailMagazine.vue";
import SendComment from "@/views/template/sendComment.vue";

import { Close, ChatLineSquare, Document } from "@element-plus/icons-vue";

interface MailRow {
  mailTitle: string;
  mailDate: string;
  mailAlert: string;
  mailTarget: string;
  mailContent: string;
  mailFeedback?: string[];
}

interface Message {
  id: string;
  text: string;
  title: string;
  date: string;
  [key: string]: string | number;
}

export default defineComponent({
  name: "AboutView",
  components: {
    MailMagazine,
    SendComment,
    Close,
  },

  data() {
    return {
      showSimpleMailContent: true,
      showSimpleMailContentText: "簡易表示",
      showSimpleMailTitle: "",

      textarea: "",

      mailIndex: 0,
      isEditing: false,

      // mail column to be chosen, connected to google sheet
      mailBeChosen: "",

      // mail title and date, displayed in the table
      mailData: [] as MailRow[],

      isLoading: false,

      showMailByDate: "all",

      // dialog
      visible: false,
    };
  },

  setup() {
    return {
      ChatLineSquare,
      Document,
    };
  },

  async mounted() {
    try {
      // Fetch the data from the Firestore
      this.$store.dispatch("fetchDataFromFirebase");
      // Fetch the data from the Google Sheet

      setTimeout(() => {
        this.fetchSheetDataForColumnsInComponent();
      }, 500);
    } catch (error) {
      console.error("Fetching data failed:", error);
    }
  },

  computed: {
    ...mapState(["messages"]),
    // computed property to show the text of the button

    showSimpleMailContentButtonText(): string {
      return this.showSimpleMailContent ? "簡易表示" : "詳細表示";
    },
  },

  methods: {
    // fetch mail content
    processSheetData: function (data: string[], index: number) {
      let htmlContent = "<p>";
      if (data) {
        data.slice(1).forEach((item: string) => {
          if (item[index]) {
            // Check if the cell is not empty
            htmlContent += `${item[index]}<br>`;
          }
          // If the current cell is empty or it's the last non-empty cell, don't add a break
          if (!item[index]) {
            htmlContent += "<br>";
          }
        });
        const regex = /(<br>\s*)+$/;
        htmlContent = htmlContent.replace(regex, "");
        htmlContent += "</p>";
        return htmlContent;
      }
      return "";
    },

    async fetchSheetDataForColumnsInComponent() {
      this.isLoading = true;

      try {
        const mailData = await fetchSheetDataForColumns("z", "メルマガ依頼", 1, 300);
        this.processSheetDataForMailInfo(mailData);
      } catch (error) {
        console.error("Fetching data failed:", error);
        this.isLoading = false;
      }
      this.isLoading = false;
    },

    fetchData() {
      setTimeout(() => {
        this.fetchSheetDataForColumnsInComponent();
      }, 500);
    },

    // fetch mail title and date
    processSheetDataForMailInfo: function (data: string[]) {
      //depanding on sheet data structure, slice the data to get the mail title and date
      const mailTitle = data.slice(2, 3)[0];
      const mailDate = data.slice(4, 5)[0];
      const mailTarget = data.slice(6, 7)[0];
      const mailContent = data.slice(7);

      const tempMailData = [] as MailRow[];

      if (mailTitle && mailDate) {
        for (let i = 0; i < mailTitle.length; i++) {
          const mailAlert = this.getMailAlert(mailDate[i]);

          let matches = this.messages.filter((message: Message) => message.title === mailTitle[i]);
          let matchesData: string[] = [];
          matches.forEach((item: Message) => {
            matchesData.push(item.text);
          });

          if (matches.length > 0) {
            tempMailData.push({
              mailTitle: mailTitle[i],
              mailDate: mailDate[i],
              mailAlert: mailAlert,
              mailTarget: mailTarget[i],
              mailContent: this.processSheetData(mailContent, i),
              mailFeedback: matchesData,
            });
          } else {
            tempMailData.push({
              mailTitle: mailTitle[i],
              mailDate: mailDate[i],
              mailAlert: mailAlert,
              mailTarget: mailTarget[i],
              mailContent: this.processSheetData(mailContent, i),
            });
          }
        }
      }

      // make sure the mailData is sorted by date
      tempMailData.sort((a, b) => {
        return new Date(a.mailDate).getTime() - new Date(b.mailDate).getTime();
      });

      this.mailData = tempMailData;
      this.showSimpleMailTitle = this.mailData[0].mailTitle;
    },

    getMailAlert(mailDate: string) {
      const currentTime = new Date().getTime();
      const mailTime = new Date(mailDate).getTime();
      const difference = mailTime - currentTime;
      const oneDayInMs = 86400000;

      if (difference < -oneDayInMs) {
        return "配信終了"; // Delivery finished
      } else if (difference < 0) {
        return "当日配信"; // Delivered today!
      } else if (difference < 2 * oneDayInMs) {
        return "配信３日前"; // Day before delivery
      } else {
        return "まだ余裕"; // Plenty of time
      }
    },

    getAlertClass(alert: string) {
      switch (alert) {
        case "配信終了": // Delivery finished
          return "mail-alert__text--gray"; // Example class for finished
        case "当日配信": // Delivered today!
          return "mail-alert__text--red"; // Example class for today
        case "配信３日前": // Day before delivery
          return "mail-alert__text--orange"; // Previously existing class for urgent
        case "まだ余裕": // Plenty of time
          return "mail-alert__text--green"; // Example class for relaxed
        default:
          return ""; // No class for undefined or unexpected values
      }
    },

    // when a row is clicked, determine the row index and set the mail title and content
    handleRowClick(mail: MailRow, index: number) {
      const rowIndex = this.mailData.findIndex((row) => row.mailTitle === mail.mailTitle && row.mailDate === mail.mailDate);
      this.showSimpleMailTitle = mail.mailTitle;
      const selectedCol = String.fromCharCode(65 + rowIndex);
      this.mailBeChosen = selectedCol;
      this.mailIndex = index;

      this.visible = true;
    },

    // format multiline text to be displayed in HTML
    formatMultiline(text: string) {
      return text.replace(/\n/g, "<br>");
    },

    editClick(index: number) {
      this.isEditing = !this.isEditing;

      this.mailIndex = index;
    },

    shouldShowMail(mail: MailRow) {
      if (this.showMailByDate === "all") {
        return true;
      } else if (this.showMailByDate === "soon") {
        return mail.mailAlert === "配信３日前" || mail.mailAlert === "当日配信";
      } else {
        return mail.mailAlert === "まだ余裕" || mail.mailAlert === "配信３日前" || mail.mailAlert === "当日配信";
      }
    },
  },
});
</script>

<style scoped lang="scss">
.about {
  max-width: 1200px;
  gap: 2rem;
  margin: 0 auto;
}
.mail-table {
  margin: 0 auto 0;
}

.mail-table__title {
  display: grid;
  grid-template-columns: 1fr 200px 150px 180px;
  padding: 0rem 1rem;
  background-color: #385f9d;
  color: #fff;
  font-weight: bold;
  text-align: left;
  @media screen and (max-width: 480px) {
    grid-template-columns: 1fr 1fr 1fr 0.6fr;
  }
}

.mail-table__list-title {
  font-size: 1.2rem;

  @media screen and (max-width: 480px) {
    display: flex;
  }
}

.mail-table__list {
  padding: 0rem 1.5rem;
  border-bottom: 1px solid #d4dae9;
  text-align: left;
  line-height: 1.8;

  @media screen and (max-width: 480px) {
    padding: 0rem 1rem;
  }
}

.mail-table__grid {
  display: grid;
  grid-template-columns: 1fr 200px 140px 120px 60px;
  @media screen and (max-width: 480px) {
    display: block;
  }
}

.mail-table__list--active {
  background-color: #e0ecff;
}

.mail-alert__text {
  color: #fff;
  background-color: #ccc;
  padding: 0.4rem 0.8rem;
  border-radius: 0.2rem;
  font-size: 0.8rem;
  font-weight: bold;
  width: fit-content;
  margin: 1rem 0;

  @media screen and (max-width: 480px) {
    margin: 0;
  }
}

.mail-alert__text--red {
  background-color: #cc0000;
}
.mail-alert__text--orange {
  background-color: #f56c6c;
}
.mail-alert__text--green {
  background-color: #00a400;
}
.mail-alert__text--gray {
  background-color: #aaa;
}
.flex-comment {
  display: flex;
  justify-content: space-between;
  gap: 1rem;

  @media screen and (max-width: 480px) {
    // display: block;
    flex-direction: column-reverse;
  }
}

.send-comment {
  flex: 1;

  @media screen and (max-width: 480px) {
    width: 100%;
    margin-bottom: 2rem;
  }
}
.mail-feedback {
  flex: 1;
  max-width: 50%;

  @media screen and (max-width: 480px) {
    max-width: 100%;
  }
}

.mail-feedback__item {
  border: 1px solid #aaa;
  background: #fff;
  padding: 1rem 1.5rem;
  font-size: 1rem;
  word-wrap: break-word;
}

.mail-feedback--small {
  font-size: 0.85rem;
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

.show-mail-by-date {
  display: flex;
  justify-content: space-around;
  max-width: 350px;
  margin: 1rem auto 2rem;
  @media screen and (max-width: 480px) {
    max-width: 320px;
  }
}

.show-mail-by-date__button {
  padding: 0.5rem 0;
  font-size: 1.2rem;
  color: #bbb;
  font-weight: 700;
  cursor: pointer;
}

.show-mail-by-date__button:hover {
  background-color: #f6fafd;
}

.show-mail-by-date__button--active {
  color: #333;
  border-bottom: 2px solid #333;
}

.loader {
  border: 16px solid #f3f3f3;
  border-top: 16px solid #3498db;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 2s linear infinite;
  margin: auto;
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

::v-deep .el-dialog {
  width: 100%;
  max-width: 1200px;
  margin: 5rem auto 0;
}
::v-deep .dialog-content {
  max-height: 75vh;
}

.my-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 50px;
}

::v-deep .el-button.is-circle {
  width: 35px;
  height: 35px;

  @media screen and (max-width: 480px) {
    width: 40px;
    height: 40px;
    margin-right: 0.8rem;
  }
}

::v-deep .el-button svg {
  width: unset;
  height: unset;
}

::v-deep .el-icon {
  width: 20px;
  height: 20px;

  @media screen and (max-width: 480px) {
    width: 25px;
    height: 25px;
  }
}

::v-deep .mail-table__edit .el-icon {
  @media screen and (max-width: 480px) {
    color: #fff;
  }
}

.el-button + .el-button {
  margin-left: unset;
}

.edit-button.is-circle {
  width: 100%;
  border-radius: 5px;
  margin-top: 1rem;

  @media screen and (max-width: 480px) {
    margin-top: 2rem;
    height: 50px;
    background-color: #1751ad;
  }
}
</style>
