# UIReview 源代码

## 目录

- `UIReview-extension/`：Chrome Manifest V3 插件源码

## 加载浏览器插件

1. 打开 `chrome://extensions`。
2. 开启“开发者模式”。
3. 点击“加载已解压的扩展程序”。
4. 选择 `UIReview-extension` 文件夹。

## 连接飞书

1. 首次安装会自动打开 UIReview 设置页。
2. 填入当前用户自己的飞书自建应用 App ID 和 App Secret。
3. 点击“保存并测试连接”，成功后即可关闭设置页开始使用。

新版扩展直接从后台服务工作线程访问飞书开放平台，不需要 Node.js、本地服务或 Bridge。凭证仅保存在当前 Chrome 的扩展本地存储中，不会打包进插件，也不会暴露给被检查的网页。

## 源码说明

- `content.js`：检查、文本样式、间距、标尺、吸管、截图、箭头和画笔标注等页面交互。
- `background.js`：扩展快捷键、截图、受保护的本地配置以及飞书请求入口。
- `feishu-client.js`：飞书认证、文档/表格验证和反馈写入。
- `manifest.json`：Chrome 扩展配置。

Chrome 商店上传包只包含 `UIReview-extension/`，不包含旧版服务、`.env` 或任何飞书密钥。
