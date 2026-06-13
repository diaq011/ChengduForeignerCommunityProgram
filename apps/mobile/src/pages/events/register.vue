<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import type { Event } from "@/types";

import { mobileApi } from "@/api/client";
import SectionPanel from "@/components/SectionPanel.vue";
import { pickLocalized, useAppStore } from "@/stores/app-store";

const { state } = useAppStore();
const event = ref<Event | null>(null);
const submitting = ref(false);
const form = reactive({
  contact_name: "Jerry",
  contact_phone: "13800000000",
  attendee_count: 1
});

const canSubmit = computed(
  () =>
    !!event.value &&
    form.contact_name.trim().length > 0 &&
    form.contact_phone.trim().length >= 6 &&
    form.attendee_count >= 1 &&
    !submitting.value
);

onLoad(async (query) => {
  if (!query?.id) {
    return;
  }
  const result = await mobileApi.events.detail(String(query.id));
  event.value = result.data;
});

const submit = async () => {
  if (!event.value || !canSubmit.value) {
    uni.showToast({ title: "请填写报名信息", icon: "none" });
    return;
  }

  submitting.value = true;
  try {
    const result = await mobileApi.events.register(event.value._id, {
      contact_name: form.contact_name.trim(),
      contact_phone: form.contact_phone.trim(),
      attendee_count: form.attendee_count,
      source_channel: "miniapp"
    });
    uni.redirectTo({
      url: `/pages/events/ticket?registrationId=${result.data.registration._id}`
    });
  } finally {
    submitting.value = false;
  }
};
</script>

<template>
  <view class="page" v-if="event">
    <SectionPanel
      title="活动报名"
      :subtitle="pickLocalized(state.locale, event.title_zh, event.title_en)"
    >
      <view class="field">
        <view class="label">联系人姓名</view>
        <input v-model="form.contact_name" class="input" placeholder="请输入姓名" />
      </view>
      <view class="field">
        <view class="label">联系电话</view>
        <input
          v-model="form.contact_phone"
          class="input"
          type="number"
          placeholder="请输入联系电话"
        />
      </view>
      <view class="field">
        <view class="label">报名人数</view>
        <input
          v-model.number="form.attendee_count"
          class="input"
          type="number"
          placeholder="1"
        />
      </view>
      <button class="primary" :disabled="!canSubmit" @click="submit">
        {{ submitting ? "提交中..." : "提交报名" }}
      </button>
    </SectionPanel>
  </view>
</template>

<style scoped>
.page {
  padding: 24rpx;
}

.field {
  margin-bottom: 24rpx;
}

.label {
  margin-bottom: 12rpx;
  font-weight: 600;
}

.input {
  width: 100%;
  box-sizing: border-box;
  padding: 20rpx;
  border-radius: 16rpx;
  background: #f8fafc;
}

.primary {
  margin-top: 20rpx;
  background: #0f766e;
  color: #ffffff;
}
</style>
