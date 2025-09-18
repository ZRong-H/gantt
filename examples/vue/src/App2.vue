<template>
  <div class="vue-demo">
    <div class="controls">
      <button @click="addRandomTask" class="btn-add">➕ 添加任务</button>
      <button @click="clearTasks" class="btn-clear">🗑️ 清空</button>
      <select v-model="viewMode" @change="updateViewMode">
        <option value="day">日视图</option>
        <option value="week">周视图</option>
        <option value="month">月视图</option>
      </select>
    </div>

    <XGanttVue :options="ganttOptions" @click:row="handleTaskClick" />

    <div class="stats">
      <div class="stat">任务总数: {{ tasks.length }}</div>
      <div class="stat">完成率: {{ completionRate }}%</div>
      <div class="stat">最后操作: {{ lastAction }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import { XGanttVue, XGanttUnit } from "@huang_zengrong/kingdee-xk-gantt-vue";
import "@huang_zengrong/kingdee-xk-gantt-vue/style.css";

const viewMode = ref<XGanttUnit>("week");
const lastAction = ref("页面已加载");

const tasks = reactive([
  {
    id: "1",
    name: "Vue 3 项目搭建",
    startTime: "2025-01-01",
    endTime: "2025-01-05",
    progress: 100
  },
  {
    id: "2",
    name: "组件开发",
    startTime: "2025-01-06",
    endTime: "2025-01-20",
    progress: 75
  }
]);

const ganttOptions = reactive({
  data: tasks,
  width: 800,
  height: 400,
  unit: viewMode.value
});

const completionRate = computed(() => {
  if (tasks.length === 0) return 0;
  const totalProgress = tasks.reduce((sum, task) => sum + task.progress, 0);
  return Math.round(totalProgress / tasks.length);
});

const addRandomTask = () => {
  const id = String(Date.now());
  const taskNames = ["前端开发", "后端开发", "测试", "部署", "文档编写"];
  const randomName = taskNames[Math.floor(Math.random() * taskNames.length)];

  tasks.push({
    id,
    name: `${randomName} ${tasks.length + 1}`,
    startTime: "2025-01-21",
    endTime: "2025-01-30",
    progress: Math.floor(Math.random() * 100)
  });

  lastAction.value = `添加了任务: ${randomName}`;
};

const clearTasks = () => {
  tasks.splice(0);
  lastAction.value = "已清空所有任务";
};

const updateViewMode = () => {
  lastAction.value = `切换到${viewMode.value}视图`;
  ganttOptions.unit = viewMode.value;
};

const handleTaskClick = (task: any) => {
  lastAction.value = `点击了任务: ${task.name}`;
};
</script>

<style scoped>
.vue-demo {
  padding: 1rem;
}

.controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  align-items: center;
}

.btn-add,
.btn-clear {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-add {
  background: #52c41a;
  color: white;
}

.btn-clear {
  background: #ff4d4f;
  color: white;
}

.stats {
  display: flex;
  gap: 2rem;
  margin-top: 1rem;
  padding: 1rem;
  background: #f5f5f5;
  border-radius: 8px;
}

.stat {
  font-weight: 600;
  color: #333;
}
</style>
