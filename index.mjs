import express from "express"
// import { spawnSync } from "child_process"
import { createHmac, timingSafeEqual } from "crypto"
import { env } from "process"

const PORT = env.PORT || 2022
const GITHUB_WEBHOOK_SECRET = env.GITHUB_WEBHOOK_SECRET

if (GITHUB_WEBHOOK_SECRET === undefined) throw 'Missing GITHUB_WEBHOOK_SECRET'

const app = express()

const actions = (body) => {
}

app.use(express.json({
  verify: (req, res, buf, encoding) => {
    if (buf && buf.length) {
      req.rawBody = buf.toString(encoding || 'utf8');
    }
  }
}))

app.post('/', (req, res) => {
  const hashAlg = 'sha256'
  const hmac = createHmac(hashAlg, GITHUB_WEBHOOK_SECRET)
  const digest = Buffer.from(hashAlg + '=' + hmac.update(req.rawBody).digest('hex'), 'utf8')
  const sig = Buffer.from(req.get('x-hub-signature-256') || '', 'utf8')
  timingSafeEqual(sig, digest)
    ? (res.status(200).end(), actions(req.body))
    : res.status(400).send('Signature did not match').end()
})

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`))
