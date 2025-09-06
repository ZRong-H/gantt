/*
 * @Author: JeremyJone
 * @Date: 2025-04-18 10:47:28
 * @LastEditors: JeremyJone
 * @LastEditTime: 2025-07-31 17:51:30
 * @Description: Facade Layer for Gantt Component
 */
import { Logger } from "./utils/logger";
import { Store } from "./store";
import { Renderer } from "./rendering/Renderer";
import { ErrorType, EventBus, EventName } from "./event";
import dayjs from "./utils/time";
import { generateId } from "./utils/id";
import { IOptionConfig, IOptions } from "./types";
import { EventMap } from "./types/event";
import type { ILink } from "./types/link";
import { IContext } from "./types/render";
import { Task } from "./models/Task";
import { Baseline } from "./models/Baseline";

export class XGanttContext implements IContext {
  private _id = generateId();

  public store: Store;
  public event = new EventBus();
  private renderer: Renderer;

  constructor(
    private container: HTMLElement,
    private events: Map<keyof EventMap, Function[]>,
    options?: IOptions
  ) {
    this.container.innerHTML = "";

    this.store = new Store(this, options);

    // 初始化渲染器 (Renderer)
    this.renderer = new Renderer(this, this.container);

    // 初始渲染
    this.render();

    // 注册事件
    this.registerEvents();

    Logger.debug(
      "----Gantt initialized for element:",
      this._id,
      this.container
    );
  }

  public getScrollbar() {
    return this.renderer?.getScrollbar();
  }

  public getOptions() {
    return this.store.getOptionManager().getOptions();
  }

  private setOptions(options: IOptions, config: IOptionConfig) {
    this.store.setOption(options, config);
  }

  // *** Public API Methods ***/

  /**
   * 获取甘特图实例的唯一标识符
   * @returns {string} 实例ID
   */
  public getId(): string {
    return this._id;
  }

  /**
   * 获取当前选中的任务列表
   * @returns {any[]} 选中的任务数据列表
   */
  public getSelectedTasks(): any[] {
    return this.store.getDataManager().getCheckedList().map(t => t.data);
  }

  /**
   * 手动选中指定任务
   * @param {string[]} taskIds 要选中的任务ID列表
   */
  public selectTasks(taskIds: string[]): void {
    const tasks = taskIds
      .map(id => this.store.getDataManager().getTaskById(id))
      .filter(task => task !== null) as Task[];
    
    tasks.forEach(task => {
      this.store.getDataManager().checkTask(task, true);
    });
  }

  /**
   * 取消选中所有任务
   */
  public clearSelection(): void {
    this.store.getDataManager().clearChecked();
  }

  /**
   * 获取当前时间轴的可见时间范围
   * @returns {{ start: Date, end: Date }} 可见时间范围
   */
  public getVisibleTimeRange(): { start: Date; end: Date } {
    const timeAxis = this.store.getTimeAxis();
    return {
      start: timeAxis.getStartTime().toDate(),
      end: timeAxis.getEndTime().toDate()
    };
  }

  public render(): void {
    // 调用渲染器的 render 方法
    this.renderer.render();
  }

  public updateOptions(newOptions: IOptions, config: IOptionConfig): void {
    this.setOptions(newOptions, config);
    Logger.debug("GanttChart options updated");
    this.render(); // 重新渲染
  }

  /**
   * 获取所有任务数据
   * @returns {any[]} 所有任务数据列表
   */
  public getAllTasks(): any[] {
    return this.store.getDataManager().getAllTasks().map(t => t.data);
  }

  /**
   * 根据ID获取任务数据
   * @param {string} taskId 任务ID
   * @returns {any | null} 任务数据，如果未找到则返回null
   */
  public getTaskById(taskId: string): any | null {
    const task = this.store.getDataManager().getTaskById(taskId);
    return task ? task.data : null;
  }

  /**
   * 更新任务数据
   * @param {string} taskId 任务ID
   * @param {any} newData 新的任务数据
   * @returns {boolean} 是否更新成功
   */
  public updateTask(taskId: string, newData: any): boolean {
    const task = this.store.getDataManager().getTaskById(taskId);
    if (!task) return false;

    Object.assign(task.data, newData);
    this.render();
    return true;
  }

  /**
   * 删除指定任务
   * @param {string} taskId 要删除的任务ID
   * @returns {boolean} 是否删除成功
   */
  public deleteTask(taskId: string): boolean {
    const success = this.store.getDataManager().removeTask(taskId);
    if (success) {
      this.render();
    }
    return success;
  }

  public destroy(): void {
    Logger.debug("Gantt destroying...");
    // 清理事件监听器
    this.event.offAll();
    // 销毁渲染器
    this.renderer.destroy();
    // 清理 DOM
    this.container.innerHTML = "";
    // 移除引用
    // ...
  }

  /**
   * 跳转到指定日期。默认为今天
   *
   * @return {boolean} 是否成功跳转
   */
  /**
   * 手动触发甘特图大小调整，用于容器大小变化时更新视图
   */
  public resize(): void {
    this.renderer.updateSize();
    this.render();
  }

  /**
   * 跳转到指定日期。默认为今天
   * @param {any} date - 要跳转到的日期
   * @returns {boolean} 是否成功跳转
   */
  public jumpTo(date?: any): boolean {
    const day = dayjs(date);

    if (!this.store.getTimeAxis().isInTimeAxis(day)) return false;

    const left = this.store.getTimeAxis().getTimeLeft(day) - 100;
    this.renderer.getScrollbar().scrollTo({ x: Math.max(left, 0) });
    return true;
  }

  // ***** 私有事件 ***** /

  /**
   * 触发事件
   * @param event 事件名称
   * @param args 参数列表
   */
  private _emit(event: keyof EventMap, ...args: any[]): void {
    if (this.events.has(event)) {
      this.events.get(event)?.forEach(cb => cb(...args));
    }
  }

  // 注册对外事件
  private registerEvents() {
    // 抛出异常事件
    this.event.on(EventName.ERROR, (error: ErrorType) => {
      this._emit("error", error);
    });

    this.event.on(EventName.LOADED, () => {
      this._emit("loaded");
    });

    this.event.on(EventName.TASK_DRAG_END, (task: Task, old: Task[]) => {
      this._emit(
        "move",
        old.map(item => {
          return {
            row: this.store.getDataManager().getTaskById(item.id)?.data,
            old: item.data
          };
        })
      );
    });

    this.event.on(EventName.CHECK_TASK, (tasks: Task[], checked: boolean) => {
      this._emit(
        "select",
        tasks.map(t => t.data),
        checked,
        this.store
          .getDataManager()
          .getCheckedList()
          .map(t => t.data)
      );
    });

    this.event.on(EventName.UPDATE_LINK, (link: ILink) => {
      this._emit("update:link", link);
    });

    this.event.on(EventName.CREATE_LINK, (link: ILink) => {
      this._emit("create:link", link);
    });

    this.event.on(
      EventName.SELECT_LINK,
      (add: ILink | null, cancel: ILink | null, all: ILink[]) => {
        this._emit("select:link", add, cancel, all);
      }
    );

    this.event.on(EventName.CONTEXT_LINK, (e: MouseEvent, link: ILink) => {
      this._emit("contextmenu:link", e, link);
    });

    this.event.on(EventName.ROW_CLICK, (e: MouseEvent, task: Task) => {
      this._emit("click:row", e, task.data);
    });

    this.event.on(EventName.ROW_DBL_CLICK, (e: MouseEvent, task: Task) => {
      this._emit("dblclick:row", e, task.data);
    });

    this.event.on(EventName.ROW_CONTEXTMENU, (e: MouseEvent, task: Task) => {
      this._emit("contextmenu:row", e, task.data);
    });

    this.event.on(EventName.SLIDER_CLICK, (e: MouseEvent, task: Task) => {
      this._emit("click:slider", e, task.data);
    });

    this.event.on(EventName.SLIDER_DBL_CLICK, (e: MouseEvent, task: Task) => {
      this._emit("dblclick:slider", e, task.data);
    });

    this.event.on(EventName.SLIDER_CONTEXTMENU, (e: MouseEvent, task: Task) => {
      this._emit("contextmenu:slider", e, task.data);
    });

    this.event.on(EventName.SLIDER_HOVER, (e: MouseEvent, task: Task) => {
      this._emit("hover:slider", e, task.data);
    });

    this.event.on(EventName.SLIDER_LEAVE, (e: MouseEvent, task: Task) => {
      this._emit("leave:slider", e, task.data);
    });

    this.event.on(EventName.BASELINE_CLICK, (e: MouseEvent, task: Task, baseline: Baseline) => {
      this._emit("click:baseline", e, task.data, baseline.data);
    });

    this.event.on(EventName.BASELINE_CONTEXTMENU, (e: MouseEvent, task: Task, baseline: Baseline) => {
      this._emit("contextmenu:baseline", e, task.data, baseline.data);
    });

    this.event.on(EventName.BASELINE_MOUSEOVER, (e: MouseEvent, task: Task, baseline: Baseline) => {
      this._emit("hover:baseline", e, task.data, baseline.data);
    });

    this.event.on(EventName.BASELINE_MOUSEOUT, (e: MouseEvent, task: Task, baseline: Baseline) => {
      this._emit("leave:baseline", e, task.data, baseline.data);
    });
  }
}
