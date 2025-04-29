​​# 前端开发专家规则 v2.1​​

​​▌工程化铁律​​

组件架构强制采用「原子设计+容器模式」：
bash
src/
├─ components/      # 无状态UI组件
│  └─ Button/       # 组件维度目录
│     ├─ test/      # 专属测试用例
│     ├─ index.tsx  # 组件本体
│     └─ styles.ts  # CSS-in-JS
├─ containers/      # 数据连接层
└─ hooks/           # 自定义hook
样式系统采用CSS-in-JS混合方案：
tsx
// 基础样式使用CSS变量
const Wrapper = styled.div`
  --btn-radius: ${p => p.size === 'lg' ? '8px' : '4px'};
  border-radius: var(--btn-radius);
`

// 动态样式使用Emotion
const dynamicStyle = css`
  background: ${({ theme }) => theme.colors.primary};
`
​​▌精准开发协议​​
① 像素级校验流程：

markdown
1. 截图测量 → 生成样式草稿
2. 实现组件 → 浏览器缩放至`200%`检查边缘
3. 使用Pixel Perfect插件覆盖比对
4. 提交前执行`npm run pixel-diff`校验
② 动效开发规范：

ts
// 贝塞尔曲线必须从设计稿转换
const EASING = {
  modalEnter: 'cubic-bezier(0.16, 1, 0.3, 1)', // 从AE曲线转换
  buttonHover: 'cubic-bezier(.4,0,.2,1)' 
}

// 所有transform必须启用GPU加速
const frame = () => requestAnimationFrame(() => {
  element.style.transform = `translateY(${y}px)`
})
​​▌性能红线​​

组件级别：单个组件首屏渲染时间 < 2ms
网络级别：关键请求链深度 ≤ 3
交互级别：点击→响应时间 ≤ 100ms
内存级别：重复挂载组件内存波动 < 5MB
​​▌质量保障体系​​

自动化检测链：
bash
commit前执行：  
eslint → stylelint → 无障碍检测 → 视觉回归测试
可视化监控指标：
tsx
// 在开发环境注入性能监控
if (isDev) {
  reportWebVitals(console.log)
  injectDevTools({
    highlightRenders: true,  // 高亮重渲染组件
    stateDiff: true          // 显示状态变更差异
  })
}
​​▌API对接规范​​

请求层封装：
ts
// 自动生成API类型
type ApiResponse<T> = {
  data: T
  error?: {
    code: string
    message: string
    trackingId: string  // 必须包含追踪ID
  }
}

// 错误边界处理
async function queryAPI<T>(endpoint: string) {
  const res = await fetch(endpoint)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json() as ApiResponse<T>
}
数据模拟：
js
// 使用MSW生成符合OpenAPI规范的mock
import { rest } from 'msw'

export const handlers = [
  rest.get('/api/user', (req, res, ctx) => {
    return res(
      ctx.delay(150), // 模拟网络延迟
      ctx.json({
        data: mockUser,
        error: null
      })
    )
  })
]
​​▌交付物标准​​

markdown
交付包必须包含：
frontend-report/
├─ bundle-analyzer.html  # 构建产物分析
├─ coverage/            # 测试覆盖率
├─ performance-audit/   # Lighthouse各环境报告
└── type-docs/          # 自动生成的类型文档