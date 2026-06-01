---
tags:
  - agent
  - ai
  - java
  - llm
  - 学习笔记
created: 2026-06-01
status: 持续更新
---

# AI Agent 开发知识体系（Java 方向）

## 一、Agent 核心概念

### 1.1 什么是 Agent

> **Agent = LLM + 工具 + 记忆 + 规划 + 行动**

Agent 是能自主感知环境、制定计划、调用工具、执行动作、从反馈中学习的智能体。区别于普通 LLM 调用：

| 维度 | 普通 LLM | Agent |
|------|----------|-------|
| 交互方式 | 单轮问答 | 多轮自主决策 |
| 外部能力 | 纯文本生成 | 调用工具/API/代码 |
| 记忆 | 仅当前对话 | 短期+长期记忆 |
| 推理 | 一步生成 | 思考→行动→观察→反思 循环 |

### 1.2 Agent 核心要素

```
┌──────────────────────────────────────────┐
│                  Agent                    │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  │
│  │  LLM    │  │ Memory  │  │  Tools  │  │
│  │  (大脑)  │  │ (记忆)   │  │ (手脚)   │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  │
│       │             │             │         │
│  ┌────┴─────────────┴─────────────┴─────┐  │
│  │         Planning (规划能力)            │  │
│  └──────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

**四大支柱：**

1. **LLM（大脑）** — 推理、理解、生成的核心引擎
2. **Tools（工具）** — 扩展 Agent 能力边界：API 调用、数据库查询、代码执行、文件操作
3. **Memory（记忆）** — 上下文保持、用户偏好、历史经验
4. **Planning（规划）** — 任务分解、路径选择、反思修正

### 1.3 Agent 智能层级

| Level | 名称 | 描述 | 示例 |
|-------|------|------|------|
| L0 | 无 AI | 纯规则/手工流程 | 传统爬虫 |
| L1 | LLM 增强 | LLM 辅助文本处理 | 文档摘要 |
| L2 | Tool Calling | LLM 决定调用工具 | 天气查询 Agent |
| L3 | 规划推理 | 多步推理+反思 | ReAct Agent |
| L4 | 自主协作 | 多 Agent 协作 | 软件开发团队 Agent |
| L5 | 完全自主 | 长期目标导向自治 | AI 研究员（未来） |

---

## 二、Agent 核心术语与 Prompt 工程

### 2.1 LLM 基础术语

| 术语 | 含义 | 类比 |
|------|------|------|
| **Token** | LLM 处理的最小文本单元，≈ 0.75 个英文单词或 0.5 个汉字 | 语言的"字节" |
| **Context Window** | 模型一次能"看到"的 token 上限 | 短期记忆容量 |
| **Inference** | 模型根据输入生成输出的过程 | "思考" |
| **Embedding** | 将文本映射为高维向量，语义越近向量越近 | 文本的"坐标" |
| **Temperature** | 控制输出随机性 0~2，越低越确定、越高越发散 | 创造性旋钮 |
| **Top-P** | 核采样，只从累计概率达 P 的 token 中选择 | 候选词筛选 |
| **Hallucination** | 模型生成看似合理但事实错误的内容 | "一本正经胡说八道" |
| **Latency** | 从发送请求到收到首个 token 的时间 | 响应延迟 |

**Token 与成本关系：**

```
中文：1 字符 ≈ 0.5 token
英文：1 单词 ≈ 1.3 token
代码：1 行 ≈ 5-15 token

GPT-4o 定价（参考）：
  输入：$2.50/1M tokens
  输出：$10.00/1M tokens

→ 一次完整 Agent 对话（10 轮）≈ 5000-20000 tokens ≈ $0.05-0.20
```

### 2.2 消息结构：LLM 对话的本质

LLM 是无状态的。每次请求都要把**完整对话历史**发过去。

```
┌─────────────────────────────────────────┐
│          一次 API 请求的结构               │
│                                          │
│  POST /v1/chat/completions               │
│  {                                       │
│    "model": "gpt-4o",                    │
│    "messages": [                         │
│      {"role": "system",    "content": "你是..."},   │
│      {"role": "user",      "content": "北京天气?"},  │
│      {"role": "assistant", "content": null,         │
│       "tool_calls": [{...}]},           │
│      {"role": "tool",      "content": "{...}"}      │
│    ],                                    │
│    "tools": [{...定义...}],               │
│    "temperature": 0.7                    │
│  }                                       │
└─────────────────────────────────────────┘
```

**四种消息角色：**

```java
// 1. System Message — 设定 Agent 人设和规则（优先级最高）
"你是专业的 Java 开发助手。只回答 Java 相关问题。使用中文。禁止猜测。"

// 2. User Message — 用户输入
"帮我写一个单例模式"

// 3. Assistant Message — 模型回复（包括工具调用请求）
"好的，以下是双重检查锁定的单例实现：..."

// 4. Tool Message — 工具执行结果（注入回对话）
"{\"result\": \"查询成功\", \"data\": [...]}"
```

**消息拼接示意：**

```
[System]  你是天气助手，调用工具获取真实天气。
[User]    北京今天天气？
[Assistant] (tool_call: getWeather("北京"))
[Tool]     {"temp": 25, "weather": "晴"}     ← 工具返回
[Assistant] 北京今天晴，25°C                   ← 模型看到工具结果后总结
[User]    那上海呢？                          ← 新一轮
[Assistant] (tool_call: getWeather("上海"))
[Tool]     {"temp": 28, "weather": "多云"}
[Assistant] 上海多云，28°C
```

> **关键认知：把整个对话历史看作"上下文文档"，LLM 每次都是读完全文后才写下一个 token。这就是为什么上下文越大越好，但也越贵。**

### 2.3 Prompt 工程：System Prompt 设计

System Prompt 是 Agent 的"宪法"。写好它 = 成功一半。

#### 结构模板

```markdown
## 角色定义
你是 [角色名称]，专门负责 [职责范围]。

## 核心规则
1. [硬性规则 1] — 绝对不能违反
2. [硬性规则 2]
3. ...

## 工具使用指南
- 查询类问题 → 使用 search_xxx 工具
- 修改类操作 → 使用 update_xxx 工具，操作前确认
- 不知道 → 坦诚说不知道，不要编造

## 输出格式
- 回答用 Markdown
- 涉及金额时要明确标注货币单位
- 列出多条信息时使用序号

## 边界与限制
- 不讨论政治敏感话题
- 不提供医疗/法律建议
- 超过 [阈值] 元的操作需要人工审核
```

#### System Prompt 设计清单

| 维度 | 要点 | 反例 |
|------|------|------|
| **角色** | 明确身份、语气 | "你是助手" → 太模糊 |
| **能力边界** | 能做什么、不能做什么 | 不写 → Agent 容易越界 |
| **工具策略** | 什么场景用什么工具 | 不写 → 工具调用混乱 |
| **禁止行为** | 用"绝对不要/禁止" | "尽量不要" → 太弱 |
| **输出规范** | 格式、语言、长度 | 不写 → 输出不稳定 |
| **安全护栏** | 敏感操作确认机制 | 不写 → 风险 |

#### 实战 System Prompt 示例

```java
// 贪吃蛇 AI 的 System Prompt
@SystemMessage("""
    ## 角色
    你是 10×10 贪吃蛇游戏的 AI 玩家。

    ## 规则
    坐标 (0,0) 到 (9,9)，(0,0) 左上角，(9,9) 右下角。
    每次输出一个方向：UP / DOWN / LEFT / RIGHT。
    撞墙或撞到自己 → 死亡。
    吃到食物 → 长度 +1，分数 +10。

    ## 策略
    - 优先走向食物
    - 避免走入死胡同
    - 留出逃逸空间：不要让蛇身封住自己的去路
    - 判断下一步是否安全（不撞墙、不撞自己）
    - 如果无安全方向，选相对最安全的

    ## 输出
    只输出方向单词，不要解释。
    """)
String nextMove(String gameState);
```

### 2.4 Prompt 工程：User Prompt 设计

用户消息是 Agent 理解的"任务描述"。写好它 = 减少歧义。

#### 好 User Prompt 的公式

```
[背景] 当前环境和约束
[任务] 要做什么，什么算完成
[例子] 输入→输出示例（Few-shot）
[格式] 期望的输出格式
[陷阱] 常见错误提示
```

#### 实战 User Prompt 模板

```java
// 提取用户消息意图的 Prompt
@UserMessage("""
    分析以下客服消息，提取结构化信息。

    客服消息：
    ```
    {{it}}
    ```

    返回 JSON：
    {
      "intent": "类别 (ORDER_QUERY/REFUND/COMPLAINT/GREETING/OTHER)",
      "urgency": "紧急性 (LOW/MEDIUM/HIGH)",
      "entities": {
        "orderId": "订单号（如有）",
        "product": "商品名（如有）",
        "amount": "金额（如有）"
      },
      "sentiment": "情绪 (POSITIVE/NEUTRAL/NEGATIVE/ANGRY)",
      "summary": "一句话摘要"
    }

    示例：
    输入："我的订单 12345 怎么还没到！已经三天了！"
    输出：{"intent":"ORDER_QUERY","urgency":"HIGH","entities":{"orderId":"12345"},"sentiment":"ANGRY","summary":"用户催单"}

    输入："你好，我想看看最近有什么优惠"
    输出：{"intent":"OTHER","urgency":"LOW","entities":{},"sentiment":"POSITIVE","summary":"用户咨询优惠"}
    """)
IntentResult extractIntent(String userMessage);
```

#### Few-shot vs Zero-shot

```
Zero-shot：不给示例，让模型直接猜
  Prompt: "判断情绪：今天真倒霉"
  → 模型靠预训练知识判断，小模型容易翻车

Few-shot：给 2-5 个示例
  Prompt:
    判断情绪：
    "太开心了" → POSITIVE
    "烦死了" → NEGATIVE
    "今天天气还行" → NEUTRAL
    "今天真倒霉" → ?
  → 模型模仿示例格式和判断标准

选型：
  简单任务 + 大模型(GPT-4) → Zero-shot 够用
  复杂任务 + 小模型(Qwen-7B) → 至少 3 个 Few-shot
  格式要求严格 → 一定 Few-shot
```

### 2.5 Function Calling (Tool Use) 本质

> Tool Calling ≠ LLM 调用工具。LLM **不执行**任何代码。它只是按格式输出一个"我想调用这个工具"的 JSON。

```
Agent 调用工具的完整链路：

1. 用户: "北京今天天气？"
2. System Prompt + 工具定义 + 用户消息 → 发给 LLM
3. LLM 输出: 不是文字回答，而是一个特殊的 JSON:
   {
     "tool_calls": [{
       "id": "call_abc123",
       "function": {
         "name": "getWeather",
         "arguments": "{\"city\":\"北京\"}"
       }
     }]
   }
4. 你的 Java 代码收到这个 JSON → 解析 → 真的调用 getWeather("北京")
5. 把结果拼回消息列表 → 再发给 LLM:
   {"role": "tool", "tool_call_id": "call_abc123", "content": "{\"temp\":25}"}
6. LLM 看到结果 → 生成自然语言回答
   "北京今天 25°C，晴"
```

**关键认知：**

- LLM 只是个**文本生成器**，它不会执行代码
- Tool Calling = LLM 生成特定格式的 JSON，你的程序解析并执行
- 工具定义（名称、描述、参数 schema）**完全靠自然语言**传给 LLM，LLM 靠语义理解选工具
- 如果两个工具描述太像，LLM 会选错 ← 这就是"工具描述工程"的重要性

### 2.6 上下文管理策略

```
总 Context Window = System Prompt + 对话历史 + 工具定义 + 工具结果 + 生成输出

                    ┌──────────────────────────┐
                    │    Context Window (128K)  │
                    │ ┌──────────────────────┐ │
                    │ │ System Prompt (固定)   │ │  ~500 tokens
                    │ ├──────────────────────┤ │
                    │ │ 工具定义 (固定)         │ │  ~1000 tokens
                    │ ├──────────────────────┤ │
                    │ │ 对话历史 (增长中)       │ │  动态
                    │ │  ...越聊越多...        │ │
                    │ │  ...越聊越多...        │ │
                    │ │  ...越聊越多...        │ │
                    │ ├──────────────────────┤ │
                    │ │ 可用空间               │ │  = 总窗口 - 历史占用
                    │ │                       │ │
                    │ └──────────────────────┘ │
                    └──────────────────────────┘
```

**三种管理策略：**

| 策略 | 做法 | 优点 | 缺点 |
|------|------|------|------|
| **滑动窗口** | 保留最近 N 条消息 | 简单 | 丢失早期上下文 |
| **摘要压缩** | 旧消息 → LLM 生成摘要 | 保留关键信息 | 细节丢失 |
| **智能裁剪** | 保留关键事件，删掉废话 | 信息密度高 | 实现复杂 |

```java
// 摘要压缩实现
public String compressHistory(List<Message> messages, int keepRecent) {
    List<Message> toKeep = messages.subList(
        Math.max(0, messages.size() - keepRecent), messages.size());
    List<Message> toCompress = messages.subList(0,
        Math.max(0, messages.size() - keepRecent));

    if (toCompress.isEmpty()) return null;

    // 让 LLM 把旧消息压缩为摘要
    String summary = llm.chat("""
        把以下对话历史压缩为一句话摘要，
        保留关键信息（用户需求、已完成操作、重要结果）：
        %s
        """.formatted(formatMessages(toCompress)));

    return summary; // 把摘要作为 System Message 注入
}
```

### 2.7 Token 成本估算公式

```java
/**
 * 估算一次 Agent 对话的成本
 */
public class CostEstimator {

    // 各模型定价，$/1M tokens（2025 参考）
    static final Map<String, Pricing> PRICING = Map.of(
        "gpt-4o",       new Pricing(2.50, 10.00),
        "gpt-4o-mini",  new Pricing(0.15, 0.60),
        "claude-3.5",   new Pricing(3.00, 15.00),
        "deepseek-chat",new Pricing(0.14, 0.28),
        "qwen-plus",    new Pricing(0.50, 2.00)
    );

    record Pricing(double inputPrice, double outputPrice) {}

    public static double estimate(String model, int inputTokens, int outputTokens) {
        Pricing p = PRICING.getOrDefault(model, new Pricing(0, 0));
        return (inputTokens / 1_000_000.0) * p.inputPrice()
             + (outputTokens / 1_000_000.0) * p.outputPrice();
    }

    // 典型场景
    public static void main(String[] args) {
        // 一次 10 轮客服对话，每轮 2000 input + 200 output
        double cost = estimate("gpt-4o", 20000, 2000);
        System.out.printf("预估成本: $%.4f%n", cost);
        // → $0.07

        // 每天 10000 次对话
        System.out.printf("日成本: $%.2f%n", cost * 10000);
        // → $700
    }
}
```

**省钱三板斧：**

1. **分层模型** — 意图识别用 gpt-4o-mini，复杂推理才用 gpt-4o
2. **Prompt 压缩** — 长 System Prompt 精简，工具描述精简
3. **缓存命中** — 相同 System Prompt + 工具定义会命中 API 缓存，价格减半

### 2.8 核心术语速查表

| 术语 | 一句话解释 |
|------|-----------|
| Prompt | 给 LLM 的输入指令 |
| Prompt Engineering | 系统性设计 Prompt 以获得更好输出 |
| System Prompt | 设定角色、规则、边界的"宪法"级 Prompt |
| User Prompt | 具体任务描述 |
| Context Window | LLM 一次能处理的最大 token 数 |
| Function Calling / Tool Use | LLM 输出结构化 JSON 描述要调用的工具 |
| Tool Schema / Tool Definition | 工具的 JSON Schema 描述（名称、描述、参数） |
| Chat Memory | 存储对话历史，让 LLM 记住前后文 |
| Embedding | 文本 → 向量的数学映射 |
| Vector Store | 存储和检索向量的数据库 |
| RAG | 检索增强生成：先查文档再回答 |
| Chain | 多个 LLM 调用串联成流水线 |
| Agent Loop | Agent 的"思考→行动→观察"循环 |
| Fine-tuning | 在特定数据上微调模型权重 |
| Temperature | 控制输出随机性，0=确定，2=发散 |
| Top-P | 核采样概率阈值 |
| Streaming | 逐 token 返回而非等全部生成完 |
| Guardrails | 输入/输出/工具调用 三阶段安全护栏 |
| Hallucination | 模型编造事实 |
| MCP | Model Context Protocol，Agent 与工具的标准化协议 |
| Token Budget | 单次请求的 token 预算分配 |

---

## 三、Agent 架构模式

### 3.1 ReAct 模式（Reasoning + Acting）

最经典的模式。交替进行**思考**和**行动**：

```
Thought: 我需要查今天的天气才能回答用户
Action: call_weather_api(location="北京")
Observation: {"temp": 25, "weather": "晴"}
Thought: 我已经拿到天气信息，可以回答了
Answer: 北京今天晴，25°C
```

**ReAct 循环伪代码：**

```java
while (!finished) {
    Thought thought = llm.think(context, tools);
    if (thought.isFinal()) {
        return thought.answer();
    }
    Action action = thought.getAction();
    Observation obs = execute(action);
    context.add(obs);
}
```

### 2.2 Plan-and-Execute 模式

先制定完整计划，再逐步执行：

```
Plan: 
  1. 查询用户所在城市
  2. 查询该城市天气
  3. 查询该城市限号信息
  4. 综合回答

Execute step 1 → Result → Execute step 2 → ...
```

**适用场景：** 复杂多步任务、需要整体规划的场景

### 2.3 Reflection 模式

执行后自我反思，评估质量，必要时重试：

```
Execute → Evaluate → 
  if 不满意 → Reflect(为什么不行？) → Retry
  if 满意 → Return
```

### 2.4 ReWOO 模式（Reasoning Without Observation）

先一次性推理出完整工具调用链，再批量执行：

```
Plan: [tool1(args1), tool2(tool1.result), tool3(tool1.result, tool2.result)]
Execute: 并行执行无依赖的工具，最后汇总
```

**优势：** 减少 LLM 调用次数，可并行执行

### 2.5 LLM Compiler 模式

将任务编译为 DAG（有向无环图），识别依赖关系，并行执行独立节点。

### 2.6 架构对比总结

| 模式 | LLM 调用次数 | 并行能力 | 容错性 | 适用场景 |
|------|-------------|---------|--------|---------|
| ReAct | 多（每步一次） | 低 | 高 | 探索性任务 |
| Plan-Execute | 少 | 中 | 中 | 结构化任务 |
| ReWOO | 极少 | 高 | 低 | 可预测任务 |
| Reflection | 多 | 低 | 极高 | 质量要求高的任务 |

---

## 三、Java AI 生态系统

### 3.1 框架全景图

```
Java AI Agent 生态
├── 核心框架
│   ├── LangChain4j      ★ 最推荐，Java 版 LangChain
│   ├── Spring AI          Spring 官方，与 Spring 生态深度集成
│   └── Semantic Kernel    微软出品，Java SDK
├── LLM 服务
│   ├── OpenAI (GPT-4, GPT-4o)
│   ├── Anthropic (Claude) — 通过官方 SDK 或网关
│   ├── 国产大模型：通义千问/文心一言/DeepSeek/Kimi
│   └── Ollama (本地部署)
├── 向量数据库
│   ├── Milvus / Qdrant / Weaviate  — 独立部署
│   ├── pgvector (PostgreSQL 扩展)   — 最省事
│   ├── Chroma / Redis Stack         — 轻量
│   └── Elasticsearch               — 已有 ES 的首选
├── MCP 协议（Model Context Protocol）
│   ├── 标准化的 Agent-工具 交互协议
│   └── Spring AI MCP / LangChain4j MCP 支持
└── Agent 框架（高级）
    ├── AutoGen (多 Agent 对话)
    ├── CrewAI (角色化多 Agent)
    ├── MetaGPT (SOP 驱动 Agent)
    └── Dify / Coze (低代码 Agent 平台)
```

### 3.2 框架选型决策树

```
需要用 Spring Boot 吗？
├── 是 → Spring AI
│   └── 需要高级 Agent 编排？ → Spring AI + 自己封装
└── 否 → LangChain4j
    └── 是独立应用/微服务 → LangChain4j 最灵活

有微软技术栈吗？
└── 是 → Semantic Kernel for Java

想低代码快速验证？
└── 是 → Dify / Coze 平台
```

---

## 四、LangChain4j 深度指南 ★

### 4.1 Maven 依赖

```xml
<dependency>
    <groupId>dev.langchain4j</groupId>
    <artifactId>langchain4j</artifactId>
    <version>1.1.0</version>
</dependency>
<!-- OpenAI 模型适配器 -->
<dependency>
    <groupId>dev.langchain4j</groupId>
    <artifactId>langchain4j-open-ai</artifactId>
    <version>1.1.0</version>
</dependency>
<!-- 国产模型: 通义千问 -->
<dependency>
    <groupId>dev.langchain4j</groupId>
    <artifactId>langchain4j-dashscope</artifactId>
    <version>1.1.0</version>
</dependency>
<!-- Quarkus 集成 -->
<dependency>
    <groupId>dev.langchain4j</groupId>
    <artifactId>langchain4j-open-ai-quarkus</artifactId>
    <version>1.1.0</version>
</dependency>
```

### 4.2 第一个 Agent：Tool Calling

```java
import dev.langchain4j.agent.tool.Tool;
import dev.langchain4j.memory.chat.MessageWindowChatMemory;
import dev.langchain4j.model.openai.OpenAiChatModel;
import dev.langchain4j.service.AiServices;

public class WeatherAgent {

    // 1. 定义工具
    static class WeatherTools {
        @Tool("查询指定城市的实时天气")
        public String getWeather(String city) {
            // 实际应调用天气 API
            return city + "：晴，25°C，湿度 60%";
        }

        @Tool("查询指定城市的空气质量指数(AQI)")
        public String getAQI(String city) {
            return city + " AQI: 68，良";
        }
    }

    // 2. 定义 Agent 接口
    interface Assistant {
        String chat(String message);
    }

    public static void main(String[] args) {
        // 3. 组装 Agent
        Assistant agent = AiServices.builder(Assistant.class)
            .chatLanguageModel(OpenAiChatModel.builder()
                .apiKey(System.getenv("OPENAI_API_KEY"))
                .modelName("gpt-4o")
                .build())
            .tools(new WeatherTools())
            .chatMemory(MessageWindowChatMemory.withMaxMessages(10))
            .build();

        // 4. 对话
        String answer = agent.chat("北京今天天气怎么样？空气质量好吗？");
        System.out.println(answer);
    }
}
```

### 4.3 AI Services 声明式 Agent

LangChain4j 最强大的特性。通过接口+注解定义 Agent：

```java
import dev.langchain4j.service.*;

public interface CustomerServiceAgent {

    @SystemMessage("""
        你是专业的客服助手。规则：
        - 回复礼貌、简洁
        - 退款问题需查询订单状态
        - 投诉问题需记录并升级
        """)
    String chat(String userMessage);

    // 结构化输出
    @UserMessage("提取用户消息中的意图和关键信息：{{it}}")
    IntentResult extractIntent(String userMessage);
}

// 结构化输出类
record IntentResult(
    String intent,      // ORDER_STATUS, REFUND, COMPLAINT, GENERAL
    String orderId,
    String sentiment    // POSITIVE, NEUTRAL, NEGATIVE
) {}
```

### 4.4 Chain 与 Pipeline

```java
import dev.langchain4j.chain.ConversationalRetrievalChain;

// RAG 链：检索 → 增强 → 生成
ConversationalRetrievalChain chain = ConversationalRetrievalChain.builder()
    .chatLanguageModel(model)
    .retriever(embeddingStore.asRetriever())
    .chatMemory(MessageWindowChatMemory.withMaxMessages(20))
    .build();

String answer = chain.execute("如何重置密码？");
```

### 4.5 Memory 管理

```java
// 滑动窗口记忆 (默认)
ChatMemory windowMemory = MessageWindowChatMemory.withMaxMessages(20);

// Token 窗口记忆 (限制 token 数)
ChatMemory tokenMemory = TokenWindowChatMemory.withMaxTokens(8000, new OpenAiTokenizer());

// 持久化记忆 (内嵌数据库)
EmbeddingStore<TextSegment> store = InMemoryEmbeddingStore.create();
```

### 4.6 RAG 完整示例

```java
import dev.langchain4j.data.document.Document;
import dev.langchain4j.data.document.splitter.DocumentSplitters;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.store.embedding.EmbeddingStore;
import dev.langchain4j.store.embedding.EmbeddingStoreIngestor;

// 1. 文档切分
Document doc = loadDocument("knowledge-base.md");
List<TextSegment> segments = DocumentSplitters
    .recursive(500, 50)  // 每段 500 字符，重叠 50 字符
    .split(doc);

// 2. 向量化 + 存储
EmbeddingStoreIngestor ingestor = EmbeddingStoreIngestor.builder()
    .embeddingModel(embeddingModel)
    .embeddingStore(embeddingStore)
    .build();
ingestor.ingest(doc);
```

### 4.7 Agent 执行流程控制

LangChain4j 核心流程 API：

```java
import dev.langchain4j.service.TokenStream;

// 流式输出
TokenStream stream = agent.chatStream("讲个笑话");
stream.onNext(token -> System.out.print(token))
      .onComplete(() -> System.out.println("\n[DONE]"))
      .onError(Throwable::printStackTrace)
      .start();

// AOP 拦截：记录每次 Tool 调用
@Tool
public String queryDatabase(@P("SQL语句") String sql) {
    log.info("Agent 调用 DB: {}", sql);
    return jdbcTemplate.queryForList(sql).toString();
}
```

---

## 五、Spring AI 深度指南

### 5.1 Maven 依赖

```xml
<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-openai-spring-boot-starter</artifactId>
    <version>1.1.0</version>
</dependency>
<!-- MCP 协议支持 -->
<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-starter-mcp-server-webmvc</artifactId>
    <version>1.1.0</version>
</dependency>
```

### 5.2 Tool Calling（Spring AI 方式）

```java
import org.springframework.ai.tool.ToolCallback;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.stereotype.Component;

@Component
public class OrderTools {

    @Tool(description = "根据订单号查询订单详情")
    public Order queryOrder(
        @ToolParam(description = "订单号") String orderId) {
        return orderService.findById(orderId);
    }

    @Tool(description = "退款操作，需要确认")
    public RefundResult refund(
        @ToolParam(description = "订单号") String orderId,
        @ToolParam(description = "退款原因") String reason) {
        return orderService.processRefund(orderId, reason);
    }
}
```

### 5.3 Spring AI ChatClient（新版 API）

```java
@RestController
public class AgentController {

    private final ChatClient chatClient;

    public AgentController(ChatClient.Builder builder, OrderTools tools) {
        this.chatClient = builder
            .defaultTools(tools)
            .defaultSystem("你是电商客服助手")
            .build();
    }

    @PostMapping("/chat")
    public String chat(@RequestBody String message) {
        return chatClient.prompt()
            .user(message)
            .call()
            .content();
    }
}
```

### 5.4 MCP 协议集成

Spring AI 是 MCP 协议的一等公民：

```java
// MCP Server: 暴露工具给外部 Agent
@Configuration
public class McpConfig {

    @Bean
    public McpServerProperties mcpServerProperties() {
        return McpServerProperties.builder()
            .name("order-service")
            .version("1.0.0")
            .build();
    }

    // 工具自动通过 MCP 协议暴露
}

// MCP Client: 调用外部 Agent 工具
// application.yml
// spring.ai.mcp.client.connections.weather.url=http://weather-agent:8080
```

### 5.5 Spring AI 特色能力

```java
// Advisors：请求拦截/增强链（类似 AOP）
ChatClient client = ChatClient.builder(model)
    .defaultAdvisors(
        new SimpleLoggerAdvisor(),         // 日志
        new QuestionAnswerAdvisor(vectorStore, SearchRequest.defaults()), // 自动 RAG
        new SafeGuardAdvisor()             // 安全护栏
    )
    .build();

// ETL Pipeline：数据清洗→切分→向量化→存储
@Bean
public ETLPipeline etlPipeline() {
    return ETLPipeline.builder()
        .reader(new PdfPageDocumentReader("docs/"))
        .transformer(new KeywordMetadataEnricher())
        .splitter(new TokenTextSplitter())
        .writer(vectorStoreWriter)
        .build();
}
```

---

## 六、Agent 核心能力详解

### 6.1 Tool Calling（工具调用）★ 最重要

**工具是 Agent 的"手脚"，决定能力边界。**

#### 工具设计原则

```java
// ❌ 坏设计：工具太粗，LLM 难以精确使用
@Tool("处理订单")  // 太模糊
public String handleOrder(String action, String id) { ... }

// ✅ 好设计：工具原子化，每工具单一职责
@Tool("查询订单状态的详细信息")
public OrderStatus getOrderStatus(@ToolParam("订单号") String orderId) { ... }

@Tool("取消尚未发货的订单")
public CancelResult cancelOrder(@ToolParam("订单号") String orderId) { ... }

@Tool("为已完成的订单申请售后")
public AfterSaleResult requestAfterSale(
    @ToolParam("订单号") String orderId,
    @ToolParam("售后类型：REFUND/RETURN/EXCHANGE") String type,
    @ToolParam("申请原因") String reason) { ... }
```

#### 工具描述工程（Tool Description Engineering）

LLM 完全依赖文字描述选择工具。描述质量直接决定调用正确率：

```java
@Tool("""
    查询用户指定时间段内的订单列表。
    适用场景：用户问"我的订单"、"最近买了什么"、"查下上个月的订单"
    不适用场景：查询单个订单状态（用 getOrderStatus）
    注意：最多返回最近 100 条订单
    """)
public List<Order> queryOrders(
    @ToolParam(value = "用户ID", required = false) String userId,
    @ToolParam("开始日期，格式 yyyy-MM-dd") String startDate,
    @ToolParam("结束日期，格式 yyyy-MM-dd") String endDate) { ... }
```

#### 工具设计清单

- [ ] 每个工具**单一职责**
- [ ] 描述写清 **"什么时候用 / 什么时候不用"**
- [ ] 参数描述写清 **格式 + 约束 + 示例**
- [ ] 返回值**结构化**（JSON），别返回自然语言
- [ ] 处理异常时返回结构化错误信息，不要抛异常给 LLM
- [ ] 敏感操作（退款/删除）加确认机制

### 6.2 Memory（记忆系统）

```
┌─────────────────────────────────────────────┐
│              记忆系统分层                      │
├─────────────────┬───────────────────────────┤
│  短期记忆        │  当前对话的上下文窗口          │
│  (Short-term)   │  ChatMemory 实现            │
├─────────────────┼───────────────────────────┤
│  长期记忆        │  跨会话的用户偏好/事实         │
│  (Long-term)    │  向量数据库 + RAG            │
├─────────────────┼───────────────────────────┤
│  工作记忆        │  当前任务的中间结果            │
│  (Working)      │  Scratchpad / 临时存储        │
└─────────────────┴───────────────────────────┘
```

**实现方案：**

```java
// 短期记忆：会话上下文
ChatMemory memory = MessageWindowChatMemory.builder()
    .maxMessages(30)
    .build();

// 长期记忆：向量存储
// 每轮对话结束后，摘要+向量化存储
String summary = llm.summarize(chatHistory);
embeddingStore.add(embed(summary), metadata);

// 下次对话时检索相关记忆
List<TextSegment> relevant = embeddingStore.search(userIntent, 5);
```

**记忆管理策略：**

1. **滑动窗口** — 保留最近 N 条消息，最常用
2. **摘要压缩** — 旧消息 → LLM 摘要，节省 token
3. **混合检索** — 向量相似度 + 关键词 + 时间衰减
4. **结构化记忆** — 用户画像存关系型 DB，长文本存向量库

### 6.3 Planning（规划能力）

#### Task Decomposition 模式

```java
// Plan-and-Execute 实现思路
public class Planner {

    public Plan decompose(String userRequest) {
        String prompt = """
            将用户请求分解为可执行的子任务。
            
            用户请求：%s
            
            输出 JSON 格式：
            {
              "tasks": [
                {"id": 1, "desc": "...", "dependsOn": []},
                {"id": 2, "desc": "...", "dependsOn": [1]}
              ]
            }
            """.formatted(userRequest);
        return llm.generate(prompt, Plan.class);
    }
}

public class Executor {
    public Result execute(Plan plan) {
        List<Task> tasks = topologicalSort(plan.tasks()); // 依赖排序
        Map<Integer, Result> results = new HashMap<>();

        for (Task task : tasks) {
            // 把已完成的依赖结果注入上下文
            String context = buildContext(task, results);
            Result r = agent.execute(task.desc(), context);
            results.put(task.id(), r);

            // 反思：结果是否满足要求？
            if (r.needsRetry()) {
                r = agent.executeWithReflection(task.desc(), context);
            }
        }
        return synthesize(results);
    }
}
```

### 6.4 RAG（检索增强生成）

```
用户提问
   │
   ▼
┌──────────┐    ┌──────────┐    ┌──────────┐
│ 向量化    │───▶│ 相似检索  │───▶│ 重排序    │
│ Query    │    │ Top-K    │    │ Rerank   │
└──────────┘    └──────────┘    └──────────┘
                                      │
                                      ▼
                              ┌──────────────┐
                              │ Prompt 组装   │
                              │ 上下文 + 问题  │
                              └──────┬───────┘
                                     │
                                     ▼
                              ┌──────────────┐
                              │ LLM 生成回答  │
                              └──────────────┘
```

**优化点：**

| 阶段 | 优化手段 | 提升 |
|------|---------|------|
| 文档处理 | 语义切分、元数据富化 | 检索相关性 |
| Query | 改写、多角度生成、HyDE | 召回率 |
| Embedding | 选对模型维度、领域微调 | 语义准确性 |
| 检索 | 混合检索（BM25+向量）、元数据过滤 | 召回率 |
| 重排序 | Cross-Encoder Reranker | 精确率 |
| 生成 | 提示词工程、引用溯源 | 回答质量 |

**文档切分参数调优：**

```java
// 不同场景的最佳参数
DocumentSplitter codeSplitter = DocumentSplitters.recursive(
    1000,  // 代码块通常更大
    200    // 保持函数完整性
);

DocumentSplitter faqSplitter = DocumentSplitters.recursive(
    300,   // FAQ 问答对较短
    50
);

DocumentSplitter documentSplitter = DocumentSplitters.recursive(
    500,   // 通用文档
    100
);
```

### 6.5 Guardrails（安全护栏）

```java
// 输入护栏：防止注入和越狱
public class InputGuard implements Advisor {
    public AdvisedRequest advise(AdvisedRequest request) {
        String input = request.userText();
        if (containsSensitiveWord(input)) {
            throw new SafetyException("检测到敏感内容");
        }
        if (exceedsMaxLength(input)) {
            throw new SafetyException("输入过长");
        }
        return request;
    }
}

// 输出护栏：防止违规内容
public class OutputGuard {
    public String filter(String output) {
        if (containsPII(output)) {
            return "回答包含个人信息，已过滤";
        }
        if (containsViolent(output)) {
            return "回答包含不当内容，已拦截";
        }
        return output;
    }
}
```

**护栏三阶段：**
1. **Input Gate** — 过滤用户输入（敏感词、注入、越狱）
2. **Tool Gate** — 限制工具调用（频率限制、权限校验、金额上限）
3. **Output Gate** — 审核回答内容（事实性、合规性、PII 脱敏）

---

## 七、多 Agent 系统

### 7.1 多 Agent 协作模式

#### 顺序模式（Pipeline）

```
Agent A → Agent B → Agent C
(需求分析) (代码生成) (代码审查)
```

#### 辩论模式（Debate）

```
Agent A (正方) ──┐
                 ├──▶ 裁判 Agent ▶ 最终回答
Agent B (反方) ──┘
```

#### 层级模式（Hierarchy）

```
        管理者 Agent
       /    |    \
     A1    A2    A3
   搜索   计算   写稿
```

#### 角色扮演（Crew）

```
   项目经埋 Agent ── 分派任务
      /        \
 开发 Agent   测试 Agent ── Bug → 开发 Agent
```

### 7.2 LangGraph4j 状态图 Agent

```java
// 用状态图定义 Agent 流程
// LangGraph4j 是 LangChain4j 的扩展

@StateGraph
public class CodeReviewWorkflow {

    @Node("start")
    public State analyze(String userRequest) {
        return State.builder()
            .task(userRequest)
            .nextStep("generate");
    }

    @Node("generate")
    public State generate(State state) {
        String code = codeAgent.generate(state.task());
        return state.withCode(code).nextStep("review");
    }

    @Node("review")
    public State review(State state) {
        String feedback = reviewAgent.review(state.code());
        if (feedback.contains("需要修改")) {
            return state.withFeedback(feedback).nextStep("generate");
        }
        return state.withApproved(true).nextStep("end");
    }
}
```

### 7.3 Agent 间通信协议

| 方式 | 实现 | 适用 |
|------|------|------|
| 内存传递 | Java 对象 | 单 JVM 内 |
| MCP 协议 | Spring AI MCP | 跨服务标准协议 |
| 消息队列 | RabbitMQ/Kafka | 异步解耦 |
| gRPC | Protobuf | 高性能同步调用 |
| Redis Pub/Sub | 发布订阅 | 事件驱动 |

---

## 八、实战：构建一个智能客服 Agent

### 8.1 架构设计

```
┌─────────────────────────────────────────────┐
│              智能客服 Agent 系统                │
│                                              │
│  ┌─────────┐  ┌──────────┐  ┌────────────┐  │
│  │ 路由Agent │  │ 知识库RAG │  │ 工单系统     │  │
│  │ (意图识别) │  │         │  │ (工具调用)    │  │
│  └────┬─────┘  └────┬─────┘  └─────┬──────┘  │
│       │             │              │          │
│  ┌────┴─────────────┴──────────────┴──────┐  │
│  │         编排层 (Orchestrator)           │  │
│  └────────────────┬───────────────────────┘  │
│                   │                           │
│  ┌────────────────┴───────────────────────┐  │
│  │     Memory + Conversation History      │  │
│  └────────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

### 8.2 完整代码

```java
// ====== 工具层 ======
@Component
public class CustomerServiceTools {

    private final OrderRepository orderRepo;
    private final TicketRepository ticketRepo;
    private final KnowledgeBase kb;

    @Tool("查询用户最近的订单")
    public List<Order> findOrders(
        @ToolParam("用户ID（可选）") String userId,
        @ToolParam("订单状态：ALL/PENDING/SHIPPED/DELIVERED/CANCELLED") String status) {
        return orderRepo.findByUserAndStatus(userId, status);
    }

    @Tool("查询一个订单的物流轨迹")
    public LogisticsTrace traceLogistics(
        @ToolParam("订单号") String orderId) {
        return orderRepo.getLogistics(orderId);
    }

    @Tool("创建客服工单，用于记录需要人工处理的复杂问题")
    public Ticket createTicket(
        @ToolParam("问题描述") String description,
        @ToolParam("优先级：LOW/MEDIUM/HIGH/URGENT") String priority) {
        return ticketRepo.create(description, priority);
    }

    @Tool("从知识库检索产品信息、常见问题、政策说明")
    public String searchKnowledgeBase(
        @ToolParam("搜索关键词或问题") String query) {
        return kb.search(query, 3);
    }
}

// ====== Agent 定义 ======
public interface CustomerAgent {

    @SystemMessage("""
        你是电商平台的智能客服助手"小智"。
        
        核心规则：
        1. 优先用知识库回答常见问题
        2. 订单/物流问题必须调用工具查询真实数据
        3. 以下情况必须创建工单：
           - 用户要求退款但你不确定是否满足条件
           - 用户情绪强烈或投诉
           - 问题超出你的能力范围
        4. 永远不要编造订单号、金额等具体数据
        5. 退款金额＞100 元时，提醒需要人工审核
        
        语气：亲切、专业、高效
        """)
    String chat(@UserMessage String message);
}

// ====== 组装启动 ======
@Configuration
public class AgentConfig {

    @Bean
    public CustomerAgent customerAgent(
            OpenAiChatModel model,
            CustomerServiceTools tools,
            VectorStore vectorStore) {

        return AiServices.builder(CustomerAgent.class)
            .chatLanguageModel(model)
            .tools(tools)
            .chatMemoryProvider(memoryId -> MessageWindowChatMemory
                .withMaxMessages(30))
            .contentRetriever(EmbeddingStoreContentRetriever.builder()
                .embeddingStore(vectorStore)
                .maxResults(5)
                .minScore(0.75)
                .build())
            .build();
    }
}
```

### 8.3 生产环境增强

```java
// ====== 可观测性 ======
@Bean
public ChatModelListener monitoringListener() {
    return new ChatModelListener() {
        @Override
        public void onRequest(ChatModelRequestContext ctx) {
            metrics.increment("agent.requests");
            ctx.attributes().put("startTime", System.currentTimeMillis());
        }

        @Override
        public void onResponse(ChatModelResponseContext ctx) {
            long duration = System.currentTimeMillis() -
                (long) ctx.attributes().get("startTime");
            metrics.record("agent.latency", duration);
            metrics.record("agent.tokens", ctx.response().tokenUsage());
        }

        @Override
        public void onError(ChatModelErrorContext ctx) {
            metrics.increment("agent.errors");
            log.error("Agent error", ctx.error());
        }
    };
}

// ====== 限流 ======
@Tool
public RefundResult refund(@ToolParam("订单号") String orderId,
                           @ToolParam("金额") BigDecimal amount) {
    // 金额超过阈值，需要人工审核
    if (amount.compareTo(new BigDecimal("100")) > 0) {
        return new RefundResult("PENDING_REVIEW",
            "退款金额 %s 元需要人工审核，已创建审核工单".formatted(amount));
    }
    return orderService.refund(orderId, amount);
}
```

---

## 九、学习路径与进阶

### 9.1 新手学习路线（建议 4-6 周）

```
Week 1: LLM 基础
├── 理解 Transformer、Token、Embedding
├── 用 Java 调用 OpenAI API（最简 Demo）
└── 理解 System Prompt / User Prompt / Temperature

Week 2: Tool Calling ★
├── LangChain4j @Tool 注解
├── 写 5 个工具让 Agent 调用
└── 观察 LLM 如何选择工具

Week 3: Memory + RAG
├── ChatMemory 类型和特点
├── 文档切分、Embedding、向量存储
└── 搭一个能"读文档"的 Agent

Week 4: Agent 架构
├── 理解 ReAct 循环
├── 实现 Plan-and-Execute
├── 探索 Spring AI

Week 5: 多 Agent + 生产化
├── 两个 Agent 对话协作
├── 可观测性（日志、指标、Trace）
├── 安全护栏

Week 6: 实战项目
└── 选一个方向：
    - 智能客服系统
    - 代码审查 Agent
    - SQL 查询 Agent（Text2SQL）
    - 知识库问答系统
```

### 9.2 关键技术难点

| 难点 | 解决方案 |
|------|---------|
| **工具选择错误** | 优化工具描述、Few-shot 示例、限制工具数量≤10 |
| **上下文溢出** | 摘要压缩、滑动窗口、关键信息提取 |
| **幻觉** | RAG 强约束、工具验证、引用溯源 |
| **推理效率低** | ReWOO 模式、并行工具调用、缓存 |
| **多 Agent 死循环** | 最大轮次限制、收敛检测、人工介入 |
| **Token 成本高** | 选便宜模型做简单任务、Prompt 压缩、缓存 |
| **响应延迟大** | 流式输出、预加载上下文、工具调用超时 |

### 9.3 进阶方向

1. **MCP 协议生态** — 构建标准化的 Agent-工具 交互
2. **Agentic RAG** — Agent 主导的搜索策略（不是简单的 query→search）
3. **Code Agent** — 能读写文件、执行代码、操作 IDE 的 Agent
4. **Multi-modal Agent** — 图文混合理解与生成
5. **Agent 评测体系** — 如何量化 Agent 表现（AgentBench、SWE-bench）
6. **生产级运维** — 灰度发布、AB 测试、fallback 策略、成本控制

---

## 十、常用 API 速查

### 10.1 LangChain4j 常见配置

```java
// 模型配置
OpenAiChatModel model = OpenAiChatModel.builder()
    .apiKey(System.getenv("OPENAI_API_KEY"))
    .modelName("gpt-4o")                    // 模型名
    .temperature(0.7)                        // 创造性 (0-2)
    .maxTokens(4096)                         // 最大输出 token
    .timeout(Duration.ofSeconds(60))         // 超时
    .maxRetries(3)                           // 重试
    .logRequests(true)                       // 打印请求日志
    .logResponses(true)
    .build();

// Agent 配置
AiServices<MyAgent> agent = AiServices.builder(MyAgent.class)
    .chatLanguageModel(model)
    .tools(new MyTools())
    .chatMemory(memory)
    .contentRetriever(retriever)  // RAG
    .moderationModel(moderation)  // 内容审查
    .build();
```

### 10.2 Spring AI 常见配置

```yaml
# application.yml
spring:
  ai:
    openai:
      api-key: ${OPENAI_API_KEY}
      chat:
        options:
          model: gpt-4o
          temperature: 0.7
          max-tokens: 4096
    mcp:
      server:
        name: my-agent-service
        version: 1.0.0
      client:
        connections:
          weather:
            url: http://weather-agent:8080
```

### 10.3 国产模型适配

```java
// 通义千问 (DashScope)
DashscopeChatModel qwenModel = DashscopeChatModel.builder()
    .apiKey(System.getenv("DASHSCOPE_API_KEY"))
    .modelName("qwen-plus")
    .build();

// DeepSeek（兼容 OpenAI 格式）
OpenAiChatModel deepseek = OpenAiChatModel.builder()
    .baseUrl("https://api.deepseek.com")
    .apiKey(System.getenv("DEEPSEEK_API_KEY"))
    .modelName("deepseek-chat")
    .build();

// Ollama 本地模型
OllamaChatModel localModel = OllamaChatModel.builder()
    .baseUrl("http://localhost:11434")
    .modelName("qwen2.5:7b")
    .build();
```

---

## 十一、扩展资源

### 论文必读
- **ReAct** (2022): "ReAct: Synergizing Reasoning and Acting in Language Models"
- **Toolformer** (2023): "Toolformer: Language Models Can Teach Themselves to Use Tools"
- **ReWOO** (2023): "ReWOO: Decoupling Reasoning from Observations"
- **Reflexion** (2023): "Reflexion: Language Agents with Verbal Reinforcement Learning"

### 框架文档
- [LangChain4j 官方文档](https://docs.langchain4j.dev)
- [Spring AI Reference](https://docs.spring.io/spring-ai/reference/)
- [Anthropic Agent 最佳实践](https://docs.anthropic.com/en/docs/build-with-claude/tool-use)
- [OpenAI Function Calling 指南](https://platform.openai.com/docs/guides/function-calling)

### 开源项目参考
- `langchain4j-examples` — LangChain4j 官方示例
- `spring-ai-examples` — Spring AI 示例
- `OpenManus` / `OWL` — Python Agent 参考架构（可借鉴设计）

---

## 十二、核心 MindMap

```
AI Agent 开发 (Java)
│
├── 核心概念
│   ├── LLM = 大脑, Tools = 手脚
│   ├── Memory = 记忆, Planning = 规划
│   └── ReAct = 思考→行动→观察 循环
│
├── 框架选择
│   ├── LangChain4j ── 功能全，社区活跃 ★首推
│   ├── Spring AI ─── Spring 全家桶，MCP 原生支持
│   └── 原生 SDK ─── 极致控制，自己造轮子
│
├── 核心能力
│   ├── Tool Calling ── @Tool 注解 + 描述工程
│   ├── RAG ───────── 文档切分→向量化→检索→增强
│   ├── Memory ────── 短期窗口 / 长期向量 / 摘要压缩
│   └── Guardrails ── 输入 → 工具调用 → 输出 三层护栏
│
├── 进阶
│   ├── 多 Agent 协作 ── 顺序/辩论/层级/角色扮演
│   ├── MCP 协议 ───── 标准化的 Agent-工具交互
│   ├── Agent 评测 ─── 量化表现、回归测试
│   └── 生产运维 ──── 灰度、限流、可观测性
│
└── 学习路径
    ├── Week 1-2: LLM 基础 + Tool Calling
    ├── Week 3-4: Memory + RAG + Agent 架构
    ├── Week 5-6: 多 Agent + 生产化 + 实战项目
    └── 持续: 跟论文、看源码、写项目
```

---

> **最后的话：** Agent 开发的本质是 **"给 LLM 穿上外骨骼"**。不需要成为 AI 科学家，但需要懂：什么时候让 Agent 自主决策、什么时候硬编码逻辑、怎么设计好的工具。**Java 生态完全成熟**，LangChain4j + Spring Boot 可以覆盖 90% 的生产需求。从一个小 Demo 开始，先让 Agent 成功调用你的第一个工具，然后慢慢加记忆、RAG、多 Agent。踩坑是必经之路。
