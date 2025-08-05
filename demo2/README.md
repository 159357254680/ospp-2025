# HorizontalChart

## 使用

```javascript
// 引入图表库
import HorizontalChart from './HorizontalChart/index.js';

// 创建并获取图表容器
<div id="main" style="width: 600px;height:400px;"></div>
let chartContainerDom = document.getElementById('main');

// 创建图表实例
const chart = new HorizontalChart();

// 初始化图表容器
chartIns.init(chartContainerDom);

// 填入图表配置项
let chartOption = {...};
/* 可配置项：
    const chartConfig = {
        type: 'svg', // 当前图表的渲染模式，可选svg或者canvas，默认为svg
        sort: null, // 是否为data排序，可选为'asc','desc'和null, 默认为null
        header: ['名称', '金额', '贡献度'], // 图表的头部信息，共有三种信息可传入，默认['名称', '金额', '贡献度']
        theme: 'hdesign-light', // 图表的主题颜色，可选'hdesign-light'或'hdesign-dark',默认为'hdesign-light'
        data: [
            {
                name: '项目A',              // 进度条表示的名称，必选
                amount: 5000,               // 进度条表示的数值，必选
                percent: 0.25,              // 进度条表示的百分比，必选
                color: '#4caf50',         // 进度条的颜色，可选
                content: '详细描述信息A'     // 进度条的tooltip信息，可选
            },
        ]
}
*/

// 传入配置项
chart.setSimpleOptions(chartOption);

//开始渲染
chart.render()
```

## API
``` javascript
1. init(dom)
//传入容器dom，并在 dom 内创建一个 <svg>，并根据容器大小初始化 width、height

2. setSimpleOptions(options)
// 传入配置项options，对比默认配置合并，再赋给实例的 options

3. render()
/*
    调用 uninstall() 清空上一次渲染内容 
    然后调用renderHeader()和createScrollArea()分别生成header和rows并插入svg中
    渲染完成后会触发一次onRenderReady注册的回调
*/

4. onRenderReady(callback)
// 注册一个回调函数，该函数会在render结束后执行

5. refresh(newOptions)
//图表刷新，包括配置和数据

6. refreshData(newData)
//图表刷新，仅刷新数据

7. uninstall()
// 清空svg内部的子节点，但保留svg本身

8. destroy()
// 卸载整个图表

```