// 全局tooltip单例实例存储
let tooltip = null;


class Tooltip {
  // 构造函数：初始化tooltip配置
  constructor(dom, theme) {
    this.dom = dom;                              // 容器DOM元素
    this.theme = theme;                          // 主题
    this.isDark = this.theme === 'hdesign-dark'; // 是否为深色主题
    this.offset = 10;                            // 鼠标偏移量（px）
    this.tooltip = null;                         // tooltip元素引用

    this.createTooltip();                        // 创建tooltip元素
    this.bindMouseMove();                        // 绑定鼠标移动事件
  }

  // 创建tooltip div元素
  createTooltip() {
    if (this.tooltip) return;                          // 已有则返回

    this.tooltip = document.createElement('div');      // 创建div元素
    this.tooltip.style.cssText = this.getBaseStyles(); // 设置基础样式
    this.dom.appendChild(this.tooltip);                // 挂载到容器
  }

  // 获取基础样式字符
  getBaseStyles() {
    return `
      position: fixed;
      z-index: 9999; 
      padding: 8px 12px; 
      background-color: ${this.isDark ? '#3d3d3d' : '#ffffff'}; 
      color: ${this.isDark ? '#ffffff' : '#333333'}; 
      border: 1px solid ${this.isDark ? '#555' : '#e5e6eb'}; 
      border-radius: 6px; 
      border-color: ${this.isDark ? '#555555' : '#e5e6eb'};
      box-shadow: ${this.isDark
        ? '0 4px 16px rgba(0,0,0,0.3)' 
        : '0 4px 16px rgba(0,0,0,0.15), 0 1.5px 6px rgba(0,0,0,0.08)'}; 
      font-size: 15px; 
      font-weight: bold; 
      pointer-events: none; 
      white-space: nowrap; 
      transition: left 0.15s, top 0.15s, opacity 0.15s; 
      line-height: 1.6; 
      opacity: 0; 
    `;
  }

  // 绑定鼠标移动事件，处理tooltip跟随
  bindMouseMove() {
    // 获取容器边界信息
    const { left: domLeft, top: domTop, width: domWidth, height: domHeight } = this.dom.getBoundingClientRect();
    const maxX = domLeft + domWidth; // 容器右边界
    const maxY = domTop + domHeight; // 容器下边界
    let left; // tooltip的left坐标
    let top;  // tooltip的top坐标

    // 监听鼠标移动事件
    this.dom.addEventListener('mousemove', (e) => {
      if (!this.tooltip) return; // tooltip未创建则退出
      // 获取tooltip尺寸
      const { width: tooltipWidth, height: tooltipHeight} = this.tooltip.getBoundingClientRect();

      left = e.clientX + this.offset; // 基础left位置
      top = e.clientY + this.offset;  // 基础top位置

      // 如果超出容器，向左调整
      if(left + tooltipWidth >= maxX) {
        left = e.clientX - tooltipWidth - this.offset;
      }
      // 如果超出容器，向上调整
      if(top + tooltipHeight >= maxY) {
        top = e.clientY - tooltipHeight - this.offset;
      }

      this.tooltip.style.left = `${left}px`; // 设置最终left
      this.tooltip.style.top = `${top}px`; // 设置最终top
    });
  }

  // 渲染tooltip内容
  renderContent(data) {
    const contentColor = this.isDark ? '#fff' : '#333'; // 内容颜色
    const { icon, content, unit } = data;               // 解构数据：图标、内容、单位

    // 图标HTML片段
    const iconStr = icon ? `<img src="${icon}" style="width:16px;height:16px;">` : '';
    const unitStr = unit ? `<span style="margin-left:4px;">${unit}</span>` : '';

    return `
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px">
        <div style="display:flex;gap:4px;align-items:center;">
          ${iconStr}
        </div>
        <div style="display:flex;">
          <span style="font-weight:bold;color:${contentColor};">${content}</span>
          ${unitStr}
        </div>
      </div>
    `;
  }

  // 显示tooltip
  show(data) {
    if (!tooltip) return;
    this.tooltip.innerHTML = this.renderContent(data);
    this.tooltip.style.opacity = 1;
  }

  // 隐藏tooltip
  hide() {
    if (!this.tooltip) return
    this.tooltip.style.opacity = 0;
  }

}

export function createTooltip(dom, theme) {
  if (!tooltip) {
    tooltip = new Tooltip(dom, theme);
  }
  return tooltip;
}

export function show(data) {
    tooltip?.show(data)
  }


export function hide() {
    tooltip?.hide()
}