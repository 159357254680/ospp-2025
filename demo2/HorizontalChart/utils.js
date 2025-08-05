import { show, hide } from "./handleTooltip.js";

// 创建SVG元素并设置属性
export const createSvgElement = (tag, attrs = {}) => {
  const element = document.createElementNS('http://www.w3.org/2000/svg', tag);
  Object.entries(attrs).forEach(([key, value]) => {
    if (value) {
      element.setAttribute(key, value);
    }
  });
  return element;
}

// 判断值是否为纯对象
const isObject = (value) => {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

// 判断值是否为数组
const isArray = (value) => {
  return Array.isArray(value);
}

// 合并两个对象
export function merge(target, task) { 
    if (target === undefined) { target = task; return target; } // 如果目标未定义,直接使用源对象
    if (isObject(task)) { // 如果源是对象
        for (const key in task) { 
            if (target[key] === undefined || target[key] === null) { 
                target[key] = task[key]; // 目标属性不存在时直接赋值
            } else if (isObject(task[key]) && !isArray(task[key])) { 
                merge(target[key], task[key]); // 递归合并嵌套对象
            } else { 
                target[key] = task[key]; // 覆盖基本类型属性
            } 
        } 
    } 
    return target; // 返回合并后的对象
} 

// 模拟flex计算列的X轴位置
export function calcColumnX(flexs, totalWidth, padding) { 
  // flexs: 弹性系数数组, totalWidth: 容器的总宽度, padding: 内边距
    const sum = flexs.reduce((s, f) => s + f, 0); // 计算flex系数总和
    let offset = 0;
    return flexs.map(f => {
      const x = offset + padding;
      offset += (f / sum) * totalWidth;
      return x;  //根据flex比例计算在实际宽度下的x坐标，用于header和row的信息对齐
    });
}

// 为文本元素设置省略号并添加tooltip
export function setEllipsisWithTooltip(textElement, text, maxLength) { 
    if (text.length <= maxLength) {
      textElement.textContent = text;
      return; // 如果没有达到最大长度直接返回
    }
    else { 
        const truncatedText = text.slice(0, maxLength) + '...'; // 截断文本并添加省略号
        textElement.innerHTML = truncatedText; 
        textElement.addEventListener('mouseover', () => show({ content: text })); // 鼠标悬停显示完整文本
        textElement.addEventListener('mouseout', hide); // 鼠标移出隐藏提示
    } 
}

// 使用归并排序按数量对数据进行排序
export function sortByAmount(data, type) { 
    if (data.length <= 1) return data; // 空数组或单元素数组直接返回
    const mid = Math.floor(data.length / 2); // 从中间开始
    const left = sortByAmount(data.slice(0, mid), type); // 排序左半部分
    const right = sortByAmount(data.slice(mid), type); // 排序右半部分
    return mergeSortedArrays(left, right, type); // 合并排序结果
}

// 合并两个已排序的数组
function mergeSortedArrays(left, right, type) { 
    // left为左边已排序的数组， right为右边已排序的数组，type为升序或者降序(对于null在调用是已检测)
    const result = []; 
    let leftIndex = 0, rightIndex = 0; 
    while (leftIndex < left.length && rightIndex < right.length) { 
        const leftAmount = left[leftIndex].amount; 
        const rightAmount = right[rightIndex].amount; 
        if ((type === 'asc' && leftAmount < rightAmount) || 
            (type === 'desc' && leftAmount > rightAmount)) { 
            result.push(left[leftIndex++]); 
        } else { 
            result.push(right[rightIndex++]); 
        } 
    } 
    return result.concat(left.slice(leftIndex)).concat(right.slice(rightIndex)); // 拼接剩余元素
}
