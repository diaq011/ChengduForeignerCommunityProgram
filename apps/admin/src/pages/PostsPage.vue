<script setup lang="ts">
import { onMounted, ref } from "vue";

import { adminApi } from "@/api/client";
import type { Post } from "@community-map/shared";

const loading = ref(false);
const posts = ref<Post[]>([]);

const load = async () => {
  loading.value = true;
  try {
    const result = await adminApi.discover.listPosts({ includeHidden: true });
    posts.value = result.data.items;
  } finally {
    loading.value = false;
  }
};

const moderatePost = async (id: string, reviewStatus: Post["review_status"]) => {
  await adminApi.admin.moderatePost(id, { review_status: reviewStatus });
  await load();
};

const statusType = (status: Post["review_status"]) => {
  if (status === "reported") {
    return "warning";
  }
  if (status === "hidden" || status === "deleted") {
    return "danger";
  }
  return "success";
};

onMounted(load);
</script>

<template>
  <div class="page-card">
    <div class="page-header">
      <h2>帖子治理</h2>
      <el-tag type="warning">支持举报后保留、隐藏、删除</el-tag>
    </div>
    <el-table :data="posts" v-loading="loading">
      <el-table-column prop="title" label="标题" min-width="220" />
      <el-table-column prop="language" label="语言" width="100" />
      <el-table-column label="标签" min-width="180">
        <template #default="{ row }">
          <el-tag v-for="tag in row.tag_ids" :key="tag" size="small" class="tag">
            {{ tag }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="治理状态" width="140">
        <template #default="{ row }">
          <el-tag :type="statusType(row.review_status)">
            {{ row.review_status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="260">
        <template #default="{ row }">
          <el-button size="small" @click="moderatePost(row._id, 'visible')">
            保留
          </el-button>
          <el-button size="small" type="warning" @click="moderatePost(row._id, 'hidden')">
            隐藏
          </el-button>
          <el-button size="small" type="danger" @click="moderatePost(row._id, 'deleted')">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<style scoped>
.tag {
  margin-right: 6px;
}
</style>
