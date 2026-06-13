<script setup lang="ts">
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import type { EventTicket } from "@/types";

import { mobileApi } from "@/api/client";
import SectionPanel from "@/components/SectionPanel.vue";

const ticket = ref<EventTicket | null>(null);

onLoad(async (query) => {
  const registrationId = query?.registrationId;
  if (!registrationId) {
    return;
  }
  const result = await mobileApi.events.registrationTicket(String(registrationId));
  ticket.value = result.data;
});
</script>

<template>
  <view class="page">
    <SectionPanel title="报名凭证" subtitle="活动现场可出示此凭证用于核销">
      <view v-if="ticket" class="ticket-card">
        <view class="code">{{ ticket.ticket_code }}</view>
        <view class="line">状态：{{ ticket.status }}</view>
        <view class="line">签发时间：{{ ticket.issued_at }}</view>
        <view class="qr-placeholder">
          <view>二维码文件</view>
          <view class="path">{{ ticket.qr_cloud_path }}</view>
        </view>
      </view>
      <view v-else class="empty">凭证加载中...</view>
    </SectionPanel>
  </view>
</template>

<style scoped>
.page {
  padding: 24rpx;
}

.ticket-card {
  padding: 24rpx;
  border-radius: 24rpx;
  background: #f8fafc;
}

.code {
  margin-bottom: 20rpx;
  font-size: 36rpx;
  font-weight: 700;
  color: #0f766e;
}

.line {
  margin-top: 12rpx;
  color: #475569;
}

.qr-placeholder {
  margin-top: 28rpx;
  padding: 32rpx;
  border: 2rpx dashed #94a3b8;
  border-radius: 20rpx;
  color: #64748b;
  text-align: center;
}

.path {
  margin-top: 12rpx;
  word-break: break-all;
}

.empty {
  color: #64748b;
}
</style>
