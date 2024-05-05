<template>
  <div class="home">
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

    <el-dialog v-model="visible" :show-close="false">
      <template #header="{ close, titleId, titleClass }">
        <div class="my-header">
          <h4 :id="titleId" :class="titleClass">メルマガ原稿</h4>
          <el-button type="danger" @click="close">
            <el-icon><Close /></el-icon> クローズ
          </el-button>
        </div>
      </template>
      <div class="dialog-content" style="overflow-y: auto">
        <div>
          <div class="mail-content-area">
            <div class="simple-mail-content">
              <h2 class="mb-2" v-html="showSimpleMailContentTitle"></h2>

              <div v-html="showSimpleMailContent"></div>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>

    <homeTable ref="childComponentRef" :dateFilter="dateFilter" @fetchContentClick="fetchContentClick"></homeTable>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import homeTable from "/src/views/require/homeTable.vue";

import { Calendar, Search, Document, Close } from "@element-plus/icons-vue";

import { fetchContent } from "@/service/axios";

export default defineComponent({
  name: "HomeView",
  components: {
    homeTable,
    Close,
  },
  data() {
    return {
      dateFilter: { start: "2019-01-01", end: "2024-04-01", seminarName: "すべて" },
      ifDateError: false,

      categoryButtonType: ["すべて", "役立ち", "体験講座", "コーチング"],
      categoryButtonSelected: "すべて",
      activeCategoryButtonIndex: 0,

      showSimpleMailContentTitle: "",
      showSimpleMailContent: "",
      visible: false,
    };
  },

  setup() {
    return {
      Calendar,
      Search,
      Document,
      Close,
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
      (this.$refs.childComponentRef as any).processData();
    },

    confirmSeminarName(index: number) {
      this.activeCategoryButtonIndex = index;
      this.categoryButtonSelected = this.categoryButtonType[index];
      this.dateFilter.seminarName = this.categoryButtonSelected;

      (this.$refs.childComponentRef as any).processData();
    },

    fetchContentClick(url: string, title: string) {
      fetchContent(url, (html) => {
        if (html) {
          this.showSimpleMailContent = html;
          this.showSimpleMailContentTitle = title;
          this.visible = true;
        } else {
          window.open(url, "_blank"); // Opens the URL in a new tab if no content is found
        }
      });
    },
  },
});
</script>

<style scoped lang="scss">
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

.my-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 50px;
}

:deep(.el-dialog) {
  width: 100%;
  max-width: 1200px;
  margin: 5rem auto 0;

  @media screen and (max-width: 480px) {
    width: 96%;
    margin: 2rem auto 0;
  }
}
:deep(.dialog-content) {
  max-height: 75vh;

  @media screen and (max-width: 480px) {
    max-height: 80vh;
  }
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

:deep(.el-button.is-circle) {
  width: 35px;
  height: 35px;

  @media screen and (max-width: 480px) {
    width: 25px;
    height: 25px;
    margin-right: 0.8rem;
  }
}

:deep(.el-button svg) {
  width: unset;
  height: unset;
}

:deep(.el-icon) {
  width: 20px;
  height: 20px;

  @media screen and (max-width: 480px) {
    width: 25px;
    height: 25px;
  }
}
</style>
