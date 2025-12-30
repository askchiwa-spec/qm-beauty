'use client';

import { useState } from 'react';

export default function WhatsAppTestPage() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [testPhone, setTestPhone] = useState('255657120151');
  const [testMessage, setTestMessage] = useState('Hello from QM Beauty! 🌺');
  const [result, setResult] = useState<any>(null);

  const checkStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/whatsapp/evolution');
      const data = await response.json();
      setStatus(data);
    } catch (error: any) {
      setStatus({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const createInstance = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/whatsapp/evolution', {
        method: 'POST',
      });
      const data = await response.json();
      setStatus(data);
    } catch (error: any) {
      setStatus({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const sendTestMessage = async () => {
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch('/api/test/whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: testPhone,
          message: testMessage,
        }),
      });
      const data = await response.json();
      setResult(data);
    } catch (error: any) {
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">
          WhatsApp Evolution API - Test Dashboard
        </h1>

        {/* Instance Management */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Instance Management</h2>
          
          <div className="flex gap-4 mb-4">
            <button
              onClick={checkStatus}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded disabled:bg-gray-400"
            >
              {loading ? 'Loading...' : 'Check Status'}
            </button>
            
            <button
              onClick={createInstance}
              disabled={loading}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded disabled:bg-gray-400"
            >
              {loading ? 'Creating...' : 'Create Instance'}
            </button>
          </div>

          {status && (
            <div className="bg-gray-100 p-4 rounded mt-4">
              <h3 className="font-semibold mb-2">Status Response:</h3>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(status, null, 2)}
              </pre>
              
              {status.qrCode && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">QR Code:</h3>
                  <img 
                    src={status.qrCode.base64} 
                    alt="WhatsApp QR Code" 
                    className="border-4 border-green-500 rounded"
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    Scan this with WhatsApp: Settings → Linked Devices → Link a Device
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Message Testing */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Message Sending</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Phone Number (Tanzania format)
              </label>
              <input
                type="text"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="255715727085"
                className="w-full border border-gray-300 rounded px-4 py-2"
              />
              <p className="text-xs text-gray-500 mt-1">
                Format: 255XXXXXXXXX (no plus, no spaces)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Message
              </label>
              <textarea
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                rows={4}
                className="w-full border border-gray-300 rounded px-4 py-2"
              />
            </div>

            <button
              onClick={sendTestMessage}
              disabled={loading}
              className="bg-[#25D366] hover:bg-[#20BA5A] text-white px-6 py-2 rounded disabled:bg-gray-400 w-full"
            >
              {loading ? 'Sending...' : 'Send Test Message'}
            </button>
          </div>

          {result && (
            <div className="bg-gray-100 p-4 rounded mt-4">
              <h3 className="font-semibold mb-2">Send Result:</h3>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
              
              {result.success && (
                <div className="mt-4 p-3 bg-green-100 border border-green-400 rounded">
                  <p className="text-green-800 font-semibold">
                    ✅ Message sent successfully!
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    Provider: {result.provider || 'Unknown'}
                  </p>
                  {result.messageId && (
                    <p className="text-xs text-green-600 mt-1">
                      Message ID: {result.messageId}
                    </p>
                  )}
                </div>
              )}
              
              {result.error && (
                <div className="mt-4 p-3 bg-red-100 border border-red-400 rounded">
                  <p className="text-red-800 font-semibold">
                    ❌ Error: {result.error}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
          
          <div className="space-y-2">
            <a
              href="http://localhost:8080"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-blue-600 hover:underline"
            >
              🔗 Evolution API Dashboard (localhost:8080)
            </a>
            
            <a
              href="http://localhost:8080/instance/qrcode/qm-beauty"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-blue-600 hover:underline"
            >
              📱 View QR Code Directly
            </a>
            
            <a
              href="https://doc.evolution-api.com"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-blue-600 hover:underline"
            >
              📚 Evolution API Documentation
            </a>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
          <h3 className="font-semibold text-blue-900 mb-2">
            📋 Quick Setup Instructions:
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-800 text-sm">
            <li>Make sure Docker is running</li>
            <li>Run: <code className="bg-blue-100 px-2 py-1 rounded">docker-compose -f docker-compose.evolution.yml up -d</code></li>
            <li>Click "Create Instance" button above</li>
            <li>Scan the QR code with WhatsApp on your phone</li>
            <li>Wait for "Connected" status</li>
            <li>Try sending a test message!</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
