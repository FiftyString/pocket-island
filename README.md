# 口袋小岛 V0.1

当前独立项目位于 `/workspace/pocket-island`，正在进行 V0.2 发布准备。原始 V0.1 已保留为本地 `v0.1.0` 标签。**尚未发布公网版本。** 发布操作、Git 边界及 iPhone Safari 真机验收清单见 [发布准备记录](docs/RELEASE.md)。

治愈系离线合成小游戏，Vite + TypeScript + Phaser。无服务器、账户、广告、付费服务或 AI API。七级地块由 Phaser Graphics 原创绘制，音效由 Web Audio 实时合成，无外部字体或资源请求。

## 启动

建议 Node.js 22，首次安装需要网络：

```bash
npm install
npm run dev
npm test
npm run build
npm run preview
```

开发地址以终端输出为准，通常为 http://localhost:5173；生产预览通常为 http://localhost:4173。部署或预览必须使用 HTTP/HTTPS，不直接打开 dist/index.html。`package-lock.json` 已锁定依赖，CI 使用 `npm ci`。

## 玩法

- 空白 6×6 棋盘，点击空格放置下一块；草地、花田、树林概率为 75%、20%、5%。配置在 `TileGenerator` 的默认 weights 中。
- 仅上下左右同级连通，至少三块整体合成；结果固定在最后落点，其他参与格清空，然后继续判断连锁。
- 草地 → 花田 → 树林 → 木屋 → 村庄 → 城堡 → 奇迹之塔；Lv7 不再合成。
- 每次合成得分 `(参与数 − 1) × 10 × 2^(结果等级 − 2) × 本次放置内连锁次数`。
- 合成完全结算后检查满盘。每局一次撤销，恢复棋盘、分数、下一块、随机数状态及结束状态；撤销额度永不恢复，结束页也可使用。
- 历史纪录是已达成分数的最大值，撤销不降低历史纪录，也不会重复累加得分。

## 界面与存档

包含主菜单、首次教学、玩法图鉴、暂停/设置、重新开始确认和结束页。支持鼠标、触摸及键盘辅助棋盘；提供放置弹性缩放、合成粒子、连锁文字、分数跳动和结束动画。系统低动态效果偏好优先，也可手动减少动态。

每步操作自动写入 localStorage，保存版本号、完整局面、撤销快照及额度、最高分、教学和设置。损坏 JSON/不支持版本恢复默认；非法局面被丢弃但保留合法设置与纪录。存储被浏览器禁用时提示并在内存中继续游戏。在 pagehide 或切换后台时再次保存（浏览器强制结束进程不保证触发生命周期事件）。

## 离线 PWA

`npm run build` 在构建完成后自动生成带内容哈希版本的 Service Worker，并预缓存全部本地构建资源。首次在线打开生产站点且缓存完成后，可断网刷新或再次打开。开发模式不注册 Service Worker。支持相对路径，适用于仓库子目录。iPhone Safari 可通过“分享 → 添加到主屏幕”安装。浏览器可能清理站点缓存/存储；离线缓存并不是永久备份。

## GitHub Pages

1. 将项目推送到 GitHub 仓库的 `main` 分支。
2. 仓库 Settings → Pages → Build and deployment → Source 选择 **GitHub Actions**。
3. 自带 `.github/workflows/pages.yml` 会安装依赖、运行测试、构建并发布 `dist`。
4. 在 Actions 查看部署地址，通常是 `https://用户名.github.io/仓库名/`。如果默认分支不是 main，请修改 workflow 分支。

Vite 使用 `base: './'`，manifest、Service Worker、预缓存 URL 均为相对路径，无需写死仓库名。也可将 `dist` 整体托管到其他 HTTPS 静态站点。

## 文件结构

```text
src/core/game.ts         状态、棋盘、合成引擎、可序列化随机数与撤销
src/core/save.ts         版本化存档、校验与存储故障处理
src/core/game.test.ts    18 项核心规则与存档测试
src/core/storage.test.ts  2 项浏览器存储失败与恢复测试
src/render/art.ts        七级原创地块绘制
src/render/IslandScene.ts Phaser 棋盘、触摸交互与动画
src/main.ts             主菜单、教学、设置、结束页与生命周期
src/audio.ts            Web Audio 合成音效
src/style.css           移动端适配、安全区域与低动态效果
public/                 本地图标与 PWA manifest
scripts/offline.mjs      根据构建产物生成离线预缓存
.github/workflows/      GitHub Pages 自动发布
```

## 验证和限制

实际运行结果：`npm test` 20/20 通过（独立目录）；`npm run build` 通过（含 TypeScript 检查）。Chromium 390×844 手机视口实测落子、撤销、静音设置、断网刷新与存档恢复通过，无页面运行错误；根路径与 `/pocket-island/` 子路径均通过。另保存了手机和桌面截图 `screenshot-mobile.png`、`screenshot-desktop.png`。浏览器测试工具临时安装在工作区外，未增加项目运行依赖。未在 iPhone Safari 真机运行测试。

`npm test` 覆盖四向连通、对角线隔离、2/3/4+块、不同等级、连锁与分数、最高等级、满盘与满盘触发合成、无效输入、随机配置、撤销一致性、结束后撤销、存档恢复及非法数据。

V0.1 使用单一存档槽；不提供跨设备同步。动效表现为最终合成结果和连锁提示，不逐级播放中间棋盘。初始资源包含 Phaser，构建 JS 约 1.5 MB（gzip 约 347 KB）。界面针对手机竖屏及桌面设计，极矮窗口可滚动页面，棋盘触摸不会带动页面。iOS 真机兼容性仍需在目标设备验证。
