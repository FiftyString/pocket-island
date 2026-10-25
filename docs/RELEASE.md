# V0.2 发布准备记录

本阶段只做独立项目整理、兼容性修复与发布验证，不新增大型玩法。应用版本仍为 0.1.0；尚未创建 V0.2 发布标签。

## 文件保护与 Git 边界

- 原始目录 `/workspace` 的 Git 命令返回“not a git repository”；存在只读 `.git` 目录，但没有可用仓库根目录或远端信息。
- 只复制游戏的 24 个明确文件到 `/workspace/pocket-island`，未复制其他项目、凭据目录、node_modules 或 dist。
- 在独立目录初始化本地 `main` 分支。`v0.1.0` 指向原始源码基线提交 `6b623b6`；逐文件字节对比确认这 24 个基线文件与原目录一致。
- 发布准备修改位于标签之后的提交，标签不移动。提交使用工具身份 Codex <codex@localhost>，未修改全局 Git 身份。
- `.gitignore` 排除 node_modules、dist、测试报告、环境文件、常见私钥文件及凭据目录。常见凭据模式扫描未命中；没有读取或复制工作区凭据文件。
- 没有配置远端、创建 GitHub 仓库或执行 push。没有公网游戏网址。

## 本阶段兼容性修复

- 顶栏和底栏按钮至少 44×44 CSS px；设置整行可点击。
- 左右安全区域及弹窗安全区域补充；Safari 背景模糊前缀。
- 音效在用户操作中恢复 AudioContext，等待恢复成功后播放，捕获失败并清理音频节点；后台暂停音频，下次触摸重新解锁。
- 保留每步存档，增加 pagehide 保存及 pageshow/前台恢复绘制。
- 不禁止用户缩放。棋盘使用 touch-action:none 防止落子拖动页面，页面其他区域允许正常浏览。

## 本地验证

- 原始 V0.1：18 项 Vitest 测试通过，生产构建通过。
- 独立目录：npm ci 完成；20 项 Vitest 测试通过，生产构建通过。第一次受限沙箱安装在 esbuild 校验时出现 EPERM，在允许执行所需能力后重试成功。
- `scripts/browser-check.mjs` 为可复跑浏览器检查，启动临时本地静态服务器，模拟独立仓库 `/pocket-island/` 目录。
- Chromium 实测通过：子路径重定向、资源与 SW 作用域、触摸落子/撤销、设置及刷新恢复、320/375/390/430/1280 宽度布局与 44px 触控区域、低动态效果、断网刷新和断网新标签页启动、存储写入失败回退。无捕获到的主页面运行错误。
- 使用 Chromium 自动化，不等同 iPhone Safari 真机，也不代表 GitHub Pages 已部署。

可选浏览器测试工具无需加入游戏依赖。先在工作区外安装 Playwright 和 Chromium，然后指定模块路径：

```bash
# 示例工具目录可按本机调整
npm install --prefix /tmp/pocket-browser playwright
/tmp/pocket-browser/node_modules/.bin/playwright install chromium
cd /workspace/pocket-island
npm run build
PLAYWRIGHT_MODULE=/tmp/pocket-browser/node_modules/playwright/index.mjs node scripts/browser-check.mjs
```

## Pages 配置核对

- Vite base 为 `./`；JS/CSS/图标相对加载。
- Manifest start_url 与 scope 均为 `./`，含 192/512 PNG 和 SVG 图标；apple-touch-icon 使用本地 PNG。
- Service Worker 在子目录注册，默认作用域为该目录；缓存名称含 SW 路径，不清除同域其他项目缓存。
- 构建生成资源清单，包括全部本地资源。缓存读取忽略静态服务器的 Vary: Origin 差异。
- 在线目录根地址及刷新访问可直接由 Pages 的 index.html 提供。应用没有路由，不承诺任意嵌套路径可访问。
- 首次联网完成缓存后才能离线打开；Safari 可能清理缓存。新版本发布后应再次确认缓存及存档兼容性。
- GitHub Actions 使用 Node 22、npm ci、测试、构建、上传 dist 和 deploy-pages；仅需要 contents:read、pages:write、id-token:write。

## iPhone Safari 人工待验收（全部待真机验证）

记录 iPhone 型号、iOS 版本、Safari/PWA 模式与结果；建议至少测试当前版本及一个旧版本（建议 iOS 16+）。

- [ ] 刘海/灵动岛、底部 Home Indicator 不遮挡；地址栏展开/收起后布局正常。
- [ ] 竖屏 320–430 CSS px 可玩，横竖切换回来棋盘与触摸落点一致；小屏弹窗可滚动到底。
- [ ] 连续单点/快点不会重复落子，拖动棋盘不滚动页面，边缘格易点击。
- [ ] 页面非棋盘区域双指缩放可用；缩放后无误触、内容仍可阅读。
- [ ] 首次触摸可播放音效；静音开关持久化。锁屏、来电/切后台后再次触摸可恢复音效，无突然补播。
- [ ] 切后台、Safari 返回、结束进程后重新打开，棋盘/分数/下一块/撤销额度正确。
- [ ] 正常浏览存档持久化；隐私浏览/存储受限时提示合理，仍能游戏；清理站点数据后的新局行为可理解。
- [ ] 分享 → 添加到主屏幕：图标、名称、独立窗口和安全区域正常。不要假定 Safari 标签页和安装实例一定共享已有存档。
- [ ] 在线打开并完成缓存后开启飞行模式：刷新、关闭后重开 Safari、主屏幕冷启动均可玩；首次从未加载的站点不能离线启动。
- [ ] 系统“减弱动态效果”开启后粒子、跳动和循环动画停用；关闭/打开系统设置后的行为可接受。
- [ ] 发布新构建后更新正常，老存档能恢复；缓存被系统回收时联网可恢复。

## 最简单发布流程（尚未执行，需用户授权）

拟执行操作及影响：

1. 在用户指定的 GitHub 账号下创建空的 `pocket-island` 仓库。选择公开将使源码、图像与提交历史公开；不添加 GitHub 生成的 README，避免不必要的合并。
2. 仅在 `/workspace/pocket-island` 添加这个新仓库为 origin，推送 main 和 v0.1.0 标签；不修改或推送其他项目。
3. Settings → Pages → Source 选择 GitHub Actions，必要时手动触发 Deploy Pocket Island。Pages 站点内容将对公网可访问。
4. 等待 Actions 部署成功，打开部署输出的实际网址，执行资源、刷新和手机检查。只有完成这一步才记录公网游戏网址。

用户可以授权助手执行，也可自行执行。以下是授权之后的命令模板，替换 OWNER 为真实账号；不要将占位地址直接设为远端：

```bash
cd /workspace/pocket-island
git status --short
git remote -v
# 先在 GitHub 手动创建空仓库，并确认该地址属于新游戏仓库
git remote add origin https://github.com/OWNER/pocket-island.git
git push -u origin main
git push origin v0.1.0
```

随后选择 Pages 的 GitHub Actions，运行工作流并检查实际部署链接。如账号/套餐不支持选定可见性的 Pages，先确认 GitHub 设置，不自动改为公开。
