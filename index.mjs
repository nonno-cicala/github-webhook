import express from "express"
// import { spawnSync } from "child_process"
import { createHmac, timingSafeEqual } from "crypto"
import { env } from "process"

const app = express()
const PORT = 21913

app.use(express.json({
  verify: (req, res, buf, encoding) => {
    if (buf && buf.length) {
      req.rawBody = buf.toString(encoding || 'utf8');
    }
  }
}))

app.post('/', (req, res) => {
  // console.log(req.body)
  // const date = spawn('date')
  // date.stdout.on('data', data => {
  //   console.log(data.toString())
  // })
  // const pwd = exec('pwd')
  // pwd.stdout.on('data', data => {
  //   console.log(data.toString())
  // })
  // console.log(spawnSync('date').stdout.toString())
  const hashAlg = 'sha256'
  const hmac = createHmac(hashAlg, env.GITHUB_WEBHOOK_SECRET)
  const digest = Buffer.from(hashAlg + '=' + hmac.update(req.rawBody).digest('hex'), 'utf8')
  const sig = Buffer.from(req.get('x-hub-signature-256') || '', 'utf8')
  if (!timingSafeEqual(sig, digest)) {
    res.status(400).send('Signature did not match').end()
  }
  res.status(200).end()
})

// app.get('/', (req, res) => {
//   res.send('Ciao, da grande voglio essere un hook').end()
// })

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`))
