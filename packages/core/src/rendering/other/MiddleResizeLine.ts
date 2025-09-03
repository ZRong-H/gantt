/*
 * @Author: JeremyJone
 * @Date: 2025-05-09 17:06:07
 * @LastEditors: JeremyJone
 * @LastEditTime: 2025-07-29 11:18:34
 * @Description: 表格和图表中间的移动线
 */

import { IContext } from "@/types/render";
import { EventName } from "../../event";

// 蓝色三角形图标 - 向左
const leftTriangleIcon = '<svg style="transition: all 0.3s" xmlns="http://www.w3.org/2000/svg" width="4.5" height="5.5" viewBox="0 0 4.5 5.5"><polygon fill="rgba(39, 111, 245, 1)" points="4.5,0 0,2.75 4.5,5.5"/></svg>';
// 蓝色三角形图标 - 向右
const rightTriangleIcon = '<svg style="transition: all 0.3s" xmlns="http://www.w3.org/2000/svg" width="4.5" height="5.5" viewBox="0 0 4.5 5.5"><polygon fill="rgba(39, 111, 245, 1)" points="0,0 4.5,2.75 0,5.5"/></svg>';

export class MiddleResizeLine {
  private line: HTMLDivElement;
  private initialX: number = 0;
  private initialWidth: number = 0;

  private collapseButton: HTMLDivElement | null = null;
  private chartCollapseButton: HTMLDivElement | null = null;

  constructor(private root: IContext, private container: HTMLElement) {
    // 创建一个用于包含表格组件的容器
    this.line = document.createElement("div");
    this.line.className = "x-gantt-middle-resize-line";
    this.line.style.position = "absolute";
    this.line.style.zIndex = "9999";
    this.line.style.width = "5px";
    this.line.style.height = "100%";
    this.line.style.borderLeft = "2px solid";
    this.line.style.setProperty(
      "border-left-color",
      this.root.store.getOptionManager().getOptions().border.color,
      "important"
    );
    this.line.style.cursor = "col-resize";

    // 根据extendColumns配置决定显示哪个按钮
    const tableOptions = this.root.store.getOptionManager().getOptions().table;
    const hasExtendColumns = tableOptions.expendColumns && tableOptions.expendColumns.length > 0;

    if (hasExtendColumns) {
      // 如果有extendColumns，只显示折叠chart的按钮
      this.chartCollapseButton = document.createElement("div");
      this.chartCollapseButton.className = "x-gantt-chart-collapse-button";
      this.chartCollapseButton.style.position = "absolute";
      this.chartCollapseButton.style.top = "50%";
      // 初始状态下，chart未折叠，按钮紧贴middleLine右边
      this.chartCollapseButton.style.left = "0px";
      this.chartCollapseButton.style.right = "auto";
      this.chartCollapseButton.style.transform = "translateY(-50%)";
      this.chartCollapseButton.style.cursor = "pointer";
      this.chartCollapseButton.style.zIndex = "9999";

      // 设置chart折叠按钮的样式
      this.chartCollapseButton.style.width = "12px";
      this.chartCollapseButton.style.height = "12px";
      this.chartCollapseButton.style.backgroundColor = "#fff";
      this.chartCollapseButton.style.border = "1px solid rgba(229, 229, 229, 1)";
      // 初始状态下，chart未折叠，按钮右侧带圆角
      this.chartCollapseButton.style.borderRadius = "0 6px 6px 0";
      this.chartCollapseButton.style.display = "flex";
      this.chartCollapseButton.style.alignItems = "center";
      this.chartCollapseButton.style.justifyContent = "center";
      // 设置chart折叠按钮的图标
      this.chartCollapseButton.innerHTML = rightTriangleIcon;

      // 点击chart折叠按钮时触发事件
      this.chartCollapseButton.addEventListener("click", e => {
        e.stopPropagation();
        this.root.store.getColumnManager().toggleChartCollapse();
      });

      this.line.appendChild(this.chartCollapseButton);
    } else {
      // 如果没有extendColumns，只显示折叠table的按钮
      this.collapseButton = document.createElement("div");
      this.collapseButton.className = "x-gantt-collapse-button";
      this.collapseButton.style.position = "absolute";
      this.collapseButton.style.top = "50%";
      this.collapseButton.style.left = "0";
      this.collapseButton.style.transform = "translateY(-50%)";
      this.collapseButton.style.cursor = "pointer";
      this.collapseButton.style.zIndex = "9999";

      // 设置折叠按钮的样式
      this.collapseButton.style.width = "12px";
      this.collapseButton.style.height = "12px";
      this.collapseButton.style.backgroundColor = "#fff";
      this.collapseButton.style.border = "1px solid rgba(229, 229, 229, 1)";
      this.collapseButton.style.borderRadius = "0 6px 6px 0";
      this.collapseButton.style.display = "flex";
      this.collapseButton.style.alignItems = "center";
      this.collapseButton.style.justifyContent = "center";
      // 设置折叠按钮的图标
      this.collapseButton.innerHTML = leftTriangleIcon;

      // 点击折叠按钮时触发事件
      this.collapseButton.addEventListener("click", e => {
        e.stopPropagation();
        this.root.store.getColumnManager().collapse();
      });

      this.line.appendChild(this.collapseButton);
    }

    this.container.appendChild(this.line);

    // 添加拖拽功能
    this.addDragEvents();
  }

  public setOffset(x: number) {
    this.line.style.left = `${x - 2}px`;
    this.initialX = x;

    // 更新图标
    if (this.collapseButton) {
      if (this.root.store.getColumnManager().isCollapsed()) {
        this.collapseButton.innerHTML = rightTriangleIcon;
      } else {
        this.collapseButton.innerHTML = leftTriangleIcon;
      }
    }

    // 更新chart折叠按钮图标、圆角和位置
    if (this.chartCollapseButton) {
      if (this.root.store.getColumnManager().isChartCollapsed()) {
        this.chartCollapseButton.innerHTML = leftTriangleIcon;
        // chart折叠时，按钮左侧带圆角，位置在middleLine左边
        this.chartCollapseButton.style.borderRadius = "6px 0 0 6px";
        this.chartCollapseButton.style.left = "-13px";
        this.chartCollapseButton.style.right = "auto";
      } else {
        this.chartCollapseButton.innerHTML = rightTriangleIcon;
        // chart未折叠时，按钮右侧带圆角，紧贴middleLine右边
        this.chartCollapseButton.style.borderRadius = "0 6px 6px 0";
        this.chartCollapseButton.style.left = "0px";
        this.chartCollapseButton.style.right = "auto";
      }
    }
  }

  /**
   * 添加拖拽事件
   */
  private addDragEvents() {
    let startX = 0;
    let rootRect: DOMRect | null = null;
    const columnManager = this.root.store.getColumnManager();
    const leafColumns = columnManager.getLeafColumns();

    const onMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // 记录初始鼠标位置
      startX = e.clientX;
      // 获取容器相对于视口的位置
      rootRect = this.container.getBoundingClientRect();
      // 获取最后一列的初始宽度
      const lastColumnKey = leafColumns[leafColumns.length - 1].key;
      this.initialWidth = columnManager.getColumnWidth(lastColumnKey);

      // 显示指导线
      const guidelineLeft = parseInt(this.line.style.left) + 2; // 加回偏移量
      this.root.event.emit(EventName.SHOW_GUIDELINE, guidelineLeft);

      // 添加移动和抬起事件监听
      const mouseMoveHandler = (e: MouseEvent) => onMouseMove(e);
      const mouseUpHandler = (e: MouseEvent) =>
        onMouseUp(e, mouseMoveHandler, mouseUpHandler);

      document.addEventListener("mousemove", mouseMoveHandler);
      document.addEventListener("mouseup", mouseUpHandler);
    };

    const onMouseMove = (e: MouseEvent) => {
      e.preventDefault();

      if (!rootRect) return;

      // 计算鼠标移动的距离
      const deltaX = e.clientX - startX;

      // 获取最后一列
      const lastColumnKey = leafColumns[leafColumns.length - 1].key;

      // 限制移动范围，防止最后一列宽度小于50px
      const minDeltaX = 50 - this.initialWidth;

      // 计算最大允许移动距离
      // 防止超出右侧边界，考虑在rootRect.width的基础上，而不是container的宽度
      // 最大位置应该是rootRect.width - 20
      const maxLeft = rootRect.width - 20; // 右侧保留20px的间距
      const maxDeltaX = maxLeft - this.initialX;

      // 双向限制：不能小于最小宽度，也不能超过最大宽度
      const limitedDeltaX = Math.max(minDeltaX, Math.min(maxDeltaX, deltaX));

      // 计算新位置（当前位置 + 受限的鼠标移动距离）
      const newLeft = this.initialX + limitedDeltaX;

      // 更新指导线位置
      this.root.event.emit(EventName.MOVE_GUIDELINE, newLeft);
    };

    const onMouseUp = (
      e: MouseEvent,
      mouseMoveHandler: (e: MouseEvent) => void,
      mouseUpHandler: (e: MouseEvent) => void
    ) => {
      // 移除事件监听
      document.removeEventListener("mousemove", mouseMoveHandler);
      document.removeEventListener("mouseup", mouseUpHandler);

      // 隐藏指导线
      this.root.event.emit(EventName.HIDE_GUIDELINE);

      // 计算最终位置
      const deltaX = e.clientX - startX;

      // 获取最后一列
      const lastColumnKey = leafColumns[leafColumns.length - 1].key;

      // 计算新宽度（考虑最小宽度限制）
      const newWidth = Math.max(50, this.initialWidth + deltaX);

      // 更新最后一列宽度
      columnManager.setColumnWidth(lastColumnKey, newWidth);

      // 更新表头
      this.root.event.emit(EventName.UPDATE_TABLE_HEADER);
    };

    // 添加鼠标按下事件监听
    this.line.addEventListener("mousedown", onMouseDown);
  }
}
