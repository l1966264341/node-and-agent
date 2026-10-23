import express from "express"
import cors from 'cors'
import { randomUUID } from 'node:crypto'
import AI from './ai/ai.mjs'

export const app = express()

// 前面有代理
app.set('trust proxy', 1)

// 指定请求id
app.use((req, res, next) => {
  req.id = randomUUID()
  // 每个请求的唯一ID写进响应头，方便日志追踪
  res.setHeader('X-Request-Id', req.id) 
  next() // 放行，交给下一个中间件
})

// 跨域限制
app.use(cors({ origin: process.env.WEB_ORIGIN  || "http://localhost:5173" }))

// 解析请求的JSON，限制大小
app.use(express.json({ limit: '512kb' }))

// 路由请求，带响应内容
app.get('/healthz', (_, res) => res.json({ ok: true }))
app.use('/api/ai', AI)

// 404
app.use((req, res) => {
  res.status(404).json({ message: 'not found', requestId: req.id })
})

// 统一错误出口（4 个参数才会被 Express 识别为错误中间件）
app.use((err, req, res, _) => {
  if(err.type === 'entity.too.large') {
    return res.status(413).json({ message: '请求体过大', requestId: req.id })
  }
  console.error('[error]', req.id, err)

  res.status(err.status || 500).json({
    message: err.status ? err.message : '服务端出现问题，未捕获到异常',
    requestId: req.id
  })
})