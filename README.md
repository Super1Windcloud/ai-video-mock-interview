<div align="center">
  <h3 align="center">由 Vapi AI 语音代理驱动的求职面试准备平台</h3>
</div>
    

 
## <a name="introduction">🤖 介绍</a>
使用 Next.js 构建前端和后端逻辑，Firebase 处理认证和数据存储，使用 TailwindCSS 进行样式，并集成 Vapi 的语音代理。 
 
 
## <a name="tech-stack">⚙️ 技术栈</a>

- Next.js
- Firebase
- Tailwind CSS
- Vapi AI
- shadcn/ui
- Google Gemini
- Zod

## <a name="features">🔋 功能</a>

👉 **身份验证**：使用 Firebase 提供的邮箱/密码注册和登录。

👉 **创建面试**：借助 Vapi 语音助理和 Google Gemini 轻松生成面试题目。

👉 **AI 反馈**：与 AI 语音代理进行模拟面试并获得基于对话的即时反馈。

👉 **现代化 UI/UX**：外观简洁、易用，提供良好的使用体验。

👉 **面试页面**：实时反馈与详细转录的 AI 驱动面试体验。

👉 **仪表盘**：管理并追踪所有面试，便捷导航。

👉 **响应式设计**：在各种设备上都具有良好兼容性。

以及更多功能，包括代码架构和可重用性

## <a name="quick-start">🤸 快速开始</a>

**安装依赖**

使用 pnpm 安装项目依赖：

```bash
pnpm install
```

**设置环境变量**

在项目根目录下创建 `.env.local`，并添加以下内容：

```env
NEXT_PUBLIC_VAPI_WEB_TOKEN=
NEXT_PUBLIC_VAPI_WORKFLOW_ID=

GOOGLE_GENERATIVE_AI_API_KEY=

NEXT_PUBLIC_BASE_URL=

NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

将以上占位符替换为你的 **[Firebase](https://firebase.google.com/)**、**[Vapi](https://vapi.ai/?utm_source=youtube&utm_medium=video&utm_campaign=jsmastery_recruitingpractice&utm_content=paid_partner&utm_term=recruitingpractice)** 凭据。

**运行项目**

```bash
pnpm run dev
```
 