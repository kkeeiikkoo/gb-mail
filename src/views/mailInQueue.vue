<template>
  <div class="about">
    <h1>メルマガ原稿待ち：</h1>

    <div class="container-mail-queue">
      <el-table class="mb-2" :data="mailData" style="width: 100%" @row-click="handleRowClick">
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column type="index" width="35"></el-table-column>
        <el-table-column label="メルマガ名">
          <template #default="scope">
            <div v-html="formatMultiline(scope.row.mailTitle)"></div>
          </template>
        </el-table-column>
        <el-table-column prop="mailDate" label="予定配信日" width="150" />

        <el-table-column label="Operations">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.$index, scope.row)">コメントする</el-button>
            <!-- <el-button size="small" type="danger" @click="handleDelete(scope.$index, scope.row)">削除</el-button> -->
          </template>
        </el-table-column>
      </el-table>
      <el-button type="primary">確認済みにする</el-button>
      <!-- <el-button type="danger">不可にする</el-button> -->
    </div>

    <h1>メルマガ原稿文面はこちら：</h1>
    <h3 v-if="showSimpleMailTitle">{{ showSimpleMailTitle }}</h3>
    <el-button @click="showSimpleMailContent = !showSimpleMailContent" class="mb-2">モード：{{ showSimpleMailContentButtonText }}</el-button>

    <div class="mail-content-area">
      <div v-if="showSimpleMailContent" class="simple-mail-content" v-html="processedContent"></div>

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

import MailMagazine from "@/views/template/mailMagazine.vue";

interface MailRow {
  mailTitle: string;
  mailDate: string;
}

export default defineComponent({
  name: "AboutView",
  components: {
    MailMagazine,
  },

  data() {
    return {
      showSimpleMailContent: true,
      showSimpleMailContentText: "簡易表示",
      showSimpleMailTitle: "",

      // mail column to be chosen, connected to google sheet
      mailBeChosen: "A",

      // mail content, once col be chosen, the content will be fetched
      processedContent: "",

      // mail title and date, displayed in the table
      mailData: [] as MailRow[],
      // mailData: [] as { mailTitle: string; mailDate: string }[],
    };
  },

  async mounted() {
    // Fetch the data from the Google Sheet
    this.fetchAndProcessMailContent();
    this.fetchSheetDataForColumns();

    // const mailData = await fetchSheetDataForColumns("G", "メルマガ依頼", 5);
    // this.processSheetDataForMailInfo(mailData);
  },

  computed: {
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
      const mailData = await fetchSheetDataForColumns("G", "メルマガ依頼", 1, 5);
      this.processSheetDataForMailInfo(mailData);
    },
    // fetch mail title and date
    processSheetDataForMailInfo: function (data: string[]) {
      const mailTitle = data.slice(2, 3)[0];
      const mailDate = data.slice(4, 5)[0];

      if (mailTitle && mailDate) {
        for (let i = 0; i < mailTitle.length; i++) {
          this.mailData.push({
            mailTitle: mailTitle[i],
            mailDate: mailDate[i],
          });
        }
      }
    },

    // handle row click event
    // when a row is clicked, determine the row index and set the mail title and content
    handleRowClick(clickedRow: MailRow) {
      const rowIndex = this.mailData.findIndex((row) => row.mailTitle === clickedRow.mailTitle && row.mailDate === clickedRow.mailDate);
      this.showSimpleMailTitle = clickedRow.mailTitle;
      const selectedCol = String.fromCharCode(65 + rowIndex);
      this.mailBeChosen = selectedCol;
    },

    // format multiline text to be displayed in HTML
    formatMultiline(text: string) {
      return text.replace(/\n/g, "<br>");
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
.container-mail-queue {
  max-width: 860px;
  margin: 0 auto 5rem;
}

.el-table__row {
  cursor: pointer;
}

.el-table__row--active {
  background-color: #f5f7fa;
}

.mail-content-area {
  background-color: #f6fafd;
  padding: 3rem;
}

.simple-mail-content {
  max-width: 600px;
  margin: 0 auto;
  text-align: left;
  padding: 2rem 3rem;
  background-color: #fff;
}

.el-table {
  cursor: pointer !important;
}
</style>
