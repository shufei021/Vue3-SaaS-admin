<template>
  <div class="page-container">
    <div class="card-base">
      <el-tabs v-model="activeTab" type="border-card">
        <!-- Basic Config -->
        <el-tab-pane label="基础配置" name="basic">
          <el-form :model="basicForm" label-width="140px" style="max-width: 600px; margin-top: 16px">
            <el-form-item label="系统名称">
              <el-input v-model="basicForm.siteName" />
            </el-form-item>
            <el-form-item label="系统 Logo">
              <el-input v-model="basicForm.logo" placeholder="Logo URL" />
            </el-form-item>
            <el-form-item label="版权信息">
              <el-input v-model="basicForm.copyright" />
            </el-form-item>
            <el-form-item label="默认语言">
              <el-select v-model="basicForm.language" style="width: 100%">
                <el-option label="简体中文" value="zh-CN" />
                <el-option label="English" value="en-US" />
              </el-select>
            </el-form-item>
            <el-form-item label="时区">
              <el-select v-model="basicForm.timezone" style="width: 100%">
                <el-option label="Asia/Shanghai (UTC+8)" value="Asia/Shanghai" />
                <el-option label="UTC" value="UTC" />
              </el-select>
            </el-form-item>
            <el-form-item label="每页默认条数">
              <el-input-number v-model="basicForm.pageSize" :min="10" :max="100" :step="10" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSave('basic')">保存配置</el-button>
              <el-button @click="handleReset('basic')">重置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- Notification Settings -->
        <el-tab-pane label="通知设置" name="notification">
          <el-form :model="notifyForm" label-width="140px" style="max-width: 600px; margin-top: 16px">
            <el-form-item label="邮件通知">
              <el-switch v-model="notifyForm.emailEnabled" />
            </el-form-item>
            <el-form-item label="SMTP 服务器">
              <el-input v-model="notifyForm.smtpHost" placeholder="smtp.example.com" />
            </el-form-item>
            <el-form-item label="SMTP 端口">
              <el-input-number v-model="notifyForm.smtpPort" :min="1" :max="65535" />
            </el-form-item>
            <el-form-item label="发件人邮箱">
              <el-input v-model="notifyForm.fromEmail" placeholder="noreply@example.com" />
            </el-form-item>
            <el-form-item label="短信通知">
              <el-switch v-model="notifyForm.smsEnabled" />
            </el-form-item>
            <el-form-item label="短信服务商">
              <el-select v-model="notifyForm.smsProvider" style="width: 100%">
                <el-option label="阿里云" value="aliyun" />
                <el-option label="腾讯云" value="tencent" />
              </el-select>
            </el-form-item>
            <el-form-item label="系统告警通知">
              <el-switch v-model="notifyForm.alertEnabled" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSave('notification')">保存配置</el-button>
              <el-button @click="handleTestNotify">发送测试通知</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- Security Settings -->
        <el-tab-pane label="安全策略" name="security">
          <el-form :model="securityForm" label-width="160px" style="max-width: 600px; margin-top: 16px">
            <el-form-item label="密码最小长度">
              <el-input-number v-model="securityForm.minPasswordLength" :min="6" :max="32" />
            </el-form-item>
            <el-form-item label="密码复杂度要求">
              <el-checkbox-group v-model="securityForm.passwordRules">
                <el-checkbox value="uppercase">大写字母</el-checkbox>
                <el-checkbox value="lowercase">小写字母</el-checkbox>
                <el-checkbox value="number">数字</el-checkbox>
                <el-checkbox value="special">特殊字符</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            <el-form-item label="登录失败锁定次数">
              <el-input-number v-model="securityForm.maxLoginAttempts" :min="3" :max="10" />
            </el-form-item>
            <el-form-item label="锁定时长(分钟)">
              <el-input-number v-model="securityForm.lockDuration" :min="5" :max="120" :step="5" />
            </el-form-item>
            <el-form-item label="会话超时(分钟)">
              <el-input-number v-model="securityForm.sessionTimeout" :min="15" :max="480" :step="15" />
            </el-form-item>
            <el-form-item label="强制双因素认证">
              <el-switch v-model="securityForm.force2FA" />
            </el-form-item>
            <el-form-item label="IP 白名单">
              <el-switch v-model="securityForm.ipWhitelist" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSave('security')">保存配置</el-button>
              <el-button @click="handleReset('security')">重置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { ElMessage } from "element-plus";

const activeTab = ref("basic");

const basicForm = reactive({
  siteName: "SaaS Admin",
  logo: "",
  copyright: "© 2025 SaaS Admin. All rights reserved.",
  language: "zh-CN",
  timezone: "Asia/Shanghai",
  pageSize: 20,
});

const notifyForm = reactive({
  emailEnabled: true,
  smtpHost: "smtp.example.com",
  smtpPort: 465,
  fromEmail: "noreply@saas-admin.com",
  smsEnabled: false,
  smsProvider: "aliyun",
  alertEnabled: true,
});

const securityForm = reactive({
  minPasswordLength: 8,
  passwordRules: ["lowercase", "number"] as string[],
  maxLoginAttempts: 5,
  lockDuration: 30,
  sessionTimeout: 120,
  force2FA: false,
  ipWhitelist: false,
});

function handleSave(tab: string) {
  ElMessage.success(`${tab}配置已保存（Mock）`);
}

function handleReset(tab: string) {
  ElMessage.info(`${tab}配置已重置`);
}

function handleTestNotify() {
  ElMessage.success("测试通知已发送（Mock）");
}
</script>
