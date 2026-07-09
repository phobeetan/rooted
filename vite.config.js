import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

function sendJson(res, statusCode, body) {
  res.statusCode = statusCode
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(body))
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = ''

    req.on('data', (chunk) => {
      body += chunk
    })

    req.on('end', () => resolve(body))
    req.on('error', reject)
  })
}

function mockFidelityApi() {
  let lastMockFidelityImport = null

  return {
    name: 'mock-fidelity-api',
    configureServer(server) {
      server.middlewares.use('/api/mock-fidelity/import', async (req, res) => {
        if (req.method === 'GET') {
          if (!lastMockFidelityImport) {
            sendJson(res, 404, {
              success: false,
              message: 'No mock Fidelity data received yet',
            })
            return
          }

          sendJson(res, 200, {
            success: true,
            data: lastMockFidelityImport,
          })
          return
        }

        if (req.method !== 'POST') {
          sendJson(res, 405, {
            success: false,
            message: 'Method not allowed',
          })
          return
        }

        try {
          const payload = JSON.parse(await readBody(req))
          const receivedAccounts = Array.isArray(payload.accounts) ? payload.accounts.length : 0

          if (payload.provider !== 'mock_fidelity' || receivedAccounts === 0) {
            sendJson(res, 400, {
              success: false,
              message: 'Invalid mock Fidelity payload',
            })
            return
          }

          lastMockFidelityImport = payload
          console.log('Mock Fidelity data received by Rooted:', JSON.stringify(payload, null, 2))

          sendJson(res, 200, {
            success: true,
            message: 'Mock Fidelity data received by Rooted',
            receivedAccounts,
          })
        } catch {
          sendJson(res, 400, {
            success: false,
            message: 'Invalid JSON payload',
          })
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), mockFidelityApi()],
})
