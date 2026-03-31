# Output Template

Use this as the default content shape inside the schema JSON or as a compact checklist while filling it.

```md
姓名：
玩家：
年龄：
性别：
职业：
时代/背景：
居住地：
出生地：

属性：
- STR:
- CON:
- SIZ:
- DEX:
- APP:
- INT:
- POW:
- EDU:
- LUCK:

衍生属性：
- SAN:
- HP:
- MP:
- MOV:
- DB:
- Build:

追踪栏：
- 当前 SAN:
- 初始 SAN:
- 当前 HP / Max HP:
- 当前 MP / Max MP:
- 当前 LUCK:
- 重伤:
- 昏迷:
- 濒死:
- 临时疯狂:
- 总结性疯狂:

职业信息：
- 职业技能点公式：
- 兴趣技能点：
- 信用评级：
- 生活水平概述：
- 现金：
- 消费水平：
- 其他资产：

关键技能：
- 技能名 百分比（半值/五分之一）

战斗相关：
- 斗殴：
- 闪避：
- 常用武器/火器：

背景：
- 个人描述：
- 思想/信念：
- 重要之人：
- 意义非凡之地：
- 宝贵之物：
- 特点：

进展与状态：
- 损伤/伤痕：
- 恐惧/狂躁：
- 神话典籍：
- 法术：
- 重要遭遇：

备注：
- assumptions
- any rule-sensitive choices
```

## Formatting guidance

- Keep the default output compact and readable.
- If the user wants a fuller sheet, expand the skill list and background details.
- If a field is unknown, either infer it carefully or mark it as an assumption.
- Prefer fields that correspond to the visible standard sheet first. `关键连接` is still useful builder metadata, but it is not a dedicated printed field on this form.

## Structured data

Use the normalized JSON Schema at [../../schemas/investigator-sheet.schema.json](../../schemas/investigator-sheet.schema.json) when you need a machine-readable sheet for validation or storage.
That JSON is the canonical output of the build flow.
By default, keep investigator JSON artifacts under `play-data/investigators/` so character sheets live beside the active play workspace rather than in scattered folders.

Keep investigator output in JSON only. Do not generate a parallel Markdown sheet.
