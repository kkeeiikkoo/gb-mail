<template>
  <div class="about">
    <h1>メルマガ原稿待ち：</h1>

    <div v-if="isLoading" class="loader"></div>
    <div class="mail-table">
      <div class="mail-table__title">
        <p>メルマガ名</p>
        <p>予定配信日</p>
        <p>緊急度</p>
      </div>
      <div
        class="mail-table__list"
        :class="{ 'mail-table__list--active': index === mailIndex }"
        v-for="(mail, index) in mailData"
        :key="index"
        @click="handleRowClick(mail, index)"
      >
        <p class="mail-table__list-title" v-html="formatMultiline(mail.mailTitle)"></p>
        <p>{{ mail.mailDate }}</p>
        <div class="mail-alert">
          <p class="mail-alert__text" :class="getAlertClass(mail.mailAlert)">{{ mail.mailAlert }}</p>
        </div>
        <div class="mail-table__edit">
          <el-button :icon="Edit" circle @click="editClick()" />
        </div>

        <div v-if="mail.mailFeedback" class="mail-feedback" v-html="mail.mailFeedback"></div>

        <SendComment
          class="mb-1"
          @dataChanged="fetchData"
          v-if="index === mailIndex && isEditing"
          :mailDate="mail.mailDate"
          :mailTitle="mail.mailTitle"
          :mailIndex="index"
        ></SendComment>

        <div class="feed-back mb-1"></div>
      </div>
    </div>
    <p class="mb-4">※緊急度４段階：【まだ余裕】、【明日配信】、【当日配信】、【配信終了】</p>

    <h2>文面はこちら：</h2>
    <el-button @click="showSimpleMailContent = !showSimpleMailContent" class="mb-2">モード：{{ showSimpleMailContentButtonText }}</el-button>

    <div class="mail-content-area">
      <!-- simple mail content -->
      <div v-if="showSimpleMailContent" class="simple-mail-content">
        <h2 v-if="showSimpleMailTitle" class="mb-3" v-html="formatMultiline(showSimpleMailTitle)"></h2>
        <div v-html="processedContent"></div>
      </div>
      <!-- detailed mail content -->
      <MailMagazine v-if="!showSimpleMailContent">
        <template v-slot:mail-contents>
          <div v-html="processedContent"></div>
        </template>
      </MailMagazine>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { fetchSheetData, fetchSheetDataForColumns } from "@/service/sheets";

import { mapState } from "vuex";

import MailMagazine from "@/views/template/mailMagazine.vue";
import SendComment from "@/views/template/sendComment.vue";

import { Edit } from "@element-plus/icons-vue";

interface MailRow {
  mailTitle: string;
  mailDate: string;
  mailAlert: string;
  mailFeedback?: string;
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
      mailBeChosen: "A",

      // mail content, once col be chosen, the content will be fetched
      processedContent: "",

      // mail title and date, displayed in the table
      mailData: [] as MailRow[],

      isLoading: false,
    };
  },

  setup() {
    return {
      Edit,
    };
  },

  async mounted() {
    try {
      // Fetch the data from the Firestore
      this.$store.dispatch("fetchDataFromFirebase");
      // Fetch the data from the Google Sheet
      this.fetchAndProcessMailContent();
      this.fetchSheetDataForColumns();
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
    // trigger the fetch and process mail content
    async fetchAndProcessMailContent() {
      // Fetch the data from the Google Sheet
      const mailContent = await fetchSheetData(this.mailBeChosen, "メルマガ依頼", 2);
      this.processSheetData(mailContent);
      this.processedContent = this.processSheetData(mailContent);
    },
    // fetch mail content
    processSheetData: function (data: string[]) {
      let htmlContent = "<p>";
      if (data && data.length > 4) {
        data.slice(5).forEach((item: string) => {
          if (item[0]) {
            // Check if the cell is not empty
            htmlContent += `${item[0]}<br>`;
          }
          // If the current cell is empty or it's the last non-empty cell, don't add a break
          if (!item[0]) {
            htmlContent += "<br>";
          }
        });
        htmlContent += "</p>";
        return htmlContent;
      }
      return "";
    },

    async fetchSheetDataForColumns() {
      this.isLoading = true;

      try {
        const mailData = await fetchSheetDataForColumns("G", "メルマガ依頼", 1, 5);
        this.processSheetDataForMailInfo(mailData);
      } catch (error) {
        console.error("Fetching data failed:", error);
        this.isLoading = false;
      }
      this.isLoading = false;
    },

    fetchData() {
      setTimeout(() => {
        this.fetchSheetDataForColumns();
      }, 500);
    },

    // fetch mail title and date
    processSheetDataForMailInfo: function (data: string[]) {
      const mailTitle = data.slice(2, 3)[0];
      const mailDate = data.slice(4, 5)[0];

      const tempMailData = [] as MailRow[];

      if (mailTitle && mailDate) {
        for (let i = 0; i < mailTitle.length; i++) {
          const mailAlert = this.getMailAlert(mailDate[i]);

          let matches = this.messages.filter((message: Message) => message.title === mailTitle[i]);
          let matchesData = matches.map((item: Message) => item.text).join("<br><br>");

          if (matches.length > 0) {
            tempMailData.push({
              mailTitle: mailTitle[i],
              mailDate: mailDate[i],
              mailAlert: mailAlert,
              mailFeedback: matchesData,
            });
          } else {
            tempMailData.push({
              mailTitle: mailTitle[i],
              mailDate: mailDate[i],
              mailAlert: mailAlert,
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
      } else if (difference < oneDayInMs) {
        return "明日配信"; // Day before delivery
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
        case "明日配信": // Day before delivery
          return "mail-alert__text--orange"; // Previously existing class for urgent
        case "まだ余裕": // Plenty of time
          return "mail-alert__text--green"; // Example class for relaxed
        default:
          return ""; // No class for undefined or unexpected values
      }
    },

    // handle row click event
    // when a row is clicked, determine the row index and set the mail title and content
    handleRowClick(clickedRow: MailRow, index: number) {
      const rowIndex = this.mailData.findIndex((row) => row.mailTitle === clickedRow.mailTitle && row.mailDate === clickedRow.mailDate);
      this.showSimpleMailTitle = clickedRow.mailTitle;
      const selectedCol = String.fromCharCode(65 + rowIndex);
      this.mailBeChosen = selectedCol;
      this.mailIndex = index;
    },

    // format multiline text to be displayed in HTML
    formatMultiline(text: string) {
      return text.replace(/\n/g, "<br>");
    },

    editClick() {
      this.isEditing = !this.isEditing;
    },
  },

  watch: {
    mailBeChosen(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.fetchAndProcessMailContent();
      }
    },
  },
});
</script>

<style scoped>
.mail-table {
  max-width: 860px;
  margin: 0 auto 0;
}

.mail-table__title {
  display: grid;
  grid-template-columns: 1fr 0.4fr 0.3fr;
  padding: 0rem 1rem;
  background-color: #385f9d;
  color: #fff;
  font-weight: bold;
  text-align: left;
}

.mail-table__list {
  display: grid;
  grid-template-columns: 1fr 0.4fr 0.2fr 0.1fr;
  padding: 0rem 1rem;
  border-bottom: 1px solid #ebeef5;
  text-align: left;
  cursor: pointer;
}

.mail-table__list:hover {
  background-color: #f6fafd;
}

.mail-table__list--active {
  background-color: #e0ecff;
}
.mail-table__list--active:hover {
  background-color: #e0ecff;
}

.mail-table__edit {
  display: flex;
  justify-content: center;
  align-items: center;
}

.mail-alert__text {
  color: #fff;
  background-color: #ccc;
  padding: 0.4rem 0.8rem;
  border-radius: 0.2rem;
  font-size: 0.8rem;
  font-weight: bold;
  width: fit-content;
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

.mail-feedback {
  border: 1px solid #aaa;
  background: #fff;
  padding: 0.5rem;
  margin-bottom: 1rem;
  font-size: 0.8rem;
  max-width: 360px;
}

.mail-content-area {
  background-color: #f6fafd;
  padding: 3rem;
  /* width: 50%; */
  /* position: absolute; */
  /* top: 0; */
}

.simple-mail-content {
  max-width: 800px;
  margin: 0 auto;
  text-align: left;
  padding: 2rem 3rem;
  background-color: #fff;
}

.el-table {
  cursor: pointer !important;
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
</style>
