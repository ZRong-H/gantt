/*
 * @Author: JeremyJone
 * @Date: 2025-09-13 15:26:00
 * @LastEditors: JeremyJone
 * @LastEditTime: 2025-09-13 15:26:00
 * @Description: 悬浮提示
 */

import { IContext } from "@/types/render";
import { EventName } from "../../event";
import { Task } from "@/models/Task";
import dayjs from "dayjs";

export class Tooltip {
  private element: HTMLElement;
  private titleElement: HTMLElement;
  private contentElement: HTMLElement;
  private container: HTMLElement;
  private visible: boolean = false;

  constructor(private context: IContext, container: HTMLElement) {
    if (!container) {
      throw new Error("Container is required for Tooltip instance");
    }

    this.container = container;
    this.element = document.createElement("div");
    this.titleElement = document.createElement("div");
    this.contentElement = document.createElement("div");
    this.initElement();
    this.initEvents();
  }

  private initElement(): void {
    this.element.className = "x-gantt-tooltip";
    this.titleElement.className = "x-gantt-tooltip-title";
    this.contentElement.className = "x-gantt-tooltip-content";

    this.element.appendChild(this.titleElement);
    this.element.appendChild(this.contentElement);

    if (getComputedStyle(this.container).position === "static") {
      this.container.style.position = "relative";
    }

    this.container.appendChild(this.element);
  }

  private initEvents(): void {
    this.context.event.on(
      EventName.SLIDER_HOVER,
      (event: MouseEvent, task: Task) => {
        this.show(event, task);
      }
    );

    this.context.event.on(EventName.SLIDER_LEAVE, () => {
      this.hide();
    });
  }

  public show(event: MouseEvent, task: Task): void {
    this.titleElement.innerText = task.name;
    const dateFormat = this.context.getOptions().dateFormat;
    this.contentElement.innerHTML = `
      <p>Start: ${task.startTime?.format(dateFormat)}</p>
      <p>End: ${task.endTime?.format(dateFormat)}</p>
    `;
    this.element.style.display = "block";
    this.visible = true;
    this.updatePosition(event);
  }

  public hide(): void {
    this.element.style.display = "none";
    this.visible = false;
  }

  public updatePosition(event: MouseEvent): void {
    if (!this.visible) return;

    const containerRect = this.container.getBoundingClientRect();
    const tooltipRect = this.element.getBoundingClientRect();

    let left = event.clientX - containerRect.left + 15;
    let top = event.clientY - containerRect.top + 15;

    if (left + tooltipRect.width > containerRect.width) {
      left = event.clientX - containerRect.left - tooltipRect.width - 15;
    }

    if (top + tooltipRect.height > containerRect.height) {
      top = event.clientY - containerRect.top - tooltipRect.height - 15;
    }

    this.element.style.left = `${left}px`;
    this.element.style.top = `${top}px`;
  }

  public isVisible(): boolean {
    return this.visible;
  }
}