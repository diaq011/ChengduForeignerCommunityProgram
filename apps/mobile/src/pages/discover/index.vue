<script setup lang="ts">
import { computed, onMounted, ref } from "vue";

import { mobileApi } from "@/api/client";
import SectionPanel from "@/components/SectionPanel.vue";
import type { Post } from "@/types";

const TAG_OPTIONS = [
  { id: "", label: "全部" },
  { id: "life", label: "生活" },
  { id: "help", label: "求助" },
  { id: "sports", label: "运动" },
  { id: "social", label: "社交" },
  { id: "language", label: "语言" },
  { id: "food", label: "餐饮" }
];

const posts = ref<Post[]>([]);
const keyword = ref("");
const activeTag = ref("");
const page = ref(1);
const pageSize = 5;
const total = ref(0);
const loading = ref(false);
const loadingMore = ref(false);
const errorMessage = ref("");

const hasMore = computed(() => posts.value.length < total.value);
const listSubtitle = computed(() =>
  total.value > 0 ? `已加载 ${posts.value.length}/${total.value} 条社区帖子` : "社区内容流"
);

const formatLanguage = (language: Post["language"]) =>
  language === "en" ? "English" : "中文";

const tagLabel = (id: string) =>
  TAG_OPTIONS.find((tag) => tag.id === id)?.label ?? id;

const load = async (nextPage = 1) => {
  if (nextPage === 1) {
    loading.value = true;
  } else {
    loadingMore.value = true;
  }
  errorMessage.value = "";

  try {
    const result = await mobileApi.discover.listPosts({
      page: nextPage,
      pageSize,
      keyword: keyword.value.trim() || undefined,
      tagId: activeTag.value || undefined
    });
    posts.value =
      nextPage === 1 ? result.data.items : [...posts.value, ...result.data.items];
    page.value = result.data.page;
    total.value = result.data.total;
  } catch (error) {
    errorMessage.value = "内容流加载失败，请稍后再试。";
  } finally {
    loading.value = false;
    loadingMore.value = false;
  }
};

const openDetail = (id: string) => {
  uni.navigateTo({
    url: `/pages/discover/detail?id=${id}`
  });
};

const openCreate = () => {
  uni.navigateTo({
    url: "/pages/discover/create"
  });
};

const refresh = () => load(1);

const loadMore = () => {
  if (!hasMore.value || loadingMore.value) {
    return;
  }
  load(page.value + 1);
};

const selectTag = (id: string) => {
  activeTag.value = id;
  refresh();
};

onMounted(load);
</script>

<template>
  <view class="page">
    <SectionPanel title="Discover" :subtitle="listSubtitle">
      <view class="toolbar">
        <input
          v-model="keyword"
          class="search"
          confirm-type="search"
          placeholder="搜索帖子标题或正文"
          @confirm="refresh"
        />
        <button class="primary" @click="openCreate">发布帖子</button>
      </view>

      <scroll-view scroll-x class="tag-scroll">
        <view class="tag-row">
          <button
            v-for="tag in TAG_OPTIONS"
            :key="tag.id || 'all'"
            class="tag"
            :class="{ active: activeTag === tag.id }"
            @click="selectTag(tag.id)"
          >
            {{ tag.label }}
          </button>
        </view>
      </scroll-view>

      <view v-if="loading" class="state">正在加载社区内容...</view>
      <view v-else-if="errorMessage" class="state error">
        <view>{{ errorMessage }}</view>
        <button class="secondary" @click="refresh">重试</button>
      </view>
      <view v-else-if="posts.length === 0" class="state">
        <view>还没有匹配的帖子，试试换个关键词或发布第一条内容。</view>
      </view>

      <template v-else>
        <view
          v-for="post in posts"
          :key="post._id"
          class="card"
          @click="openDetail(post._id)"
        >
          <image
            v-if="post.image_urls[0]"
            class="cover"
            mode="aspectFill"
            :src="post.image_urls[0]"
          />
          <view class="card-body">
            <view class="meta">
              <text>{{ formatLanguage(post.language) }}</text>
              <text v-if="post.location_text"> · {{ post.location_text }}</text>
            </view>
            <view class="card-title">{{ post.title }}</view>
            <view class="card-text">{{ post.content }}</view>
            <view class="tag-list">
              <text v-for="tag in post.tag_ids" :key="tag" class="tag-pill">
                #{{ tagLabel(tag) }}
              </text>
            </view>
          </view>
        </view>
      </template>

      <button
        v-if="posts.length > 0 && hasMore"
        class="secondary"
        :disabled="loadingMore"
        @click="loadMore"
      >
        {{ loadingMore ? "加载中..." : "加载更多" }}
      </button>
    </SectionPanel>
  </view>
</template>

<style scoped>
.page {
  padding: 24rpx;
}

.toolbar {
  display: flex;
  gap: 16rpx;
  align-items: center;
  margin-bottom: 20rpx;
}

.search {
  flex: 1;
  height: 72rpx;
  background: #f9fafb;
  border-radius: 999rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
}

.primary {
  min-width: 180rpx;
  background: #1d4ed8;
  color: white;
}

.secondary {
  margin-top: 20rpx;
  color: #1d4ed8;
  background: #eff6ff;
}

.tag-scroll {
  white-space: nowrap;
  margin-bottom: 16rpx;
}

.tag-row {
  display: flex;
  gap: 12rpx;
}

.tag {
  display: inline-flex;
  align-items: center;
  height: 58rpx;
  padding: 0 22rpx;
  border-radius: 999rpx;
  font-size: 24rpx;
  color: #374151;
  background: #f3f4f6;
}

.tag.active {
  color: white;
  background: #0f766e;
}

.state {
  padding: 48rpx 24rpx;
  text-align: center;
  color: #6b7280;
  background: #f9fafb;
  border-radius: 24rpx;
}

.state.error {
  color: #b91c1c;
  background: #fef2f2;
}

.card {
  overflow: hidden;
  margin-top: 20rpx;
  background: white;
  border: 1rpx solid #e5e7eb;
  border-radius: 28rpx;
  box-shadow: 0 12rpx 28rpx rgba(15, 23, 42, 0.06);
}

.cover {
  width: 100%;
  height: 260rpx;
  background: #f3f4f6;
}

.card-body {
  padding: 24rpx;
}

.meta {
  margin-bottom: 10rpx;
  color: #6b7280;
  font-size: 24rpx;
}

.card-title {
  font-size: 32rpx;
  font-weight: 600;
}

.card-text {
  margin-top: 10rpx;
  color: #6b7280;
  line-height: 1.6;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  margin-top: 18rpx;
}

.tag-pill {
  padding: 6rpx 14rpx;
  color: #0f766e;
  font-size: 22rpx;
  background: #ecfdf5;
  border-radius: 999rpx;
}
</style>
