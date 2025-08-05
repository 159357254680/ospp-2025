// 导入SVG元素创建函数、计算x轴位置函数
import { createSvgElement, calcColumnX } from './utils.js';

class HeaderRow { 
  constructor({headerFields, headerWidth, headerHeight, theme}) { 
    this.headerFields = headerFields;  // 首部字段文本数组
    this.headerWidth = headerWidth;    // 首部宽度
    this.headerHeight = headerHeight;  // 首部高度
    this.padding = 24;                 // 内边距

    this.textScale = [5, 1, 1];        // flex比例
    // 计算各列X坐标
    this.columnX = calcColumnX(this.textScale, this.headerWidth, this.padding);
    this.theme = theme || 'hdesign-light';       // 主题
    this.isDark = this.theme === 'hdesign-dark'; // 是否为深色
  }

  render() { 
    // 创建首部容器组
    this.headerRow = createSvgElement('g');

    this.renderBg();   // 渲染首部背景
    this.renderText(); // 渲染首部文本

    return this.headerRow;
  }

  renderBg() { 
    const headerBg = createSvgElement('rect', {
      width: this.headerWidth,
      height: this.headerHeight,
      fill: this.isDark ? '#2d2d2d' : '#f5f6fa',
    });
    this.headerRow.appendChild(headerBg);
  }

  renderText() { 
    // 计算文本大小
    const textSize = Math.max(12, this.headerHeight * 0.4);
    // 创建文本容器组
    const textContainer = createSvgElement('g', {
      transform: `translate(0, ${this.headerHeight * 0.65})`
    });
    this.headerRow.appendChild(textContainer);

    this.headerFields.forEach((text, index) => {
      const content = createSvgElement('text', {
        x: this.columnX[index],
        'font-size': textSize,
        'font-weight': 'bold',
        fill: this.isDark ? '#e0e0e0' : '#333'
      });
      content.textContent = text;
      textContainer.appendChild(content);
    });
  }

}

export function renderHeader(svg, containerWidth, containerHeight, headerFields, theme) { 
  // 创建首部实例
  const header = new HeaderRow({
    headerFields,
    headerWidth: containerWidth,
    headerHeight: containerHeight,
    theme
  });

  // 渲染首部并添加到SVG容器
  const headerGroup = header.render();
  svg.appendChild(headerGroup);
  return headerGroup; // 返回首部组元素
}

