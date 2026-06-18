<div align="center">
  <a href="https://sirugao.github.io/socratic-kernel/">
    <img src="./docs/assets/hero.svg" width="100%" alt="Socratic Kernel — Answers can be outsourced. Judgment cannot." />
  </a>

  <h1>Socratic Kernel · 内核</h1>

  <p><strong>一个不替你做决定的认知自主权练习工具。</strong></p>
  <p>先写下自己的立场，再审查前提、证据、反方、价值与责任。</p>

  <p>
    <a href="https://sirugao.github.io/socratic-kernel/"><strong>在线体验</strong></a>
    ·
    <a href="./docs/PRODUCT.md">产品原则</a>
    ·
    <a href="./docs/ROADMAP.md">路线图</a>
    ·
    <a href="./README_EN.md">English</a>
  </p>

  <p>
    <a href="https://github.com/SiruGao/socratic-kernel/actions/workflows/deploy-kernel-pages.yml"><img src="https://github.com/SiruGao/socratic-kernel/actions/workflows/deploy-kernel-pages.yml/badge.svg" alt="Deploy status" /></a>
    <a href="https://github.com/SiruGao/socratic-kernel/stargazers"><img src="https://img.shields.io/github/stars/SiruGao/socratic-kernel?style=flat-square" alt="GitHub stars" /></a>
    <a href="https://github.com/SiruGao/socratic-kernel/commits/main"><img src="https://img.shields.io/github/last-commit/SiruGao/socratic-kernel?style=flat-square" alt="Last commit" /></a>
    <img src="https://img.shields.io/badge/version-v0.2.0-214732?style=flat-square" alt="Version 0.2.0" />
    <img src="https://img.shields.io/badge/PWA-installable-335d43?style=flat-square" alt="Installable PWA" />
    <img src="https://img.shields.io/badge/data-local--first-d8ae5e?style=flat-square" alt="Local-first data" />
    <img src="https://img.shields.io/badge/telemetry-none-171915?style=flat-square" alt="No telemetry" />
  </p>
</div>

> [!IMPORTANT]
> **当前是早期 MVP。** 系统使用透明、可检查的本地规则与结构化追问，不调用云端大模型，也不声称能够诊断人格或心理状态。

<p align="center">
  <img src="./docs/assets/product-preview.svg" width="100%" alt="Socratic Kernel product interface preview" />
</p>

## 为什么需要它

生成式 AI 让答案变得即时、完整而廉价，但也容易让人把问题定义、价值排序和最终判断一并外包。

Socratic Kernel 不反对使用 AI。它关心的是：

- 哪些任务适合交给工具；
- 哪些判断必须由人亲自形成；
- 语言流畅是否正在被误认为证据充分；
- 一次对话结束后，责任是否真正回到了用户手中。

| 普通 AI 助手 | Socratic Kernel |
| --- | --- |
| 尽快给出答案 | 要求用户先写下初步立场 |
| 降低所有认知摩擦 | 只在价值判断和推理缺口处制造必要摩擦 |
| 优化满意度与对话时长 | 优化独立判断、反例意识和责任承担 |
| 记住偏好以提高便利 | 记录思考线索，但允许查看、导出和删除 |
| 可能强化既有叙事 | 主动检验确认偏误、流畅性信任和判断外包 |

## 它如何工作

```mermaid
flowchart LR
    A[先写问题与初步立场] --> B[区分事实、解释、情绪与推测]
    B --> C[检测待核验的认知线索]
    C --> D[概念、证据、反方、价值与后果追问]
    D --> E[用户逐题回答]
    E --> F[用自己的语言形成判断]
    F --> G[写下行动与愿意承担的责任]
    G --> H[仅在本地保存思考档案]
```

### 审议流程

1. **先行立场**：在看到系统分析之前，用户先写下问题、立场、依据和确信程度。
2. **线索检测**：系统寻找绝对化表达、外部评价牵引、紧迫性放大、判断外包和流畅性信任等线索。
3. **结构化追问**：问题覆盖概念、证据、可证伪性、最强反方、价值来源、长期后果和责任归属。
4. **判断归还**：系统不生成最终人生结论，用户必须亲自写下暂时判断。
5. **现实检验**：每次审议以最小行动和愿意承担的代价结束。

## 五种核心模式

| 模式 | 适用场景 | 主要检验 |
| --- | --- | --- |
| **决策审议** | 选择项目、工作、关系或行动方向 | 标准冲突、长期代价、可逆实验 |
| **观点审查** | 检查一个自己确信的主张 | 证据、可证伪性、最强反方 |
| **阅读质疑** | 分析文章、网页、报告或他人论证 | 隐藏前提、框架遗漏、引用责任 |
| **自我反思** | 理解欲望、焦虑与重复行为模式 | 欲望来源、身份压力、现实验证 |
| **AI 使用审计** | 在向 AI 外包任务或判断之前 | 认知分工、接受条件、独立核验 |

## 当前能力

- 五种结构化审议模式；
- 本地认知线索检测；
- 逐题苏格拉底式追问；
- 审议前后确信程度对比；
- 最终判断、行动和责任确认；
- 长期思考档案与重复线索统计；
- 单条删除、全部删除、JSON 导入与导出；
- PWA 安装与离线使用；
- 零运行时依赖、无登录、无分析 SDK、无默认网络请求。

## 隐私不是设置，而是架构

Socratic Kernel 当前没有后端。审议内容默认只保存在当前浏览器的 `LocalStorage` 中。

- **不上传**：问题、回答和思考档案不会发送到服务器；
- **不画像**：没有广告追踪、行为分析或隐藏人格评分；
- **可迁移**：可以导出完整 JSON 档案并在其他浏览器导入；
- **可撤回**：支持删除单条记录或永久删除全部数据；
- **可检查**：规则、问题生成和完整度计算全部位于前端源码中。

> [!NOTE]
> 清除浏览器站点数据会删除本地档案。重要记录请先使用应用中的“导出档案”。

## 快速开始

### 在线使用

访问：**[sirugao.github.io/socratic-kernel](https://sirugao.github.io/socratic-kernel/)**

支持安装为桌面或移动端 PWA。浏览器出现“安装应用”按钮后，可直接添加到设备。

### 本地运行

```bash
# 克隆项目
git clone https://github.com/SiruGao/socratic-kernel.git
cd socratic-kernel

# 启动任意静态服务器
python3 -m http.server 4173
```

打开 `http://localhost:4173`。

### 测试与构建

```bash
npm test
npm run build
```

构建产物位于 `dist/`，可直接部署到 GitHub Pages、Vercel、Netlify 或任意静态托管服务。

## 技术架构

当前版本刻意保持简单：零框架、零运行时依赖、无后端。

| 层 | 实现 | 职责 |
| --- | --- | --- |
| 应用壳 | `index.html` + `styles.css` | 响应式界面与无障碍结构 |
| 审议引擎 | `app.js` | 状态管理、线索检测、问题编排和流程控制 |
| 本地记忆 | `LocalStorage` | 保存审议、信心变化与重复线索 |
| 离线能力 | `manifest.webmanifest` + `sw.js` | PWA 安装和静态资源缓存 |
| 质量门禁 | Node smoke tests + GitHub Actions | 语法、关键能力和部署验证 |

更完整的设计见 [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md)。

## 路线图

- [x] 本地优先的结构化审议闭环
- [x] AI 使用审计
- [x] 思考档案、导入导出与删除
- [x] PWA 与离线能力
- [ ] Chrome / Edge / Firefox 浏览器扩展
- [ ] 选中文字后启动“阅读质疑”
- [ ] 可替换的大模型追问层
- [ ] 独立的反迎合审查器
- [ ] 可追溯的哲学原典知识层
- [ ] 用户可编辑的个人认知模型
- [ ] 独立性指标与长期效果研究

详细计划见 [`docs/ROADMAP.md`](./docs/ROADMAP.md)。

## 项目文档

| 文档 | 内容 |
| --- | --- |
| [`PRODUCT.md`](./docs/PRODUCT.md) | 产品使命、不可妥协原则与边界 |
| [`ARCHITECTURE.md`](./docs/ARCHITECTURE.md) | 当前架构和未来三层架构 |
| [`ROADMAP.md`](./docs/ROADMAP.md) | 浏览器扩展、模型层和认知模型计划 |
| [`CONTRIBUTING.md`](./CONTRIBUTING.md) | 开发流程、提交标准和设计约束 |
| [`SECURITY.md`](./SECURITY.md) | 隐私问题与安全漏洞报告方式 |

## 参与贡献

这个项目欢迎以下类型的贡献：

- 更准确、不过度的苏格拉底式问题协议；
- 反迎合与判断外包测试案例；
- 无障碍、移动端和本地化改进；
- 浏览器扩展与隐私威胁模型；
- 关于“AI 是否增强了用户独立判断”的评估方法。

开始前请阅读 [`CONTRIBUTING.md`](./CONTRIBUTING.md)。较大的功能建议先通过 [Feature Request](https://github.com/SiruGao/socratic-kernel/issues/new?template=feature_request.yml) 讨论。

## 产品边界

Socratic Kernel 不是心理治疗工具，也不替代医疗、法律、财务或其他专业意见。它不会因为识别到某种语言模式，就断言用户具有某种人格或心理状态。所有“线索”都只是需要用户继续核验的假设。

## License

本项目采用 [MIT License](./LICENSE)。

---

<div align="center">
  <strong>一个好的 AI 苏格拉底，不应让人永久依赖它。</strong><br />
  它的目标，是让用户逐渐能够在没有它时继续追问、判断与承担。
</div>
