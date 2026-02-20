import { Client, LocalAuth } from 'whatsapp-web.js';
import express from 'express';
import cors from 'cors';

const QRCode = require('qrcode-terminal');

const app = express();
app.use(cors());
app.use(express.json());

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('qr', (qr) => {
    console.log('📱 Scan QR code:');
    QRCode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('✅ WhatsApp ready!');
});

client.on('message', async (message) => {
    if (message.fromMe || message.from.includes('broadcast')) return;
    
    const msg = message.body.toLowerCase();
    let reply = '';
    
    if (msg.includes('hi') || msg.includes('hello')) {
        reply = '👋 Hello! Welcome to QM Beauty!\n\n🛍️ Products: qmbeauty.africa/shop\n📅 Book: qmbeauty.africa/appointments\n📞 Contact: +255 657 120 151';
    }
    else if (msg.includes('product')) {
        reply = '🛍️ Products:\n• Carrot Oil - 25,000 TZS\n• Coconut Oil - 25,000-35,000 TZS\n• Body Butter - 100,000 TZS\n\nShop: qmbeauty.africa/shop';
    }
    else if (msg.includes('book') || msg.includes('appointment')) {
        reply = '💇‍♀️ Book Services:\n• Facial, Hair, Nails, Waxing\n\n📅 qmbeauty.africa/appointments\n📞 +255 657 120 151';
    }
    
    if (reply) {
        try { await message.reply(reply); } catch(e) {}
    }
});

app.listen(4000, () => console.log('Server on port 4000'));
client.initialize();
