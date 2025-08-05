// 导入工具函数：创建SVG元素、排序、文本省略处理、x轴位置计算
import { 
  createSvgElement, 
  setEllipsisWithTooltip, 
  calcColumnX 
} from './utils.js';

// 导入tooltip显示控制函数
import {show, hide} from './handleTooltip.js'

export class ContentRow {

  constructor(options) {
    const {data, index, rowWidth, rowHeight, theme} = options
    this.data = data;                            // 行数据
    this.index = index;                          // 行索引
    this.rowWidth = rowWidth;                    // 行宽度
    this.rowHeight = rowHeight;                  // 行高度
    this.theme = theme || 'hdesign-light';       // 主题
    this.isDark = this.theme === 'hdesign-dark'; // 是否为深色主题

    this.init(); // 初始化布局参数
  }

 
  init() {
    // 暂时用rowHeight做自适应处理
    this.padding = 24;                                        // 内边距
    this.textBaselineY = this.rowHeight * 0.4;                // 文本基线Y坐标
    this.rankBgSize = this.rowHeight * 0.33;                  // 排名背景尺寸
    this.rankBgRadius = this.rankBgSize * 0.3;                // 排名背景圆角
    this.rankTextOffset = this.rowHeight * 0.15;              // 排名文本偏移量
    this.textSize = this.rowHeight * 0.27;                    // 文本字号
    this.rankSize = this.rowHeight * 0.2;                     // 排名数字字号
    this.progressWidth = this.rowWidth - 2 * this.padding;    // 进度条宽度
    this.progressHeight = Math.max(6, this.rowHeight * 0.25); // 进度条高度（最小4px）

    // flex比例
    const textScale = [5, 1, 1];
    // 计算row信息X坐标
    this.columnX = calcColumnX(textScale, this.rowWidth, this.padding);
  }

  render() {
    // 创建行容器组
    this.row = createSvgElement('g', {
      style: `
        transform: translate(0, ${this.index * this.rowHeight}px);
        transition: transform 0.5s ease;
        transform-box: fill-box;
        transform-origin: 0 0;
      `
    });

    // 创建行背景矩形
    const rowBg = createSvgElement('rect', {
      x: '0',
      y: '0',
      width: '100%',
      height: this.rowHeight,
      fill: this.isDark ? '#2d2d2d' : '#ffffff'
    });
    this.row.appendChild(rowBg);

    this.renderRank();        // 渲染排名
    this.renderName();        // 渲染名称
    this.renderAmount();      // 渲染数值
    this.renderPercent();     // 渲染百分比
    this.renderProgressBar(); // 渲染进度条

    return this.row; // 返回完整行元素
  }

  renderRank() {
    // 创建排名背景圆形
    const rankBg = createSvgElement('rect', {
      x: this.columnX[0],
      y: this.textBaselineY - this.rankBgSize / 2 - this.rankTextOffset,
      width: this.rankBgSize,
      height: this.rankBgSize,
      rx: this.rankBgRadius,
      ry: this.rankBgRadius,
      fill: getRankColor(this.index + 1) // 获取排名对应的颜色
    });
    this.row.appendChild(rankBg);

    // 创建排名数字文本
    const rankText = createSvgElement('text', {
      x: this.columnX[0] + this.rankBgSize / 2,
      y: this.textBaselineY - this.rankTextOffset / 2,
      'font-size': this.rankSize,
      'font-weight': 'bold',
      fill: '#fff',
      'text-anchor': 'middle',
    });
    rankText.textContent = `${this.index + 1}`;
    this.row.appendChild(rankText);
  }


  renderName() {
    const nameText = createSvgElement('text', {
      x: this.padding + this.rankBgSize + this.rowHeight * 0.08,
      y: this.textBaselineY,
      'font-size': this.textSize,
      'font-weight': '500',
      fill: this.isDark ? '#e0e0e0' : '#333',
      'text-anchor': 'start',
    });
    // 设置文本省略和tooltip（最多显示8个字符）
    setEllipsisWithTooltip(nameText, this.data.name || '', 8);
    this.row.appendChild(nameText);
  }


  renderAmount() {
    const amountText = createSvgElement('text', {
      x: this.columnX[1],
      y: this.textBaselineY,
      'font-size': this.textSize,
      'font-weight': 'bold',
      'text-anchor': 'start',
      fill: this.isDark ? '#ffffff' : '#2d2d2d'
    });
    amountText.textContent = this.data.amount;
    this.row.appendChild(amountText);
  }


  renderPercent() {
    const percentText = createSvgElement('text', {
      x: this.columnX[2],
      y: this.textBaselineY,
      'font-size': this.textSize,
      'font-weight': 'bold',
      'text-anchor': 'start',
      fill: this.isDark ? '#ffffff' : '#2d2d2d'
    });
    percentText.textContent = `${this.data.percent}%`;
    this.row.appendChild(percentText);
  }


  renderProgressBar() {
    // 创建进度条背景
    const ProgressBg = createSvgElement('rect', {
      x: this.padding,
      y: this.rowHeight * 0.55,
      width: this.progressWidth,
      height: this.progressHeight,
      rx: '8',
      ry: '8',
      fill: this.isDark ? '#444444' : '#f0f0f0'
    });
    this.row.appendChild(ProgressBg);

    // 创建进度条
    const progressBar = createSvgElement('rect', {
      x: this.padding,
      y: this.rowHeight * 0.55,
      width: '0', 
      height: this.progressHeight,
      rx: '8',
      ry: '8',
      fill: this.data.color || '#1977fbff'
    });

    // 创建进度条动画（从0到目标宽度的过渡效果）
    const animate = createSvgElement('animate', {
      attributeName: 'width',
      from:           '0',
      to:             this.progressWidth * ((this.data.percent || 0) / 100), // 目标宽度=总宽度*百分比
      dur:            '1s',           // 动画持续时间
      fill:           'freeze',       // 动画结束后保持最终状态
      calcMode:       'spline',       // 使用样条曲线缓动
      keyTimes:       '0;1',
      keySplines:     '0.42 0 0.58 1' // 缓动函数参数
    });

    progressBar.appendChild(animate);
    this.row.appendChild(progressBar);

    // 启动动画
    animate.beginElement();

    // 如果有详细内容，绑定tooltip显示事件
    if (this.data.content) {
      progressBar.addEventListener('mouseover', () => show(this.data)); // 鼠标悬停显示tooltip
      progressBar.addEventListener('mouseout',  () => hide());          // 鼠标离开隐藏tooltip
    }
  }
}


// 获取排名对应的颜色
function getRankColor(rank) {
  const rankColors = {
    1: '#e74c3c',  // 第1名：红色
    2: '#ffa600',  // 第2名：橙色
    3: '#FFD700',  // 第3名：金色
  };
  return rankColors[rank] || '#cacaca'; // 默认：浅灰色
}
