---
tags:
  - agent
  - AI
  - learning-roadmap
created: 2026-06-14
---

# 从零开始学习 Agent 的学习路线

> 面向零基础小白，循序渐进，从概念到实战。

---

## 阶段零：预备知识（2-4 周）

Agent 建立在 LLM 之上，先打好地基。

### 必学

| 主题 | 内容 | 推荐资源 |
|------|------|----------|
| Python 基础 | 函数、类、异步 (async/await)、类型注解 | [Python 官方教程](https://docs.python.org/3/tutorial/) |
| LLM 基础概念 | Token、Prompt、Context Window、Temperature、Embedding | [DeepLearning.AI 短课](https://www.deeplearning.ai/short-courses/) |
| API 调用 | OpenAI / Anthropic API 基本用法，理解 Chat Completion | 官方文档 + 跑通一个 `curl` 请求 |
| Prompt Engineering | System prompt vs User prompt, few-shot, chain-of-thought | [Prompt Engineering Guide](https://www.promptingguide.ai/) |

### 动手任务
- 用 Python 调用 OpenAI API 写一个简单的翻译脚本
- 体验不同 temperature 对输出的影响
- 手写一个简单的 system prompt 让模型扮演客服

### 📚 学习资源

**Python 异步编程：**
- [Real Python - asyncio 实战教程](https://realpython.com/async-io-python/) — 38 分钟读完，协程、事件循环、`asyncio.gather()` 全覆盖
- [DigitalOcean - 用 Python 构建并行 Agent 工作流](https://www.digitalocean.com/community/tutorials/how-to-build-parallel-agentic-workflows-with-python) — 实战：用 `asyncio` + `aiohttp` 并行调用 LLM

**LLM 基础 & API：**
- [DeepLearning.AI 短课合集](https://www.deeplearning.ai/short-courses/) — 免费，入门首选，ChatGPT Prompt Engineering、LangChain 等
- [OpenAI API 官方文档](https://platform.openai.com/docs/) — Chat Completion 入门必读
- [Anthropic API 官方文档](https://docs.anthropic.com/) — Claude API 入门

**Prompt Engineering：**
- [Prompt Engineering Guide](https://www.promptingguide.ai/) — 最全 Prompt 工程指南，含 CoT、Few-Shot 等
- [Featherless.ai - Prompt + Context Engineering 开发者完整指南](https://featherless.ai/blog/prompt-engineering-and-context-engineering-the-complete-developers-guide-to-modern-ai-system-design) — System Prompt / User Prompt 详解
- [Microsoft - Chain of Thought 提示词教程](https://learn.microsoft.com/en-us/dotnet/ai/conceptual/chain-of-thought-prompting) — CoT 原理 + 代码示例
- [GitHub - Prompt Engineering Techniques Hub](https://github.com/KalyanKS-NLP/Prompt-Engineering-Techniques-Hub) — LangChain 实现的各种 Prompt 技术代码

---

## 阶段一：理解 Agent 核心概念（1-2 周）

### Agent 是什么？

> Agent = LLM + 工具 + 记忆 + 规划

Agent 不是普通的"一问一答"。它能**自主决策**——思考、调用工具、观察结果、再思考，直到完成任务。

### 核心概念脑图

```
Agent 架构
├── 大脑 (LLM)        → 推理、决策、规划
├── 工具 (Tools)      → 搜索、计算器、代码执行、API 调用
├── 记忆 (Memory)     → 短期(对话上下文) / 长期(向量数据库)
├── 规划 (Planning)   → 任务分解、反思、纠错
└── 行动 (Action)     → 调用工具、输出结果
```

### 关键论文 & 概念（了解即可，不需要深读论文）

| 概念                              | 一句话解释                             |
| ------------------------------- | --------------------------------- |
| **ReAct**                       | Reasoning + Acting，边想边做，交替进行推理和行动 |
| **Chain-of-Thought (CoT)**      | 让模型"一步步思考"，提升推理能力                 |
| **Tool Use / Function Calling** | 模型不直接回答，而是输出 JSON 调用外部工具          |
| **Plan-and-Execute**            | 先制定完整计划，再逐步执行                     |
| **Reflexion**                   | Agent 执行失败后反思错误，重新尝试              |

### 动手任务
- 读一篇 ReAct 的科普文章，画出 ReAct 的循环流程图
- 手写一个"伪代码 Agent"：一个 while 循环，LLM 思考 → 选择行动 → 观察结果 → 继续循环

### 📚 学习资源

**核心文章（必读）：**
- [Lilian Weng - LLM Powered Autonomous Agents](https://lilianweng.github.io/posts/2023-06-23-agent/) — Agent 三大支柱（规划/工具/记忆）经典博客，必读
- [Anthropic - Building Effective Agents](https://www.anthropic.com/engineering/building-effective-agents) — 官方 Agent 设计指南，必读
- [OpenAI - A Practical Guide to Building Agents](https://platform.openai.com/docs/guides/agents) — OpenAI Agent 实战指南

**ReAct 模式深入：**
- [MachineLearningMastery - Building ReAct Agents with LangGraph](https://machinelearningmastery.com/building-react-agents-with-langgraph-a-beginners-guide/) — 从零构建 ReAct Agent 全流程
- [Sparkco.ai - 7 Must-Know Agentic AI Design Patterns](https://sparkco.ai/blog/mastering-async-patterns-for-autonomous-agents) — ReAct、Plan-Execute 等 7 大设计模式

**视频课程：**
- 🎬 [吴恩达 Agentic AI 课程 (B站中字)](https://www.bilibili.com/video/BV1gxArztEfd) — Agent 核心范式与工作流系统讲解
- 🎬 [微软 AI Agents for Beginners (15节)](https://github.com/microsoft/ai-agents-for-beginners) — Agent 概念→工具调用→RAG→多 Agent→MCP→部署，含中文字幕，强烈推荐
- 🎬 [李宏毅 2026 AI Agent 保姆级课程 (78集)](https://www.bilibili.com/video/BV1kyPLzGE2L) — 从 Transformer 到 LLM 训练到 Agent 全链路

**GitHub 项目研究：**
- [ginobefun/agentic-design-patterns-cn](https://github.com/ginobefun/agentic-design-patterns-cn) — Agent 设计模式中文词典

---

## 阶段二：Function Calling 深入（1-2 周）

Tool Use 是 Agent 的基石。先精通这一步。

### 学习路径

1. **理解 Function Calling 协议**
   - JSON Schema 定义工具
   - 模型如何决定调用哪个工具
   - tool_choice 参数 (auto / required / none)

2. **用 OpenAI / Anthropic API 手写**
   ```python
   # 伪代码示意
   tools = [{"name": "get_weather", "parameters": {...}}]
   
   while True:
       response = llm.chat(messages, tools=tools)
       if response has tool_calls:
           for tool_call in response.tool_calls:
               result = execute(tool_call)  # 你自己实现工具逻辑
               messages.append(result)
       else:
           break  # 模型认为任务完成
   ```

3. **常见工具模式**
   - 搜索工具 (网页搜索、知识库搜索 RAG)
   - 计算工具 (数学运算、代码沙箱)
   - 数据工具 (数据库查询、API 请求)
   - 文件工具 (读写文件)

### 动手任务
- 实现一个"天气助手 Agent"：查询天气 + 根据天气给穿衣建议
- 实现一个"计算器 Agent"：模型遇到数学问题自动调用计算函数

### 📚 学习资源

**OpenAI Function Calling：**
- [OpenAI 官方 Function Calling 指南](https://developers.openai.com/api/docs/guides/function-calling) — 最权威的 5 步工具调用流程，含 `get_horoscope` 完整示例
- [OpenAI Cookbook - Reasoning Models + Function Calls](https://developers.openai.com/cookbook/examples/reasoning_function_calls) — 多步工具调用循环 + 自定义搜索工具
- [Kanaries - OpenAI 函数调用：上手示例大全](https://docs.kanaries.net/zh/articles/openai-function-calling) — 中文版，三个完整示例：会议安排/股票查询/旅行预订
- [Azure OpenAI Function Calling 教程](https://learn.microsoft.com/en-us/azure/ai-foundry/openai/how-to/function-calling) — 单次调用、并行调用、多函数组合全流程
- [PlainEnglish.io - 5 步拆解 Function Calling](https://ai.plainenglish.io/function-calling-with-openai-apis-getting-started-45905922c2fc) — 工具注册表模式 + 动态分发

**Anthropic Tool Use：**
- [Anthropic - Writing Effective Tools for Agents](https://www.anthropic.com/engineering/writing-tools-for-agents) — 工具设计最佳实践：命名空间、上下文优化、Token 效率

**完整项目参考：**
- [GitHub - Agentic AI Starter Kit](https://github.com/frezazadeh/agentic-ai-starter-kit) — Python Agent 从零实现：Plan→Act→Reflect 循环 + 工具注册表 + 记忆缓冲

---

## 阶段三：主流框架入门（3-4 周）

不要重复造轮子，学会用框架快速搭建 Agent。

### 框架对比

| 框架 | 特点 | 适合场景 |
|------|------|----------|
| **OpenAI Agents SDK** | 官方出品，简洁，易上手 | 入门首选、简单 Agent |
| **LangChain / LangGraph** | 生态最大，抽象多 | 复杂工作流、RAG 应用 |
| **CrewAI** | 多 Agent 协作，角色扮演 | 多 Agent 协同任务 |
| **AutoGen (Microsoft)** | 对话式多 Agent | 企业级、微软生态 |
| **Anthropic Claude Agent SDK** | 原生工具使用，简单直接 | Claude 深度用户 |

### 建议学习顺序

```
OpenAI Agents SDK (2天)
    ↓
LangChain 基础 (1周) → LangGraph (1周)
    ↓
CrewAI (3天) → 对比理解多 Agent 模式
```

### 动手任务
- 用 **OpenAI Agents SDK** 搭建一个带搜索工具的 Agent
- 用 **LangGraph** 搭建一个条件分支工作流（如：意图分类 → 不同处理路径）
- 用 **CrewAI** 搭建 2 个 Agent 协作（如：研究员 + 写手）

### 📚 学习资源

**OpenAI Agents SDK：**
- [DataCamp - OpenAI Agents SDK 教程](https://www.datacamp.com/tutorial/openai-agents-sdk-tutorial) — 从 Hello World 到多 Agent Handoff，最全面入门教程
- [OpenAI Agents SDK 官方文档](https://openai.github.io/openai-agents-python/) — 完整 API 参考与指南
- [OpenAI Cookbook - Parallel Agents](https://developers.openai.com/cookbook/examples/agents_sdk/parallel_agents) — 并行 Agent 编排实战
- [GitHub - OpenAI Agents SDK Quickstart](https://github.com/ItsRealDennis/openai-agents-sdk-quickstart) — 含 Agent/Handoff/Guardrails 完整示例

**LangChain + LangGraph：**
- [Software Mansion - Building AI Agents With LangGraph (4 部分)](https://swmansion.com/blog/building-ai-agents-with-langgraph-part-1-4-a-basic-chatbot-ac4d2ad10bed/) — 从零到完整 Agent（RAG+搜索+记忆+持久化），强烈推荐
- [GitHub - JBaczuk/LangGraph-Tutorial (6 种 Agent 模式)](https://github.com/JBaczuk/LangGraph-Tutorial) — ReAct/多步推理/规划/Supervisor/反思 全覆盖，本地 Ollama 运行
- [Skywork.ai - 构建你的第一个 AI Agent](https://skywork.ai/blog/build-ai-agent-python-langgraph-step-by-step-2025/) — CLI Agent：搜索+文件读写+Human-in-the-loop+可选 LangSmith 追踪
- [GitHub - SnehalAgrawal LangChain+LangGraph 示例](https://github.com/SnehalAgrawal/ai-langchain-langgraph-example) — 模块化示例：Prompt模板/Chain/RAG/Agent 图

**Anthropic Claude Agent SDK：**
- [Anthropic 官方博客 - Building Agents with Claude Agent SDK](https://claude.com/blog/building-agents-with-the-claude-agent-sdk) — 核心理念：Gather→Act→Verify→Repeat
- [KDnuggets - Claude Agent SDK 入门](https://www.kdnuggets.com/getting-started-with-the-claude-agent-sdk) — 构建 TrendSmith 多工具 CLI 应用
- [DataCamp - Claude Agent SDK 教程](https://www.datacamp.com/zh/tutorial/how-to-use-claude-agent-sdk) — 3 个项目从零构建（Blog提纲/InspireBot/NoteSmith）
- [Skywork.ai - Claude Agent SDK 分步教程](https://skywork.ai/blog/how-to-use-claude-agent-sdk-step-by-step-ai-agent-tutorial/) — 安装→权限→工具→MCP→部署 全流程

**CrewAI + AutoGen：**
- [Coursera - Agentic AI with LangGraph, CrewAI, AutoGen and BeeAI](https://www.coursera.org/learn/agentic-ai-with-langgraph-crewai-autogen-and-beeai) — 5.0 评分，多框架对比实战
- [GitHub - ai-agent-comparison (CrewAI vs LangGraph vs AutoGen)](https://github.com/Vigneshmaradiya/ai-agent-comparison) — 同一股票分析任务用三个框架实现，直观对比
- 🎬 [B站 - 70个Agent练手实战项目](https://www.bilibili.com/video/BV111XmBrEvX) — Dify+LangChain+AutoGen+CrewAI 全框架覆盖

**综合视频课程：**
- 🎬 [B站 - 2026版 Agent项目实战合集](https://www.bilibili.com/video/BV1FzRSBGETD) — Agent开发/智能体搭建，全程干货
- 🎬 [B站 - 企业级AI智能体7天入门](https://www.bilibili.com/video/BV1iHwjzFE8V) — MCP+LangGraph+CrewAI+AutoGen 全家桶

---

## 阶段四：记忆与 RAG（2-3 周）

Agent 需要"记住"信息。

### 学习内容

| 主题 | 核心知识 |
|------|----------|
| **短期记忆** | 对话历史管理、滑动窗口、摘要压缩 |
| **长期记忆** | 向量数据库 (Chroma / Pinecone / Milvus)、Embedding |
| **RAG (检索增强生成)** | 文档切片 → Embedding → 检索 → 注入 Prompt |
| **记忆管理策略** | 重要性评分、记忆衰减、反思整合 |

### 动手任务
- 用 `chromadb` 实现一个简单的 RAG 系统：索引文档 → 检索相关内容 → 让 LLM 回答
- 做一个"个人知识库 Agent"：能记住用户之前说过的话，并据此回答后续问题

### 📚 学习资源

**RAG 入门：**
- [Codecademy - What is RAG? 完整教程](https://www.codecademy.com/article/retrieval-augmented-generation-in-ai) — 文档→切片→ChromaDB→检索→生成，从零完整流程
- [IBM Skills.Network - Vector Databases for RAG](https://catalog.skills.network/catalog_item/7693/) — ChromaDB 操作 + 相似搜索 + RAG 集成，含动手实验
- [Coursera - Vector Databases for RAG](https://www.coursera.org/learn/vector-databases-for-rag-an-introduction) — IBM 出品，结构化学习路径

**ChromaDB + RAG 实战项目：**
- [GitHub - Total_RAG (5 阶段渐进)](https://github.com/hadywalied/Total_RAG) — 关键词搜索→语义搜索→基础RAG→高级RAG（重排序+混合搜索），含 CLI 和 Web UI
- [GitHub - RAG-LangChain Architecture (10+脚本)](https://github.com/pritamnikam/rag-langchain-architecture) — TF-IDF→Embedding→LangChain+ChromaDB→Streamlit PDF 问答
- [GitHub - RAG_Naive (极简版)](https://github.com/Sriram4774/RAG_Naive) — 本地 .txt + ChromaDB + Google Gemini，代码最小化快速验证
- [KDnuggets - Gemini RAG Recipe with Query Enhancement](https://www.kdnuggets.com/gemini-rag-recipe-with-query-enhancement) — ChromaDB 本地 + 查询改写 + HyDE 高级技术

**RAG 视频：**
- 🎬 [DeepLearning.AI - Building Agentic RAG with LlamaIndex](https://www.deeplearning.ai/short-courses/) — RAG + Agent 结合实战
- 🎬 [吴恩达 LangChain Chat with Your Data](https://www.deeplearning.ai/short-courses/) — 用 LangChain 构建文档对话系统

---

## 阶段五：高级 Agent 模式（3-4 周）

### 学习主题

1. **多 Agent 协作**
   - 角色分工 (研究员、分析师、写手)
   - 通信机制 (消息传递、共享记忆)
   - 任务分配 (人工编排 vs 自动协商)

2. **Agent 规划与反思**
   - ReAct 循环的深入实现
   - Plan-and-Execute 模式
   - Reflexion：失败后自我纠错
   - Tree-of-Thought：多路径探索

3. **自主 Agent（Agentic Workflow）**
   - 长任务分解与执行
   - 检查点与回退
   - Human-in-the-loop（关键时刻人工确认）

4. **Agent 评估**
   - 什么是"好的 Agent"？
   - 评估指标：任务完成率、工具选择准确率、效率
   - 评估框架：自定义 Benchmark、LLM-as-Judge

### 动手任务
- 实现一个 ReAct Agent：给定复杂问题，让它搜索 + 计算 + 推理
- 搭建一个 3-Agent 写作团队：规划者 → 研究者 → 写作者
- 写一个简单的 Agent 评估脚本，跑 10 个测试题目并打分

### 📚 学习资源

**ReAct 深入实现：**
- [MachineLearningMastery - Building ReAct Agents with LangGraph](https://machinelearningmastery.com/building-react-agents-with-langgraph-a-beginners-guide/) — 从零实现 ReAct 循环
- [JBaczuk/LangGraph-Tutorial - Reflection Agent Pattern](https://github.com/JBaczuk/LangGraph-Tutorial) — 反思 Agent：自我批评+质量改进

**多 Agent 协作：**
- [Udemy - AI Agent: Beginners Guide on Agentic AI CrewAI AutoGen](https://www.udemy.com/course/agentic_ai/) — 3 小时，顺序/群聊模式+Agentic RAG+AutoGenStudio
- [GitHub - Vigneshmaradiya/ai-agent-comparison](https://github.com/Vigneshmaradiya/ai-agent-comparison) — CrewAI/LangGraph/AutoGen 同一任务三框架对比
- [O'Reilly - AI Agents in Action (Chapter 4 多Agent)](https://www.oreilly.com/library/view/ai-agents-in/9781633436343/) — AutoGen Studio + CrewAI 群聊与处理模式

**Agent 评估：**
- [KDD 2025 - Evaluation and Benchmarking of LLM Agents 教程](https://sap-samples.github.io/llm-agents-eval-tutorial/2025_KDD_Evaluation_and_Benchmarking_of_LLM_Agents.pdf) — 评估维度（交互模式/数据/指标/工具/上下文）全覆盖
- [IBM IJCAI 2025 - Evaluating LLM-based Agents](https://research.ibm.com/publications/evaluating-llm-based-agents-foundations-best-practices-and-open-challenges) — 规划/工具使用/反思/记忆/多Agent 评估
- [Statsig - LLM-as-a-Judge 方法论](https://www.statsig.com/perspectives/llm-judge-methodology) — 评分标准定义+校准集+CI/CD 集成
- [Agent-as-a-Judge (ICML 2025)](https://proceedings.mlr.press/v267/zhuge25a.html) — 用 Agentic 评估器替代静态 LLM 评估
- [GitHub - LLM-Evaluation Toolkit (ODSC Workshop)](https://github.com/rajshah4/LLM-Evaluation) — Notebook 和模板，含评估数据集+单元测试+LLM Judge 偏差处理

**视频课程：**
- 🎬 [Google 5-Day AI Agents Course](https://www.kaggle.com/whitepaper-ai-agents) — 多智能体协作/记忆管理/评估测试/工程化部署

---

## 阶段六：工具与生态（持续学习）

### 常用基础设施

| 类别 | 工具/服务 |
|------|-----------|
| **向量数据库** | Chroma(入门)、Pinecone(云)、Milvus(生产) |
| **搜索 API** | Tavily、SerpAPI、Brave Search |
| **代码执行** | E2B、Replit、本地 Docker 沙箱 |
| **可观测性** | LangSmith、LangFuse、Weights & Biases |
| **模型服务** | OpenAI、Anthropic、Ollama(本地)、Groq(快速推理) |
| **MCP (Model Context Protocol)** | Anthropic 的标准工具协议，让你的 Agent 连接任意工具 |

### 动手任务
- 用 **MCP** 协议给你的 Agent 添加文件系统工具
- 部署一个 Agent 到生产环境（如用 FastAPI 封装成 API）

### 📚 学习资源

**MCP (Model Context Protocol)：**
- [Anthropic - Writing Effective Tools for Agents](https://www.anthropic.com/engineering/writing-tools-for-agents) — 工具选择/命名空间/Token 优化原则
- [Anthropic - Code Execution with MCP](https://www.mbgsec.com/archive/2025-11-08-code-execution-with-mcp-building-more-efficient-ai-agents-anthropic/) — 代码执行减少 98.7% Token 消耗
- [DeepLearning.AI - MCP: Build Rich-Context AI Apps with Anthropic](https://learn.deeplearning.ai/courses/mcp-build-rich-context-ai-apps-with-anthropic/) — Andrew Ng + Anthropic 联合出品，入门首选
- [DigitalOcean - How to Use MCP with OpenAI Agents](https://www.digitalocean.com/community/tutorials/how-to-use-mcp-with-openai-agents) — MCP 服务器（文件系统/Fetch/GitHub/Slack）集成 OpenAI Agents
- [HuggingFace - Agent2Agent & MCP 端到端教程](https://huggingface.co/blog/tsadoq/agent2agent-and-mcp-tutorial) — MCP 服务器（Google搜索+股票）+ Google ADK Agent
- [PyPI - mcp-agent](https://pypi.org/project/mcp-agent/) — "MCP is all you need to build agents"，`uvx mcp-agent init` 2 分钟搭建
- [GitHub - Intro to MCP (课程完成版)](https://github.com/pborenstein/intro-to-mcp) — Anthropic 官方入门课程完整实现

**可观测性 & 追踪：**
- [MLflow Blog - Claude Agent SDK + MLflow 原型与评估](https://mlflow.org/blog/mlflow-autolog-claude-agents-sdk) — `@mlflow.anthropic.autolog()` 自动追踪 Agent 行为
- [LangSmith 官方文档](https://docs.smith.langchain.com/) — LangChain 生态追踪与评估平台
- [LangFuse 开源可观测性](https://langfuse.com/) — 开源的 LLM 应用追踪

**部署：**
- 用 FastAPI + Uvicorn 封装 Agent 为 REST API
- 用 Docker 容器化部署
- 参考 LangGraph Platform / CrewAI Enterprise 的生产部署方案

**视频课程：**
- 🎬 [B站 - 100个Agent项目实战](https://www.bilibili.com/video/BV1xvBXB9EdF) — 零基础到精通，设计模式+Fewshot+ReAct
- 🎬 [B站 - AI Agent 100个项目实战 (最新版)](https://www.bilibili.com/video/BV1xvBXB9EdF) — 手把手打造智能体

---

## 阶段七：实战项目（持续）

### 推荐项目（由浅入深）

1. **个人研究助手** ⭐
   - 输入主题 → 搜索 → 阅读 → 生成摘要报告
   - 用 LangGraph + Tavily API

2. **代码审查 Agent** ⭐⭐
   - 读取 PR diff → 分析问题 → 给出修改建议
   - 用 OpenAI Function Calling + GitHub API

3. **客服 Agent** ⭐⭐
   - 理解问题 → 查知识库 → 如需人工则转接
   - 用 RAG + Human-in-the-loop

4. **自动化数据分析 Agent** ⭐⭐⭐
   - 接收数据文件 → 生成 Python 代码 → 执行 → 输出图表
   - 用代码沙箱 + 多轮交互

5. **多 Agent 协作内容创作** ⭐⭐⭐
   - 选题 → 调研 → 大纲 → 写作 → 审校 → 排版
   - 用 CrewAI 或 AutoGen

---

## 🏆 全阶段最强资源 Top 10

| # | 资源 | 类型 | 覆盖阶段 | 说明 |
|---|------|------|---------|------|
| 1 | [微软 AI Agents for Beginners](https://github.com/microsoft/ai-agents-for-beginners) | 🎬 课程 | 1-6 | 15节，Agent 全生命周期，中文字幕 |
| 2 | [Anthropic - Building Effective Agents](https://www.anthropic.com/engineering/building-effective-agents) | 📄 文章 | 1-5 | Agent 设计圣经，必读 |
| 3 | [Lilian Weng - LLM Powered Autonomous Agents](https://lilianweng.github.io/posts/2023-06-23-agent/) | 📄 文章 | 1 | Agent 三大支柱经典 |
| 4 | [OpenAI Agents SDK 官方文档](https://openai.github.io/openai-agents-python/) | 📄 文档 | 3 | 最简洁的 Agent 框架入门 |
| 5 | [JBaczuk/LangGraph-Tutorial (6 种模式)](https://github.com/JBaczuk/LangGraph-Tutorial) | 💻 代码 | 3,5 | ReAct→多步推理→Supervisor→反思 |
| 6 | [DeepLearning.AI - MCP 课程](https://learn.deeplearning.ai/courses/mcp-build-rich-context-ai-apps-with-anthropic/) | 🎬 课程 | 6 | MCP 入门首选 |
| 7 | [DeepLearning.AI 短课合集](https://www.deeplearning.ai/short-courses/) | 🎬 课程 | 0,3,4 | 免费，入门必刷 |
| 8 | [吴恩达 Agentic AI (B站)](https://www.bilibili.com/video/BV1gxArztEfd) | 🎬 视频 | 1 | Agent 核心范式系统讲解 |
| 9 | [Google 5-Day AI Agents Course](https://www.kaggle.com/whitepaper-ai-agents) | 🎬 课程 | 1,4,5 | 完整生命周期课程 |
| 10 | [2026全年 AI Agent 每周学习计划](https://segmentfault.com/a/1190000047519837) | 📄 计划 | 全部 | 34 周细化计划表 |

## 推荐 GitHub 项目研究

- [OpenAI Agents SDK](https://github.com/openai/openai-agents-python)
- [CrewAI](https://github.com/crewAIInc/crewAI)
- [AutoGPT](https://github.com/Significant-Gravitas/AutoGPT)
- [LangGraph](https://github.com/langchain-ai/langgraph)
- [MetaGPT](https://github.com/geekan/MetaGPT)

## 推荐社区

- LangChain Discord / GitHub Discussion
- 知乎 AI Agent 话题
- Reddit r/LangChain / r/OpenAI
- Anthropic Discord

---

## 学习节奏建议

| 阶段               | 预估时间  | 强度        |
| ---------------- | ----- | --------- |
| 预备知识             | 2-4 周 | 每天 1-2 小时 |
| Agent 核心概念       | 1-2 周 | 理解为主      |
| Function Calling | 1-2 周 | 重点动手      |
| 主流框架             | 3-4 周 | 框架为主      |
| 记忆与 RAG          | 2-3 周 | 结合项目      |
| 高级模式             | 3-4 周 | 深挖原理      |
| 实战项目             | 持续    | 边做边学      |

**总计：约 3-4 个月可完成全部基础阶段，之后持续通过项目积累。**

---

## 学习原则

1. **动手第一** — 每学一个概念就写代码。看十遍不如写一遍。
2. **由简到繁** — 先从 1 个工具、1 个 Agent 开始，再加复杂度。
3. **读源码** — 框架源码是最好的教材。重点看 Agent Loop 是怎么实现的。
4. **关注 Anthropic 和 OpenAI 的官方指南** — 它们代表了 Agent 设计的最佳实践。
5. **加入社区** — Discord、Reddit r/LangChain、知乎/X 上的 Agent 讨论。
