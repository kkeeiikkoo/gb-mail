<template>
  <div class="home">
    <!-- <div v-html="content"></div> -->

    <h2>日程で絞り込む</h2>
    <div class="flex mb-1">
      <div>
        <span>開始日：</span>
        <el-input v-model="start" style="width: 150px" placeholder="開始日はこちら" :suffix-icon="Calendar" />
      </div>
      <div>
        <span>終了日：</span>
        <el-input v-model="end" style="width: 150px" placeholder="終了日はこちら" :suffix-icon="Calendar" />
      </div>
      <el-button type="primary" @click="confirmDates">この日程で絞り込む</el-button>
    </div>
    <div class="mb-2">※日付を数字８桁で入力してください。例：20230801</div>

    <h2>種類で絞り込む</h2>
    <div class="mb-3">
      <el-button v-for="(item, index) in categoryButtonType" :key="index" @click="confirmSeminarName(index)" :class="{ active: activeCategoryButtonIndex === index }">{{
        item
      }}</el-button>
    </div>

    <div v-if="ifDateError" class="error-message">日程の入力は間違っています</div>

    <homeTable ref="childComponentRef" :dateFilter="dateFilter"></homeTable>

    <!-- <el-button type="primary" @click="fetchContentClick">Primary</el-button> -->
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import homeTable from "/src/views/require/homeTable.vue";

import { Calendar, Search } from "@element-plus/icons-vue";

// import { fetchContent } from "@/service/axios";

export default defineComponent({
  name: "HomeView",
  components: {
    homeTable,
  },
  data() {
    return {
      dateFilter: { start: "2024-01-01", end: "2024-04-01", seminarName: "すべて" },
      ifDateError: false,

      categoryButtonType: ["すべて", "役立ち", "体験講座", "話し方プレゼン"],
      categoryButtonSelected: "すべて",
      activeCategoryButtonIndex: 0,

      content: "",
    };
  },

  setup() {
    return {
      Calendar,
      Search,
    };
  },
  computed: {
    start: {
      get(): string {
        return this.dateFilter.start;
      },
      set(value: string) {
        this.dateFilter.start = value;
      },
    },
    end: {
      get(): string {
        return this.dateFilter.end;
      },
      set(value: string) {
        this.dateFilter.end = value;
      },
    },
    seminarName: {
      get(): string {
        return this.dateFilter.seminarName;
      },
      set(value: string) {
        this.dateFilter.seminarName = value;
      },
    },
  },
  methods: {
    transformDateToYYYYMMDD(date: string) {
      const dataCheck = date.split("").filter((char) => !isNaN(Number(char)));

      if (dataCheck.length < 8) {
        // Handle error or invalid date format
        console.error("Invalid date format:", date);
        this.ifDateError = true;
        return null; // or return the original date, depending on your needs
      }

      const year = dataCheck.slice(0, 4).join("").toString();
      const month = dataCheck.slice(4, 6).join("").toString();
      const day = dataCheck.slice(6, 8).join("").toString();

      // Basic validation example
      if (parseInt(month) > 12 || parseInt(month) < 1 || parseInt(day) < 1 || parseInt(day) > 31) {
        console.error("Invalid date:", date);
        this.ifDateError = true;
        return null;
      }

      return `${year}-${month}-${day}`;
    },
    confirmDates() {
      this.ifDateError = false;
      this.dateFilter.start = this.transformDateToYYYYMMDD(this.start) as string;
      this.dateFilter.end = this.transformDateToYYYYMMDD(this.end) as string;
      (this.$refs.childComponentRef as any).fetchAndProcessData();
    },

    confirmSeminarName(index: number) {
      this.activeCategoryButtonIndex = index;
      this.categoryButtonSelected = this.categoryButtonType[index];
      this.dateFilter.seminarName = this.categoryButtonSelected;

      (this.$refs.childComponentRef as any).fetchAndProcessData();
    },
  },

  // methods: {
  //   fetchContentClick() {
  //     fetchContent("../html/nlp_mm_html_p1_20240325.html", (html) => (this.content = html));
  //   },
  // },
});
</script>

<style scoped>
.flex {
  display: flex;
  justify-content: center;

  gap: 1.5rem;
}

.error-message {
  color: red;
  font-size: 1rem;
  text-align: center;
}

.active {
  background-color: #8fcbb0 !important;
  color: white !important;
}
</style>
