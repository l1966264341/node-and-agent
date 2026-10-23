// Please install OpenAI SDK first: `npm install openai`
import { Router} from 'express'
import OpenAI from "openai";

const openai = new OpenAI({
        baseURL: 'https://api.deepseek.com',
        apiKey: process.env.DEEPSEEK_API_KEY,
});

// async function main() {
//   const completion = await openai.chat.completions.create({
//     messages: [{ role: "system", content: "You are a helpful assistant." }],
//     model: "deepseek-flash",
//     thinking: {"type": "enabled"},
//     reasoning_effort: "high",
//     stream: false,
//   });

//   console.log(completion.choices[0].message.content);
// }
// main();

// 创建路由，不直接执行
export const aiRouter = Router()

// POST /api/ai/chat
aiRouter.post('/chat', async (req, res, next) => {
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        ...(req.body?.messages || []),
      ],
      model: 'deepseek-flash',
      thinking: { type: 'enabled' },
      reasoning_effort: 'high',
      stream: false,
    })

    res.json({ content: completion.choices[0].message.content })
  } catch (err) {
    next(err)   // 交给 app.mjs 的统一错误出口
  }
})

export default aiRouter