# RPGMakerGameSpeedAccelerator

本项目支持 RPG Maker MV 和 RPG Maker MZ 框架变速功能

| 快捷键    | 功能        |
| --------- | ----------- |
| shift + z | 重置为 1.0x |
| shift + x | 减速        |
| shift + c | 加速        |

## 安装

### 自动安装

1. 下载本项目
2. 运行 `install.bat` 按提示操作

### 手动安装

1. 找到 `plugins.js` 文件，将 json 复制到最后一行

```
// 插入到最后一个位置
// 下一行行首有一个英文逗号，需要复制进去。如果运行不了，可以去掉逗号再重试一遍
,{
  "name": "GameSpeedAccelerator",
  "status": true,
  "description": "",
  "parameters": {
    "defaultSpeed": "1.0", // 默认速度
    "speedStep": "0.5", // 每次加减速度步长
  }
}
```

完成后文件大概长这样

```
var $plugins =
[
  {},
  {},
  // 插入这里
]
```

2. 下载 `GameSpeedAccelerator.js` 文件，复制到 `plugins` 文件夹里
3. 打开游戏使用快捷键变速
