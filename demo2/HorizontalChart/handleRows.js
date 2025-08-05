// 导入SVG元素创建函数
import { createSvgElement } from './utils.js'; 
// 导入行内容渲染类
import { ContentRow } from './handleRow.js'; 



class VirtualList { 

  constructor(options) { 
    // 解构配置参数
    const { data, containerWidth, rowHeight, headerHeight, theme, scrollCallback }= options; 
    this.data = data;                     // 完整数据数组
    this.containerWidth = containerWidth; // 容器宽度
    this.rowHeight = rowHeight;           // 行高度
    this.headerHeight = headerHeight;     // 首部高度
    this.theme = theme;                   // 主题
    this.scrollCallback = scrollCallback; // 回调函数
    this.visibleRows = new Map();         // 缓存可见行元素的Map
    this.startIndex = 0;                  // 当前可见起始索引
    this.endIndex = 0;                    // 当前可见结束索引
    this.visibleCount = 0;                // 可见行数量
    this.totalHeight = 0;                 // 总内容高度

    this.init(); // 初始化
  }


  init() { 
    // 创建容器元素
    this.container = createSvgElement('g', { 
      transform: `translate(0, ${this.headerHeight})` 
    }); 

    // 计算总内容高度（数据行数 × 行高度）
    this.totalHeight = this.data.length * this.rowHeight; 
    // 计算可见行数量：可视区域高度/行高度 + 4（额外渲染4行作为缓冲）
    this.visibleCount = Math.ceil(this.scrollCallback().viewHeight / this.rowHeight) + 4; 
  }



  updateVisibleRange(scrollY) { 
    // 计算新的起始索引
    const newStart = Math.max(0, Math.floor(scrollY / this.rowHeight)); 
    // 计算新的结束索引
    const newEnd = Math.min( 
      this.data.length, 
      newStart + this.visibleCount 
    ); 

    // 只有当可见范围变化时才重新渲染
    if (newStart !== this.startIndex || newEnd !== this.endIndex) { 
      this.startIndex = newStart; 
      this.endIndex = newEnd; 
      this.renderVisibleRows(); // 渲染可见行
    } 
  }


  renderVisibleRows() { 
    // 遍历可见行索引范围
    for (let i = this.startIndex; i < this.endIndex; i++) { 
      // 如果该行尚未创建，则创建并添加到容器
      if (!this.visibleRows.has(i)) { 
        // 创建行内容实例
        const row = new ContentRow({ 
          data: this.data[i],            // 行数据
          index: i,                      // 行索引
          rowWidth: this.containerWidth, // 行宽度
          rowHeight: this.rowHeight,     // 行高度
          theme: this.theme              // 主题
        }); 
        // 缓存渲染后的行元素
        this.visibleRows.set(i, row.render()); 
        // 添加到容器
        this.container.appendChild(this.visibleRows.get(i)); 
      } 
    } 
  }


// 获取容器元素
  getContainer() { 
    return this.container; 
  }


// 获取总内容高度
  getTotalHeight() { 
    return this.totalHeight; 
  }


} 

export function createVirtualList(options) { 
  return new VirtualList(options); 
} 