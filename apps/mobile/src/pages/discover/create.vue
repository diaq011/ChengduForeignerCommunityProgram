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
        <view
          class="segment-chip"
          :class="{ active: form.language === 'zh' }"
          @click="selectLanguage('zh')"
        >
          <text class="segment-chip-text">中文</text>
        </view>
        <view
          class="segment-chip"
          :class="{ active: form.language === 'en' }"
          @click="selectLanguage('en')"
        >
          <text class="segment-chip-text">English</text>
        </view>
      </view>
    </view>

    <view class="field">
      <view class="label">标签（至少选择 1 个）</view>
      <view class="tag-list">
        <view
          v-for="tag in TAG_OPTIONS"
          :key="tag.id"
          class="tag-chip"
          :class="{ active: tagSelected(tag.id) }"
          @click="toggleTag(tag.id)"
        >
          <text class="tag-chip-text">{{ tag.label }}</text>
        </view>
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

    <view
      class="submit-btn"
      :class="{ disabled: !canSubmit }"
      @click="submit"
    >
      <text class="submit-btn-text">{{ submitting ? "发布中..." : "发布笔记" }}</text>
    </view>
  </view>
</template>

<style scoped>
.page {
  min-height: 100vh;
  padding: 24rpx;
  background: #f7f7f7;
}

.section-title {
  font-size: 34rpx;
  font-weight: 700;
  margin-bottom: 12rpx;
  color: #1a1a1a;
}

.section-subtitle {
  margin-bottom: 28rpx;
  color: #999999;
  font-size: 26rpx;
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
  border: none;
  border-radius: 16rpx;
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

.segment-chip,
.tag-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 56rpx;
  padding: 0 28rpx;
  background: #ffffff;
  border-radius: 999rpx;
}

.segment-chip.active,
.tag-chip.active {
  background: #ff2442;
}

.segment-chip-text,
.tag-chip-text {
  font-size: 26rpx;
  color: #666666;
  line-height: 1;
}

.segment-chip.active .segment-chip-text,
.tag-chip.active .tag-chip-text {
  color: #ffffff;
  font-weight: 600;
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

.submit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 88rpx;
  margin-top: 16rpx;
  background: #ff2442;
  border-radius: 999rpx;
}

.submit-btn.disabled {
  opacity: 0.45;
}

.submit-btn-text {
  font-size: 30rpx;
  font-weight: 600;
  color: #ffffff;
  line-height: 1;
}
</style>
