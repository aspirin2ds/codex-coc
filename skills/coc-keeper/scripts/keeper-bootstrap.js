#!/usr/bin/env node

const mode = process.argv[2] || "all";

const characterSteps = [
  "1. 确认玩家顺序和整体风格。",
  "2. 询问姓名、人物概念、入局动机。",
  "3. 锁定年龄、职业、出身和关键关系。",
  "4. 收集或生成属性，先稳定数值再继续。",
  "5. 确认职业强项、野外/行动强项、个人兴趣。",
  "6. 补一个弱点或恐惧，以及关心案件的原因。",
  "7. 交给 coc-investigator-builder 完成建卡并落盘。"
];

const opening = [
  "时间：1925 年 6 月 20 日，佛蒙特州贝宁顿。",
  "事件：卢卡斯·斯壮之女简在赎金交付后的枪战中失踪，两名绑匪逃入森林。",
  "现场气氛：镇上流言四起，警方人手不足，临时搜查队正在集结。",
  "玩家当前可选：继续打听消息、采购装备、去枪战现场、直接进林追踪。"
];

function printSection(title, lines) {
  console.log(title);
  for (const line of lines) {
    console.log(`- ${line}`);
  }
}

if (mode === "all" || mode === "character") {
  printSection("角色创建流程", characterSteps);
}

if (mode === "all" || mode === "opening") {
  if (mode === "all") {
    console.log("");
  }
  printSection("模组开场", opening);
}
