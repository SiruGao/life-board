# 5 分钟开始

Socratic Kernel 有两种运行方式：

- **本地版**：无需账号、服务器或模型费用；使用浏览器内的规则引擎；
- **AI 版**：在本地核心之上增加 Vercel Gateway，安全调用真实大模型。

## 方式一：直接使用本地版

打开：

```text
https://sirugao.github.io/socratic-kernel/
```

然后：

1. 点击“开始审议”；
2. 选择一种模式，或使用页面提供的示例；
3. 在看到追问前写下初始立场与依据；
4. 完成结构化问题；
5. 亲自确认判断、行动和责任；
6. 下载私密档案，或生成默认去隐私的分享摘要。

本地版的数据保存在当前浏览器。清除站点数据前，请先导出重要档案。

## 方式二：本地开发

```bash
git clone https://github.com/SiruGao/socratic-kernel.git
cd socratic-kernel
python3 -m http.server 4173
```

打开：

```text
http://localhost:4173
```

运行质量检查：

```bash
npm test
npm run build
```

## 方式三：部署带真实模型的 AI 版

### 1. 导入 Vercel

使用 README 顶部的 **Deploy with Vercel**，或在 Vercel 中导入：

```text
SiruGao/socratic-kernel
```

构建配置已经写在 `vercel.json` 中：

```text
Build Command: npm run build
Output Directory: dist
```

### 2. 配置至少一个模型供应商

进入：

```text
Vercel → Project → Settings → Environment Variables
```

例如 OpenAI：

```bash
OPENAI_API_KEY=your_server_side_key
OPENAI_MODEL=gpt-5-mini
```

例如 DeepSeek：

```bash
DEEPSEEK_API_KEY=your_server_side_key
DEEPSEEK_MODEL=your_available_model
```

还可以配置 Claude、Gemini、Qwen、Kimi 或 Grok。完整变量见 `.env.example`。

### 3. 配置 Beta 访问保护

建议增加：

```bash
AI_GATEWAY_TOKEN=generate-a-long-random-token
```

这个令牌用于限制谁能使用你的 Gateway。它不是供应商 API Key。

### 4. 重新部署

环境变量保存后，触发一次新的 Production Deployment。

### 5. 在模型中心完成设置

打开部署后的应用：

```text
模型
→ 检查 Gateway
→ 选择默认模型
→ 展开高级设置并填写 Gateway 访问令牌
→ 测试所选模型
→ 启用 AI 追问
→ 保存并应用
```

## GitHub Pages 前端连接独立 Gateway

如果前端继续使用 GitHub Pages，而 Gateway 部署在 Vercel，需要在 Vercel 中设置：

```bash
AI_ALLOWED_ORIGINS=https://sirugao.github.io
```

然后在应用“模型 → 高级连接设置”中填写 Vercel 的完整 HTTPS 地址。

## 常见状态

| 页面状态 | 含义 | 处理方式 |
| --- | --- | --- |
| 本地追问 | AI 未启用或 Gateway 不可用 | 可直接使用；需要 AI 时继续配置 |
| Gateway 未连接 | 地址错误、未部署或网络失败 | 检查 Vercel Deployment 和地址 |
| Gateway 已连接，0 个供应商 | 服务端没有供应商密钥 | 配置环境变量并重新部署 |
| 模型测试失败 | 密钥、余额、模型名、令牌或权限问题 | 根据页面提示检查对应配置 |
| 模型测试通过 | 完整调用链正常 | 启用 AI 并保存 |

## 安全提醒

- 不要把真实 API Key 提交到 GitHub；
- 不要把供应商 API Key 填入网页；
- 不要把无访问控制、无额度限制的 Gateway 长期公开；
- 面向公开用户前，需要增加账号、按用户限流、预算告警和订阅额度；
- 当前 Gateway 更适合个人使用和封闭 Beta。

下一步阅读：

- [`MODEL_CENTER.md`](./MODEL_CENTER.md)
- [`AI_GATEWAY.md`](./AI_GATEWAY.md)
- [`SECURITY.md`](../SECURITY.md)
