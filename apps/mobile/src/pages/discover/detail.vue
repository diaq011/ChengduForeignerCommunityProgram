<script setup lang="ts">
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";

import { mobileApi } from "@/api/client";
import type { Comment, Post } from "@/types";

const TAG_LABELS: Record<string, string> = {
  life: "生活",
  help: "求助",
  sports: "运动",
  social: "社交",
  language: "语言",
  food: "餐饮",
  secondhand: "二手"
};

const REPORT_REASONS = ["广告或垃圾信息", "不友善内容", "虚假信息", "其他问题"];

const post = ref<Post | null>(null);
const comments = ref<Comment[]>([]);
const postId = ref("");
const commentValue = ref("");
const loading = ref(false);
const commentsLoading = ref(false);
const submittingComment = ref(false);
const reporting = ref(false);
const errorMessage = ref("");
/** True while Chinese/IME composition is active (e.g. pinyin not yet committed). */
const isComposing = ref(false);
/** Briefly true after composition ends so Enter to commit IME text does not send. */
const blockConfirmAfterComposition = ref(false);
let compositionBlockTimer: ReturnType<typeof setTimeout> | null = null;

const tagLabel = (id: string) => TAG_LABELS[id] ?? id;

const loadComments = async () => {
  if (!postId.value) {
    return;
  }
  commentsLoading.value = true;
  try {
    const result = await mobileApi.discover.listComments(postId.value, {
      page: 1,
      pageSize: 20
    });
    comments.value = result.data.items;
  } finally {
    commentsLoading.value = false;
  }
};

const loadPost = async (id: string) => {
  loading.value = true;
  errorMessage.value = "";
  try {
    const result = await mobileApi.discover.detailPost(id);
    post.value = result.data;
    await loadComments();
  } catch {
    errorMessage.value = "帖子加载失败，请返回后重试。";
  } finally {
    loading.value = false;
  }
};

const onCompositionStart = () => {
  isComposing.value = true;
  if (compositionBlockTimer) {
    clearTimeout(compositionBlockTimer);
    compositionBlockTimer = null;
  }
  blockConfirmAfterComposition.value = false;
};

const onCompositionEnd = () => {
  isComposing.value = false;
  blockConfirmAfterComposition.value = true;
  if (compositionBlockTimer) {
    clearTimeout(compositionBlockTimer);
  }
  compositionBlockTimer = setTimeout(() => {
    blockConfirmAfterComposition.value = false;
    compositionBlockTimer = null;
  }, 200);
};

const shouldIgnoreKeyboardConfirm = () =>
  isComposing.value || blockConfirmAfterComposition.value;

const onCommentKeyboardConfirm = () => {
  // Defer so compositionend from the same Enter key runs before we decide to send.
  setTimeout(() => {
    if (shouldIgnoreKeyboardConfirm()) {
      return;
    }
    void submitComment();
  }, 0);
};

const submitComment = async () => {
  if (!post.value) {
    return;
  }
  const content = commentValue.value.trim();
  if (!content) {
    uni.showToast({ title: "请输入评论内容", icon: "none" });
    return;
  }

  submittingComment.value = true;
  try {
    await mobileApi.discover.createComment(post.value._id, {
      content,
      language: post.value.language,
      parent_id: null
    });
    commentValue.value = "";
    await loadComments();
    uni.showToast({ title: "已发送", icon: "success" });
  } catch {
    uni.showToast({ title: "发送失败", icon: "none" });
  } finally {
    submittingComment.value = false;
  }
};

const reportPost = () => {
  if (!post.value || reporting.value) {
    return;
  }
  uni.showActionSheet({
    itemList: REPORT_REASONS,
    success: async ({ tapIndex }) => {
      if (!post.value) {
        return;
      }
      reporting.value = true;
      try {
        await mobileApi.discover.reportPost(post.value._id, {
          reason: REPORT_REASONS[tapIndex],
          description: "mobile discover report"
        });
        uni.showToast({ title: "已举报", icon: "success" });
      } catch {
        uni.showToast({ title: "举报失败", icon: "none" });
      } finally {
        reporting.value = false;
      }
    }
  });
};

onLoad(async (query) => {
  if (!query?.id) {
    errorMessage.value = "缺少帖子 ID。";
    return;
  }
  postId.value = String(query.id);
  await loadPost(postId.value);
});
</script>

<template>
  <view class="page">
    <view v-if="loading" class="state">正在加载...</view>
    <view v-else-if="errorMessage" class="state error">{{ errorMessage }}</view>

    <template v-else-if="post">
      <scroll-view scroll-y class="content-scroll">
        <view class="post-block">
          <view class="title-row">
            <text class="post-title">{{ post.title }}</text>
            <view class="report-link" @click.stop="reportPost">
              <text class="report-link-text">{{ reporting ? "..." : "举报" }}</text>
            </view>
          </view>

          <view v-if="post.location_text" class="post-location">
            <text class="post-location-text">{{ post.location_text }}</text>
          </view>

          <view v-if="post.image_urls.length > 0" class="gallery">
            <image
              v-for="url in post.image_urls"
              :key="url"
              :src="url"
              mode="widthFix"
              class="gallery-image"
            />
          </view>

          <text class="post-content">{{ post.content }}</text>

          <view v-if="post.tag_ids.length > 0" class="tag-list">
            <text v-for="tag in post.tag_ids" :key="tag" class="tag-pill">
              #{{ tagLabel(tag) }}
            </text>
          </view>
        </view>

        <view class="comments-block">
          <view class="comments-header">
            <text class="comments-title">评论</text>
            <text class="comments-count">{{ comments.length }}</text>
          </view>

          <view v-if="commentsLoading" class="comment-empty">
            <text>加载中...</text>
          </view>
          <view v-else-if="comments.length === 0" class="comment-empty">
            <text>还没有评论，来说点什么吧</text>
          </view>
          <view v-else class="comment-list">
            <view v-for="comment in comments" :key="comment._id" class="comment-item">
              <view class="comment-avatar">
                <text class="comment-avatar-text">邻</text>
              </view>
              <view class="comment-main">
                <text class="comment-content">{{ comment.content }}</text>
                <text class="comment-time">{{ comment.created_at }}</text>
              </view>
            </view>
          </view>
        </view>

        <view class="scroll-spacer" />
      </scroll-view>

      <view class="comment-bar">
        <view class="comment-input-wrap">
          <input
            v-model="commentValue"
            class="comment-input"
            maxlength="500"
            placeholder="说点什么..."
            confirm-type="done"
            @compositionstart="onCompositionStart"
            @compositionend="onCompositionEnd"
            @confirm="onCommentKeyboardConfirm"
          />
        </view>
        <view
          class="send-btn"
          :class="{ disabled: submittingComment || !commentValue.trim() }"
          @click="submitComment"
        >
          <text class="send-btn-text">{{ submittingComment ? "..." : "发送" }}</text>
        </view>
      </view>
    </template>
  </view>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #f7f7f7;
}

.state {
  padding: 80rpx 24rpx;
  text-align: center;
  color: #999999;
  font-size: 28rpx;
}

.state.error {
  color: #ff2442;
}

.content-scroll {
  flex: 1;
  height: 0;
}

.scroll-spacer {
  height: calc(120rpx + env(safe-area-inset-bottom));
}

.post-block {
  padding: 24rpx 24rpx 16rpx;
  background: #ffffff;
}

.title-row {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16rpx;
}

.post-title {
  flex: 1;
  font-size: 34rpx;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1.45;
}

.report-link {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 48rpx;
  padding: 0 8rpx;
}

.report-link-text {
  font-size: 24rpx;
  color: #999999;
  line-height: 1;
}

.post-location {
  margin-top: 12rpx;
}

.post-location-text {
  font-size: 24rpx;
  color: #999999;
}

.gallery {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  margin-top: 20rpx;
}

.gallery-image {
  width: 100%;
  border-radius: 12rpx;
  background: #f0f0f0;
}

.post-content {
  display: block;
  margin-top: 20rpx;
  font-size: 30rpx;
  color: #333333;
  line-height: 1.75;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 20rpx;
}

.tag-pill {
  padding: 6rpx 14rpx;
  font-size: 24rpx;
  color: #666666;
  background: #f5f5f5;
  border-radius: 8rpx;
  line-height: 1.2;
}

.comments-block {
  margin-top: 16rpx;
  padding: 24rpx;
  background: #ffffff;
}

.comments-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8rpx;
  margin-bottom: 20rpx;
}

.comments-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #1a1a1a;
}

.comments-count {
  font-size: 24rpx;
  color: #999999;
}

.comment-empty {
  padding: 40rpx 0;
  text-align: center;
  font-size: 26rpx;
  color: #999999;
}

.comment-list {
  display: flex;
  flex-direction: column;
  gap: 28rpx;
}

.comment-item {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 16rpx;
}

.comment-avatar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64rpx;
  height: 64rpx;
  background: #f0f0f0;
  border-radius: 50%;
}

.comment-avatar-text {
  font-size: 24rpx;
  color: #999999;
  line-height: 1;
}

.comment-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.comment-content {
  font-size: 28rpx;
  color: #333333;
  line-height: 1.55;
}

.comment-time {
  font-size: 22rpx;
  color: #bbbbbb;
}

.comment-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16rpx;
  padding: 16rpx 24rpx;
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
  background: #ffffff;
  border-top: 1rpx solid #eeeeee;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.04);
}

.comment-input-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  height: 72rpx;
  padding: 0 24rpx;
  background: #f5f5f5;
  border-radius: 999rpx;
}

.comment-input {
  width: 100%;
  height: 72rpx;
  font-size: 28rpx;
  color: #333333;
  line-height: 72rpx;
}

.send-btn {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 72rpx;
  padding: 0 28rpx;
  background: #ff2442;
  border-radius: 999rpx;
}

.send-btn.disabled {
  opacity: 0.45;
}

.send-btn-text {
  font-size: 28rpx;
  font-weight: 600;
  color: #ffffff;
  line-height: 1;
}
</style>
