---
title: "Python 程序设计 & 数据可视化"
tags:
  - python
  - 数据可视化
  - matplotlib
  - numpy
  - pandas
  - agent-基础
created: 2026-06-14
category: 编程
---

# Python 程序设计 & 数据可视化

> Python = Agent 开发的母语。LangChain、AutoGen、CrewAI、LlamaIndex 全是 Python。这份笔记覆盖到 Agent 开发所需的 Python 核心能力。

---

## 一、Python 基础速览

### 1.1 变量与类型

```python
# Python 是动态类型，变量无需声明类型
name = "Alice"           # str
age = 25                 # int
height = 1.68            # float
is_student = True        # bool
hobbies = ["读书", "编程"]  # list
profile = {"name": "Alice", "age": 25}  # dict

# 类型检查
print(type(name))    # <class 'str'>
print(type(age))     # <class 'int'>
print(isinstance(age, int))  # True
```

**基本数据类型：**

| 类型 | 示例 | 可变 | 有序 | 去重 |
|------|------|------|------|------|
| `int` | `42` | — | — | — |
| `float` | `3.14` | — | — | — |
| `str` | `"hello"` | ✗ | ✓ | — |
| `bool` | `True/False` | — | — | — |
| `list` | `[1,2,3]` | ✓ | ✓ | ✗ |
| `tuple` | `(1,2,3)` | ✗ | ✓ | ✗ |
| `set` | `{1,2,3}` | ✓ | ✗ | ✓ |
| `dict` | `{"a":1}` | ✓ | ✗(key) | ✗ |
| `NoneType` | `None` | — | — | — |

### 1.2 字符串与格式化

```python
# f-string (Python 3.6+, 最推荐)
name, age = "Bob", 30
s = f"我叫{name}，今年{age}岁，明年{age + 1}岁"

# 多行字符串
sql = """
SELECT name, age
FROM users
WHERE age > {min_age}
""".format(min_age=18)

# 常用方法
"hello world".upper()       # 'HELLO WORLD'
"hello world".split()       # ['hello', 'world']
",".join(["a", "b", "c"])   # 'a,b,c'
"  trim  ".strip()          # 'trim'
"abc".replace("a", "x")     # 'xbc'
"hello" in "hello world"    # True
```

### 1.3 列表与推导式

```python
# 创建
nums = [1, 2, 3, 4, 5]
zeros = [0] * 10              # [0,0,0,0,0,0,0,0,0,0]

# 切片 [start:end:step]
nums[0:3]     # [1, 2, 3]   前3个
nums[-2:]     # [4, 5]      最后2个
nums[::-1]    # [5,4,3,2,1] 反转

# 列表推导式 ★ Agent 中大量使用
squares = [x**2 for x in range(10) if x % 2 == 0]
# [0, 4, 16, 36, 64]

# 字典推导式
word_lengths = {w: len(w) for w in ["go", "python", "rust"]}
# {'go': 2, 'python': 6, 'rust': 4}

# 常用操作
nums.append(6)        # 尾部追加
nums.insert(0, 0)     # 指定位置插入
nums.pop()            # 尾部弹出
nums.remove(3)        # 按值删除
nums.sort(reverse=True)
sorted(nums, key=lambda x: -x)  # 返回新列表
```

### 1.4 字典 — Agent 数据交换核心

```python
# 创建
user = {"name": "Alice", "age": 25, "roles": ["admin", "editor"]}

# 安全访问
name = user.get("name", "未知")       # 'Alice'
phone = user.get("phone", "N/A")      # 'N/A' (不会 KeyError)

# 解包
for key, value in user.items():
    print(f"{key} = {value}")

# 合并 (Python 3.9+)
defaults = {"theme": "dark", "lang": "zh"}
config = defaults | {"theme": "light"}  # {'theme':'light','lang':'zh'}

# 嵌套展开 — 工具调用结果经常是嵌套 dict
response = {
    "status": "ok",
    "data": {"user": {"name": "Tom", "email": "tom@test.com"}}
}
email = response.get("data", {}).get("user", {}).get("email")
```

> [!tip] dict 是 Agent 数据交换的通用语言 — JSON 解码后就是 dict，工具返回值就是 dict，API 响应就是 dict。

### 1.5 条件与循环

```python
# if-elif-else
score = 85
if score >= 90:
    grade = 'A'
elif score >= 80:
    grade = 'B'
else:
    grade = 'C'

# 三元表达式
status = "成年" if age >= 18 else "未成年"

# for 循环
for i, item in enumerate(items, start=1):
    print(f"{i}. {item}")

# zip 并行遍历 — Agent 合并多个数据源
names = ["Alice", "Bob", "Carol"]
scores = [85, 92, 78]
for name, score in zip(names, scores):
    print(f"{name}: {score}")

# while + else (else 在没有 break 时执行)
n = 0
while n < 3:
    print(n)
    n += 1
else:
    print("循环正常结束")
```

### 1.6 函数 — Agent 工具定义的基础

```python
from typing import Optional, Union

# 基本函数
def greet(name: str, greeting: str = "你好") -> str:
    """向用户打招呼"""
    return f"{greeting}，{name}！"

# 可变参数 *args / **kwargs
def log(message: str, **metadata):
    """带元数据的日志 (Agent 日志常用)"""
    entry = {"message": message, **metadata}
    print(entry)

log("工具调用", tool="search", duration=0.5, status="ok")
# {'message': '工具调用', 'tool': 'search', 'duration': 0.5, 'status': 'ok'}

# Lambda — 短小的一次性函数
users = [{"name": "A", "age": 30}, {"name": "B", "age": 20}]
users.sort(key=lambda u: u["age"])  # 按年龄排序
```

**类型提示（Type Hints）— Agent 工具定义的标配：**

```python
from typing import Optional, List, Dict, Any, Union, Literal

# Agent 工具函数的典型签名
def search_products(
    query: str,
    category: Optional[str] = None,
    max_price: Optional[float] = None,
    sort_by: Literal["price", "rating", "sales"] = "rating",
    limit: int = 10
) -> List[Dict[str, Any]]:
    """
    搜索商品。
    
    Args:
        query: 搜索关键词
        category: 商品分类（可选）
        max_price: 最高价格限制（可选）
        sort_by: 排序方式
        limit: 返回数量上限
    
    Returns:
        商品列表，每个商品包含 id, name, price, rating
    """
    # ... 实现
    pass
```

> [!important] 类型提示对 Agent 至关重要 — LangChain/Spring AI 的 `@Tool` 自动从函数签名和 docstring 生成工具描述，LLM 据此决定何时调用。

---

## 二、面向对象（OOP）

### 2.1 类与对象

```python
class Agent:
    """AI Agent 基类 (理解 OOP 后看 Agent 框架源码更轻松)"""
    
    # 类变量 — 所有实例共享
    model_provider = "openai"
    _instance_count = 0
    
    def __init__(self, name: str, model: str = "gpt-4o"):
        """构造器 — 创建实例时调用"""
        self.name = name              # 实例变量
        self.model = model
        self.memory = []              # 对话历史
        Agent._instance_count += 1
    
    def think(self, prompt: str) -> str:
        """实例方法 — 有 self"""
        result = f"[{self.name}] 思考: {prompt}"
        self.memory.append(result)
        return result
    
    @classmethod
    def get_count(cls) -> int:
        """类方法 — 访问类变量"""
        return cls._instance_count
    
    @staticmethod
    def token_count(text: str) -> int:
        """静态方法 — 无关实例/类的工具函数"""
        return len(text) // 2  # 粗略估算
    
    def __str__(self) -> str:
        """字符串表示"""
        return f"Agent(name={self.name}, model={self.model})"
    
    def __repr__(self) -> str:
        return self.__str__()

# 使用
agent = Agent("客服助手")
agent.think("用户想退款")
print(agent)
print(Agent.get_count())  # 1
```

### 2.2 继承与多态

```python
from abc import ABC, abstractmethod

# 抽象基类 — 定义接口契约
class BaseTool(ABC):
    """工具基类 — 所有 Agent 工具继承这个"""
    
    @abstractmethod
    def name(self) -> str:
        """工具名称"""
        pass
    
    @abstractmethod
    def description(self) -> str:
        """工具描述 — LLM 据此决定是否调用"""
        pass
    
    @abstractmethod
    def execute(self, **kwargs) -> dict:
        """执行工具"""
        pass
    
    def __call__(self, **kwargs):
        """让工具实例可被直接调用"""
        print(f"🔧 调用工具: {self.name()}")
        result = self.execute(**kwargs)
        print(f"✅ 结果: {result}")
        return result


class WeatherTool(BaseTool):
    """天气查询工具"""
    
    def name(self) -> str:
        return "get_weather"
    
    def description(self) -> str:
        return "查询指定城市的实时天气，返回温度和天气状况"
    
    def execute(self, **kwargs) -> dict:
        city = kwargs.get("city", "未知")
        # 实际应调 API
        return {"city": city, "temp": 25, "weather": "晴"}


class CalculatorTool(BaseTool):
    """计算器工具"""
    
    def name(self) -> str:
        return "calculator"
    
    def description(self) -> str:
        return "执行数学计算，支持加减乘除"
    
    def execute(self, **kwargs) -> dict:
        expr = kwargs.get("expression", "")
        try:
            result = eval(expr)  # 仅演示，生产环境禁 eval
            return {"expression": expr, "result": result}
        except Exception as e:
            return {"error": str(e)}


# 多态：统一接口调用不同工具
tools: list[BaseTool] = [WeatherTool(), CalculatorTool()]

for tool in tools:
    print(f"工具: {tool.name()} — {tool.description()}")

# 调用
weather_result = tools[0](city="北京")
```

> [!tip] Agent 框架中每个工具都是一个类或函数，LLM 通过工具名称+描述决定调用哪个。理解这个继承体系 = 理解 Agent 工具系统。

### 2.3 魔术方法

```python
class Vector:
    def __init__(self, x, y):
        self.x, self.y = x, y
    
    def __add__(self, other):      # v1 + v2
        return Vector(self.x + other.x, self.y + other.y)
    
    def __eq__(self, other):       # v1 == v2
        return self.x == other.x and self.y == other.y
    
    def __len__(self):             # len(v)
        return 2
    
    def __getitem__(self, i):      # v[0], v[1]
        return self.x if i == 0 else self.y
    
    def __iter__(self):            # for val in v
        yield self.x
        yield self.y
    
    def __str__(self):
        return f"Vector({self.x}, {self.y})"

v1, v2 = Vector(1, 2), Vector(3, 4)
v3 = v1 + v2           # Vector(4, 6)
x, y = v3              # 解包: 4, 6
```

---

## 三、异常处理 — Agent 容错必备

```python
import traceback

def call_api(endpoint: str, params: dict) -> dict:
    """模拟 API 调用"""
    raise ConnectionError("网络超时")

# 基础
try:
    result = call_api("/weather", {"city": "北京"})
except ConnectionError as e:
    print(f"网络错误: {e}")
except Exception as e:
    print(f"未知错误: {e}")
else:
    print("成功:", result)     # 无异常时执行
finally:
    print("清理资源")          # 必定执行

# 完整 Agent 工具容错模式 ★
def safe_tool_call(tool_name: str, **kwargs):
    """Agent 工具调用容错包装"""
    try:
        # 1. 执行工具
        result = execute_tool(tool_name, **kwargs)
        return {"status": "ok", "data": result}
    
    except TimeoutError:
        return {"status": "error", "message": f"工具 {tool_name} 超时，请稍后重试"}
    
    except ConnectionError:
        return {"status": "error", "message": f"工具 {tool_name} 网络异常，请检查连接"}
    
    except ValueError as e:
        return {"status": "error", "message": f"参数错误: {e}"}
    
    except Exception as e:
        # 生产环境记录完整 traceback
        traceback.print_exc()
        return {"status": "error", "message": f"工具 {tool_name} 异常: {str(e)}"}
```

> [!important] Agent 工具必须做好异常处理！未捕获的异常直接抛给 LLM 会中断 Agent 循环。永远返回结构化错误信息。

---

## 四、文件 I/O 与数据持久化

### 4.1 文本文件

```python
# 读文件
with open("data.txt", "r", encoding="utf-8") as f:
    content = f.read()           # 全读
    # lines = f.readlines()      # 逐行读

# 逐行读（大文件）
with open("large.log", "r") as f:
    for line in f:
        process(line)

# 写文件
with open("output.txt", "w", encoding="utf-8") as f:
    f.write("Hello\n")
    f.writelines(["line1\n", "line2\n"])

# 追加
with open("log.txt", "a") as f:
    f.write(f"{timestamp}: {event}\n")
```

### 4.2 JSON — Agent 数据交换标准

```python
import json

# Python → JSON 字符串
data = {
    "name": "Alice",
    "age": 25,
    "skills": ["Python", "Java"],
    "metadata": None
}
json_str = json.dumps(data, ensure_ascii=False, indent=2)
# {
#   "name": "Alice",
#   "age": 25,
#   "skills": ["Python", "Java"],
#   "metadata": null
# }

# JSON 字符串 → Python
parsed = json.loads(json_str)
print(parsed["name"])   # Alice

# 文件读写
with open("config.json", "w") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

with open("config.json", "r") as f:
    config = json.load(f)
```

> [!tip] Agent 工具调用流程中的 JSON：
> 1. LLM 输出 JSON 描述要调用的工具 → `json.loads()` 解析
> 2. 你的代码执行工具 → 返回 dict
> 3. 工具结果序列化为 JSON → 注入回对话上下文

### 4.3 CSV 读写

```python
import csv

# 读 CSV
with open("data.csv", "r") as f:
    reader = csv.DictReader(f)
    for row in reader:
        print(row["name"], row["age"])

# 写 CSV
with open("output.csv", "w", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=["name", "age", "score"])
    writer.writeheader()
    writer.writerow({"name": "Alice", "age": 25, "score": 90})
    writer.writerows([
        {"name": "Bob", "age": 30, "score": 85},
        {"name": "Carol", "age": 28, "score": 92},
    ])
```

---

## 五、模块与包管理

### 5.1 导入机制

```python
# 标准导入
import os
import json
from datetime import datetime, timedelta
from typing import Optional, List, Dict

# 别名 — Agent 代码中很常见
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

# 自定义模块导入
from tools.weather import WeatherTool
from agents.base import BaseAgent
```

### 5.2 虚拟环境 (必学)

```bash
# 创建虚拟环境
python -m venv .venv            # Windows
python3 -m venv .venv           # macOS/Linux

# 激活
.venv\Scripts\activate          # Windows
source .venv/bin/activate       # macOS/Linux

# 安装依赖
pip install numpy pandas matplotlib seaborn plotly
pip install -r requirements.txt

# 冻结依赖
pip freeze > requirements.txt
```

### 5.3 Agent 项目常用依赖

```txt
# requirements.txt — Agent 项目典型依赖
numpy>=1.24
pandas>=2.0
matplotlib>=3.7
seaborn>=0.12
plotly>=5.14

# Agent 框架 (后续学习)
langchain>=0.3
langchain-openai
langchain-community

# 向量数据库
chromadb
faiss-cpu

# 工具库
requests
httpx
pydantic>=2.0
python-dotenv
```

---

## 六、NumPy — 数值计算基石

> Agent 不直接算矩阵，但理解 NumPy 才能理解向量数据库、Embedding、相似度计算。

### 6.1 创建数组

```python
import numpy as np

# 从列表创建
a = np.array([1, 2, 3, 4, 5])
b = np.array([[1, 2, 3], [4, 5, 6]])   # 2×3 矩阵

# 快速创建
np.zeros((3, 4))           # 全 0
np.ones((2, 3))            # 全 1
np.eye(3)                  # 单位矩阵
np.arange(0, 10, 2)        # [0, 2, 4, 6, 8]
np.linspace(0, 1, 5)       # [0, 0.25, 0.5, 0.75, 1.0]
np.random.randn(3, 4)      # 标准正态分布随机数
```

### 6.2 属性与基本操作

```python
arr = np.array([[1, 2, 3], [4, 5, 6]])

arr.shape     # (2, 3) 形状
arr.ndim      # 2      维度数
arr.dtype     # int64  数据类型
arr.size      # 6      元素总数

# 运算 — 向量化，无循环
arr + 10      # 每个元素 +10
arr * 2       # 每个元素 ×2
np.sqrt(arr)  # 逐元素开方
arr @ arr.T   # 矩阵乘法 (Python 3.5+)
np.dot(arr, arr.T)

# 聚合
arr.sum()       # 总和
arr.mean()      # 均值
arr.std()       # 标准差
arr.min()       # 最小值
arr.argmax()    # 最大值索引
arr.sum(axis=0) # 按列求和 → [5, 7, 9]
arr.sum(axis=1) # 按行求和 → [6, 15]
```

### 6.3 索引与切片

```python
arr = np.array([[1, 2, 3, 4],
                [5, 6, 7, 8],
                [9, 10, 11, 12]])

arr[0, 0]         # 1       单个元素
arr[0, :]         # [1,2,3,4]  第0行
arr[:, 1]         # [2,6,10]   第1列
arr[:2, 1:3]      # [[2,3],[6,7]]

# 布尔索引 ★
arr[arr > 5]      # [6,7,8,9,10,11,12]
arr[(arr > 5) & (arr < 10)]  # [6,7,8,9]

# 花式索引
arr[[0, 2]]       # 取第 0 行和第 2 行
```

### 6.4 与 Agent 相关的应用

```python
# === 向量相似度计算 ===
# Agent 的 RAG 检索核心：计算 query embedding 与文档库中各向量的相似度

# 余弦相似度
def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    """计算两个向量的余弦相似度"""
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

# 批量计算（模拟向量检索）
query_vec = np.random.randn(768)       # 查询向量 (768 维)
doc_vecs = np.random.randn(1000, 768)  # 1000 个文档向量

# 一次矩阵乘法算出所有相似度
similarities = query_vec @ doc_vecs.T  # (768,) @ (768, 1000) → (1000,)
top_5_idx = np.argsort(similarities)[-5:][::-1]  # 相似度最高的 5 个

# === Softmax ===
# Agent 中用于将 logits 转为概率分布
def softmax(x: np.ndarray) -> np.ndarray:
    e_x = np.exp(x - np.max(x))  # 减最大值防溢出
    return e_x / e_x.sum()
```

---

## 七、Pandas — 数据处理利器

> Agent 处理表格数据、分析工具返回结果的核心库。

### 7.1 数据结构

```python
import pandas as pd

# Series — 一维带标签数组
s = pd.Series([85, 92, 78, 90], index=["Alice", "Bob", "Carol", "David"])

# DataFrame — 二维表格 ★
df = pd.DataFrame({
    "姓名": ["Alice", "Bob", "Carol", "David"],
    "年龄": [25, 30, 28, 35],
    "分数": [85, 92, 78, 90],
    "城市": ["北京", "上海", "广州", "深圳"]
})
```

### 7.2 数据读写

```python
# CSV
df = pd.read_csv("data.csv", encoding="utf-8")
df.to_csv("output.csv", index=False)

# Excel
df = pd.read_excel("data.xlsx", sheet_name="Sheet1")
df.to_excel("output.xlsx", index=False)

# JSON
df = pd.read_json("data.json")
df.to_json("output.json", orient="records", force_ascii=False)

# SQL (Agent 常用)
from sqlalchemy import create_engine
engine = create_engine("sqlite:///mydb.db")
df = pd.read_sql("SELECT * FROM orders WHERE date > '2024-01-01'", engine)
df.to_sql("results", engine, if_exists="replace")
```

### 7.3 数据探查

```python
df.head(5)          # 前5行
df.tail(3)          # 后3行
df.info()           # 列类型、非空计数
df.describe()       # 数值列统计 (count/mean/std/min/max)
df.shape            # (行数, 列数)
df.columns          # 列名列表
df.dtypes           # 每列数据类型
df.isnull().sum()   # 每列缺失值计数
df.nunique()        # 每列唯一值数量
```

### 7.4 数据选择与过滤

```python
# 选择列
df["姓名"]
df[["姓名", "分数"]]

# 按条件过滤 ★ Agent 数据分析最常用
high_scorers = df[df["分数"] > 85]
beijing_users = df[df["城市"] == "北京"]
complex_filter = df[(df["分数"] > 80) & (df["年龄"] < 30)]

# loc — 按标签索引
df.loc[0, "姓名"]           # 第0行，"姓名"列
df.loc[0:2, ["姓名", "分数"]]

# iloc — 按位置索引
df.iloc[0, 0]              # 第0行，第0列
df.iloc[:3, [0, 2]]        # 前3行，第0和2列

# query — 字符串条件
df.query("分数 > 85 and 城市 == '北京'")
```

### 7.5 数据清洗

```python
# 缺失值处理
df.dropna()                    # 删除含缺失值的行
df.dropna(subset=["分数"])     # 只检查指定列
df.fillna(0)                   # 用 0 填充
df.fillna({"年龄": 0, "城市": "未知"})  # 分列填充

# 重复值
df.drop_duplicates()                          # 删除完全重复
df.drop_duplicates(subset=["姓名"], keep="first")  # 按姓名去重

# 类型转换
df["年龄"] = df["年龄"].astype(int)
df["日期"] = pd.to_datetime(df["日期"])

# 重命名
df.rename(columns={"姓名": "name", "分数": "score"})

# 排序
df.sort_values("分数", ascending=False)
df.sort_values(["城市", "分数"], ascending=[True, False])
```

### 7.6 分组聚合 — Agent 数据总结核心

```python
# 按城市分组，统计
df.groupby("城市").agg({
    "姓名": "count",          # 人数
    "年龄": "mean",           # 平均年龄
    "分数": ["min", "max", "mean"]  # 分数统计
})

# 结果:
#     姓名        年龄         分数
#     count  mean  min  max  mean
# 城市
# 上海    1  30.0   92   92  92.0
# 北京    1  25.0   85   85  85.0
# 广州    1  28.0   78   78  78.0
# 深圳    1  35.0   90   90  90.0

# pivot_table — 透视表
pd.pivot_table(df, values="分数", index="城市", aggfunc="mean")

# 常用聚合函数:
# sum, mean, median, std, var, min, max
# count, nunique (唯一值计数)
# first, last
```

### 7.7 合并与连接

```python
# merge — 类似 SQL JOIN ★
orders = pd.DataFrame({"order_id": [1, 2, 3], "user_id": [101, 102, 101]})
users = pd.DataFrame({"user_id": [101, 102], "name": ["Alice", "Bob"]})

merged = orders.merge(users, on="user_id", how="left")

# concat — 纵向堆叠
df1 = pd.DataFrame({"A": [1, 2]})
df2 = pd.DataFrame({"A": [3, 4]})
combined = pd.concat([df1, df2], ignore_index=True)

# join — 按索引合并
```

---

## 八、Matplotlib — 数据可视化核心

> Agent 生成数据分析报告时需要图表佐证结论。

### 8.1 基础绘图

```python
import matplotlib.pyplot as plt
import numpy as np

# 基础折线图
x = np.linspace(0, 10, 100)
y = np.sin(x)

plt.figure(figsize=(10, 5))
plt.plot(x, y, label="sin(x)", color="blue", linewidth=2)
plt.plot(x, np.cos(x), label="cos(x)", color="red", linestyle="--")
plt.xlabel("x")
plt.ylabel("y")
plt.title("sin(x) 和 cos(x)")
plt.legend()
plt.grid(True, alpha=0.3)
plt.show()
```

### 8.2 常用图表类型

```python
# 柱状图 — 类别对比
categories = ["A", "B", "C", "D"]
values = [23, 45, 56, 78]

plt.bar(categories, values, color=["#3498db", "#2ecc71", "#e74c3c", "#f39c12"])
plt.title("各类别数据对比")
plt.ylabel("数值")
plt.show()

# 水平柱状图 — 长标签场景
plt.barh(categories, values)

# 散点图 — 相关性分析 ★
np.random.seed(42)
x = np.random.randn(100)
y = 2 * x + np.random.randn(100) * 0.5

plt.scatter(x, y, alpha=0.6, c=x, cmap="coolwarm", edgecolors="white")
plt.colorbar(label="x 值")
plt.xlabel("X")
plt.ylabel("Y")
plt.title("散点图: Y ≈ 2X + noise")

# 饼图 — 占比
sizes = [35, 25, 20, 15, 5]
labels = ["Python", "Java", "JS", "Go", "其他"]
explode = (0.1, 0, 0, 0, 0)  # 突出第一块

plt.pie(sizes, labels=labels, explode=explode, autopct="%1.1f%%",
        startangle=90, shadow=True)
plt.axis("equal")
plt.title("编程语言使用占比")
```

### 8.3 子图布局

```python
fig, axes = plt.subplots(2, 2, figsize=(12, 10))
# axes 是 2×2 的数组

# 右上: 折线图
axes[0, 0].plot(x, y)
axes[0, 0].set_title("折线图")

# 右上: 散点图
axes[0, 1].scatter(x, y, alpha=0.5)
axes[0, 1].set_title("散点图")

# 左下: 直方图
axes[1, 0].hist(y, bins=20, edgecolor="white")
axes[1, 0].set_title("直方图")

# 右下: 箱线图
axes[1, 1].boxplot([y, y * 1.5])
axes[1, 1].set_title("箱线图")

plt.tight_layout()
plt.show()
```

### 8.4 中文字体配置

```python
# Windows
plt.rcParams["font.sans-serif"] = ["Microsoft YaHei", "SimHei"]
# macOS
# plt.rcParams["font.sans-serif"] = ["PingFang SC", "Heiti SC"]
# Linux
# plt.rcParams["font.sans-serif"] = ["WenQuanYi Micro Hei", "Noto Sans CJK SC"]

plt.rcParams["axes.unicode_minus"] = False  # 解决负号显示问题
```

### 8.5 保存图表

```python
plt.savefig("chart.png", dpi=150, bbox_inches="tight", transparent=False)
plt.savefig("chart.pdf", format="pdf")  # 矢量图
```

---

## 九、Seaborn — 统计可视化

> Matplotlib 的高级封装，专注统计图表。Agent 做数据分析报告首选。

### 9.1 基础设置

```python
import seaborn as sns
import matplotlib.pyplot as plt

sns.set_theme(style="darkgrid")  # 或 whitegrid, dark, white, ticks
sns.set_palette("husl")

# 加载示例数据集
tips = sns.load_dataset("tips")
iris = sns.load_dataset("iris")
```

### 9.2 分布可视化

```python
# 直方图 + KDE 密度曲线
sns.histplot(tips["total_bill"], bins=30, kde=True)
plt.title("账单金额分布")

# 核密度估计
sns.kdeplot(data=tips, x="total_bill", hue="time", fill=True, alpha=0.3)

# 箱线图 — 看离散值和分布
sns.boxplot(data=tips, x="day", y="total_bill", hue="smoker")

# 小提琴图 — 箱线图 + 密度
sns.violinplot(data=tips, x="day", y="total_bill")
```

### 9.3 关系可视化

```python
# 散点图 + 回归线 ★
sns.lmplot(data=tips, x="total_bill", y="tip", hue="smoker", height=5)

# 相关性热力图 ★ Agent 数据分析核心图表
corr = df.corr(numeric_only=True)
sns.heatmap(corr, annot=True, cmap="coolwarm", center=0,
            square=True, linewidths=1)
plt.title("特征相关性矩阵")
```

### 9.4 分类可视化

```python
# 柱状图 — 带误差线
sns.barplot(data=tips, x="day", y="total_bill", hue="sex",
            estimator="mean", errorbar="sd")

# 计数图
sns.countplot(data=tips, x="day", hue="time")

# 点图 — 连线对比趋势
sns.pointplot(data=tips, x="day", y="total_bill", hue="sex")
```

---

## 十、Plotly — 交互式可视化

> 能缩放、悬停看值的图表。Agent 做交互式报告首选。

### 10.1 Plotly Express (快速绘图)

```python
import plotly.express as px
import plotly.graph_objects as go

df = px.data.gapminder().query("year == 2007")

# 散点图 — 支持悬停、缩放
fig = px.scatter(
    df,
    x="gdpPercap",          # X 轴
    y="lifeExp",            # Y 轴
    size="pop",             # 气泡大小
    color="continent",      # 颜色分组
    hover_name="country",   # 悬停显示
    log_x=True,             # X 轴对数
    size_max=60,
    title="2007 年各国 GDP vs 预期寿命"
)
fig.show()

# 折线图
fig = px.line(df, x="date", y="value", color="category")

# 柱状图
fig = px.bar(df, x="category", y="count", color="group", barmode="group")

# 热力图
fig = px.imshow(corr_matrix, text_auto=True, aspect="auto")

# 饼图
fig = px.pie(df, values="count", names="category", title="占比")

# 保存为 HTML（独立交互文件）
fig.write_html("chart.html")
```

### 10.2 组合图表示例

```python
from plotly.subplots import make_subplots

# 双 Y 轴
fig = make_subplots(specs=[[{"secondary_y": True}]])

fig.add_trace(
    go.Bar(x=months, y=sales, name="销售额"),
    secondary_y=False,
)
fig.add_trace(
    go.Scatter(x=months, y=growth_rate, name="增长率", mode="lines+markers"),
    secondary_y=True,
)
fig.update_layout(title="月度销售额与增长率")
fig.show()
```

---

## 十一、HTTP 请求 — Agent 访问外部 API

> Agent 调用天气预报、搜索引擎、数据库等外部服务都需要发 HTTP 请求。

### 11.1 requests 库

```python
import requests

# GET 请求
resp = requests.get(
    "https://api.example.com/weather",
    params={"city": "北京", "lang": "zh"},
    headers={"Authorization": "Bearer YOUR_TOKEN"},
    timeout=10  # 必须设超时！
)
print(resp.status_code)   # 200
data = resp.json()        # 解析 JSON 响应
print(data["temperature"])

# POST 请求
resp = requests.post(
    "https://api.example.com/orders",
    json={"product": "book", "quantity": 2},  # 自动设 Content-Type: application/json
    headers={"X-API-Key": "..."},
    timeout=30
)

# 异常处理 ★ Agent 必须安全处理网络请求
try:
    resp = requests.get(url, timeout=10)
    resp.raise_for_status()  # 4xx/5xx 抛异常
    return resp.json()
except requests.Timeout:
    return {"error": "请求超时"}
except requests.ConnectionError:
    return {"error": "网络连接失败"}
except requests.HTTPError as e:
    return {"error": f"HTTP 错误: {e.response.status_code}"}
except Exception as e:
    return {"error": str(e)}
```

### 11.2 异步请求 (httpx) — Agent 高性能必备

```python
import httpx
import asyncio

async def fetch_weather(city: str) -> dict:
    """异步获取天气 — Agent 可同时查多个城市"""
    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.get(
            f"https://api.example.com/weather",
            params={"city": city}
        )
        return resp.json()

async def fetch_all_weather(cities: list[str]) -> list[dict]:
    """并发查询多个城市天气"""
    tasks = [fetch_weather(city) for city in cities]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    return results

# 运行
# results = asyncio.run(fetch_all_weather(["北京", "上海", "广州"]))
```

---

## 十二、异步编程 — Agent 并发基础

> Agent 常需同时调多个工具/API，异步大幅减少等待时间。

```python
import asyncio
import time

# === 同步版本 ===
def fetch_sync(url: str) -> str:
    time.sleep(1)  # 模拟网络等待
    return f"Result from {url}"

def main_sync():
    start = time.time()
    results = [fetch_sync(f"url_{i}") for i in range(5)]
    print(f"同步耗时: {time.time() - start:.2f}s")  # ~5s

# === 异步版本 ===
async def fetch_async(url: str) -> str:
    await asyncio.sleep(1)  # 模拟异步等待
    return f"Result from {url}"

async def main_async():
    start = time.time()
    tasks = [fetch_async(f"url_{i}") for i in range(5)]
    results = await asyncio.gather(*tasks)
    print(f"异步耗时: {time.time() - start:.2f}s")  # ~1s

# asyncio.run(main_async())

# === async/await 核心规则 ===
# 1. async def 定义的函数返回 coroutine 对象
# 2. await 只能在 async 函数内使用
# 3. asyncio.gather() 并发执行多个 coroutine
# 4. asyncio.run() 是入口（Python 3.7+）
```

---

## 十三、Pydantic — 数据校验与配置管理

> Agent 工具参数校验的标配。LangChain、CrewAI 都基于 Pydantic。

```python
from pydantic import BaseModel, Field, validator
from typing import Optional, Literal
from datetime import datetime

# 定义工具参数模型
class WeatherQuery(BaseModel):
    """天气查询参数 — LLM 据此理解工具需要的参数"""
    city: str = Field(description="城市名称，如'北京'、'上海'")
    date: Optional[str] = Field(
        default=None,
        description="查询日期，格式 YYYY-MM-DD，默认今天"
    )
    units: Literal["celsius", "fahrenheit"] = Field(
        default="celsius",
        description="温度单位"
    )
    
    @validator("city")
    def city_not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError("城市名不能为空")
        return v.strip()

# 使用
try:
    query = WeatherQuery(city="北京")
    print(query.model_dump())  # {'city': '北京', 'date': None, 'units': 'celsius'}
    
    bad_query = WeatherQuery(city="")  # 抛 ValidationError
except Exception as e:
    print(f"参数校验失败: {e}")

# Agent 工具函数的 Pydantic 模式 ★
from pydantic import BaseModel

class ToolResult(BaseModel):
    """统一的工具返回格式"""
    status: Literal["ok", "error"] = "ok"
    data: Optional[dict] = None
    message: str = ""

def search_tool(query: WeatherQuery) -> ToolResult:
    try:
        # 执行查询...
        result = {"city": query.city, "temp": 25}
        return ToolResult(status="ok", data=result, message="查询成功")
    except Exception as e:
        return ToolResult(status="error", message=str(e))
```

---

## 十四、.env 与环境变量

> Agent 的 API Key 必须用环境变量，绝对不能硬编码！

```python
# 安装: pip install python-dotenv

# .env 文件 (不要提交到 Git!)
OPENAI_API_KEY=sk-xxxxxxxxxxxx
ANTHROPIC_API_KEY=sk-ant-xxxxxxxx
DATABASE_URL=postgresql://user:pass@localhost:5432/mydb

# Python 中加载
from dotenv import load_dotenv
import os

load_dotenv()  # 自动读 .env 文件

openai_key = os.getenv("OPENAI_API_KEY")
db_url = os.getenv("DATABASE_URL", "sqlite:///default.db")  # 带默认值

# .gitignore 中必须加:
# .env
# .venv/
# __pycache__/
```

---

## 十五、日志 — Agent 调试必备

```python
import logging

# 配置
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s - %(message)s",
    handlers=[
        logging.FileHandler("agent.log", encoding="utf-8"),
        logging.StreamHandler()  # 同时输出到控制台
    ]
)

logger = logging.getLogger(__name__)

# 使用
logger.debug("调试信息")
logger.info("Agent 启动成功")
logger.warning("工具调用超时，重试中...")
logger.error("API 返回 500 错误")
logger.critical("系统异常，Agent 终止")

# Agent 工具调用日志模式
def log_tool_call(tool_name: str, params: dict, result: dict, duration: float):
    logger.info(
        f"工具调用 | name={tool_name} | params={params} | "
        f"duration={duration:.3f}s | status={result.get('status')}"
    )
```

---

## 十六、综合应用 — 数据 EDA 报告

> 模拟 Agent 接到"分析这份数据"任务后的处理流程。

```python
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

# 1. 加载数据
df = pd.read_csv("sales_data.csv")

# 2. 数据概览
print(f"数据维度: {df.shape}")
print(f"\n缺失值:\n{df.isnull().sum()}")
print(f"\n数值列统计:\n{df.describe()}")

# 3. 数据清洗
df["日期"] = pd.to_datetime(df["日期"])
df = df.dropna(subset=["销售额"])  # 删除销售额为空的行
df["月份"] = df["日期"].dt.month

# 4. 分析
monthly_sales = df.groupby("月份")["销售额"].agg(["sum", "mean", "count"])
print(f"\n月度销售汇总:\n{monthly_sales}")

# 5. 可视化
fig, axes = plt.subplots(1, 3, figsize=(15, 4))

# 月度趋势
axes[0].plot(monthly_sales.index, monthly_sales["sum"], marker="o")
axes[0].set_title("月度销售总额趋势")
axes[0].set_xlabel("月份")
axes[0].set_ylabel("销售额")

# 类别占比
category_sales = df.groupby("类别")["销售额"].sum()
axes[1].pie(category_sales.values, labels=category_sales.index, autopct="%1.1f%%")
axes[1].set_title("各类别销售额占比")

# 地域分布
region_avg = df.groupby("地区")["销售额"].mean().sort_values()
axes[2].barh(region_avg.index, region_avg.values)
axes[2].set_title("各地区平均销售额")
axes[2].set_xlabel("平均销售额")

plt.tight_layout()
plt.savefig("sales_report.png", dpi=150, bbox_inches="tight")
plt.show()

# 6. 结论
print("""
=== 分析结论 ===
1. 销售高峰期: 第 {} 月
2. 最畅销类别: {}
3. 平均销售额最高地区: {}
""".format(
    monthly_sales["sum"].idxmax(),
    category_sales.idxmax(),
    region_avg.idxmax()
))
```

---

## 重点备忘

- **dict 和 JSON** 是 Agent 数据交换的标准格式，掌握所有操作
- **类型提示（Type Hints）** 和 **docstring** 是 Agent 工具定义的标配，LLM 据此理解工具
- **异常处理** 必须在每个工具函数中做，返回结构化错误而非抛出异常
- **推导式** 是 Python 最优雅的数据处理方式，Agent 代码中大量使用
- **Seaborn heatmap** 是 Agent 数据分析报告中最高频的图表
- **异步编程** 让 Agent 能同时调用多个工具，大幅减少总延迟
- **Pydantic** 是 Agent 参数校验的事实标准

## 与 Agent 开发的衔接

| Python 知识点 | Agent 开发中的用途 |
|--------------|-------------------|
| 函数 + 类型提示 + docstring | 定义 Agent 工具（@Tool） |
| dict / JSON | 工具参数解析、API 响应处理 |
| 异常处理 try/except | 工具容错，防止 Agent 循环中断 |
| 异步 async/await | 并发调用多个工具/API |
| Pydantic | 工具参数自动校验 |
| Pandas groupby + agg | Agent 数据分析/总结 |
| Matplotlib/Seaborn | Agent 生成分析报告图表 |
| requests/httpx | Agent 调用外部 API |

## 相关笔记

- [[Javase]] — Java SE 完整笔记
- [[数据结构]] — C/Java 数据结构与算法
- [[agent知识点]] — AI Agent 开发知识体系（后续学习入口）
- [[项目实战]] — 实战项目汇总
