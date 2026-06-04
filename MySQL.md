---
tags:
  - database
  - mysql
  - sql
created: 2026-06-04
---

# MySQL 知识点笔记

## 1. 架构概览

```
客户端 → 连接器 → 分析器 → 优化器 → 执行器 → 存储引擎
                                              ├── InnoDB (默认)
                                              ├── MyISAM
                                              └── Memory
```

| 组件 | 职责 |
|------|------|
| 连接器 | 建立连接、权限验证、维持长连接 |
| 分析器 | 词法分析 → 语法分析 → AST |
| 优化器 | 索引选择、JOIN 顺序、生成执行计划 |
| 执行器 | 调用引擎接口，逐行扫描/索引查找 |
| 存储引擎 | 数据存储与读取（插件式） |

### InnoDB vs MyISAM

| 特性 | InnoDB | MyISAM |
|------|--------|--------|
| 事务 | ✅ ACID | ❌ |
| 行锁 | ✅ | ❌ 表锁 |
| 外键 | ✅ | ❌ |
| MVCC | ✅ | ❌ |
| 崩溃恢复 | ✅ redo log | ❌ |
| 全文索引 | ✅ (5.6+) | ✅ |
| 场景 | OLTP | 只读/日志 |

---

## 2. SQL 分类

- **DDL**: `CREATE`, `ALTER`, `DROP`, `TRUNCATE`, `RENAME`
- **DML**: `SELECT`, `INSERT`, `UPDATE`, `DELETE`
- **DCL**: `GRANT`, `REVOKE`
- **TCL**: `COMMIT`, `ROLLBACK`, `SAVEPOINT`

---

## 3. 数据类型

### 数值

| 类型 | 大小 | 范围 |
|------|------|------|
| TINYINT | 1B | -128 ~ 127 |
| SMALLINT | 2B | ±3.2万 |
| MEDIUMINT | 3B | ±830万 |
| INT | 4B | ±21亿 |
| BIGINT | 8B | ±9.2×10¹⁸ |
| DECIMAL(M,D) | 变长 | 精确小数（金融） |

### 字符串

| 类型 | 说明 |
|------|------|
| CHAR(N) | 定长，最多255 |
| VARCHAR(N) | 变长，最多65535 |
| TEXT | 长文本，最多64KB |
| LONGTEXT | 极大文本，4GB |

### 时间

| 类型 | 格式 | 范围 |
|------|------|------|
| DATE | YYYY-MM-DD | 1000 ~ 9999 |
| DATETIME | YYYY-MM-DD HH:MM:SS | 1000 ~ 9999 |
| TIMESTAMP | 同 DATETIME | 1970 ~ 2038，时区敏感 |
| TIME | HH:MM:SS | |

### JSON (5.7+)

```sql
-- ========================
-- JSON 查询
-- ========================

-- JSON_EXTRACT 从 JSON 文档中提取路径对应的值，返回带引号的字符串
-- 例如 data = '{"name":"Alice"}'，结果为 "Alice"（含双引号）
SELECT JSON_EXTRACT(data, '$.name') FROM t;

-- -> 是 JSON_EXTRACT 的简写语法糖，功能完全等价
-- $ 表示 JSON 根对象，.name 表示取 name 字段的值
SELECT data->'$.name' FROM t;

-- ->> 与 -> 的区别：返回去引号的纯文本（即 JSON_UNQUOTE 效果）
-- -> 返回 "Alice"（JSON 字符串），->> 返回 Alice（纯文本）
SELECT data->>'$.name' FROM t;

-- 为 JSON 字段中的某个 key 建立索引：先用虚拟列提取值，再在虚拟列上建索引
-- GENERATED ALWAYS 可省略，VIRTUAL 表示不占物理存储，值在查询时计算
-- 注意：虚拟列上建普通索引即可，MySQL 自动维护
ALTER TABLE t ADD col VARCHAR(100) AS (data->>'$.name') VIRTUAL;

-- 在虚拟列上创建索引，加速 JSON 字段的查询
CREATE INDEX idx ON t(col);
```

### ENUM vs TINYINT

- ENUM 存储为整数但可读性好，不推荐超过10个值
- 修改 ENUM 值需 ALTER TABLE，代价大

---

## 4. 常用 SQL

### DDL

```sql
-- ========================
-- 数据库创建
-- ========================

-- utf8mb4 是真正的 UTF-8 编码，支持 emoji 等 4 字节字符（utf8 只支持 3 字节，是历史遗留）
-- utf8mb4_unicode_ci：case-insensitive 排序规则，ci=case insensitive，对大小写不敏感
CREATE DATABASE dbname CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ========================
-- 建表
-- ========================

CREATE TABLE users (
    -- BIGINT UNSIGNED：8 字节无符号整数（0 ~ 2⁶⁴-1），主键推荐用此类型而非 INT，预留增长空间
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    -- VARCHAR(50)：变长字符串，实际存储=数据长度+1~2 字节长度前缀，最大 50 个字符
    -- NOT NULL：列级约束，禁止 NULL，减少 NULL 判断带来的额外逻辑
    name VARCHAR(50) NOT NULL,

    email VARCHAR(100) NOT NULL,

    -- TINYINT UNSIGNED：1 字节无符号整数（0~255），适合年龄等小范围数值
    -- DEFAULT 0：插入时若未指定该列，自动填充 0
    age TINYINT UNSIGNED DEFAULT 0,

    -- DATETIME：8 字节，范围 1000~9999 年，不依赖时区，推荐代替 TIMESTAMP
    -- DEFAULT CURRENT_TIMESTAMP：插入时自动填入当前时间
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    -- ON UPDATE CURRENT_TIMESTAMP：行被更新时自动刷新为当前时间
    -- 适合记录"最后修改时间"，与 created_at 配对使用
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- UNIQUE KEY：唯一索引，插入重复值会报错（Duplicate entry），也可用 UNIQUE INDEX
    uk_email (email),

    -- INDEX：普通索引（非唯一），加速等值查询和排序
    -- 命名惯例：idx_表名缩写_列名 或 idx_列名
    INDEX idx_name (name),

    -- 联合索引：覆盖 (age, name) 两个列的查询
    -- 遵循最左前缀原则：WHERE age=xx 走索引，WHERE name=xx 不走
    INDEX idx_age_name (age, name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4; -- 显式指定引擎和字符集，避免依赖全局默认值

-- ========================
-- 表结构变更 (ALTER TABLE)
-- ========================

-- ADD COLUMN：新增列，默认追加到表末尾，可加 AFTER col_name 指定位置
ALTER TABLE users ADD COLUMN phone VARCHAR(20);

-- MODIFY COLUMN：修改列定义（类型、约束等），需重写整个列，大表慎用
ALTER TABLE users MODIFY COLUMN name VARCHAR(100);

-- DROP COLUMN：删除列，数据不可恢复，操作前确认
ALTER TABLE users DROP COLUMN phone;

-- 为现有列添加索引（不影响已有数据）
ALTER TABLE users ADD INDEX idx_phone (phone);

-- 删除索引（唯一或普通索引均可用此语法）
ALTER TABLE users DROP INDEX uk_email;

-- ========================
-- 删除操作
-- ========================

-- DROP TABLE IF EXISTS：安全删除，表不存在时只警告不报错
DROP TABLE IF EXISTS users;

-- TRUNCATE：清空表数据但保留表结构
-- 与 DELETE 的区别：
--   1) TRUNCATE 是 DDL，隐式提交，不可回滚；DELETE 是 DML，可回滚
--   2) TRUNCATE 重置 AUTO_INCREMENT 计数器；DELETE 不重置
--   3) TRUNCATE 速度快（直接删除数据文件再重建，不逐行记录 undo log）
TRUNCATE TABLE users;
```

### DML

```sql
-- ========================
-- 插入数据 (INSERT)
-- ========================

-- 单行插入：列出目标列名，值与列一一对应
-- 未指定的列自动使用 DEFAULT 值或 NULL（若列允许 NULL）
INSERT INTO users (name, email) VALUES ('Alice', 'a@x.com');

-- 批量插入：一个 INSERT 插入多行，减少网络往返和解析开销
-- 单条 INSERT 比多次单行 INSERT 效率高得多（减少事务提交次数和 SQL 解析）
INSERT INTO users (name, email) VALUES
    ('Bob', 'b@x.com'),
    ('Carol', 'c@x.com');

-- INSERT ... ON DUPLICATE KEY UPDATE：插入或更新（UPSERT 语义）
-- 若主键或唯一键冲突，执行 UPDATE 子句；否则执行 INSERT
-- VALUES(col) 函数取当前 INSERT 尝试写入的值（8.0.20+ 推荐用别名写法替代）
INSERT INTO users (id, name, email) VALUES (1, 'Alice', 'a2@x.com')
ON DUPLICATE KEY UPDATE name=VALUES(name), email=VALUES(email);

-- ========================
-- 更新数据 (UPDATE)
-- ========================

-- 条件更新：WHERE 限定要更新的行，忘写 WHERE 会更新全表！
UPDATE users SET age=25 WHERE id=1;

-- 表达式更新：在现有值基础上计算新值，不需要先 SELECT 再 UPDATE
-- LIMIT 10：只更新前 10 行，防止锁太多行导致锁等待超时
UPDATE users SET age=age+1 LIMIT 10;

-- ========================
-- 删除数据 (DELETE)
-- ========================

-- 条件删除：按主键删除单行，效率最高（走主键索引）
DELETE FROM users WHERE id=1;

-- 分批删除：大表清数据时用 LIMIT 分批，避免长事务锁太多行
-- 通常在循环中执行，每次删 100~1000 行，间隔 sleep 0.1s 减少主从延迟
DELETE FROM users LIMIT 100;
```

### SELECT

```sql
-- ========================
-- 基础查询
-- ========================

-- DISTINCT：去重，对 SELECT 后的所有列组合去重
-- 原理：临时表/排序去重，数据量大时消耗内存，慎用
SELECT DISTINCT city FROM users;

-- ========================
-- 分页查询
-- ========================

-- LIMIT offset, count 或 LIMIT count OFFSET offset：跳过 offset 行后取 count 行
-- 深分页问题：OFFSET 100000 时，MySQL 仍需扫描并跳过前 100000 行，越往后越慢
SELECT * FROM users LIMIT 10 OFFSET 20;

-- 游标分页（推荐替代 OFFSET）：利用主键索引快速定位起点
-- 原理：WHERE id > last_id 直接走主键索引，不需要扫描无关行
-- 前提：id 递增且连续（有空洞不影响，只是会跳过空洞）
SELECT * FROM users WHERE id > 1000 LIMIT 10;

-- ========================
-- 条件过滤 (WHERE)
-- ========================

-- BETWEEN min AND max：闭区间，等价于 age >= 18 AND age <= 30
-- IN (v1, v2, ...)：等价于多个 OR，但 MySQL 内部优化为二分查找（值多时优于 OR）
-- LIKE 'A%'：前缀匹配走索引（B+ 树有序），%A 或 %A% 不走索引
-- IS NOT NULL：判断非空，不能用 col <> NULL（NULL 是"未知"，任何比较都返回 NULL）
SELECT * FROM users
WHERE age BETWEEN 18 AND 30
  AND city IN ('Beijing', 'Shanghai')
  AND name LIKE 'A%'
  AND email IS NOT NULL;

-- ========================
-- 排序
-- ========================

-- ORDER BY：可多列排序，每列独立指定 ASC（升序，默认）或 DESC（降序）
-- 排序字段有索引可避免 filesort（文件排序），直接按索引顺序返回
SELECT * FROM users ORDER BY age DESC, name ASC;

-- ========================
-- 分组聚合 (GROUP BY + HAVING)
-- ========================

-- COUNT(*) 统计行数（含 NULL 行），COUNT(col) 只统计非 NULL 的行
-- AVG(age)：求平均值，自动忽略 NULL
-- GROUP BY 将相同 city 的行分为一组，聚合函数在每组内计算
-- HAVING：过滤分组后的结果，WHERE 只能过滤原始行，HAVING 可引用聚合函数和别名
-- 注意：MySQL 5.7+ 默认 sql_mode=ONLY_FULL_GROUP_BY，SELECT 的非聚合列必须在 GROUP BY 中
SELECT city, COUNT(*) AS cnt, AVG(age) AS avg_age
FROM users
GROUP BY city        -- 按城市分组
HAVING cnt > 5       -- 只保留人数 >5 的城市
ORDER BY cnt DESC;   -- 按人数降序排列
```

> [!warning]- `WHERE` vs `HAVING`
> WHERE 在 GROUP BY 前过滤行；HAVING 在 GROUP BY 后过滤分组。WHERE 不能接聚合函数。

---

## 5. JOIN

```sql
-- ========================
-- INNER JOIN（内连接）
-- ========================

-- 只返回两表中 ON 条件匹配的行，不匹配的行被丢弃
-- u 和 o 是表别名，简化列引用，多表 JOIN 时别名是必需的
-- JOIN 列 on u.id = o.user_id 中，user_id 是外键，需建索引（否则被驱动表全表扫）
SELECT u.name, o.order_no
FROM users u
INNER JOIN orders o ON u.id = o.user_id;

-- ========================
-- LEFT JOIN（左连接）
-- ========================

-- 返回左表 ALL 行 + 右表匹配的行
-- 右表无匹配时，右表列填充 NULL
-- 常用于"列出所有用户及其订单（含无订单用户）"
-- 过滤右表 NULL 行可得到"没有订单的用户"：WHERE o.id IS NULL
SELECT u.name, o.order_no
FROM users u
LEFT JOIN orders o ON u.id = o.user_id;

-- ========================
-- RIGHT JOIN（右连接）
-- ========================

-- 保留右表全部行，等价于调换表顺序的 LEFT JOIN，实际开发中少用
-- 以下两句等价：
-- SELECT * FROM A RIGHT JOIN B ON a.id=b.a_id
-- SELECT * FROM B LEFT JOIN A ON b.a_id=a.id
SELECT u.name, o.order_no
FROM users u
RIGHT JOIN orders o ON u.id = o.user_id;
```

### JOIN 算法

| 算法 | 说明 | 条件 |
|------|------|------|
| **Nested-Loop Join** | 驱动表每行去被驱动表全表扫 | 无索引 |
| **Block Nested-Loop Join** | 将驱动表分块读入 join buffer | 无索引，8.0.20 后改为 Hash Join |
| **Index Nested-Loop Join** | 被驱动表走索引 | 被驱动表关联列有索引 |
| **Hash Join** (8.0.18+) | 构建哈希表+探测 | 等值连接，無索引时优 |

**优化 JOIN 原则**：
- 小表驱动大表
- 被驱动表的 JOIN 列建索引
- 避免 `SELECT *`，减少 join buffer 占用

---

## 6. 索引

### 索引模型

- InnoDB 使用 **B+ 树**，数据存储在叶子节点
- 主键索引（聚簇索引）：叶子节点存整行数据
- 二级索引：叶子节点存主键值，需**回表**

```sql
-- ========================
-- 创建索引
-- ========================

-- CREATE INDEX：创建普通索引，默认 B+ 树结构
-- 命名惯例：idx_表名_列名
CREATE INDEX idx_name ON users(name);

-- ALTER TABLE ... ADD INDEX：另一种创建索引的语法，效果等价
ALTER TABLE users ADD INDEX idx_age (age);

-- 联合索引：多个列组成一个索引，键值由列值拼接而成
-- 列的顺序非常重要：遵循最左前缀原则，建议等值查询列在前，范围查询列在后
CREATE INDEX idx_city_age ON users(city, age);

-- 唯一索引：索引列值必须唯一（允许 NULL，且多个 NULL 不视为重复）
-- UNIQUE KEY 和 UNIQUE INDEX 功能完全相同
CREATE UNIQUE INDEX uk_email ON users(email);

-- 前缀索引：仅对列值的前 N 个字符建索引，节省空间
-- 适用于 VARCHAR/TEXT 等长字符串列
-- title(20) 表示取前 20 个字符建索引，20 的选择需权衡选择性（选择性太低则索引失效）
-- 计算公式：SELECT COUNT(DISTINCT LEFT(title,20))/COUNT(*) 应接近 1
CREATE INDEX idx_prefix ON articles(title(20));

-- ========================
-- 删除索引
-- ========================

-- DROP INDEX：删除索引，释放索引占用的磁盘空间
DROP INDEX idx_name ON users;

-- ========================
-- 查看索引
-- ========================

-- SHOW INDEX：列出表的所有索引信息
-- 输出包含 Index_type（BTREE/FULLTEXT）、Cardinality（唯一值估算）、
-- Seq_in_index（联合索引中列的顺序位置）等
SHOW INDEX FROM users;
```

### 最左前缀原则

联合索引 `(a, b, c)` 的有效查询：

| 查询条件 | 是否走索引 |
|----------|-----------|
| `WHERE a=1` | ✅ |
| `WHERE a=1 AND b=2` | ✅ |
| `WHERE a=1 AND b=2 AND c=3` | ✅ |
| `WHERE b=2` | ❌ 跳过 a |
| `WHERE c=3` | ❌ 跳过 a,b |
| `WHERE a=1 AND c=3` | ✅ a，c 不走（范围断后） |
| `WHERE a>1 AND b=2` | ✅ a 范围，b 不走 |

> [!warning] `LIKE 'foo%'` 走索引；`LIKE '%foo'` 不走。

### 覆盖索引

查询列全部在索引中 → 无需回表，性能最优。

```sql
-- 假设存在联合索引 idx_city_age(city, age)

-- ✅ 覆盖索引：SELECT 的列 city, age 都在索引中，无需回表
-- Extra 字段显示 "Using index"，性能最优
SELECT city, age FROM users WHERE city='Beijing';

-- ❌ 需回表：name 不在 idx_city_age 中，需回主键索引取 name 列
-- 流程：先在 idx_city_age 找到 (city='Beijing', age>20) 的主键 id
--       再拿 id 回聚簇索引查完整行，取出 name
SELECT name FROM users WHERE city='Beijing' AND age>20;
```

### 索引失效场景

- 使用函数：`WHERE YEAR(created_at)=2024`
- 隐式类型转换：`WHERE phone=13800138000`，phone 是 VARCHAR
- 字符集转换
- OR 条件非所有字段有索引
- != / <> / NOT IN
- IS NULL 走索引，IS NOT NULL 不一定

### 索引优化建议

- 高选择性列优先建索引（`COUNT(DISTINCT col) / COUNT(*)` 高）
- 联合索引列顺序：等值查询列在前，范围查询列在后
- 避免过多索引（影响写入性能）
- 用 `EXPLAIN` 分析
- 考虑 `FORCE INDEX` / `USE INDEX`（慎用）

---

## 7. EXPLAIN 执行计划

```sql
-- EXPLAIN：查看 SQL 执行计划，不实际执行 SQL
-- 用法：EXPLAIN + 任意 SELECT/INSERT/UPDATE/DELETE 语句
-- 输出一行（单表）或多行（JOIN/子查询），每行代表一次表的访问
-- id 列相同的行从上到下执行，id 越大优先级越高（先执行子查询）
EXPLAIN SELECT * FROM users WHERE name='Alice';
```

### 关键字段

| 字段 | 说明 |
|------|------|
| **type** | 访问类型：system > const > eq_ref > ref > range > index > ALL |
| **key** | 实际使用的索引 |
| **key_len** | 索引使用长度（判断联合索引用了几列） |
| **rows** | 预估扫描行数 |
| **Extra** | Using index（覆盖索引）<br/>Using filesort（文件排序，需要优化）<br/>Using temporary（临时表，需要优化）<br/>Using where |

> [!tip]- type 优先级
> 目标至少 `range`，最好是 `ref`。出现 `ALL`（全表扫描）考虑加索引。

---

## 8. 事务

### ACID

| 特性 | 实现机制 |
|------|----------|
| **A**tomicity 原子性 | undo log |
| **C**onsistency 一致性 | redo log + undo log |
| **I**solation 隔离性 | 锁 + MVCC |
| **D**urability 持久性 | redo log + doublewrite buffer |

### 隔离级别

| 级别 | 脏读 | 不可重复读 | 幻读 |
|------|------|-----------|------|
| READ UNCOMMITTED | ✅ | ✅ | ✅ |
| READ COMMITTED | ❌ | ✅ | ✅ |
| **REPEATABLE READ** (默认) | ❌ | ❌ | ✅(部分解决) |
| SERIALIZABLE | ❌ | ❌ | ❌ |

```sql
-- ========================
-- 查看与设置事务隔离级别
-- ========================

-- @@transaction_isolation：系统变量，查看当前会话的隔离级别
-- MySQL 8.0+ 使用 transaction_isolation，5.7 及之前使用 tx_isolation（已废弃）
SELECT @@transaction_isolation;

-- SET SESSION：仅当前会话生效，不影响其他连接
-- SET GLOBAL：全局生效，但已有连接不受影响（下次新建连接生效）
-- 可选项：READ UNCOMMITTED | READ COMMITTED | REPEATABLE READ | SERIALIZABLE
SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;
```

### MVCC

- 每行记录有隐藏列 `trx_id`（事务ID）、`roll_pointer`（回滚指针）
- **ReadView** 判断数据可见性
- RC：每次 SELECT 生成新 ReadView
- RR：事务开始生成一个 ReadView

### 当前读 vs 快照读

- **快照读**：普通 `SELECT`，读 MVCC 版本
- **当前读**：`SELECT ... FOR UPDATE`、`SELECT ... LOCK IN SHARE MODE`、`UPDATE`、`DELETE`，读最新已提交版本，需加锁

---

## 9. 锁

### 粒度

| 锁 | 说明 |
|----|------|
| 全局锁 | `FLUSH TABLES WITH READ LOCK`，全库只读 |
| 表锁 | `LOCK TABLES t READ/WRITE` |
| 行锁 | InnoDB 默认，通过索引加锁 |

### 行锁类型

| 锁 | 说明 |
|----|------|
| Record Lock | 锁索引记录 |
| Gap Lock | 锁索引记录间隙，防幻读 |
| Next-Key Lock | Record + Gap，RR 级别默认 |

### 意向锁

- 意向共享锁（IS）：事务想要加行级共享锁
- 意向排他锁（IX）：事务想要加行级排他锁
- 表锁与意向锁互斥判断：IS/IX 之间不互斥，IX 与 S/X 互斥

### 死锁

```sql
-- ========================
-- 死锁排查与配置
-- ========================

-- SHOW ENGINE INNODB STATUS：InnoDB 引擎状态快照，包含最近一次死锁的详细信息
-- LATEST DETECTED DEADLOCK 段显示死锁涉及的事务、持有的锁、等待的锁
-- 输出量大，建议用客户端工具或 grep 过滤 "LATEST DETECTED DEADLOCK" 段
SHOW ENGINE INNODB STATUS;

-- innodb_lock_wait_timeout：锁等待超时时间（秒），超时后事务自动回滚并报错
-- 默认 50 秒，可根据业务场景调小（快速失败）或调大（容忍长时间等待）
SET innodb_lock_wait_timeout=50;

-- innodb_deadlock_detect：死锁检测开关（默认 ON）
-- ON 时：每次锁请求都会触发等待图检查，发现环即回滚其中一个事务
-- 高并发（1000+ QPS 行锁竞争）时死锁检测成为 CPU 瓶颈，可考虑关闭
-- 关闭后依赖 innodb_lock_wait_timeout 超时解除僵局
SET innodb_deadlock_detect=ON;
```

**避免死锁**：
- 按固定顺序访问资源
- 缩短事务
- 尽量用主键更新

---

## 10. 日志

### redo log（重做日志）

- 物理日志，记录页的物理修改
- **WAL**（Write-Ahead Logging）：先写日志再写磁盘
- 循环写，固定大小（`innodb_log_file_size`）
- 用于崩溃恢复，保证持久性

### undo log（回滚日志）

- 逻辑日志，记录数据修改前的状态
- 用于事务回滚 + MVCC
- 长事务会导致 undo log 不能清理

### binlog（归档日志）

- Server 层日志，逻辑日志
- 主从复制 + 数据恢复
- 三种格式：`STATEMENT` / `ROW`（推荐）/ `MIXED`

### 两阶段提交

```
redo log prepare → binlog write → redo log commit
```

保证 redo log 与 binlog 一致。

---

## 11. 主从复制

```
Master: binlog dump thread → binlog
         ↓
Slave:  I/O thread → relay log → SQL thread → replay
```

### 复制模式

| 模式 | 原理 | 特点 |
|------|------|------|
| 异步 | Master 不管 Slave | 延迟、可能丢数据 |
| 半同步 | 至少一个 Slave ACK | 平衡可用性 |
| 组复制 (MGR) | Paxos 共识 | 强一致 |

---

## 12. SQL 优化

### 通用思路

1. **慢查询定位**：`slow_query_log` + `long_query_time`
2. **EXPLAIN 分析**：type、key、rows、Extra
3. **索引优化**：覆盖索引、最左前缀、避免失效
4. **SQL 重写**：拆分大查询、避免 SELECT *

### 分页优化

```sql
-- ❌ OFFSET 分页：OFFSET 越大越慢
-- MySQL 必须扫描并丢弃前 100000 行才能取到目标行，本质上是全表扫描
-- 即使用主键索引，前 100000 行的遍历也无法跳过
SELECT * FROM t LIMIT 100000, 20;

-- ✅ 游标分页（Seek Method）：利用索引直接定位起点
-- 前提：id 有索引（主键自带索引），前端记住上一页最后一条的 id
-- 原理：WHERE id > 100000 直接在主键 B+ 树上定位，跳过无关叶子节点
-- 限制：要求排序字段唯一且有序，不支持跳页（只能上一页/下一页）
SELECT * FROM t WHERE id > 100000 LIMIT 20;
```

### COUNT 优化

| 写法 | 性能 |
|------|------|
| `COUNT(*)` | 最好（MySQL 优化过） |
| `COUNT(1)` | 等价 |
| `COUNT(col)` | 不统计 NULL，稍慢 |

### 批量操作

```sql
-- ========================
-- 批量插入
-- ========================

-- 单条 INSERT 插入多行：减少 SQL 解析次数和网络往返
-- MySQL 默认每行有 8KB 限制（max_allowed_packet 决定单条 SQL 最大大小）
-- 建议每批 500~2000 行，具体取决于每行数据大小
INSERT INTO t VALUES (...), (...), (...);

-- ========================
-- 分批更新/删除
-- ========================

-- 大表更新时用 LIMIT 分批，避免长事务锁太多行
-- 分批的好处：
--   1) 单次锁范围小，减少锁等待和死锁概率
--   2) 事务短，undo log 可及时清理
--   3) 主从延迟小（binlog 分批发送）
-- 实际操作中在脚本循环执行，每批间 sleep 0.1~0.5 秒
UPDATE t SET status=1 WHERE id BETWEEN 1000 AND 2000 LIMIT 200;
```

### JOIN 优化

- 小表驱动大表
- 被驱动表关联列加索引
- 避免在 JOIN 列上使用函数

---

## 13. 范式与反范式

| 范式 | 要求 |
|------|------|
| 1NF | 列不可再分 |
| 2NF | 非主属性完全依赖主键 |
| 3NF | 非主属性不传递依赖主键 |
| BCNF | 消除主属性对码的传递依赖 |

实践中常适度反范式（冗余字段）用空间换 JOIN 开销。

---

## 14. 常用函数

```sql
-- ========================
-- 字符串函数
-- ========================

-- CONCAT：拼接多个字符串，任一参数为 NULL 则返回 NULL
-- 避免 NULL 影响：用 CONCAT_WS(sep, str1, str2, ...) 自动跳过 NULL
CONCAT('a', 'b');           -- 返回 'ab'

-- SUBSTRING(str, start, len)：从 start 位置（MySQL 从 1 开始计数）截取 len 个字符
-- 如果 len 省略，截取到末尾
SUBSTRING('hello', 1, 3);   -- 返回 'hel'

-- LENGTH：返回字符串的字节长度（受字符集影响）
-- CHAR_LENGTH：返回字符串的字符个数
-- utf8mb4 编码下：英文 1 字节，中文 3~4 字节
LENGTH('你好');              -- 返回 6（每个中文字符占 3 字节，2×3=6）
CHAR_LENGTH('你好');         -- 返回 2（2 个字符）

-- ========================
-- 日期函数
-- ========================

-- NOW()：返回当前日期+时间，格式 YYYY-MM-DD HH:MM:SS
-- 与 CURRENT_TIMESTAMP 等价
NOW();

-- DATE_FORMAT：将日期按指定格式输出
-- %Y=四位年 %m=两位月 %d=两位日 %H=24小时制 %i=分钟 %s=秒
DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s');

-- DATEDIFF(end, start)：计算两个日期相差的天数（end - start）
DATEDIFF('2024-12-31', '2024-01-01');  -- 返回 364

-- ========================
-- 条件函数
-- ========================

-- IF(condition, true_value, false_value)：三元条件，类似于三目运算符
IF(age>18, 'adult', 'child');

-- CASE WHEN ... THEN ... ELSE ... END：多条件分支
-- 按顺序评估 WHEN 条件，命中第一个为真的分支，都不命中走 ELSE
-- ELSE 省略时默认返回 NULL
CASE
    WHEN age < 18 THEN 'child'      -- 18 岁以下
    WHEN age < 60 THEN 'adult'      -- 18~59 岁
    ELSE 'senior'                   -- 60 岁及以上
END;

-- ========================
-- 聚合函数
-- ========================

-- 基础聚合：COUNT(计数) / SUM(求和) / AVG(平均值) / MAX(最大值) / MIN(最小值)
-- 均自动忽略 NULL 值（COUNT(*) 除外，它统计所有行包括全 NULL 行）
COUNT(col), SUM(col), AVG(col), MAX(col), MIN(col);

-- GROUP_CONCAT：将分组内的多行值拼接为一个字符串
-- 默认分隔符为逗号，可用 SEPARATOR 自定义
-- 注意：结果长度受 group_concat_max_len 限制（默认 1024 字节），超过会被截断
-- 结合 GROUP BY 使用，每个分组独立拼接
GROUP_CONCAT(city SEPARATOR ',');
```

---

## 15. 用户与权限

```sql
-- ========================
-- 用户与权限管理
-- ========================

-- 创建用户：'用户名'@'主机'
-- 'app'@'%' 表示用户 app 可从任意主机连接
-- 'app'@'localhost' 只允许本地连接
-- 注意：'app'@'%' 和 'app'@'localhost' 是不同用户，权限独立
CREATE USER 'app'@'%' IDENTIFIED BY 'password';

-- GRANT：授予权限
-- 权限列表：SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, DROP, INDEX, ALL PRIVILEGES...
-- dbname.* 表示 dbname 库的所有表，也可 dbname.tablename 限定到表
-- WITH GRANT OPTION：允许被授权者将权限再授予他人（慎用）
GRANT SELECT, INSERT ON dbname.* TO 'app'@'%';

-- REVOKE：回收已授予的权限
-- 注意：REVOKE 只回收 GRANT 明确授予的权限，不回收角色继承的权限
REVOKE DELETE ON dbname.* FROM 'app'@'%';

-- FLUSH PRIVILEGES：重新加载权限表到内存
-- 使用 GRANT/REVOKE 时 MySQL 自动执行此操作，直接改 mysql.user 表时才需手动执行
FLUSH PRIVILEGES;

-- 删除用户：同时删除该用户的所有权限
DROP USER 'app'@'%';
```

---

## 16. 备份与恢复

```bash
# ========================
# 逻辑备份 (mysqldump)
# ========================

# 全库备份：导出 dbname 库所有表的结构+数据到 backup.sql
# -u root：用户名
# -p：交互式输入密码（不建议在命令行直接写密码，会被 shell 历史记录暴露）
mysqldump -u root -p dbname > backup.sql

# 一致备份（InnoDB 专用）：--single-transaction 在事务中导出快照
# 原理：开启 REPEATABLE READ 事务，全程读同一快照，不阻塞其他写操作
# 不能与 --lock-tables 同时使用（--single-transaction 对 InnoDB 一致，--lock-tables 对 MyISAM）
mysqldump -u root -p --single-transaction dbname > backup.sql

# 备份指定表：可同时指定多个表，空格分隔
mysqldump -u root -p dbname table1 table2 > backup.sql

# ========================
# 数据恢复
# ========================

# 将 backup.sql 的内容导入到 dbname 库
# 注意：dbname 库必须事先存在（mysqldump 默认不导出 CREATE DATABASE 语句）
# 若需含建库语句，mysqldump 加 --databases dbname 参数
mysql -u root -p dbname < backup.sql

# ========================
# 物理备份 (Percona XtraBackup)
# ========================

# XtraBackup 直接复制 InnoDB 数据文件，比 mysqldump 快 N 倍
# 原理：拷贝数据文件 + 跟踪 redo log，备份期间不阻塞读写
# --target-dir：备份文件存放目录，需确保磁盘空间充足（至少等于数据目录大小）
xtrabackup --backup --target-dir=/backup
```

---

## 17. 面试高频考点

1. **B+树为什么快** → 矮胖、叶子链表支持范围查询、磁盘预读友好
2. **最左前缀原则** → 联合索引的匹配规则
3. **覆盖索引** → 不用回表，Extra 显示 `Using index`
4. **回表** → 二级索引找到主键，再查主键索引拿整行
5. **脏读/不可重复读/幻读 区别** → 查了未提交 / 两次查不同 / 范围查多了行
6. **MVCC 原理** → undo log + ReadView
7. **redolog vs binlog** → 引擎层 vs Server 层、物理 vs 逻辑
8. **JOIN 算法** → NLJ, BNLJ, Hash Join
9. **分库分表方案** → 垂直/水平切分，sharding key 选择
10. **主从延迟原因与解决** → 大事务、 Slave 单线程（5.7+ 并行复制）

---

## 18. 配置调优速查

| 参数 | 建议值 | 说明 |
|------|--------|------|
| `innodb_buffer_pool_size` | 物理内存 70% | 缓存数据+索引 |
| `innodb_log_file_size` | 1-2G | redo log 大小 |
| `innodb_flush_log_at_trx_commit` | 1(安全)/2(性能) | redo log 刷盘策略 |
| `sync_binlog` | 1(安全)/N(性能) | binlog 刷盘策略 |
| `max_connections` | 按需 | 最大连接数 |
| `slow_query_log` | ON | 慢查询日志 |

---

## 参考

- [[SQL语法笔记]]
- [[数据库系统原理]]
