import http from 'node:http'

// 请求体内容
const MAX_BODY = 1024 * 1024
const readBody = req => new Promise((resolve, reject) => {
  let size = 0
  const chunks = []
  req.on('data', chunk => {
    size += chunk.length
    if(size > MAX_BODY) {
      const err = new Error('请求体过大')
      err.status = 413
      reject(err)
      req.resume()
      return
    }
    chunks.push(chunk)
  })
  req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
  req.on('error', reject)
})


// 响应内容
const sendJson = (res, status, data) => {
  const body = JSON.stringify(data)
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body)
  })
  res.end(body)
}

// http服务
const server = http.createServer(async (req,res) => {
  try {
    const url = new URL(req.url, 'http://localhost') // 第二个参数是占位用的假域名，http://后乱填都行

    if(req.method === 'GET' && url.pathname === '/healthz'){
      sendJson(res, 200, { ok: true })
      return
    }

    if(req.method === 'GET' && url.pathname === '/hello'){
      const name = url.searchParams.get('name') || 'nothing'
      sendJson(res, 200, { message: `hello,${name}` })
      return
    }

    if(req.method === 'POST' && url.pathname === '/echo'){
      const raw = await readBody(req) 
      const body = raw ? JSON.parse(raw) : {}
      sendJson(res, 200, { whatYouSent: body })
      return
    }
    
    if(req.method === 'POST' && url.pathname === '/sum'){
      const raw = await readBody(req) 
      const body = raw ? JSON.parse(raw) : {}
      if(typeof body.a === 'number' && typeof body.b === 'number') {
        sendJson(res, 200, { result: body.a + body.b})
      } else {
        sendJson(res, 400, { message: '请求不合法'})
      }
      return
    }

    sendJson(res, 404, { message: 'not found' })

  } catch(err) {
    sendJson(res, err.status || 400, { message: err.message })
  }
  
})

server.listen(3000,'127.0.0.1',() => {
  console.log('right!!! you make 127.0.0.1:3000.');
})