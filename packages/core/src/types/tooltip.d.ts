/*
 * @Author: JeremyJone
 * @Date: 2025-09-13 15:26:00
 * @LastEditors: JeremyJone
 * @LastEditTime: 2025-09-13 15:26:00
 * @Description: Tooltip 类型定义
 */

import { Task } from "@/models/Task";

export interface ITooltipContent {
  title: string;
  content: string;
}

export interface ITooltipOptions {
  /**
   * 自定义渲染函数
   * @param task 当前任务
   * @returns 返回自定义的渲染内容，可以是一个字符串或者一个包含 title 和 content 的对象
   */
  render?: (task: Task) => string | ITooltipContent;
}