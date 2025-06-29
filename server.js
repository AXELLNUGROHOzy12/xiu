const express = require("express")
const { makeWASocket, DisconnectReason, useMultiFileAuthState } = require("@whiskeysockets/baileys")
const { Boom } = require("@hapi/boom")
const path = require("path")
const fs = require("fs")

const app = express()
const PORT = 3000

// Middleware
app.use(express.json())
app.use(express.static("public"))

// Global variables
let sock
let isConnected = false
let qrCode = ""

// Ensure sessions directory exists
const sessionsDir = "./sessions"
if (!fs.existsSync(sessionsDir)) {
  fs.mkdirSync(sessionsDir, { recursive: true })
}

// Initialize WhatsApp connection
async function connectToWhatsApp() {
  const state = await fs.promises.readdir("./sessions").then((files) => {
    if (files.length > 0) {
      return require("./sessions/creds.json")
    }
    return null
  })

  const saveCreds = (creds) => {
    fs.writeFileSync("./sessions/creds.json", JSON.stringify(creds))
  }

  sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
    logger: {
      level: "silent",
      child: () => ({ level: "silent" }),
    },
  })

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update

    if (qr) {
      qrCode = qr
      console.log("QR Code generated, scan with WhatsApp")
    }

    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect?.error instanceof Boom
          ? lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut
          : true

      console.log("Connection closed due to ", lastDisconnect?.error, ", reconnecting ", shouldReconnect)
      isConnected = false

      if (shouldReconnect) {
        connectToWhatsApp()
      }
    } else if (connection === "open") {
      console.log("WhatsApp connection opened")
      isConnected = true
      qrCode = ""
    }
  })

  sock.ev.on("creds.update", saveCreds)
}

// API Routes
app.get("/api/status", (req, res) => {
  res.json({
    connected: isConnected,
    qrCode: qrCode,
  })
})

app.post("/api/send-message", async (req, res) => {
  try {
    const { target, message } = req.body

    if (!isConnected) {
      return res.status(400).json({
        success: false,
        error: "WhatsApp not connected",
      })
    }

    if (!target || !message) {
      return res.status(400).json({
        success: false,
        error: "Target and message are required",
      })
    }

    // Format phone number (add country code if not present)
    let formattedTarget = target.replace(/\D/g, "")
    if (!formattedTarget.startsWith("62")) {
      if (formattedTarget.startsWith("0")) {
        formattedTarget = "62" + formattedTarget.substring(1)
      } else {
        formattedTarget = "62" + formattedTarget
      }
    }
    formattedTarget += "@s.whatsapp.net"

    // Send message
    await sock.sendMessage(formattedTarget, { text: message })

    res.json({
      success: true,
      message: "Message sent successfully",
      target: formattedTarget,
    })
  } catch (error) {
    console.error("Error sending message:", error)
    res.status(500).json({
      success: false,
      error: "Failed to send message: " + error.message,
    })
  }
})

app.post("/api/logout", async (req, res) => {
  try {
    if (sock) {
      await sock.logout()
    }

    // Clear session files
    const sessionFiles = fs.readdirSync("./sessions")
    sessionFiles.forEach((file) => {
      fs.unlinkSync(path.join("./sessions", file))
    })

    isConnected = false
    qrCode = ""

    res.json({
      success: true,
      message: "Logged out successfully",
    })
  } catch (error) {
    console.error("Error during logout:", error)
    res.status(500).json({
      success: false,
      error: "Failed to logout: " + error.message,
    })
  }
})

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
  connectToWhatsApp()
})
