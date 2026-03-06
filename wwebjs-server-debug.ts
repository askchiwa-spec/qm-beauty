/**
 * QM Beauty WhatsApp Bot - Debug & Enhanced Logging Version
 * Security Hardened with Comprehensive Message Tracking
 * Version: 2.1.0-DEBUG
 */

import { makeWASocket, DisconnectReason, useMultiFileAuthState, WASocket } from '@whiskeysockets/baileys';
import express, { Request, Response } from 'express';
import cors from 'cors';
import { Boom } from '@hapi/boom';

const QRCode = require('qrcode-terminal');

// ============================================================================
// DEBUG LOGGER
// ============================================================================

interface MessageLog {
    timestamp: string;
    phoneNumber: string;
    messageId: string;
    messageType: string;
    content: string;
    processed: boolean;
    ignored: boolean;
    ignoreReason?: string;
    replySent: boolean;
    replyContent?: string;
    error?: string;
}

const messageLogs: MessageLog[] = [];
const MAX_LOGS = 1000;

function logMessage(log: MessageLog): void {
    messageLogs.unshift(log);
    if (messageLogs.length > MAX_LOGS) {
        messageLogs.pop();
    }
    
    // Console output with clear formatting
    const status = log.processed ? (log.replySent ? '✅ REPLIED' : '❌ NO REPLY') : '⏩ IGNORED';
    console.log(`\n[${log.timestamp}] ${status}`);
    console.log(`  Phone: ${log.phoneNumber}`);
    console.log(`  MsgID: ${log.messageId}`);
    console.log(`  Type: ${log.messageType}`);
    console.log(`  Content: "${log.content.substring(0, 50)}${log.content.length > 50 ? '...' : ''}"`);
    if (log.ignoreReason) console.log(`  Reason: ${log.ignoreReason}`);
    if (log.error) console.log(`  Error: ${log.error}`);
    console.log('─'.repeat(60));
}

// ============================================================================
// SECURITY CONFIGURATION
// ============================================================================

const SECURITY_CONFIG = {
    MAX_MESSAGES_PER_MINUTE: 30,
    MAX_MESSAGES_PER_HOUR: 200,
    SESSION_TIMEOUT_MS: 30 * 60 * 1000,
    MAX_MESSAGE_LENGTH: 500,
    MAX_NAME_LENGTH: 50,
    MAX_PHONE_LENGTH: 20,
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
        orderCode?: string;
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

function sanitizeInput(input: string): string {
    return input
        .replace(/[<>]/g, '')
        .replace(/[\x00-\x1F\x7F]/g, '')
        .trim();
}

function isValidPhone(phone: string): boolean {
    const cleanPhone = phone.replace(/\s/g, '').replace(/-/g, '');
    return /^[\+]?[\d]{10,15}$/.test(cleanPhone);
}

function isValidName(name: string): boolean {
    return /^[a-zA-Z\s'-]{2,50}$/.test(name);
}

function checkRateLimit(userId: string): boolean {
    const now = Date.now();
    const limit = rateLimits.get(userId);
    
    if (!limit || now > limit.resetTime) {
        rateLimits.set(userId, {
            count: 1,
            resetTime: now + 60000
        });
        return true;
    }
    
    if (limit.count >= SECURITY_CONFIG.MAX_MESSAGES_PER_MINUTE) {
        return false;
    }
    
    limit.count++;
    return true;
}

function cleanupSessions(): void {
    const now = Date.now();
    for (const [userId, session] of sessions.entries()) {
        if (now - session.lastActivity > SECURITY_CONFIG.SESSION_TIMEOUT_MS) {
            sessions.delete(userId);
            console.log(`🧹 Cleaned up expired session for ${userId}`);
        }
    }
}

setInterval(cleanupSessions, 5 * 60 * 1000);

// ============================================================================
// MESSAGE HANDLING WITH DEBUG LOGGING
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

let sock: WASocket | null = null;
let isConnected = false;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;

async function startBot(): Promise<void> {
    try {
        console.log('🚀 Starting WhatsApp Bot...');
        
        const { state, saveCreds } = await useMultiFileAuthState('baileys-auth');
        sock = makeWASocket({ 
            auth: state, 
            printQRInTerminal: false,
            connectTimeoutMs: 60000,
            keepAliveIntervalMs: 30000,
            defaultQueryTimeoutMs: 60000,
            retryRequestDelayMs: 250
        });
        
        sock.ev.on('creds.update', saveCreds);
        
        sock.ev.on('connection.update', (update) => {
            const { connection, lastDisconnect, qr } = update;
            
            if (qr) { 
                console.log('📱 Scan QR:'); 
                QRCode.generate(qr, { small: true }); 
            }
            
            if (connection === 'close') {
                isConnected = false;
                const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
                const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
                
                console.log(`⚠️ Connection closed. Status: ${statusCode}, Reconnect: ${shouldReconnect}`);
                
                if (shouldReconnect && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
                    reconnectAttempts++;
                    console.log(`🔄 Reconnecting... Attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}`);
                    setTimeout(() => startBot(), 5000 * reconnectAttempts);
                } else if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
                    console.error('❌ Max reconnection attempts reached. Manual restart required.');
                }
            } else if (connection === 'open') {
                isConnected = true;
                reconnectAttempts = 0;
                console.log('✅ WhatsApp ready!');
            } else if (connection === 'connecting') {
                console.log('⏳ Connecting to WhatsApp...');
            }
        });
        
        // CRITICAL: Ensure only ONE message handler is registered
        sock.ev.removeAllListeners('messages.upsert');
        
        sock.ev.on('messages.upsert', async (m) => {
            // Process each message
            for (const msg of m.messages) {
                await processMessage(msg, m.type);
            }
        });
        
    } catch (error) {
        console.error('❌ Fatal error starting bot:', error);
        setTimeout(() => startBot(), 10000);
    }
}

async function processMessage(msg: any, type: string): Promise<void> {
    const timestamp = new Date().toISOString();
    const messageId = msg.key.id || 'unknown';
    const from = msg.key.remoteJid as string;
    
    // Initialize log entry
    const logEntry: MessageLog = {
        timestamp,
        phoneNumber: from || 'unknown',
        messageId,
        messageType: type,
        content: '',
        processed: false,
        ignored: false,
        replySent: false
    };
    
    try {
        // Check 1: From me
        if (msg.key.fromMe) {
            logEntry.ignored = true;
            logEntry.ignoreReason = 'Message from bot itself (fromMe=true)';
            logMessage(logEntry);
            return;
        }
        
        // Check 2: Not a notification
        if (type !== 'notify') {
            logEntry.ignored = true;
            logEntry.ignoreReason = `Not a notify message (type=${type})`;
            logMessage(logEntry);
            return;
        }
        
        // Check 3: Invalid JID
        if (!from) {
            logEntry.ignored = true;
            logEntry.ignoreReason = 'No remoteJid (from is null/undefined)';
            logMessage(logEntry);
            return;
        }
        
        // Check 4: Not a direct chat
        if (!from.endsWith('@s.whatsapp.net')) {
            logEntry.ignored = true;
            logEntry.ignoreReason = `Not a direct chat (jid=${from})`;
            logMessage(logEntry);
            return;
        }
        
        // Check 5: Rate limiting
        if (!checkRateLimit(from)) {
            logEntry.ignored = true;
            logEntry.ignoreReason = 'Rate limit exceeded';
            logMessage(logEntry);
            
            await sock?.sendMessage(from, { 
                text: `⏳ Please wait a moment before sending more messages.` 
            });
            return;
        }
        
        // Extract message content
        let text = msg.message?.conversation || 
                   msg.message?.extendedTextMessage?.text || 
                   msg.message?.imageMessage?.caption || '';
        
        logEntry.content = text;
        
        // Check 6: Empty message
        if (!text || text.length === 0) {
            logEntry.ignored = true;
            logEntry.ignoreReason = 'Empty message content';
            logMessage(logEntry);
            return;
        }
        
        // Check 7: Message too long
        if (text.length > SECURITY_CONFIG.MAX_MESSAGE_LENGTH) {
            text = text.substring(0, SECURITY_CONFIG.MAX_MESSAGE_LENGTH);
        }
        
        // Sanitize
        text = sanitizeInput(text);
        logEntry.content = text;
        
        const lower = text.toLowerCase().trim();
        
        // Get session
        let session = sessions.get(from);
        const hasSession = session !== undefined;
        
        if (session) {
            session.lastActivity = Date.now();
            session.messageCount++;
        }
        
        // Check 8: Session message limit
        if (session && session.messageCount > 50) {
            sessions.delete(from);
            logEntry.ignoreReason = 'Session message limit exceeded';
            logMessage(logEntry);
            
            await sock?.sendMessage(from, { 
                text: `⚠️ Session expired due to too many messages. Type "book" to restart.` 
            });
            return;
        }
        
        // Check 9: Closing words
        const isClosing = closeWords.some(w => lower.includes(w));
        if (isClosing) {
            let reply = '';
            if (hasSession) {
                sessions.delete(from);
                reply = `👋 *Goodbye!*\n\nYour booking has been cancelled.\n\nType "hi" anytime to chat again or visit: qmbeauty.africa`;
            } else {
                reply = `👋 *Thank you for chatting with QM Beauty!* 💚\n\nWe're here anytime you need us:\n📞 +255 657 120 151\n🌐 qmbeauty.africa\n\nType "hi" to start again.`;
            }
            
            await sock?.sendMessage(from, { text: reply });
            
            logEntry.processed = true;
            logEntry.replySent = true;
            logEntry.replyContent = reply;
            logMessage(logEntry);
            return;
        }
        
        // Check 10: Valid trigger/session
        const hasTrigger = validTriggers.some(t => lower.includes(t));
        const isNumber = /^[0-9]+$/.test(text);
        const isConfirm = lower === 'confirm' || lower === 'cancel';
        const isOrderCode = /^qb-\d{6}$/i.test(text.trim());
        
        if (!hasSession && !hasTrigger && !isNumber && !isConfirm && !isOrderCode) {
            logEntry.ignored = true;
            logEntry.ignoreReason = `No valid trigger (hasTrigger=${hasTrigger}, isNumber=${isNumber}, isConfirm=${isConfirm}, isOrderCode=${isOrderCode})`;
            logMessage(logEntry);
            return;
        }
        
        // Process message
        logEntry.processed = true;
        let reply = '';
        
        if (session) {
            reply = await handleBookingSession(session, text, lower);
            if (reply) {
                await sock?.sendMessage(from, { text: reply });
                logEntry.replySent = true;
                logEntry.replyContent = reply;
                
                if (session.step === 'completed' || session.step === 'cancelled') {
                    sessions.delete(from);
                }
            } else {
                logEntry.ignoreReason = 'handleBookingSession returned empty reply';
            }
        } else {
            reply = handleCommand(lower, from);
            if (reply) {
                await sock?.sendMessage(from, { text: reply });
                logEntry.replySent = true;
                logEntry.replyContent = reply;
            } else {
                logEntry.ignoreReason = 'handleCommand returned empty reply';
            }
        }
        
        logMessage(logEntry);
        
    } catch (error: any) {
        logEntry.error = error.message || 'Unknown error';
        logMessage(logEntry);
        
        console.error('❌ Error processing message:', error);
        
        // Try to send error message to user
        try {
            if (from && sock) {
                await sock.sendMessage(from, { 
                    text: `⚠️ Sorry, an error occurred. Please try again or contact us at +255 657 120 151` 
                });
            }
        } catch (sendError) {
            console.error('❌ Failed to send error message:', sendError);
        }
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
            if (!isValidName(text)) {
                return '❌ Please enter a valid name (letters only, 2-50 characters)';
            }
            session.data.name = text;
            session.step = 'phone';
            return `✅ Thanks ${session.data.name}!\n\n📞 Enter phone number:`;
        }
        
        case 'phone': {
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
        
        case 'order': {
            if (/^qb-\d{6}$/i.test(text.trim())) {
                const orderCode = text.trim().toUpperCase();
                session.data.orderCode = orderCode;
                session.step = 'order_action';
                return `📦 *Order Status: ${orderCode}*\n\n` +
                       `✅ Order confirmed and processed\n` +
                       `📍 Status: Being prepared\n` +
                       `🚚 Delivery: 1-2 business days\n\n` +
                       `What would you like to do?\n` +
                       `1. Track order\n` +
                       `2. Contact support\n` +
                       `3. Cancel order\n\n` +
                       `Reply 1-3 or "bye" to exit:`;
            } else {
                return '❌ Invalid order code. Please enter code in format QB-XXXXXX (e.g., QB-123456)';
            }
        }
        
        case 'order_action': {
            const n = parseInt(text);
            if (isNaN(n) || n < 1 || n > 3) {
                return '❌ Please reply with 1, 2, or 3';
            }
            
            const orderCode = session.data.orderCode;
            
            switch (n) {
                case 1:
                    session.step = 'completed';
                    return `🚚 *Track Order: ${orderCode}*\n\n` +
                           `Current Status: In transit\n` +
                           `Expected Delivery: 1-2 business days\n\n` +
                           `Track online:\n` +
                           `🌐 qmbeauty.africa/orders\n\n` +
                           `Need help? Contact us:\n` +
                           `📞 +255 657 120 151`;
                
                case 2:
                    session.step = 'completed';
                    return `📞 *Contact Support*\n\n` +
                           `Order: ${orderCode}\n\n` +
                           `WhatsApp: +255 657 120 151\n` +
                           `Email: info@qmbeauty.africa\n` +
                           `Hours: 8 AM - 8 PM Daily\n\n` +
                           `We're here to help!`;
                
                case 3:
                    session.step = 'completed';
                    return `❌ *Cancel Order: ${orderCode}*\n\n` +
                           `To cancel your order, please contact us:\n\n` +
                           `📞 WhatsApp: +255 657 120 151\n` +
                           `✉️ Email: info@qmbeauty.africa\n\n` +
                           `Note: Orders can only be cancelled before shipping.`;
            }
            return '';
        }
        
        default:
            return '';
    }
}

function handleCommand(lower: string, from: string) {
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
            sessions.set(from, {
                step: 'order',
                data: {},
                createdAt: Date.now(),
                lastActivity: Date.now(),
                messageCount: 0
            });
            return `📦 *Order Tracking*\n\nPlease enter your order code:\n(Format: QB-XXXXXX)\n\nOr type "bye" to cancel.`;
        
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
            if (/^qb-\d{6}$/i.test(lower)) {
                const orderCode = lower.toUpperCase();
                return `📦 *Order Status: ${orderCode}*\n\n` +
                       `✅ Order confirmed and processed\n` +
                       `📍 Status: Being prepared\n` +
                       `🚚 Delivery: 1-2 business days\n\n` +
                       `Track your order:\n` +
                       `🌐 qmbeauty.africa/orders\n\n` +
                       `Need help? Contact us:\n` +
                       `📞 +255 657 120 151`;
            }
            
            const product = products.find(p => lower.includes(p.name.toLowerCase()));
            if (product) {
                return `✅ ${product.name} is available!\n\n💰 ${product.price.toLocaleString()} TZS\n✨ ${product.benefits}\n\n🛒 Order: qmbeauty.africa/shop\n📞 WhatsApp: +255 657 120 151`;
            }
            
            return '';
        }
    }
}

// ============================================================================
// EXPRESS SERVER FOR MONITORING
// ============================================================================

const app = express();
app.use(cors({ origin: SECURITY_CONFIG.ALLOWED_ORIGINS }));
app.use(express.json());

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
    res.json({
        status: 'ok',
        connected: isConnected,
        reconnectAttempts,
        activeSessions: sessions.size,
        messageLogsCount: messageLogs.length,
        uptime: process.uptime()
    });
});

// Get message logs endpoint
app.get('/logs', (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 100;
    res.json({
        logs: messageLogs.slice(0, limit),
        total: messageLogs.length
    });
});

// Get logs for specific phone number
app.get('/logs/:phone', (req: Request, res: Response) => {
    const phone = req.params.phone;
    const logs = messageLogs.filter(log => log.phoneNumber.includes(phone));
    res.json({
        logs,
        total: logs.length
    });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`🚀 Server on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`📋 Message logs: http://localhost:${PORT}/logs`);
});

// ============================================================================
// PROCESS-LEVEL ERROR HANDLERS
// Baileys WebSocket stream errors (TransformError, NetworkError) bubble up as
// uncaught exceptions and crash the process. Catch them here and reconnect.
// ============================================================================

process.on('uncaughtException', (error: Error) => {
    console.error(`[${new Date().toISOString()}] ❌ Uncaught Exception: ${error.name}: ${error.message}`);

    const isStreamError = error.name === 'TransformError'
        || error.name === 'NetworkError'
        || error.message.includes('TransformError')
        || error.message.includes('stream')
        || error.message.includes('WebSocket');

    if (isStreamError) {
        console.log('🔄 Stream/network error — restarting bot in 5s...');
        reconnectAttempts = 0;
        isConnected = false;
        sock = null;
        setTimeout(() => startBot(), 5000);
    } else {
        console.error('💀 Non-recoverable error — process exiting.');
        process.exit(1);
    }
});

process.on('unhandledRejection', (reason: any) => {
    console.error(`[${new Date().toISOString()}] ⚠️ Unhandled Rejection:`, reason?.message || reason);
});

// Start bot
startBot();
