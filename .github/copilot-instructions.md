这个项目是纯中文的项目，请使用中文进行交流。

这个项目基于 Vue3 + TypeScript + Vite + TailwindCSS 构建，旨在提供一个现代化的听歌房体验。

## ui
### css颜色
只在`src/styles/color.css`和`src/styles/themes`目录下的css文件中定义css颜色, 在这些之外 使用颜色的地方 均通过css变量使用颜色

#### css颜色的复用
- 颜色css中的 给外部css使用的颜色的变量名, 均使用`描述功能性`的风格
- 但在颜色css内部, 其可用`颜色描述性`风格的变量名, 将重复的颜色只声明一次, `颜色描述性风格的变量名`的css变量只能在颜色css内部使用
- 只用**真正在该文件中需要被复用的颜色** 才提取`颜色描述性风格的变量名`
- `src/styles/themes`下的颜色css 不能引用 `src/styles/color.css`之外的的颜色变量, `src/styles/themes`下的颜色css应尽量复用`src/styles/color.css`中的`颜色描述性`变量; 不要复用`src/styles/color.css`中的`描述功能性`的变量, 因为如果需要复用`描述功能性`的变量 则可以直接省略
