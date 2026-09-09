# 第三方素材、修改与署名

本文件只说明实际发布的第五版运行素材。公开托管不会改变原素材许可；本仓库不对混合素材统一授予 MIT、CC0 或其他许可。

## 运行库

- **Three.js 0.160.0**，three.js authors，MIT。`three.min.js` 及由官方实现适配的 `gltf-loader.js`、`rgbe-loader.js` 使用此来源。适配为无需构建的浏览器全局加载器，保留许可：[THREE-MIT.txt](licenses/THREE-MIT.txt)。来源：[Three.js](https://github.com/mrdoob/three.js)。

## 人物、皮肤与服装 — `assets/runner.glb`

- **MakeHuman Community**：人体基础网格、成年形态目标、骨架、蒙皮权重与眼睛，CC0。已组合形态、细分并适配到浏览器游戏。[项目来源](https://github.com/makehumancommunity/makehuman) · [核心资产许可说明](https://static.makehumancommunity.org/makehuman/faq/are_makehuman_files_free.html) · [原 CC0 许可](licenses/MakeHuman-CC0.md)。本仓库未分发 MakeHuman 应用程序源码。
- **onlytheghosts**：`young_eurasian_female_diffuse` 自然皮肤，来自 MakeHuman Natural Female Skins 素材包，CC0。已缩小纹理尺寸并用于当前材质。[素材包](https://static.makehumancommunity.org/assets/assetpacks/skins01.html)。
- **Mindfront (Sweden)**：**F One-piece Swimsuit 01**，**CC BY 4.0**。已修改为黑色材质、加深 V 形露背、调整贴合与蒙皮，并细分改善轮廓。[素材包来源](https://static.makehumancommunity.org/assets/assetpacks/underwear03.html) · [CC BY 4.0 许可](https://creativecommons.org/licenses/by/4.0/) · [原文件署名摘录](licenses/Mindfront-NOTICE.txt)。分发包含该泳装的派生模型或游戏时须保留作者、来源、许可链接与修改说明。
- 当前头发为本项目制作的连续头皮、104 束主发束与 36 束表层细发，加入三段发骨和运行时有限惯性；当前模型不含早期试用的 Elvaerwyn 长发网格。金色耳环及游戏适配由本项目制作。

## 人物动作 — `assets/runner.glb`

- **CMU Graphics Lab Motion Capture Database**：采用 **09_01** 真人跑步捕捉，原采样 120 Hz。截取第 7–95 帧，重定时为 0.66 秒原地循环，去除向前根位移并适配当前骨架。CMU 官方说明数据可自由用于各种用途；这不是 CC0 声明。[CMU 原站](https://mocap.cs.cmu.edu/) · [使用说明](https://mocap.cs.cmu.edu/info.php) · [实际 BVH 转换镜像](https://github.com/Shriinivas/cmubvh/tree/main/Sequence-001-009/09) · [完整来源说明](licenses/CMU-NOTICE.txt)。

  The data used in this project was obtained from mocap.cs.cmu.edu. The database was created with funding from NSF EIA-0196217.

- **Quaternius Universal Animation Library 1 / 2**：CC0 1.0。跳跃、落地、滑行等动作经过骨架重定向、动作合成与时间调整；当前跑步已改用上述 CMU 数据。[动作库 1](https://quaternius.com/packs/universalanimationlibrary.html) · [动作库 2](https://quaternius.com/packs/universalanimationlibrary2.html) · [glTF 转换来源](https://github.com/J-Ponzo/gltf-universal-animation-library) · [CC0 许可](licenses/Quaternius-CC0.txt) · [动作库 2 原说明](licenses/Quaternius-UAL2-NOTICE.txt)。

## 石材与环境光

- **Rob Tuytel / Poly Haven — Cobblestone Floor 08**：CC0。采用 2K Diffuse、Normal GL、ARM，分别为 `assets/stone-diff.jpg`、`assets/stone-nor_gl.jpg`、`assets/stone-arm.jpg`；游戏中调整材质和重复比例。[素材原页](https://polyhaven.com/a/cobblestone_floor_08)。
- **Andreas Mischok / Poly Haven — Xanderklinge**：CC0。采用 1K HDR，发布文件为 `assets/forest-light.hdr`，用于环境照明。[素材原页](https://polyhaven.com/a/xanderklinge)。
- [Poly Haven 许可说明](https://polyhaven.com/license) · [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/)。

## 本项目制作的内容与视觉参考

- `assets/environment.png`、`monster.png`、`stone.png`、`tower-v4.png`、`fern-realistic.png` 和 `fire-atlas-v5.png` 使用 Codex 内置图像生成工具为本项目生成。部分生成素材经过导入、UV 映射与实时着色适配；火焰为 4 × 4 的透明动画纹理。
- `assets/temple-gate.json`、`serpent-pair.json`、`road-module.json` 为本项目通过 Blender 制作并导出的运行模型。植被实例、石材风化、道路开口、转向石刻和游戏逻辑为本项目制作。
- `assets/reference.png` 是制作委托中提供的视觉参考，同时用于游戏起始封面。此文件不属于上述第三方 CC0 / CC BY / MIT 许可范围；本仓库不对它额外授予复用权利。

上述项目制作内容和参考图没有在此文件中新增统一许可。需要单独复用时，先确认相应权利与授权范围。
