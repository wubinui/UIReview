# UIReview

UIReview 是一个面向设计验收的 Chrome 浏览器插件。它可以检查网页元素、查看布局和文字样式、测量元素间距，并把截图反馈直接发送到飞书文档或电子表格。

当前版本：**1.0.0**

## 特性

- 元素检查：查看元素尺寸、布局、间距和父级关系
- 文本检查：查看文字颜色、字号、字重、行高、圆角、背景和透明度
- 间距测量：按住 `Alt` 查看元素之间的距离
- 像素标尺：在页面顶部和左侧显示像素坐标
- X-ray 模式：快速查看页面结构层级
- 吸管取色：获取颜色的 HEX 和 RGB 值，并一键复制 HEX
- 截图反馈：自定义区域截图，支持画笔、箭头、矩形、圆形和撤回
- 飞书同步：将截图、问题描述和页面信息发送到飞书文档或电子表格
- 完全本地配置：不需要 Node.js、本地服务或 Bridge，凭证只保存在 Chrome 扩展存储中

## 安装

### 从 Chrome 网上应用店安装

安装后点击浏览器工具栏中的 UIReview 图标，首次使用会自动打开设置页。

### 从源码加载

1. 下载或克隆本仓库。
2. 打开 Chrome 的 `chrome://extensions`。
3. 开启右上角的“开发者模式”。
4. 点击“加载已解压的扩展程序”。
5. 选择仓库中的 `UIReview-extension/` 文件夹。

插件默认不会自动显示。安装完成后，点击工具栏中的 UIReview 图标，或使用快捷键打开。

## 连接飞书

每位用户都需要使用自己的飞书/Lark 自建应用：

1. 在[飞书开放平台](https://open.feishu.cn/app)创建企业自建应用。
2. 为应用申请云文档、电子表格、云盘媒体和 Wiki 读取等所需权限，并发布应用版本。
3. 打开 UIReview 设置页，填写 App ID 和 App Secret，点击 **Continue**。
4. 在反馈窗口中添加目标飞书文档或电子表格链接，并确保应用拥有可编辑权限。

UIReview 直接通过 Chrome 扩展后台工作线程访问飞书开放平台，不使用开发者服务器。App ID、App Secret 和文档选择只保存在当前浏览器的扩展本地存储中，不会注入网页，也不会提交到本仓库。

## 基本操作

打开 UIReview 后，使用浮动工具栏选择功能。工具栏支持拖动，工具按钮悬停时会显示英文名称和快捷键。

| 功能 | 快捷键 | 说明 |
| --- | --- | --- |
| Inspect | `I` | 检查网页元素和布局信息 |
| Typography | `T` | 检查文本样式 |
| Rulers | `R` | 显示顶部和左侧像素标尺 |
| Eyedropper | `P` | 使用浏览器原生吸管取色 |
| X-ray | `X` | 查看页面结构层级 |
| Screenshot Feedback | `C` | 截取区域并填写反馈 |
| Settings | `S` | 打开 UIReview 设置 |
| Close | `Esc` | 关闭当前工具或反馈窗口 |

在 Inspect 模式下，点击元素可以固定选中状态；按住 `Alt` 并移动鼠标，可以查看与其他元素的间距。点击 Screenshot Feedback 后拖动选择区域，松开鼠标会立即打开反馈窗口，无需再次确认。

## 截图反馈

截图窗口支持：

- 自定义区域截取和重新截取
- 画笔、箭头、矩形框选、圆形框选
- `Undo` 或 `Ctrl/Cmd + Z` 撤回标注
- 选择目标飞书文档或电子表格
- 输入问题描述和备注后发送

发送后，反馈会在后台提交，截图工具不会退出，可以继续截取下一条问题。

## 目录结构

```text
UIReview/
├── UIReview-extension/       # Chrome Manifest V3 插件源码
│   ├── manifest.json          # 扩展配置和权限
│   ├── content.js             # 检查、测量、截图和反馈交互
│   ├── background.js          # Service Worker 和飞书请求入口
│   ├── feishu-client.js       # 飞书认证、文档/表格验证和写入
│   ├── options.html            # 设置页
│   └── assets/                # Logo 和扩展图标
└── UIReview-SOURCE-README.md  # 源码加载简要说明
```

仓库只包含浏览器插件源码，不包含 Node.js 本地服务、安装包、`.env` 文件或任何飞书密钥。

## 隐私与安全

请查看 [`UIReview-extension/PRIVACY.md`](UIReview-extension/PRIVACY.md)。UIReview 不运营中间服务器，飞书请求由扩展后台直接发出；被检查网页无法读取扩展保存的凭证。

## 开发与检查

本项目使用原生 HTML、CSS 和 JavaScript，不需要构建步骤。修改后可以在 `chrome://extensions` 点击扩展的刷新按钮加载最新代码。

提交前可运行：

```bash
node --check UIReview-extension/content.js
node --check UIReview-extension/background.js
node --check UIReview-extension/feishu-client.js
node --check UIReview-extension/options.js
```

## License

项目许可证和发布信息以仓库后续补充的 License 文件为准。
