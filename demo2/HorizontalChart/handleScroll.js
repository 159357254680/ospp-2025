// 导入创建SVG元素的工具函数
import { createSvgElement } from './utils.js';

/**
 * 滚动区域控制器类
 * 管理内容区域的滚动逻辑、滚动条显示及内容区域裁剪
 */
class ScrollArea {
  
  constructor(svg, virtualList, width, height, headerHeight) {
    this.svg = svg;                  // SVG容器元素
    this.virtualList = virtualList;  // 虚拟列表实例
    this.width = width;              // 容器区域总宽度
    this.height = height;            // 容器区域总高度
    this.headerHeight = headerHeight;// 首部高度
    this.scrollY = 0;                // 当前垂直滚动位置
    this.lastClientY = 0;            // 拖动时最后鼠标Y坐标
    this.isDragging = false;         // 是否正在拖动滚动条
    this.viewHeight = height - headerHeight; // 内容可视区域高度

    // 滚动条样式常量
    this.scrollOffset = 4;           // 滚动条偏移量
    this.scrollThumbTrackWidth = 12; // 滚动条轨道宽度

    this.init();         // 初始化DOM结构
    this.calcHeight();   // 计算内容高度和滚动条尺寸
    this.bindEvents();   // 绑定事件处理函数
  }

  init() {
    // 初始化虚拟列表可见范围
    this.virtualList.updateVisibleRange(0);

    // 创建裁剪路径，用于限制内容可视区域
    this.clipPath = createSvgElement('clipPath', { id: 'viewport' });
    this.clipRect = createSvgElement('rect', {
      x: '0',
      y: this.headerHeight,                           // 裁剪区域Y坐标（从首部下方开始）
      width: this.width - this.scrollThumbTrackWidth, // 裁剪宽度（减去滚动条宽度）
      height: this.viewHeight                         // 裁剪高度（内容可视区域）
    });
    this.clipPath.appendChild(this.clipRect);
    this.svg.appendChild(this.clipPath);

    // 创建滚动区域容器（应用裁剪路径）
    this.scrollArea = createSvgElement('g', {
      clipPath: 'url(#viewport)',          // 应用裁剪路径
      transform: `translate(0, 0)`         // 初始位置
    });

    // 创建内容组（用于实现滚动）
    this.contentGroup = createSvgElement('g', {
      id: 'content',
      transform: 'translate(0, 0)'         // 初始位置
    });
    this.contentGroup.appendChild(this.virtualList.getContainer());
    this.scrollArea.appendChild(this.contentGroup);

    // 创建滚动条背景
    this.scrollThumbBg = createSvgElement('rect', {
      x: this.width - this.scrollThumbTrackWidth - this.scrollOffset,
      y: this.headerHeight,
      width: this.scrollThumbTrackWidth + this.scrollOffset,
      height: this.viewHeight,
      fill: '#f0f0f0',
      rx: 6,
      ry: 6
    });
    this.scrollArea.appendChild(this.scrollThumbBg);

    // 创建滚动条轨道
    this.scrollThumbTrack = createSvgElement('rect', {
      x: this.width - this.scrollThumbTrackWidth - this.scrollOffset / 2,
      y: this.headerHeight + this.scrollOffset,
      width: this.scrollThumbTrackWidth,
      height: this.viewHeight - this.scrollOffset * 2,
      fill: '#e0e0e0',
      rx: 4,
      ry: 4
    });
    this.scrollArea.appendChild(this.scrollThumbTrack);

    // 创建滚动条滑块
    this.scrollThumb = createSvgElement('rect', {
      id: 'scrollThumb',
      x: this.width - this.scrollThumbTrackWidth - this.scrollOffset / 2,
      y: this.headerHeight,
      width: this.scrollThumbTrackWidth,
      fill: '#999',
      rx: 4, ry: 4,
      cursor: 'pointer'
    });

    // 滚动条滑块鼠标悬停效果
    this.scrollThumb.addEventListener('mouseover', () => {
      this.scrollThumb.setAttribute('fill', '#666');
    });
    this.scrollThumb.addEventListener('mouseout', () => {
      this.scrollThumb.setAttribute('fill', '#999');
    });
    this.scrollArea.appendChild(this.scrollThumb);

    // 将滚动区域添加到SVG容器
    this.svg.appendChild(this.scrollArea);
  }


  calcHeight() {
    // 获取虚拟列表内容总高度
    this.contentHeight = this.virtualList.getTotalHeight() || 0;
    // 计算最大滚动位置
    this.maxScrollY = Math.max(0, this.contentHeight - this.viewHeight);

    if(this.maxScrollY === 0) {
      this.scrollThumb.style.visibility = 'hidden'
      this.scrollThumbTrack.style.visibility = 'hidden'
      this.scrollThumbBg.style.visibility = 'hidden'
      return
    } //没有最大滚动高度时直接不计算返回

    // 计算滚动条滑块高度（最小30px，比例基于内容高度/可视高度）
    const scrollThumbHeight = Math.max(30, (this.viewHeight / this.contentHeight) * this.viewHeight);
    this.scrollThumb.setAttribute('height', scrollThumbHeight);
    // 计算滑块最大Y位置（轨道高度 - 滑块高度 - 滚动条轨道内边距 * 2（模拟上下边距））
    this.scrollThumbMaxY = this.viewHeight - scrollThumbHeight - this.scrollOffset * 2;

    // 更新视图显示
    this.updateView();
  }

  updateView() {
    // 平移内容组实现滚动效果
    this.contentGroup.setAttribute('transform', `translate(0, ${-this.scrollY})`);

    // 更新虚拟列表可见项范围
    this.virtualList.updateVisibleRange(this.scrollY);

    // 计算滚动条滑块位置（内容未超出时固定在顶部）
    const scrollThumbY = this.maxScrollY > 0 ? (this.scrollY / this.maxScrollY) * this.scrollThumbMaxY : 0;
    this.scrollThumb.setAttribute('y', this.headerHeight + this.scrollOffset + scrollThumbY);
  }

  bindEvents() {
    this.svg.addEventListener('wheel', this.handleWheel.bind(this)); // 鼠标滚轮事件
    this.scrollThumb.addEventListener('mousedown', this.startDrag.bind(this)); //鼠标拖动事件
    this.scrollThumbTrack.addEventListener('click', this.handleClickTrack.bind(this)); //滑轨点击事件
  }

  handleWheel(e) {
    e.preventDefault(); // 阻止默认滚动行为
    // 更新滚动位置（限制在0和maxScrollY之间）
    this.scrollY = this.clamp(this.scrollY + e.deltaY, 0, this.maxScrollY);
    this.updateView(); // 更新视图
  }


  startDrag(e) {
    e.preventDefault();
    this.isDragging = true;          // 标记为拖动中
    this.lastClientY = e.clientY;    // 记录初始鼠标位置
    // 绑定全局鼠标移动和释放事件
    window.addEventListener('mousemove', this.onDrag.bind(this));
    window.addEventListener('mouseup', this.stopDrag.bind(this));
  }

  onDrag(e) {
    if (!this.isDragging) return; // 非拖动状态直接返回

    // 计算鼠标移动距离
    const dy = e.clientY - this.lastClientY;
    this.lastClientY = e.clientY; // 更新最后鼠标位置

    // 计算当前滑块位置和新位置
    const currentscrollThumbY = parseFloat(this.scrollThumb.getAttribute('y')) - this.headerHeight - this.scrollOffset;
    const newscrollThumbY = this.clamp(currentscrollThumbY + dy, 0, this.scrollThumbMaxY);

    // 根据滑块位置计算滚动位置
    this.scrollY = (newscrollThumbY / this.scrollThumbMaxY) * this.maxScrollY;
    this.updateView(); // 更新视图
  }

  stopDrag() {
    this.isDragging = false; // 清除拖动状态
    // 移除全局事件监听
    window.removeEventListener('mousemove', this.onDrag.bind(this));
    window.removeEventListener('mouseup', this.stopDrag.bind(this));
  }

  handleClickTrack(e) {
    // 获取轨道元素位置信息
    const trackRect = this.scrollThumbTrack.getBoundingClientRect();
    // 计算点击位置在轨道中的比例
    const clickY = e.clientY - trackRect.top;
    const trackClickRatio = Math.max(0, Math.min(1, clickY / trackRect.height));

    // 根据点击比例设置滚动位置
    this.scrollY = trackClickRatio * this.maxScrollY;
    this.updateView(); // 更新视图
  }

  // 限制数据范围
  clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

}

export function createScrollArea(svg, virtualList, width, height, headerHeight) {
  return new ScrollArea(svg, virtualList, width, height, headerHeight);
}