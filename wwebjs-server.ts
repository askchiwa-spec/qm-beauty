import { makeWASocket, DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys';
import express from 'express';
import cors from 'cors';
import { Boom } from '@hapi/boom';

const QRCode = require('qrcode-terminal');

const app = express();
app.use(cors());
app.use(express.json());

const products = [
    { name: 'Carrot Oil', price: 25000, category: 'Hair Care', benefits: 'Promotes hair growth' },
    { name: 'Coconut Oil (Pure)', price: 35000, category: 'Hair Care', benefits: 'Deep conditioning' },
    { name: 'Coconut Oil (Regular)', price: 25000, category: 'Hair Care', benefits: 'Daily hair care' },
    { name: 'Herbal Hair Oil', price: 30000, category: 'Hair Care', benefits: 'Strengthens roots' },
    { name: 'Body Butter', price: 100000, category: 'Body Care', benefits: 'Deep hydration' },
    { name: 'Hair Relaxer & Treatment', price: 55000, category: 'Hair Care', benefits: 'Smooth hair' },
    { name: 'Nail Care Set', price: 30000, category: 'Nail Care', benefits: 'Complete nail care' }
];

const services = [
    { name: 'Facial Treatments', duration: '60-90 min', price: '50,000 TZS' },
    { name: 'Hair Styling & Treatment', duration: '60-120 min', price: '40,000 TZS' },
    { name: 'Nail Care', duration: '30-60 min', price: '25,000 TZS' },
    { name: 'Waxing Services', duration: '30-90 min', price: '30,000 TZS' },
    { name: 'Massage Therapy', duration: '60-90 min', price: '60,000 TZS' }
];

// Session storage
const sessions: { [key: string]: any } = {};
const timeSlots = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM'];

function getDates(): string[] {
    const dates: string[] = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() + i);
        dates.push(d.toDateString().slice(0, 10));
    }
    return dates;
}

// Valid triggers
const validTriggers = [
    'hi', 'hello', 'hey', 'start',
    'book', 'appointment', 'schedule', 'reserve',
    'products', 'product', 'shop', 'buy', 'price',
    'services', 'service', 'spa', 'treatment',
    'cart', 'order', 'payment', 'pay', 'mpesa', 'tigo', 'airtel',
    'contact', 'phone', 'help', 'support',
    'hours', 'delivery', 'available', 'stock',
    'bye', 'goodbye', 'done', 'exit', 'quit', 'stop', 'end', 'thank', 'thanks'
];

// Words to close/end conversation
const closeWords = ['bye', 'goodbye', 'done', 'exit', 'quit', 'stop', 'end', 'thank', 'thanks'];

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('baileys-auth');
    const sock = makeWASocket({ auth: state, printQRInTerminal: false });
    
    sock.ev.on('creds.update', saveCreds);
    
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        if (qr) { console.log('📱 Scan QR:'); QRCode.generate(qr, { small: true }); }
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) startBot();
        } else if (connection === 'open') {
            console.log('✅ WhatsApp ready!');
        }
    });
    
    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        
        // Skip if from me or not a notification
        if (msg.key.fromMe || m.type !== 'notify') return;
        
        const from = msg.key.remoteJid;
        
        // Only respond to individual chats
        if (!from || !from.endsWith('@s.whatsapp.net')) {
            console.log(`⏩ Skipped: ${from} (not direct chat)`);
            return;
        }
        
        // Extract text
        const text = msg.message?.conversation || 
                     msg.message?.extendedTextMessage?.text || 
                     msg.message?.imageMessage?.caption || '';
        
        // Skip empty messages
        if (!text || text.trim().length === 0) {
            console.log(`⏩ Skipped: Empty message from ${from}`);
            return;
        }
        
        const lower = text.toLowerCase().trim();
        let reply = '';
        
        // Check if should respond
        const hasSession = sessions[from] !== undefined;
        const hasTrigger = validTriggers.some(t => lower.includes(t));
        const isNumber = /^[0-9]+$/.test(text.trim());
        const isConfirm = lower === 'confirm' || lower === 'cancel';
        
        // Handle conversation closing
        const isClosing = closeWords.some(w => lower.includes(w));
        if (isClosing) {
            if (hasSession) {
                delete sessions[from];
                reply = `👋 *Goodbye!*\n\nYour booking has been cancelled.\n\nType "hi" anytime to chat again or visit: qmbeauty.africa`;
            } else {
                reply = `👋 *Thank you for chatting with QM Beauty!* 💚\n\nWe're here anytime you need us:\n📞 +255 657 120 151\n🌐 qmbeauty.africa\n\nType "hi" to start again.`;
            }
            await sock.sendMessage(from, { text: reply });
            console.log('✅ Replied: Goodbye');
            return;
        }
        
        if (!hasSession && !hasTrigger && !isNumber && !isConfirm) {
            console.log(`⏩ Skipped: "${text}" - no valid trigger`);
            return;
        }
        
        console.log(`📨 ${from}: ${text}`);
        
        // Handle active session
        if (sessions[from]) {
            const session = sessions[from];
            
            if (session.step === 'service') {
                const n = parseInt(text);
                if (n >= 1 && n <= 5) {
                    session.service = services[n-1];
                    session.step = 'date';
                    reply = `✅ ${session.service.name} selected!\n\n📅 Select date:\n${getDates().map((d,i) => `${i+1}. ${d}`).join('\n')}\n\nReply 1-7:`;
                } else {
                    reply = '❌ Please reply with 1-5';
                }
            }
            else if (session.step === 'date') {
                const n = parseInt(text);
                const dates = getDates();
                if (n >= 1 && n <= 7) {
                    session.date = dates[n-1];
                    session.step = 'time';
                    reply = `✅ ${session.date} selected!\n\n🕐 Select time:\n${timeSlots.map((t,i) => `${i+1}. ${t}`).join('\n')}\n\nReply 1-9:`;
                } else {
                    reply = '❌ Please reply with 1-7';
                }
            }
            else if (session.step === 'time') {
                const n = parseInt(text);
                if (n >= 1 && n <= 9) {
                    session.time = timeSlots[n-1];
                    session.step = 'name';
                    reply = `✅ ${session.time} selected!\n\n👤 Enter your name:`;
                } else {
                    reply = '❌ Please reply with 1-9';
                }
            }
            else if (session.step === 'name') {
                session.name = text;
                session.step = 'phone';
                reply = `✅ Thanks ${session.name}!\n\n📞 Enter phone number:`;
            }
            else if (session.step === 'phone') {
                session.phone = text;
                session.step = 'confirm';
                reply = `📋 *Booking Summary*\n\n💇 ${session.service.name}\n📅 ${session.date}\n🕐 ${session.time}\n👤 ${session.name}\n📞 ${session.phone}\n💰 ${session.service.price}\n\nReply CONFIRM or CANCEL:`;
            }
            else if (session.step === 'confirm') {
                if (lower === 'confirm') {
                    reply = `🎉 *Booking Confirmed!*\n\n💇 ${session.service.name}\n📅 ${session.date}\n🕐 ${session.time}\n👤 ${session.name}\n📞 ${session.phone}\n\n📍 Dar es Salaam\n*Ref:* QB-${Date.now().toString().slice(-6)}\n\nType "help" for more.`;
                    delete sessions[from];
                } else if (lower === 'cancel') {
                    reply = '❌ Cancelled. Type "book" to restart.';
                    delete sessions[from];
                } else {
                    reply = 'Reply CONFIRM or CANCEL:';
                }
            }
            
            if (reply) {
                await sock.sendMessage(from, { text: reply });
                console.log('✅ Replied to session');
                return;
            }
        }
        
        // Regular commands
        if (lower === 'book' || lower === 'appointment') {
            sessions[from] = { step: 'service' };
            reply = `💇 *Book Appointment*\n\nSelect service:\n1. Facial - 50K\n2. Hair Styling - 40K\n3. Nail Care - 25K\n4. Waxing - 30K\n5. Massage - 60K\n\nReply 1-5:`;
        }
        else if (lower === 'hi' || lower === 'hello') {
            reply = `👋 Welcome to QM Beauty!\n\n🛍️ Products\n📅 Book Appointment\n💳 Payment Options\n📞 +255 657 120 151\n\nType "help" for commands.`;
        }
        else if (lower === 'products' || lower === 'product') {
            reply = `🛍️ Products:\n• Carrot Oil - 25K\n• Coconut Oil - 25-35K\n• Body Butter - 100K\n• Herbal Oil - 30K\n• Hair Relaxer - 55K\n• Nail Set - 30K\n\nShop: qmbeauty.africa/shop`;
        }
        else if (lower === 'services' || lower === 'service') {
            reply = `💇 Services:\n• Facial - 50K\n• Hair Styling - 40K\n• Nails - 25K\n• Waxing - 30K\n• Massage - 60K\n\nBook: qmbeauty.africa/appointments`;
        }
        else if (lower === 'cart') {
            reply = `🛒 Cart: qmbeauty.africa/cart\n\nShop: qmbeauty.africa/shop`;
        }
        else if (lower === 'order' || lower === 'orders') {
            reply = `📦 Orders: qmbeauty.africa/orders\n\nEnter order code (QB-XXXXXX)`;
        }
        else if (lower === 'payment' || lower === 'pay') {
            reply = `💳 Payment:\n• M-Pesa\n• Tigo Pesa\n• Airtel Money\n• HaloPesa\n• Cash on Delivery\n\nCheckout: qmbeauty.africa/checkout`;
        }
        else if (lower === 'contact') {
            reply = `📞 Contact:\nWhatsApp: +255 657 120 151\nEmail: info@qmbeauty.africa\nHours: 8 AM - 8 PM Daily`;
        }
        else if (lower === 'help') {
            reply = `❓ Commands:\n• book - Book appointment\n• products - Catalog\n• services - Services\n• cart - View cart\n• order - Check order\n• payment - Payment options\n• contact - Contact info\n• hours - Business hours\n• delivery - Shipping info`;
        }
        else if (lower === 'hours') {
            reply = `🕐 Hours: 8 AM - 8 PM Daily\n\nBook: qmbeauty.africa/appointments`;
        }
        else if (lower === 'delivery') {
            reply = `🚚 Delivery:\n• Dar: 1-2 days (5K TZS)\n• Free over 100K TZS\n• Other: 2-4 days\n\nTrack: qmbeauty.africa/orders`;
        }
        else if (products.some(p => lower.includes(p.name.toLowerCase()))) {
            const product = products.find(p => lower.includes(p.name.toLowerCase()));
            reply = `✅ ${product!.name} is available!\n\n💰 ${product!.price.toLocaleString()} TZS\n✨ ${product!.benefits}\n\n🛒 Order: qmbeauty.africa/shop\n📞 WhatsApp: +255 657 120 151`;
        }
        else if (lower.includes('available') || lower.includes('in stock')) {
            reply = `✅ Yes, we have products in stock!\n\n🛍️ Browse: qmbeauty.africa/shop\n\n• Carrot Oil - 25K\n• Coconut Oil - 25-35K\n• Body Butter - 100K\n• Herbal Oil - 30K\n• Hair Relaxer - 55K\n• Nail Set - 30K\n\n📞 Order: +255 657 120 151`;
        }
        else {
            reply = `🤔 Try: book, products, services, contact, help`;
        }
        
        if (reply) {
            await sock.sendMessage(from, { text: reply });
            console.log('✅ Replied');
        }
    });
}

startBot();
app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.listen(4000, () => console.log('🚀 Server on port 4000'));
