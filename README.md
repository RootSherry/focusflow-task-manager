# FocusFlow 专注任务管理器

一个基于 `React + TypeScript + Vite` 的本地专注管理 Web 应用，支持任务管理、番茄钟、统计面板和本地持久化。

## 功能

- 任务管理
  - 新增/编辑/删除任务
  - 标记完成/取消完成
  - 支持优先级（高/中/低）
  - 支持截止日期
- 专注计时
  - 默认 `25/5` 番茄钟，可配置工作/休息分钟
  - 开始/暂停/重置
  - 阶段结束显示可见提示，若浏览器授权通知则触发系统通知
- 统计面板
  - 今日完成任务数
  - 专注次数
  - 专注总时长
- 数据持久化
  - `localStorage` 存储任务、番茄设置和统计数据
- 响应式 UI
  - 桌面双栏布局
  - 移动端单栏布局

## 技术栈

- React 19
- TypeScript 5
- Vite
- Vitest + Testing Library
- ESLint

## 本地运行

```bash
npm install
npm run dev
```

打开浏览器访问终端输出的本地地址（默认 `http://localhost:5173`）。

## 质量命令

```bash
npm run lint
npm run typecheck
npm run test:run
npm run build
```

## 测试覆盖（基础）

- `src/features/tasks/__tests__/taskUtils.test.ts`
  - 任务创建、编辑、删除、完成切换、排序、今日完成统计
- `src/features/focus/__tests__/focusUtils.test.ts`
  - 番茄配置归一化、秒数格式化、阶段时长、统计累加

## 演示步骤

1. 新增两条任务（不同优先级和截止日期）。
2. 将其中一条任务标记完成，查看“今日完成任务数”变化。
3. 在专注计时中设置工作/休息时长（如 `1/1`），点击开始。
4. 等待阶段结束，观察提示和统计面板中的专注次数、总时长变化。

## 目录结构

```text
src/
  features/
    focus/
    stats/
    tasks/
  shared/
  test/
  types/
```

