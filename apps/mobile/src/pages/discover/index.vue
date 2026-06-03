<script setup lang="ts">
import { computed, onMounted, ref } from "vue";

import { mobileApi } from "@/api/client";
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
  } catch {
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
    <view class="header">
      <text class="header-title">发现</text>
      <view class="publish-btn" @click="openCreate">
        <text class="publish-btn-text">发布</text>
      </view>
    </view>

    <view class="search-bar">
      <input
        v-model="keyword"
        class="search-input"
        confirm-type="search"
        placeholder="搜索你想看的内容"
        @confirm="refresh"
      />
    </view>

    <scroll-view scroll-x class="tag-scroll" :show-scrollbar="false">
      <view class="tag-row">
        <view
          v-for="tag in TAG_OPTIONS"
          :key="tag.id || 'all'"
          class="tag-chip"
          :class="{ active: activeTag === tag.id }"
          @click="selectTag(tag.id)"
        >
          <text class="tag-chip-text">{{ tag.label }}</text>
        </view>
      </view>
    </scroll-view>

    <scroll-view scroll-y class="feed-scroll">
      <view v-if="loading" class="state">正在加载...</view>
      <view v-else-if="errorMessage" class="state error">
        <text>{{ errorMessage }}</text>
        <view class="retry-btn" @click="refresh">
          <text class="retry-btn-text">重试</text>
        </view>
      </view>
      <view v-else-if="posts.length === 0" class="state">
        <text>还没有内容，来发布第一条吧</text>
      </view>

      <template v-else>
        <view
          v-for="post in posts"
          :key="post._id"
          class="note-card"
          @click="openDetail(post._id)"
        >
          <image
            v-if="post.image_urls[0]"
            class="note-cover"
            mode="aspectFill"
            :src="post.image_urls[0]"
          />
          <view class="note-body">
            <text class="note-title">{{ post.title }}</text>
            <text class="note-desc">{{ post.content }}</text>
            <view class="note-tags">
              <text v-for="tag in post.tag_ids" :key="tag" class="note-tag">
                {{ tagLabel(tag) }}
              </text>
            </view>
            <view v-if="post.location_text" class="note-meta">
              <text class="note-meta-text">{{ post.location_text }}</text>
            </view>
          </view>
        </view>

        <view
          v-if="hasMore"
          class="load-more"
          @click="loadMore"
        >
          <text class="load-more-text">{{ loadingMore ? "加载中..." : "加载更多" }}</text>
        </view>
      </template>
    </scroll-view>
  </view>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #f7f7f7;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 24rpx 8rpx;
}

.header-title {
  font-size: 40rpx;
  font-weight: 700;
  color: #1a1a1a;
}

.publish-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 56rpx;
  padding: 0 28rpx;
  background: #ff2442;
  border-radius: 999rpx;
}

.publish-btn-text {
  font-size: 26rpx;
  font-weight: 600;
  color: #ffffff;
  line-height: 1;
}

.search-bar {
  padding: 8rpx 24rpx 12rpx;
}

.search-input {
  height: 72rpx;
  padding: 0 28rpx;
  font-size: 28rpx;
  color: #333333;
  background: #ffffff;
  border-radius: 999rpx;
}

.tag-scroll {
  width: 100%;
  white-space: nowrap;
  margin-bottom: 8rpx;
}

.tag-row {
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  gap: 16rpx;
  padding: 8rpx 24rpx 12rpx;
}

.tag-chip {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  height: 56rpx;
  padding: 0 28rpx;
  background: #ffffff;
  border-radius: 999rpx;
}

.tag-chip.active {
  background: #ff2442;
}

.tag-chip-text {
  font-size: 26rpx;
  color: #666666;
  line-height: 1;
}

.tag-chip.active .tag-chip-text {
  color: #ffffff;
  font-weight: 600;
}

.feed-scroll {
  flex: 1;
  height: 0;
  padding: 0 24rpx 24rpx;
  box-sizing: border-box;
}

.state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20rpx;
  padding: 80rpx 24rpx;
  color: #999999;
  font-size: 28rpx;
}

.state.error {
  color: #ff2442;
}

.retry-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 56rpx;
  padding: 0 32rpx;
  background: #ffffff;
  border-radius: 999rpx;
}

.retry-btn-text {
  font-size: 26rpx;
  color: #ff2442;
  line-height: 1;
}

.note-card {
  overflow: hidden;
  margin-bottom: 20rpx;
  background: #ffffff;
  border-radius: 16rpx;
}

.note-cover {
  width: 100%;
  height: 360rpx;
  background: #f0f0f0;
}

.note-body {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
  padding: 20rpx 24rpx 24rpx;
}

.note-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #1a1a1a;
  line-height: 1.4;
}

.note-desc {
  font-size: 26rpx;
  color: #666666;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.note-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  margin-top: 4rpx;
}

.note-tag {
  padding: 4rpx 12rpx;
  font-size: 22rpx;
  color: #666666;
  background: #f5f5f5;
  border-radius: 6rpx;
  line-height: 1.2;
}

.note-meta-text {
  font-size: 22rpx;
  color: #999999;
}

.load-more {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24rpx 0 8rpx;
}

.load-more-text {
  font-size: 26rpx;
  color: #999999;
}
</style>
