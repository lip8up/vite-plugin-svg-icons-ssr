# vite-plugin-svg-icons-ssr

用于生成 svg 雪碧图.

## 特征

- **预加载** 在项目运行时就生成所有图标,只需操作一次 dom
- **高性能** 内置缓存,仅当文件被修改时才会重新生成

## 安装

**node version:** >=12.0.0

**vite version:** >=2.0.0

```bash
yarn add vite-plugin-svg-icons-ssr -D
# or
npm i vite-plugin-svg-icons-ssr -D
# or
pnpm install vite-plugin-svg-icons-ssr -D
```

## 使用

- vite.config.ts 中的配置插件

```ts
import { createSvgIconsSsrPlugin } from 'vite-plugin-svg-icons-ssr'
import path from 'path'

export default () => {
  return {
    plugins: [
      createSvgIconsSsrPlugin({
        // 指定需要缓存的图标文件夹
        iconDir: path.resolve(process.cwd(), 'src/icons'),
        // 指定 symbolId 格式
        symbolIdTemplate: 'icon-[dir]-[name]'
      })
    ]
  }
}
```

- 在 src/main.ts 内引入注册脚本

```ts
import svgHtml from 'virtual:svg-icons-ssr-html'

// in template
<div v-html="svgHtml" style="display:none" />
```

到这里 svg 雪碧图已经生成

## 如何在组件使用

**Vue 方式**

`/src/components/SvgIcon.vue`

```vue
<template>
  <svg aria-hidden="true">
    <use :xlink:href="symbolId" :fill="color" />
  </svg>
</template>

<script>
import { defineComponent, computed } from 'vue'

export default defineComponent({
  name: 'SvgIcon',
  props: {
    prefix: {
      type: String,
      default: 'icon'
    },
    name: {
      type: String,
      required: true
    },
    color: {
      type: String,
      default: '#333'
    }
  },
  setup(props) {
    const symbolId = computed(() => `#${props.prefix}-${props.name}`)
    return { symbolId }
  }
})
</script>
```

**icons 目录结构**

```bash
# src/icons

- icon1.svg
- icon2.svg
- icon3.svg
- dir/icon1.svg
```

`/src/App.vue`

```vue
<template>
  <div>
    <SvgIcon name="icon1"></SvgIcon>
    <SvgIcon name="icon2"></SvgIcon>
    <SvgIcon name="icon3"></SvgIcon>
    <SvgIcon name="dir-icon1"></SvgIcon>
  </div>
</template>

<script>
import { defineComponent, computed } from 'vue'

import SvgIcon from './components/SvgIcon.vue'
export default defineComponent({
  name: 'App',
  components: { SvgIcon }
})
</script>
```

### **React 方式**

`/src/components/SvgIcon.jsx`

```jsx
export default function SvgIcon({ name, prefix = 'icon', color = '#333', ...props }) {
  const symbolId = `#${prefix}-${name}`

  return (
    <svg {...props} aria-hidden="true">
      <use href={symbolId} fill={color} />
    </svg>
  )
}
```

### 获取所有 SymbolId

```ts
import names from 'virtual:svg-icons-ssr-names'
// => ['icon-icon1','icon-icon2','icon-icon3']
```

### 配置说明

| 参数             | 类型                    | 默认值                | 说明                                                           |
| ---------------- | ---------------------- | ------------------- | -------------------------------------------------------------- |
| iconDir          | `string`               | -                   | 需要生成雪碧图的图标文件夹                                     |
| symbolIdTemplate | `string`               | `icon-[dir]-[name]` | svg 的 symbolId 格式，见下方说明                               |
| svgoOptions      | `boolean｜SvgoOptions` | `true`              | svg 压缩配置，可以是对象[Options](https://github.com/svg/svgo) |

**symbolIdTemplate**

`icon-[dir]-[name]`

**[name]:**

svg 文件名

**[dir]**

该插件的 svg 不会生成 hash 来区分，而是通过文件夹来区分.

如果`iconDir`对应的文件夹下面包含这其他文件夹

例：

则生成的 SymbolId 为注释所写

```bash
# src/icons
- icon1.svg # icon-icon1
- icon2.svg # icon-icon2
- icon3.svg # icon-icon3
- dir/icon1.svg # icon-dir-icon1
- dir/dir2/icon1.svg # icon-dir-dir2-icon1
```

## Typescript 支持

如果使用 `Typescript`,你可以在`tsconfig.json`内添加

```json
// tsconfig.json
{
  "compilerOptions": {
    "types": ["vite-plugin-svg-icons-ssr/client"]
  }
}
```
