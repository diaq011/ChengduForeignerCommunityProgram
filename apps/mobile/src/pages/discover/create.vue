<script setup lang="ts">
import { computed, reactive, ref } from "vue";

import { mobileApi } from "@/api/client";

const TAG_OPTIONS = [
  { id: "life", label: "生活" },
  { id: "help", label: "求助" },
  { id: "sports", label: "运动" },
  { id: "social", label: "社交" },
  { id: "language", label: "语言" },
  { id: "food", label: "餐饮" },
  { id: "secondhand", label: "二手" }
];

const form = reactive({
  title: "",
  content: "",
  language: "zh" as "zh" | "en",
  tag_ids: [] as string[],
  location_text: "",
  image_file_ids: [] as string[],
  image_urls: [] as string[]
});

const submitting = ref(false);
const imageUrlInput = ref("");

const canSubmit = computed(
  () =>
    form.title.trim().length > 0 &&
    form.content.trim().length > 0 &&
    form.tag_ids.length > 0 &&
    !submitting.value
);

const tagSelected = (id: string) => form.tag_ids.includes(id);

const toggleTag = (id: string) => {
  if (tagSelected(id)) {
    form.tag_ids = form.tag_ids.filter((tag) => tag !== id);
    return;
  }
  form.tag_ids.push(id);
};

const selectLanguage = (language: "zh" | "en") => {
  form.language = language;
};

const addImageUrl = () => {
  const url = imageUrlInput.value.trim();
  if (!url) {
    return;
  }
  if (!/^https?:\/\//.test(url)) {
    uni.showToast({ title: "请输入有效图片 URL", icon: "none" });
    return;
  }
  form.image_urls.push(url);
  form.image_file_ids.push(`mock://${Date.now()}`);
  imageUrlInput.value = "";
};

const removeImage = (index: number) => {
  form.image_urls.splice(index, 1);
  form.image_file_ids.splice(index, 1);
};

const submit = async () => {
  if (!canSubmit.value) {
    uni.showToast({ title: "请填写标题、正文并选择标签", icon: "none" });
    return;
  }

  submitting.value = true;
  try {
    const result = await mobileApi.discover.createPost({
      ...form,
      title: form.title.trim(),
      content: form.content.trim(),
      location_text: form.location_text.trim() || null
    });
    uni.showToast({ title: "帖子已发布", icon: "success" });
    setTimeout(() => {
      uni.redirectTo({
        url: `/pages/discover/detail?id=${result.data._id}`
      });
    }, 300);
  } catch (error) {
    uni.showToast({ title: "发布失败，请稍后再试", icon: "none" });
  } finally {
    submitting.value = false;
  }
};
</script>

<template>
  <view class="page">
    <view class="section-title">发布社区帖子</view>
    <view class="section-subtitle">分享生活经验、求助信息或社区活动见闻。</view>

    <view class="field">
      <view class="label">标题</view>
      <input v-model="form.title" class="input" maxlength="80" placeholder="例如：周末有没有语言交换活动？" />
    </view>

    <view class="field">
      <view class="label">正文</view>
      <textarea
        v-model="form.content"
        class="textarea"
        maxlength="1000"
        placeholder="写下更多细节，方便邻居理解和回复"
      />
    </view>

    <view class="field">
      <view class="label">语言</view>
      <view class="segmented">
        <button
          class="segment"
          :class="{ active: form.language === 'zh' }"
          @click="selectLanguage('zh')"
        >
          中文
        </button>
        <button
          class="segment"
          :class="{ active: form.language === 'en' }"
          @click="selectLanguage('en')"
        >
          English
        </button>
      </view>
    </view>

    <view class="field">
      <view class="label">标签（至少选择 1 个）</view>
      <view class="tag-list">
        <button
          v-for="tag in TAG_OPTIONS"
          :key="tag.id"
          class="tag"
          :class="{ active: tagSelected(tag.id) }"
          @click="toggleTag(tag.id)"
        >
          {{ tag.label }}
        </button>
      </view>
    </view>

    <view class="field">
      <view class="label">位置</view>
      <input v-model="form.location_text" class="input" placeholder="例如：桐梓林地铁站附近" />
    </view>

    <view class="field">
      <view class="label">图片（临时 URL 占位）</view>
      <view class="image-input">
        <input v-model="imageUrlInput" class="input" placeholder="https://example.com/post.jpg" />
        <button class="secondary" @click="addImageUrl">添加</button>
      </view>
      <view class="hint">正式上传会走 `public/posts/` 云存储绑定流程。</view>
      <view v-if="form.image_urls.length > 0" class="preview-grid">
        <view v-for="(url, index) in form.image_urls" :key="url" class="preview">
          <image :src="url" mode="aspectFill" class="preview-image" />
          <button class="remove" @click="removeImage(index)">删除</button>
        </view>
      </view>
    </view>

    <button class="primary" :disabled="!canSubmit" @click="submit">
      {{ submitting ? "发布中..." : "发布帖子" }}
    </button>
  </view>
</template>

<style scoped>
.page {
  padding: 24rpx;
}

.section-title {
  font-size: 34rpx;
  font-weight: 600;
  margin-bottom: 20rpx;
}

.section-subtitle {
  margin-bottom: 28rpx;
  color: #6b7280;
  line-height: 1.6;
}

.field {
  margin-bottom: 28rpx;
}

.label {
  margin-bottom: 12rpx;
  color: #111827;
  font-size: 28rpx;
  font-weight: 600;
}

.input,
.textarea {
  width: 100%;
  box-sizing: border-box;
  background: #ffffff;
  border: 1rpx solid #e5e7eb;
  border-radius: 20rpx;
  padding: 20rpx;
}

.textarea {
  min-height: 220rpx;
}

.segmented,
.tag-list,
.image-input {
  display: flex;
  gap: 14rpx;
}

.segmented,
.tag-list {
  flex-wrap: wrap;
}

.segment,
.tag {
  color: #374151;
  background: #f3f4f6;
  border-radius: 999rpx;
}

.segment.active,
.tag.active {
  color: white;
  background: #0f766e;
}

.image-input .input {
  flex: 1;
}

.secondary {
  color: #1d4ed8;
  background: #eff6ff;
}

.hint {
  margin-top: 10rpx;
  color: #9ca3af;
  font-size: 24rpx;
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12rpx;
  margin-top: 16rpx;
}

.preview {
  position: relative;
}

.preview-image {
  width: 100%;
  height: 160rpx;
  border-radius: 16rpx;
  background: #f3f4f6;
}

.remove {
  margin-top: 8rpx;
  color: #b91c1c;
  font-size: 22rpx;
  background: #fef2f2;
}

.primary {
  width: 100%;
  background: #1d4ed8;
  color: white;
}

.primary[disabled] {
  color: white;
  background: #93c5fd;
}
</style>
