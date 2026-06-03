<script setup lang="ts">
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";

import { mobileApi } from "@/api/client";
import SectionPanel from "@/components/SectionPanel.vue";
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
  } catch (error) {
    errorMessage.value = "帖子加载失败，请返回后重试。";
  } finally {
    loading.value = false;
  }
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
    uni.showToast({ title: "评论已提交", icon: "success" });
  } catch (error) {
    uni.showToast({ title: "评论提交失败", icon: "none" });
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
        uni.showToast({ title: "举报已提交", icon: "success" });
      } catch (error) {
        uni.showToast({ title: "举报失败，请稍后再试", icon: "none" });
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
    <view v-if="loading" class="state">正在加载帖子...</view>
    <view v-else-if="errorMessage" class="state error">{{ errorMessage }}</view>

    <SectionPanel v-if="post" :title="post.title" :subtitle="post.language">
        <view class="meta">
          <text>{{ post.language === "en" ? "English" : "中文" }}</text>
          <text v-if="post.location_text"> · {{ post.location_text }}</text>
        </view>

        <view v-if="post.image_urls.length > 0" class="gallery">
          <image
            v-for="url in post.image_urls"
            :key="url"
            :src="url"
            mode="aspectFill"
            class="gallery-image"
          />
        </view>

        <view class="content">{{ post.content }}</view>

        <view class="tag-list">
          <text v-for="tag in post.tag_ids" :key="tag" class="tag-pill">
            #{{ tagLabel(tag) }}
          </text>
        </view>

        <button class="report" :disabled="reporting" @click="reportPost">
          {{ reporting ? "提交中..." : "举报内容" }}
        </button>

        <view class="comment-section">
          <view class="section-heading">评论</view>
          <view v-if="commentsLoading" class="comment-state">正在加载评论...</view>
          <view v-else-if="comments.length === 0" class="comment-state">
            暂无评论，来写第一条吧。
          </view>
          <template v-else>
            <view v-for="comment in comments" :key="comment._id" class="comment">
              <view class="comment-meta">
                {{ comment.language === "en" ? "English" : "中文" }} · {{ comment.created_at }}
              </view>
              <view class="comment-content">{{ comment.content }}</view>
            </view>
          </template>
        </view>

        <textarea
          v-model="commentValue"
          class="textarea"
          maxlength="500"
          placeholder="写下你的评论"
        />
        <button class="primary" :disabled="submittingComment" @click="submitComment">
          {{ submittingComment ? "提交中..." : "发表评论" }}
        </button>
    </SectionPanel>
  </view>
</template>

<style scoped>
.page {
  padding: 24rpx;
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

.meta {
  color: #6b7280;
  font-size: 24rpx;
  margin-bottom: 18rpx;
}

.gallery {
  display: flex;
  gap: 12rpx;
  overflow-x: auto;
  margin-bottom: 20rpx;
}

.gallery-image {
  flex: 0 0 260rpx;
  width: 260rpx;
  height: 200rpx;
  border-radius: 20rpx;
  background: #f3f4f6;
}

.content {
  line-height: 1.7;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  margin-top: 20rpx;
}

.tag-pill {
  padding: 6rpx 14rpx;
  color: #0f766e;
  font-size: 22rpx;
  background: #ecfdf5;
  border-radius: 999rpx;
}

.report {
  margin-top: 24rpx;
  color: #b91c1c;
  background: #fef2f2;
}

.comment-section {
  margin-top: 32rpx;
  padding-top: 24rpx;
  border-top: 1rpx solid #e5e7eb;
}

.section-heading {
  margin-bottom: 16rpx;
  font-size: 30rpx;
  font-weight: 600;
}

.comment-state {
  color: #6b7280;
  font-size: 26rpx;
}

.comment {
  padding: 18rpx 0;
  border-bottom: 1rpx solid #f3f4f6;
}

.comment-meta {
  color: #9ca3af;
  font-size: 22rpx;
}

.comment-content {
  margin-top: 8rpx;
  line-height: 1.6;
}

.textarea {
  width: 100%;
  box-sizing: border-box;
  min-height: 180rpx;
  background: #f9fafb;
  border-radius: 20rpx;
  margin-top: 20rpx;
  padding: 20rpx;
}

.primary {
  margin-top: 20rpx;
  background: #1d4ed8;
  color: white;
}

.primary[disabled] {
  color: white;
  background: #93c5fd;
}
</style>
