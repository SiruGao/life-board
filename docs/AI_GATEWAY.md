# AI 模型网关

Socratic Kernel 的 AI 能力采用“本地核心 + 可选服务端模型网关”的架构。

- 本地规则引擎始终可用；
- 用户必须主动开启 AI 增强；
- 供应商 API Key 只能保存在服务端；
- 模型失败时保留本地问题，不阻塞审议；
- 当前请求不会默认发送历史档案或其他审议回答。

## 为什么不能在浏览器中直接填写供应商 API Key

网页源代码、浏览器存储、网络请求和移动安装包都可能被用户或第三方检查。如果把 OpenAI、Anthropic、Gemini 等供应商密钥直接放入前端，密钥将无法真正保密，并可能被盗用产生费用。

因此，前端只发送：

- 当前问题和问题类型；
- 用户主动写下的初始立场；
- 当前依据；
- 确信度和挑战强度；
- 用户选择的供应商标识。

服务端根据环境变量调用供应商，然后只把结构化追问返回前端。

## 支持的供应商

| 供应商 | 接口 | 默认模型（可覆盖） | 密钥变量 |
| --- | --- | --- | --- |
| OpenAI | Responses API | `gpt-5-mini` | `OPENAI_API_KEY` |
| Anthropic | Messages API | `claude-sonnet-4-20250514` | `ANTHROPIC_API_KEY` |
| Google | Gemini `generateContent` | `gemini-3-flash` | `GEMINI_API_KEY` |
| DeepSeek | Chat Completions | `deepseek-v4-flash` | `DEEPSEEK_API_KEY` |
| 阿里云百炼 | Qwen OpenAI 兼容接口 | `qwen3.5-flash` | `DASHSCOPE_API_KEY` |
| Moonshot | Kimi Chat Completions | `kimi-k2.5` | `MOONSHOT_API_KEY` |
| xAI | Grok Chat Completions | `grok-4.20-reasoning` | `XAI_API_KEY` |

模型名称变化较快。生产环境建议显式设置对应的 `*_MODEL` 环境变量，不依赖仓库默认值。

## 本地开发

复制环境变量模板：

```bash
cp .env.example .env.local
```

至少填写一个供应商密钥，例如：

```bash
OPENAI_API_KEY=your_server_side_key
OPENAI_MODEL=gpt-5-mini
AI_GATEWAY_TOKEN=your_private_beta_token
```

使用 Vercel CLI 启动带 Serverless Functions 的本地环境：

```bash
npm install
npx vercel dev
```

普通静态服务器只能运行本地规则模式，因为它不会执行 `/api` 目录中的服务端函数。

## Vercel 部署

1. 在 Vercel 中导入 `SiruGao/socratic-kernel`；
2. Build Command 使用 `npm run build`；
3. Output Directory 使用 `dist`；
4. 在 Project Settings → Environment Variables 中填写供应商密钥；
5. 建议在公开测试阶段设置 `AI_GATEWAY_TOKEN`；
6. 重新部署项目；
7. 打开应用的“模型”页面，检查网关配置并选择默认模型。

同域部署时不需要配置 CORS。若 GitHub Pages 前端调用独立 Vercel 网关，则设置：

```bash
AI_ALLOWED_ORIGINS=https://sirugao.github.io
```

随后在模型设置中填写完整 Vercel HTTPS 地址。

## API

### `GET /api/providers`

只返回已经配置的供应商名称和模型名称，不返回密钥。

示例：

```json
{
  "gatewayVersion": 1,
  "providers": [
    {
      "id": "openai",
      "label": "OpenAI",
      "model": "gpt-5-mini"
    }
  ],
  "requiresAccessToken": true
}
```

### `POST /api/inquiry`

请求：

```json
{
  "provider": "openai",
  "input": {
    "mode": "decision",
    "question": "我应该集中完成一个项目吗？",
    "position": "我倾向先完成一个。",
    "evidence": "并行推进时完成率较低。",
    "confidence": 64,
    "challenge": 1
  }
}
```

当设置了 `AI_GATEWAY_TOKEN` 时，请求必须包含：

```text
X-Socratic-Access-Token: <token>
```

响应包含结构化问题、供应商、模型、生成时间和中性摘要。

## 安全与成本边界

当前网关适合个人使用和小规模封闭 Beta。公开商业发布前仍需增加：

- 用户身份认证；
- 按用户或订阅额度计费；
- 分布式速率限制；
- 月度预算和供应商用量告警；
- 滥用检测；
- 可撤回的用户同意记录；
- 供应商数据保留政策展示；
- 请求与错误的隐私安全审计。

不要在没有访问控制和成本上限的情况下，把配置了真实密钥的网关公开给所有互联网用户。

## App 复用

未来的 iOS、Android 和桌面客户端不直接调用七家供应商，而是统一调用 Socratic Kernel 网关：

```text
Web / PWA / iOS / Android / Desktop
                 ↓
       Socratic Kernel Gateway
                 ↓
OpenAI / Claude / Gemini / DeepSeek / Qwen / Kimi / Grok
```

这样可以统一处理密钥、模型切换、额度、隐私同意、反迎合审查和故障回退。