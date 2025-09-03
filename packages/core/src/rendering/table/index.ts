/*
 * @Author: JeremyJone
 * @Date: 2025-04-18 11:00:12
 * @LastEditors: JeremyJone
 * @LastEditTime: 2025-07-18 15:52:24
 * @Description: 表格渲染管理器
 */
import { IContext } from "@/types/render";
import { EventName } from "../../event";
import { TableBody } from "./TableBody";
import { TableHeader } from "./TableHeader";
import type { Task } from "@/models/Task";

export class Table {
  private tableContainer: HTMLElement;
  private tableHeader: TableHeader;
  private tableBody: TableBody;

  constructor(private context: IContext, private container: HTMLElement) {
    // 创建一个用于包含表格组件的容器
    this.tableContainer = document.createElement("div");
    this.tableContainer.className = "x-gantt-table-container";
    this.tableContainer.style.position = "relative";
    this.tableContainer.style.width = "100%";
    this.tableContainer.style.height = "100%";
    // 移除overflow限制，允许横向滚动
    // this.tableContainer.style.overflow = "hidden"; // 不允许滚动，由外部虚拟滚动条控制

    // 使用flex布局，使表头和表格主体垂直排列
    this.tableContainer.style.display = "flex";
    this.tableContainer.style.flexDirection = "column";

    this.container.appendChild(this.tableContainer);

    // 创建表头和表格体
    this.tableHeader = new TableHeader(context, this.tableContainer);
    this.tableBody = new TableBody(context, this.tableContainer);

    // 监听事件
    this.listenEvents();
    
    // 添加滚动同步
    this.setupScrollSync();
  }

  public render(top: number, tasks: Task[]) {
    // 渲染表头
    this.tableHeader.render();

    // 渲染表格体 - 直接传递滚动位置值，表格体内部会根据这个值计算每行位置
    this.refresh(top, tasks);
  }

  public refresh(top: number, tasks: Task[]) {
    // this.context.store.getColumnManager().clearMergeInfo();
    this.tableBody.render(top, tasks);
  }

  public updateWidth() {
    this.tableBody.updateWidth();
  }

  public updateTask(task: Task) {
    this.tableBody.updateTask(task);
  }

  private listenEvents() {
    this.context.event.on(EventName.UPDATE_TABLE_HEADER, () => {
      this.tableHeader.render();
    });

    this.context.event.on(EventName.UPDATE_TABLE_BODY, () => {
      this.tableBody.update();
    });

    // 监听图表折叠事件，重新渲染表格
    this.context.event.on(EventName.TOGGLE_CHART_COLLAPSE, () => {
      this.tableHeader.render();
      this.tableBody.update();
    });
  }

  private setupScrollSync() {
    // 获取header和body的DOM元素
    const headerElement = this.tableContainer.querySelector('.x-gantt-table-header') as HTMLElement;
    const bodyElement = this.tableContainer.querySelector('.x-gantt-table-body') as HTMLElement;
    
    if (!headerElement || !bodyElement) {
      return;
    }

    let isHeaderScrolling = false;
    let isBodyScrolling = false;

    // 监听header的滚动事件
    headerElement.addEventListener('scroll', () => {
      if (isBodyScrolling) return;
      isHeaderScrolling = true;
      bodyElement.scrollLeft = headerElement.scrollLeft;
      setTimeout(() => { isHeaderScrolling = false; }, 10);
    });

    // 监听body的滚动事件
    bodyElement.addEventListener('scroll', () => {
      if (isHeaderScrolling) return;
      isBodyScrolling = true;
      headerElement.scrollLeft = bodyElement.scrollLeft;
      setTimeout(() => { isBodyScrolling = false; }, 10);
    });
  }
}
