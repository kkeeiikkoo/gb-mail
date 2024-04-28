<template>
  <div class="container">
    <div v-if="isLoading" class="loader"></div>

    <el-table :data="tableData" stripe style="width: 100%">
      <el-table-column prop="date" label="Date" width="150" />
      <el-table-column prop="title" label="Title" width="900" />
      <el-table-column prop="times" label="使用回数" />
      <el-table-column prop="seminar" label="セミナー名" />
    </el-table>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { fetchSheetData } from "@/service/sheets";

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

      tableData: [],
    };
  },

  methods: {
    async fetchAndProcessData() {
      this.isLoading = true; // Start loading

      // Declare variables outside of the try block to ensure they're accessible later
      let mailTitle: string[][] = [],
        mailDate: string[][] = [],
        mailTimes: string[][] = [],
        mailSeminar: string[][] = [];

      try {
        // Fetch the data from the Google Sheet
        mailTitle = await fetchSheetData("J", "配信情報HTML", 7);
        mailDate = await fetchSheetData("A", "配信情報HTML", 7);
        mailTimes = await fetchSheetData("N", "配信情報HTML", 7);
        mailSeminar = await fetchSheetData("M", "配信情報HTML", 7);
      } catch (error) {
        console.error("Fetching data failed:", error);
        this.isLoading = false; // Consider setting isLoading to false here as well if not proceeding to filter data on error
        return; // Exit the method early if there's an error
      }

      // Convert your filter dates to Date objects for comparison
      //---------------------------------------------
      const startDate = new Date(this.dateFilter.start);
      const endDate = new Date(this.dateFilter.end);
      //---------------------------------------------
      const seminarName = this.dateFilter.seminarName;
      //---------------------------------------------

      // Filter the data based on the date range and mail title
      let tableData = mailDate.reduce((acc: any, dateArr: string[], index: number) => {
        // Ensure dateArr is treated as an array and take the first element(only element) as the date string
        // For ['2023/5/14'], dateArr[0] gives you '2023/5/14'.
        const dateStr = Array.isArray(dateArr) ? dateArr[0] : dateArr;

        if (typeof dateStr === "string") {
          // If dateStr is '2023/5/14', the replace method turns it into '2023-5-14'.
          const date = new Date(dateStr.replace(/\//g, "-"));

          // Check if the date is within the filter range and if the mailTitle is not empty
          if (date >= startDate && date <= endDate && mailTitle[index] && mailTitle[index].length > 0 && (seminarName === "すべて" || mailSeminar[index][0] === seminarName)) {
            acc.push({
              title: Array.isArray(mailTitle[index]) ? mailTitle[index][0] : mailTitle[index],
              date: dateStr,
              times: Array.isArray(mailTimes[index]) ? mailTimes[index][0] : mailTimes[index],
              seminar: Array.isArray(mailSeminar[index]) ? mailSeminar[index][0] : mailSeminar[index],
            });
          }
        }

        // pass the initial value of the accumulator as an empty array
        return acc;
      }, []);

      this.tableData = tableData;

      this.isLoading = false;
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
</style>
