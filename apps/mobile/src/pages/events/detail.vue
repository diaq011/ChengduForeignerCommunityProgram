<script setup lang="ts">
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import type { Event } from "@/types";

import { mobileApi } from "@/api/client";
import SectionPanel from "@/components/SectionPanel.vue";
import { pickLocalized, useAppStore } from "@/stores/app-store";

const { state } = useAppStore();
const event = ref<Event | null>(null);

onLoad(async (query) => {
  if (!query?.id) {
    return;
  }
  const result = await mobileApi.events.detail(String(query.id));
  event.value = result.data;
});

const openRegister = () => {
  if (!event.value) {
    return;
  }

  uni.navigateTo({
    url: `/pages/events/register?id=${event.value._id}`
  });
};
</script>

<template>
  <view class="page" v-if="event">
    <SectionPanel :title="pickLocalized(state.locale, event.title_zh, event.title_en)">
      <view class="line">{{ pickLocalized(state.locale, event.summary_zh, event.summary_en) }}</view>
      <view class="line">{{ pickLocalized(state.locale, event.content_zh, event.content_en) }}</view>
      <view class="line">{{ event.address_text }}</view>
      <view class="line">时间：{{ event.start_time }} - {{ event.end_time }}</view>
      <view class="line">报名截止：{{ event.signup_deadline }}</view>
      <view class="line">名额：{{ event.capacity }}</view>
      <button class="primary" @click="openRegister">立即报名</button>
    </SectionPanel>
  </view>
</template>

<style scoped>
.page {
  padding: 24rpx;
}

.line {
  margin-bottom: 16rpx;
}

.primary {
  margin-top: 20rpx;
  background: #0f766e;
  color: white;
}
</style>
