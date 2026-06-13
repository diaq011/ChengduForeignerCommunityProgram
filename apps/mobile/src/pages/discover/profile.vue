<script setup lang="ts">
import { computed, ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";

import { mobileApi } from "@/api/client";
import type { Post, User } from "@/types";

import { getDiscoverProfile } from "./profile-data";

const profile = ref<User>(getDiscoverProfile());
const posts = ref<Post[]>([]);
const loading = ref(false);

const visiblePosts = computed(() =>
  posts.value.filter((post) => post.author_user_id === profile.value._id)
);

const stats = computed(() => [
  { label: "Posts", value: visiblePosts.value.length },
  { label: "Community", value: "Tongzilin" },
  { label: "Role", value: profile.value.role_flags.includes("organizer") ? "Organizer" : "Neighbor" }
]);

const bio = computed(() =>
  profile.value._id === "user_002"
    ? "Coffee, tennis, weekend meetups. Sharing useful notes around Tongzilin."
    : "桐梓林社区居民，记录活动、地点和邻里互助信息。"
);

const openPost = (id: string) => {
  uni.navigateTo({
    url: `/pages/discover/detail?id=${id}`
  });
};

onLoad(async (query) => {
  const userId = query?.userId ? String(query.userId) : undefined;
  profile.value = getDiscoverProfile(userId);
  loading.value = true;
  try {
    const result = await mobileApi.discover.listPosts({
      page: 1,
      pageSize: 100,
      includeHidden: false
    });
    posts.value = result.data.items;
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <view class="page">
    <view class="hero">
      <image class="avatar" mode="aspectFill" :src="profile.avatar_url" />
      <view class="hero-main">
        <view class="name-row">
          <text class="name">{{ profile.nickname }}</text>
          <text class="handle">@{{ profile._id.replace("_", ".") }}</text>
        </view>
        <view class="stats">
          <view v-for="item in stats" :key="item.label" class="stat-item">
            <text class="stat-value">{{ item.value }}</text>
            <text class="stat-label">{{ item.label }}</text>
          </view>
        </view>
      </view>
    </view>

    <view class="bio-card">
      <text class="bio-text">{{ bio }}</text>
    </view>

    <view class="section-head">
      <text class="section-title">Posts</text>
      <text class="section-meta">{{ visiblePosts.length }} notes</text>
    </view>

    <view v-if="loading" class="empty">正在加载主页...</view>
    <view v-else-if="visiblePosts.length === 0" class="empty">
      暂时还没有公开帖子。
    </view>
    <view v-else class="post-grid">
      <view
        v-for="post in visiblePosts"
        :key="post._id"
        class="post-tile"
        @click="openPost(post._id)"
      >
        <image
          v-if="post.image_urls[0]"
          class="tile-image"
          mode="aspectFill"
          :src="post.image_urls[0]"
        />
        <view v-else class="tile-fallback">
          <text class="tile-fallback-text">{{ post.title.slice(0, 18) }}</text>
        </view>
        <text class="tile-title">{{ post.title }}</text>
      </view>
    </view>
  </view>
</template>

<style scoped>
.page {
  min-height: 100vh;
  padding: 32rpx 24rpx;
  background: #f7f7f7;
}

.hero {
  display: flex;
  align-items: center;
  gap: 28rpx;
  padding: 28rpx;
  background: #ffffff;
  border-radius: 32rpx;
  box-shadow: 0 20rpx 60rpx rgba(15, 23, 42, 0.06);
}

.avatar {
  width: 132rpx;
  height: 132rpx;
  border: 4rpx solid #ffffff;
  border-radius: 50%;
  background: #e5e7eb;
  box-shadow: 0 12rpx 28rpx rgba(15, 118, 110, 0.16);
}

.hero-main {
  flex: 1;
  min-width: 0;
}

.name-row {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.name {
  color: #111827;
  font-size: 34rpx;
  font-weight: 700;
}

.handle {
  color: #8a8f98;
  font-size: 24rpx;
}

.stats {
  display: flex;
  justify-content: space-between;
  margin-top: 22rpx;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.stat-value {
  color: #111827;
  font-size: 26rpx;
  font-weight: 700;
}

.stat-label {
  color: #8a8f98;
  font-size: 22rpx;
}

.bio-card {
  margin-top: 18rpx;
  padding: 24rpx 28rpx;
  background: #ffffff;
  border-radius: 28rpx;
}

.bio-text {
  color: #374151;
  font-size: 27rpx;
  line-height: 1.55;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 34rpx 4rpx 18rpx;
}

.section-title {
  color: #111827;
  font-size: 30rpx;
  font-weight: 700;
}

.section-meta {
  color: #9ca3af;
  font-size: 24rpx;
}

.post-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18rpx;
}

.post-tile {
  overflow: hidden;
  background: #ffffff;
  border-radius: 26rpx;
  box-shadow: 0 12rpx 36rpx rgba(15, 23, 42, 0.045);
}

.tile-image,
.tile-fallback {
  width: 100%;
  height: 220rpx;
  background: #ecfdf5;
}

.tile-fallback {
  display: flex;
  align-items: flex-end;
  box-sizing: border-box;
  padding: 20rpx;
}

.tile-fallback-text {
  color: #0f766e;
  font-size: 28rpx;
  font-weight: 700;
  line-height: 1.35;
}

.tile-title {
  display: -webkit-box;
  padding: 16rpx 18rpx 20rpx;
  overflow: hidden;
  color: #1f2937;
  font-size: 25rpx;
  font-weight: 600;
  line-height: 1.35;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.empty {
  padding: 72rpx 24rpx;
  color: #9ca3af;
  font-size: 27rpx;
  text-align: center;
  background: #ffffff;
  border-radius: 28rpx;
}
</style>
