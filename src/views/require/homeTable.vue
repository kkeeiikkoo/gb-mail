<template>
  <div class="container">
    <div v-if="isLoading" class="loader"></div>

    <div class="custom-table">
      <div class="table-header">
        <div class="header-item">原稿</div>
        <div class="header-item">配信日</div>
        <div class="header-item">タイトル</div>
        <div class="header-item">使用回数</div>
        <div class="header-item">セミナー名</div>
      </div>
      <div class="table-body">
        <div v-for="item in tableData" :key="item.id" class="table-row">
          <el-button type="warning" :icon="Document" circle @click="fetchContentClick(item.url, item.title)"></el-button>

          <div class="row-item">{{ item.date }}</div>
          <div class="row-item">{{ item.title }}</div>
          <div class="row-item">{{ item.times }}</div>
          <div class="row-item">{{ item.seminar }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { fetchSheetData } from "@/service/sheets";
import { Document } from "@element-plus/icons-vue";

export default defineComponent({
  name: "homeTable",
  props: {
    dateFilter: {
      type: Object,
      default: () => ({ start: "", end: "" }),
    },
  },
  data() {
    return {
      isLoading: false,
      mailTitle: [] as string[][],
      mailDate: [] as string[][],
      mailTimes: [] as string[][],
      mailSeminar: [] as string[][],
      mailURL: [] as string[][],

      tableData: [],
    };
  },

  setup() {
    return {
      Document,
    };
  },

  methods: {
    async fetchAndProcessData() {
      this.isLoading = true; // Start loading

      // Declare variables outside of the try block to ensure they're accessible later
      let mailTitle: string[][] = [],
        mailDate: string[][] = [],
        mailTimes: string[][] = [],
        mailSeminar: string[][] = [],
        mailURL: string[][] = [];

      try {
        const promises = [
          fetchSheetData("J", "配信情報HTML", 7),
          fetchSheetData("A", "配信情報HTML", 7),
          fetchSheetData("N", "配信情報HTML", 7),
          fetchSheetData("M", "配信情報HTML", 7),
          fetchSheetData("U", "配信情報HTML", 7),
        ];
        [mailTitle, mailDate, mailTimes, mailSeminar, mailURL] = await Promise.all(promises);
      } catch (error) {
        console.error("Fetching data failed:", error);
        this.isLoading = false; // Consider setting isLoading to false here as well if not proceeding to filter data on error
        return; // Exit the method early if there's an error
      }
      this.mailTitle = mailTitle;
      this.mailDate = mailDate;
      this.mailTimes = mailTimes;
      this.mailSeminar = mailSeminar;
      this.mailURL = mailURL;

      this.isLoading = false;

      this.processData();
    },

    processData() {
      // Convert your filter dates to Date objects for comparison
      //---------------------------------------------
      const startDate = new Date(this.dateFilter.start);
      const endDate = new Date(this.dateFilter.end);
      //---------------------------------------------
      const seminarName = this.dateFilter.seminarName;
      //---------------------------------------------

      // Filter the data based on the date range and mail title
      let tableData = this.mailDate.reduce((acc: any, dateArr: string[], index: number) => {
        // Ensure dateArr is treated as an array and take the first element(only element) as the date string
        // For ['2023/5/14'], dateArr[0] gives you '2023/5/14'.
        const dateStr = Array.isArray(dateArr) ? dateArr[0] : dateArr;

        if (typeof dateStr === "string") {
          // If dateStr is '2023/5/14', the replace method turns it into '2023-5-14'.
          const date = new Date(dateStr.replace(/\//g, "-"));

          // Check if the date is within the filter range and if the mailTitle is not empty
          if (
            date >= startDate &&
            date <= endDate &&
            this.mailTitle[index] &&
            this.mailTitle[index].length > 0 &&
            (seminarName === "すべて" || (this.mailSeminar[index] && this.mailSeminar[index][0] && this.mailSeminar[index][0].includes(seminarName)))
          ) {
            acc.push({
              title: Array.isArray(this.mailTitle[index]) ? this.mailTitle[index][0] : this.mailTitle[index],
              date: dateStr,
              times: Array.isArray(this.mailTimes[index]) ? this.mailTimes[index][0] : this.mailTimes[index],
              seminar: Array.isArray(this.mailSeminar[index]) ? this.mailSeminar[index][0] : this.mailSeminar[index],
              url: Array.isArray(this.mailURL[index]) ? this.mailURL[index][0] : this.mailURL[index],
            });
          }
        }

        // pass the initial value of the accumulator as an empty array
        return acc;
      }, []);

      this.tableData = tableData.reverse();
    },

    fetchContentClick(url: string, title: string) {
      this.$emit("fetchContentClick", url, title);
    },
  },
  mounted() {
    this.fetchAndProcessData();
  },
});
</script>

<style scoped>
.container {
  width: 90%;
  margin: 0 auto;
}

.loader {
  border: 16px solid #f3f3f3; /* Light grey */
  border-top: 16px solid #3498db; /* Blue */
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

.custom-table {
  width: 100%;
  border-collapse: collapse;
}

.header-item,
.row-item {
  padding: 8px;
  flex-grow: 1;
  overflow: hidden; /* Prevent content from overflowing */
}

.table-header,
.table-row {
  display: grid;
  grid-template-columns: 0.5fr 1fr 5fr 1fr 1fr;
  align-items: center;
  text-align: left;
}
.table-row {
  border-bottom: 1px dashed #d4dae9;
  min-height: 60px;
}

.table-header {
  font-weight: bold;
  background-color: #385f9d;
  color: white;
}

.table-body .table-row:nth-child(odd) {
  background-color: #fff;
}

.table-body .table-row:nth-child(even) {
  background-color: #f8faff;
}

.row-item {
  text-overflow: ellipsis;
  white-space: nowrap; /* Keep the content on the same line */
}
</style>
