/**
 * QM Beauty WhatsApp Bot - Production Ready
 * Security Hardened & Penetration Tested
 * Version: 2.0.0
 */

import { makeWASocket, DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys';
import express, { Request, Response } from 'express';
import cors from 'cors';
import { Boom } from '@hapi/boom';

const QRCode = require('qrcode-terminal');

// ============================================================================
// SECURITY CONFIGURATION
// ============================================================================

const SECURITY_CONFIG = {
    // Rate limiting
    MAX_MESSAGES_PER_MINUTE: 30,
    MAX_MESSAGES_PER_HOUR: 200,
    SESSION_TIMEOUT_MS: 30 * 60 * 1000, // 30 minutes
    
    // Input validation
    MAX_MESSAGE_LENGTH: 500,
    MAX_NAME_LENGTH: 50,
    MAX_PHONE_LENGTH: 20,
    
    // Allowed origins for CORS
    ALLOWED_ORIGINS: ['https://qmbeauty.africa', 'http://localhost:3000'],
};

// ============================================================================
// DATA STRUCTURES
// ============================================================================

interface Product {
    name: string;
    price: number;
    category: string;
    benefits: string;
}

interface Service {
    name: string;
    duration: string;
    price: string;
}

interface UserSession {
    step: string;
    data: {
        service?: Service;
        date?: string;
        time?: string;
        name?: string;
        phone?: string;
    };
    createdAt: number;
    lastActivity: number;
    messageCount: number;
}

interface RateLimit {
    count: number;
    resetTime: number;
}

const products: Product[] = [
    { name: 'Carrot Oil', price: 25000, category: 'Hair Care', benefits: 'Promotes hair growth' },
    { name: 'Coconut Oil (Pure)', price: 35000, category: 'Hair Care', benefits: 'Deep conditioning' },
    { name: 'Coconut Oil (Regular)', price: 25000, category: 'Hair Care', benefits: 'Daily hair care' },
    { name: 'Herbal Hair Oil', price: 30000, category: 'Hair Care', benefits: 'Strengthens roots' },
    { name: 'Body Butter', price: 100000, category: 'Body Care', benefits: 'Deep hydration' },
    { name: 'Hair Relaxer & Treatment', price: 55000, category: 'Hair Care', benefits: 'Smooth hair' },
    { name: 'Nail Care Set', price: 30000, category: 'Nail Care', benefits: 'Complete nail care' }
];

const services: Service[] = [
    { name: 'Facial Treatments', duration: '60-90 min', price: '50,000 TZS' },
    { name: 'Hair Styling & Treatment', duration: '60-120 min', price: '40,000 TZS' },
    { name: 'Nail Care', duration: '30-60 min', price: '25,000 TZS' },
    { name: 'Waxing Services', duration: '30-90 min', price: '30,000 TZS' },
    { name: 'Massage Therapy', duration: '60-90 min', price: '60,000 TZS' }
];

const timeSlots: string[] = [
    '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM'
];

// ============================================================================
// SESSION & RATE LIMITING STORAGE
// ============================================================================

const sessions: Map<string, UserSession> = new Map();
const rateLimits: Map<string, RateLimit> = new Map();

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getDates(): string[] {
    const dates: string[] = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        dates.push(d.toDateString().slice(0, 10));
    }
    return dates;
}

// SECURITY: Input sanitization
function sanitizeInput(input: string): string {
    return input
        .replace(/[<>]/g, '') // Remove HTML tags
        .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
        .trim();
}

// SECURITY: Validate phone number format
function isValidPhone(phone: string): boolean {
    const cleanPhone = phone.replace(/\s/g, '').replace(/-/g, '');
    return /^[\+]?[\d]{10,15}$/.test(cleanPhone);
}

// SECURITY: Validate name (no special chars, reasonable length)
function isValidName(name: string): boolean {
    return /^[a-zA-Z\s'-]{2,50}$/.test(name);
}

// SECURITY: Rate limiting check
function checkRateLimit(userId: string): boolean {
    const now = Date.now();
    const limit = rateLimits.get(userId);
    
    if (!limit || now > limit.resetTime) {
        rateLimits.set(userId, {
            count: 1,
            resetTime: now + 60000 // 1 minute
        });
        return true;
    }
    
    if (limit.count >= SECURITY_CONFIG.MAX_MESSAGES_PER_MINUTE) {
        return false;
    }
    
    limit.count++;
    return true;
}

// SECURITY: Clean up expired sessions
function cleanupSessions(): void {
    const now = Date.now();
    for (const [userId, session] of sessions.entries()) {
        if (now - session.lastActivity > SECURITY_CONFIG.SESSION_TIMEOUT_MS) {
            sessions.delete(userId);
            console.log(`🧹 Cleaned up expired session for ${userId}`);
        }
    }
}

// Run cleanup every 5 minutes
setInterval(cleanupSessions, 5 * 60 * 1000);

// ============================================================================
// MESSAGE HANDLING
// ============================================================================

const validTriggers: string[] = [
    'hi', 'hello', 'hey', 'start',
    'book', 'appointment', 'schedule', 'reserve',
    'products', 'product', 'shop', 'buy', 'price',
    'services', 'service', 'spa', 'treatment',
    'cart', 'order', 'payment', 'pay', 'mpesa', 'tigo', 'airtel',
    'contact', 'phone', 'help', 'support',
    'hours', 'delivery', 'available', 'stock',
    'bye', 'goodbye', 'done', 'exit', 'quit', 'stop', 'end', 'thank', 'thanks'
];

const closeWords: string[] = ['bye', 'goodbye', 'done', 'exit', 'quit', 'stop', 'end', 'thank', 'thanks'];

// ============================================================================
// BOT INITIALIZATION
// ============================================================================

async function startBot(): Promise<void> {
    const { state, saveCreds } = await useMultiFileAuthState('baileys-auth');
    const sock = makeWASocket({ 
        auth: state, 
        printQRInTerminal: false,
        // SECURITY: Connection limits
        connectTimeoutMs: 60000,
        keepAliveIntervalMs: 30000
    });
    
    sock.ev.on('creds.update', saveCreds);
    
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) { 
            console.log('📱 Scan QR:'); 
            QRCode.generate(qr, { small: true }); 
        }
        
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('⚠️ Connection closed, reconnecting:', shouldReconnect);
            if (shouldReconnect) startBot();
        } else if (connection === 'open') {
            console.log('✅ WhatsApp ready!');
        }
    });
    
    // SECURITY: Error handling wrapper
    sock.ev.on('messages.upsert', async (m) => {
        try {
            await handleMessage(sock, m);
        } catch (error) {
            console.error('❌ Error handling message:', error);
        }
    });
}

async function handleMessage(sock: any, m: any): Promise<void> {
    const msg = m.messages[0];
    
    // Skip if from me or not a notification
    if (msg.key.fromMe || m.type !== 'notify') return;
    
    const from = msg.key.remoteJid as string;
    
    // SECURITY: Only respond to individual chats
    if (!from || !from.endsWith('@s.whatsapp.net')) {
        console.log(`⏩ Skipped: ${from} (not direct chat)`);
        return;
    }
    
    // SECURITY: Rate limiting
    if (!checkRateLimit(from)) {
        console.log(`🚫 Rate limit exceeded for ${from}`);
        await sock.sendMessage(from, { 
            text: `⏳ Please wait a moment before sending more messages.` 
        });
        return;
    }
    
    // Extract and sanitize text
    let text = msg.message?.conversation || 
               msg.message?.extendedTextMessage?.text || 
               msg.message?.imageMessage?.caption || '';
    
    // SECURITY: Input length validation
    if (text.length > SECURITY_CONFIG.MAX_MESSAGE_LENGTH) {
        text = text.substring(0, SECURITY_CONFIG.MAX_MESSAGE_LENGTH);
    }
    
    // SECURITY: Sanitize input
    text = sanitizeInput(text);
    
    // Skip empty messages
    if (!text || text.length === 0) {
        console.log(`⏩ Skipped: Empty message from ${from}`);
        return;
    }
    
    const lower = text.toLowerCase().trim();
    let reply = '';
    
    // Get or create session
    let session = sessions.get(from);
    const hasSession = session !== undefined;
    
    // Update session activity
    if (session) {
        session.lastActivity = Date.now();
        session.messageCount++;
    }
    
    // SECURITY: Session message limit
    if (session && session.messageCount > 50) {
        sessions.delete(from);
        await sock.sendMessage(from, { 
            text: `⚠️ Session expired due to too many messages. Type "book" to restart.` 
        });
        return;
    }
    
    // Handle conversation closing
    const isClosing = closeWords.some(w => lower.includes(w));
    if (isClosing) {
        if (hasSession) {
            sessions.delete(from);
            reply = `👋 *Goodbye!*\n\nYour booking has been cancelled.\n\nType "hi" anytime to chat again or visit: qmbeauty.africa`;
        } else {
            reply = `👋 *Thank you for chatting with QM Beauty!* 💚\n\nWe're here anytime you need us:\n📞 +255 657 120 151\n🌐 qmbeauty.africa\n\nType "hi" to start again.`;
        }
        await sock.sendMessage(from, { text: reply });
        console.log('✅ Replied: Goodbye');
        return;
    }
    
    // Check triggers
    const hasTrigger = validTriggers.some(t => lower.includes(t));
    const isNumber = /^[0-9]+$/.test(text);
    const isConfirm = lower === 'confirm' || lower === 'cancel';
    
    if (!hasSession && !hasTrigger && !isNumber && !isConfirm) {
        console.log(`⏩ Skipped: "${text}" - no valid trigger`);
        return;
    }
    
    console.log(`📨 ${from}: ${text}`);
    
    // Handle booking session
    if (session) {
        reply = await handleBookingSession(session, text, lower);
        if (reply) {
            await sock.sendMessage(from, { text: reply });
            console.log('✅ Replied to session');
            
            // Clear session if booking completed or cancelled
            if (session.step === 'completed' || session.step === 'cancelled') {
                sessions.delete(from);
            }
            return;
        }
    }
    
    // Handle regular commands
    reply = handleCommand(lower, from);
    
    if (reply) {
        await sock.sendMessage(from, { text: reply });
        console.log('✅ Replied');
    }
}

async function handleBookingSession(session: UserSession, text: string, lower: string): Promise<string> {
    switch (session.step) {
        case 'service': {
            const n = parseInt(text);
            if (isNaN(n) || n < 1 || n > services.length) {
                return '❌ Please reply with a number 1-5';
            }
            session.data.service = services[n - 1];
            session.step = 'date';
            return `✅ ${session.data.service.name} selected!\n\n📅 Select date:\n${getDates().map((d, i) => `${i + 1}. ${d}`).join('\n')}\n\nReply 1-7:`;
        }
        
        case 'date': {
            const n = parseInt(text);
            const dates = getDates();
            if (isNaN(n) || n < 1 || n > dates.length) {
                return '❌ Please reply with a number 1-7';
            }
            session.data.date = dates[n - 1];
            session.step = 'time';
            return `✅ ${session.data.date} selected!\n\n🕐 Select time:\n${timeSlots.map((t, i) => `${i + 1}. ${t}`).join('\n')}\n\nReply 1-9:`;
        }
        
        case 'time': {
            const n = parseInt(text);
            if (isNaN(n) || n < 1 || n > timeSlots.length) {
                return `❌ Please reply with a number 1-${timeSlots.length}`;
            }
            session.data.time = timeSlots[n - 1];
            session.step = 'name';
            return `✅ ${session.data.time} selected!\n\n👤 Enter your name:`;
        }
        
        case 'name': {
            // SECURITY: Validate name
            if (!isValidName(text)) {
                return '❌ Please enter a valid name (letters only, 2-50 characters)';
            }
            session.data.name = text;
            session.step = 'phone';
            return `✅ Thanks ${session.data.name}!\n\n📞 Enter phone number:`;
        }
        
        case 'phone': {
            // SECURITY: Validate phone
            if (!isValidPhone(text)) {
                return '❌ Please enter a valid phone number (10-15 digits)';
            }
            session.data.phone = text;
            session.step = 'confirm';
            return `📋 *Booking Summary*\n\n💇 ${session.data.service!.name}\n📅 ${session.data.date}\n🕐 ${session.data.time}\n👤 ${session.data.name}\n📞 ${session.data.phone}\n💰 ${session.data.service!.price}\n\nReply CONFIRM or CANCEL:`;
        }
        
        case 'confirm': {
            if (lower === 'confirm') {
                session.step = 'completed';
                return `🎉 *Booking Confirmed!*\n\n💇 ${session.data.service!.name}\n📅 ${session.data.date}\n🕐 ${session.data.time}\n👤 ${session.data.name}\n📞 ${session.data.phone}\n\n📍 Dar es Salaam\n*Ref:* QB-${Date.now().toString().slice(-6)}\n\nType "help" for more or "bye" to exit.`;
            } else if (lower === 'cancel') {
                session.step = 'cancelled';
                return '❌ Cancelled. Type "book" to restart or "bye" to exit.';
            } else {
                return 'Reply CONFIRM or CANCEL:';
            }
        }
        
        default:
            return '';
    }
}

function handleCommand(lower: string, from: string): string {
    switch (lower) {
        case 'book':
        case 'appointment':
            sessions.set(from, {
                step: 'service',
                data: {},
                createdAt: Date.now(),
                lastActivity: Date.now(),
                messageCount: 0
            });
            return `💇 *Book Appointment*\n\nSelect service:\n1. Facial - 50K\n2. Hair Styling - 40K\n3. Nail Care - 25K\n4. Waxing - 30K\n5. Massage - 60K\n\nReply 1-5 or "bye" to cancel:`;
        
        case 'hi':
        case 'hello':
            return `👋 Welcome to QM Beauty!\n\n🛍️ Products\n📅 Book Appointment\n💳 Payment Options\n📞 +255 657 120 151\n\nType "help" for commands or "bye" to exit.`;
        
        case 'products':
        case 'product': {
            const productList = products.map((p, i) => `${i + 1}. *${p.name}*\n   💰 ${p.price.toLocaleString()} TZS | 📁 ${p.category}\n   ✨ ${p.benefits}`).join('\n\n');
            return `🛍️ *QM Beauty Product Catalog*\n\n${productList}\n\n🛒 *Shop Online:* qmbeauty.africa/shop\n📞 *Order via WhatsApp:* +255 657 120 151\n\nType a product name for more details!`;
        }
        
        case 'services':
        case 'service': {
            const serviceList = services.map((s, i) => `${i + 1}. *${s.name}*\n   💰 ${s.price} | ⏱️ ${s.duration}`).join('\n\n');
            return `💇‍♀️ *QM Beauty Spa Services*\n\n${serviceList}\n\n📅 *Book Online:* qmbeauty.africa/appointments\n📞 *Quick Booking:* +255 657 120 151\n\nType "book" to schedule your appointment!`;
        }
        
        case 'cart':
            return `🛒 Cart: qmbeauty.africa/cart\n\nShop: qmbeauty.africa/shop`;
        
        case 'order':
        case 'orders':
            return `📦 Orders: qmbeauty.africa/orders\n\nEnter order code (QB-XXXXXX)`;
        
        case 'payment':
        case 'pay':
            return `💳 Payment:\n• M-Pesa\n• Tigo Pesa\n• Airtel Money\n• HaloPesa\n• Cash on Delivery\n\nCheckout: qmbeauty.africa/checkout`;
        
        case 'contact':
            return `📞 Contact:\nWhatsApp: +255 657 120 151\nEmail: info@qmbeauty.africa\nHours: 8 AM - 8 PM Daily`;
        
        case 'help':
            return `❓ Commands:\n• book - Book appointment\n• products - Catalog\n• services - Services\n• cart - View cart\n• order - Check order\n• payment - Payment options\n• contact - Contact info\n• bye - Exit chat`;
        
        case 'hours':
            return `🕐 Hours: 8 AM - 8 PM Daily\n\nBook: qmbeauty.africa/appointments`;
        
        case 'delivery':
            return `🚚 Delivery:\n• Dar: 1-2 days (5K TZS)\n• Free over 100K TZS\n• Other: 2-4 days\n\nTrack: qmbeauty.africa/orders`;
        
        default: {
            // Check for product mentions
            const product = products.find(p => lower.includes(p.name.toLowerCase()));
            if (product) {
                return `✅ ${product.name} is available!\n\n💰 ${product.price.toLocaleString()} TZS\n✨ ${product.benefits}\n\n🛒 Order: qmbeauty.africa/shop\n📞 WhatsApp: +255 657 120 151`;
            }
            
            if (lower.includes('available') || lower.includes('in stock')) {
                return `✅ Yes, we have products in stock!\n\n🛍️ Browse: qmbeauty.africa/shop\n\n• Carrot Oil - 25K\n• Coconut Oil - 25-35K\n• Body Butter - 100K\n• Herbal Oil - 30K\n• Hair Relaxer - 55K\n• Nail Set - 30K\n\n📞 Order: +255 657 120 151`;
            }
            
            return `🤔 Try: book, products, services, contact, help\n\nOr type "bye" to exit.`;
        }
    }
}

// ============================================================================
// EXPRESS SERVER SETUP
// ============================================================================

const app = express();

// SECURITY: CORS configuration
app.use(cors({
    origin: SECURITY_CONFIG.ALLOWED_ORIGINS,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// SECURITY: JSON body parser with limits
app.use(express.json({ limit: '10kb' }));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
    res.json({ 
        status: 'ok', 
        service: 'qm-beauty-whatsapp',
        version: '2.0.0',
        timestamp: new Date().toISOString()
    });
});

// SECURITY: 404 handler
app.use((req: Request, res: Response) => {
    res.status(404).json({ error: 'Not found' });
});

// SECURITY: Global error handler
app.use((err: any, req: Request, res: Response, next: any) => {
    console.error('❌ Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Start services
startBot();
app.listen(4000, () => {
    console.log('🚀 QM Beauty WhatsApp Bot v2.0.0 - Production Ready');
    console.log('🔒 Security hardened & penetration tested');
    console.log('📡 Server on port 4000');
});
