import { createSvgElement } from './utils.js';        // 导入SVG元素创建函数
import { createTooltip } from './handleTooltip.js';   // 导入tooltip创建函数
import { renderHeader } from './handleHeader.js';     // 导入首部渲染函数
import { createVirtualList } from './handleRows.js';  // 导入虚拟列表创建函数
import { createScrollArea } from './handleScroll.js'; // 导入滚动区域创建函数
import { merge, sortByAmount } from './utils.js';     // 导入对象合并和数量排序

// 默认配置选项
const defaultOptions = {
  type: 'svg',                       // 图表类型: svg, canvas
  sort: null,                        // 排序方式：null(不排序)、'asc'(升序)、'desc'(降序)
  data: [],                          // 图表数据源
  theme: 'hdesign-light',            // 主题样式
  header: ['名称', '金额', '贡献度'], // 首部文本
  color: '#1977fbff',              // 默认颜色
  headerHeight: 40,                  // 首部高度
  rowHeight: 60,                     // 行高度
};

export default class HorizontalChart {

  constructor() {
    this.dom = null;               // 图表容器DOM元素
    this.options = defaultOptions; // 配置选项，初始为默认配置
    this.renderCallBack = null;    // 渲染完成回调函数
  }

  // 初始化图表容器
  init(dom) {
    this.dom = dom;                 // 保存容器DOM引用
    this.width = dom.clientWidth;   // 保存容器宽度
    this.height = dom.clientHeight; // 保存容器高度

    // 创建根SVG元素
    this.svg = createSvgElement('svg', {
      width: '100%',              // SVG宽度自适应
      height: '100%',             // SVG高度自适应
      viewBox: `0 0 ${this.width} ${this.height}`,  // 视图
      style: 'transition: all 0.3s ease-in-out; border: 1px solid #e0e0e0;' // 一些css样式
    });
    this.dom.innerHTML = '';        // 清空容器原有内容
    this.dom.appendChild(this.svg); // 将根SVG添加到容器
  }

  // 合并配置选项
  setSimpleOptions(options) {
    if (!options || typeof options !== 'object') options = {}; // 参数校验：确保options是对象
    this.options = merge(this.options, options);               // 合并默认配置与用户配置
  }

  // 渲染图表主逻辑
  render() {
    if (!this.svg) return; // SVG未初始化则退出

    this.sortData(); // 排序数据
    const {data, header, headerHeight, theme, rowHeight} = this.options; // 解构配置选项

    createTooltip(this.dom, this.theme); // 创建tooltip组件

    // 创建虚拟列表
    this.virtualList = createVirtualList({
      data,                       // 数据源
      containerWidth: this.width, // 容器宽度
      rowHeight,                  // 行高度
      headerHeight,               // 首部高度
      theme,                      // 主题
      scrollCallback: () => ({    // 闭包获取scrollArea中的属性，需要时调用回调获取
        scrollY: this.scrollArea ? this.scrollArea.scrollY : 0, // 当前滚动位置
        viewHeight: this.height - headerHeight                  // 可视区域高度
      })
    });

    // 创建滚动区域
    this.scrollArea = createScrollArea(
      this.svg,         // 根SVG容器
      this.virtualList, // 虚拟列表实例
      this.width,       // 宽度
      this.height,      // 高度
      headerHeight      // 首部高度
    );

    // 渲染首部
    this.headerGroup = renderHeader(
      this.svg,         // 根SVG容器
      this.width,       // 宽度
      headerHeight,     // 首部高度
      header,           // 首部文本
      theme             // 主题
    );

    this.renderCallBack ? this.renderCallBack() : ''; // 执行渲染完成回调
  }

  // 设置渲染完成回调
  onRenderReady(callback) {
    this.renderCallBack = callback; // 保存回调函数引用
  }

  // 排序数据
  sortData() {
    const { data, sort } = this.options; // 解构数据和排序配置
    if (!sort || !data) return;          // 不排序或无数据则退出

    this.options.data = sortByAmount(data, sort); // 使用工具函数排序数据
  }

  // 刷新图表配置
  refresh(newOptions) {
    this.setSimpleOptions(newOptions); // 更新配置
    this.render();                     // 重新渲染
  }

  // 仅刷新数据
  refreshData(newData) {
    this.options.data = newData; // 更新数据源
    this.refresh(this.options);  // 触发刷新
  }

  // 卸载图表内容
  uninstall() {
    if (!this.svg) return this; // SVG未初始化则退出
    this.svg.innerHTML = '';    // 清空SVG内容
  }

  // 销毁图表
  destroy() {
    if (this.svg && this.dom) {
      this.dom.removeChild(this.svg); // 从DOM移除SVG
      this.uninstall();               // 卸载内容
      this.headerGroup = null         // 清除首部
      this.scrollableArea = null;     // 清除滚动区域
      this.svg = null;                // 清除SVG
      this.options = defaultOptions;  // 重置配置
    }
  }
}