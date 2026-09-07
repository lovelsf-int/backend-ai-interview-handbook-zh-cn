---
title: JVM 垃圾回收动态演示
description: 可播放、暂停、倍速和逐步观看的分代回收、标记整理与 G1 动画
status: reviewed
baseline: Oracle GC tutorial and JDK 25 G1 documentation
last_verified: 2026-09-07
level: P7/P8
source: 原创教学动画；Oracle Java GC 文档
outline: false
---

<script setup>
import { withBase } from 'vitepress'
</script>

# JVM 垃圾回收动态演示

<a :href="withBase('/labs/jvm-gc/index.html')" target="_blank" rel="noopener">打开完整动画页面 ↗</a>

<iframe :src="withBase('/labs/jvm-gc/index.html')" title="JVM 垃圾回收交互动画" style="width:100%;height:850px;border:0;border-radius:12px" allow="fullscreen" loading="lazy"></iframe>

## 观看顺序

1. **分代回收**：观察 Eden 分配、存活对象复制、Survivor 交换和晋升。
2. **标记整理**：区分对象存活判定与连续空闲空间的形成。
3. **G1 回收周期**：辨别并发标记、STW 与 Mixed GC 的回收范围。

支持播放、暂停、重播、进度拖动、逐步观看、倍速和全屏。完整页面中，焦点不在控件时可用空格播放或暂停，左右方向键切换步骤。

## 理解边界

这是实时网页动画，没有旁白音轨。对象规模、时长和晋升年龄是教学示例，不是生产测量；分代场景采用经典布局，不能套用到所有收集器。G1 场景省略大对象、特殊引用、并发清理细节与转移失败路径。

## 官方参考

- [Oracle Java Garbage Collection Basics](https://www.oracle.com/webfolder/technetwork/tutorials/obe/java/gc01/index.html)
- [Oracle JDK 25 G1 Garbage Collector](https://docs.oracle.com/en/java/javase/25/gctuning/garbage-first-g1-garbage-collector1.html)
