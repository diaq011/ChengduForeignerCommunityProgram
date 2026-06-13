<script setup lang="ts">
import { onMounted, ref } from "vue";
import type { EventRegistration } from "@/types";

import { mobileApi } from "@/api/client";

const registrations = ref<EventRegistration[]>([]);

onMounted(async () => {
  const result = await mobileApi.events.myRegistrations();
  registrations.value = result.data;
});

const openTicket = (registrationId: string) => {
  uni.navigateTo({
    url: `/pages/events/ticket?registrationId=${registrationId}`
  });
};
</script>

<template>
  <view class="page">
    <view
      v-for="item in registrations"
      :key="item._id"
      class="card"
      @click="openTicket(item._id)"
    >
      <view>报名记录：{{ item._id }}</view>
      <view class="caption">活动：{{ item.event_id }}</view>
      <view class="caption">人数：{{ item.attendee_count }}</view>
      <view class="caption">状态：{{ item.registration_status }}</view>
      <view class="link">查看凭证</view>
    </view>
    <view v-if="registrations.length === 0" class="empty">暂无报名记录。</view>
  </view>
</template>

<style scoped>
.page {
  padding: 24rpx;
}

.card {
  background: white;
  border-radius: 20rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.caption {
  color: #6b7280;
  margin-top: 10rpx;
}

.link {
  margin-top: 16rpx;
  color: #0f766e;
  font-weight: 600;
}

.empty {
  color: #6b7280;
  text-align: center;
}
</style>
