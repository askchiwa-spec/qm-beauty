// Evolution API Admin Routes
// Manage WhatsApp instances and QR codes

import { NextRequest, NextResponse } from 'next/server';
import { evolutionWhatsApp } from '@/lib/evolution-whatsapp';
import { isSuspiciousUserAgent } from '@/lib/security/validation';

/**
 * GET - Get instance status and QR code
 * POST - Create new instance
 * DELETE - Logout/delete instance
 */

export async function GET(request: NextRequest) {
  // Security checks
  const userAgent = request.headers.get('user-agent') || '';
  
  if (isSuspiciousUserAgent(userAgent)) {
    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 }
    );
  }
  
  try {
    // Check if Evolution API is enabled
    if (!evolutionWhatsApp.isEnabled()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Evolution API not enabled. Set USE_EVOLUTION_API=true in .env.local',
        },
        { status: 400 }
      );
    }

    // Get instance status
    const status = await evolutionWhatsApp.getInstanceStatus();

    if (!status.success) {
      return NextResponse.json(
        {
          success: false,
          error: status.error,
          suggestion: 'Instance may not exist. Try creating one first.',
        },
        { status: 404 }
      );
    }

    // Get QR code if not connected
    let qrCode = null;
    if (status.data?.instance?.state !== 'open') {
      const qrResult = await evolutionWhatsApp.getQRCode();
      if (qrResult.success) {
        qrCode = qrResult.data?.qrcode;
      }
    }

    return NextResponse.json({
      success: true,
      status: status.data,
      qrCode: qrCode,
    });
  } catch (error: any) {
    console.error('Evolution API Status Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get instance status', // Don't expose internal error details
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Security checks
  const userAgent = request.headers.get('user-agent') || '';
  
  if (isSuspiciousUserAgent(userAgent)) {
    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 }
    );
  }
  
  try {
    if (!evolutionWhatsApp.isEnabled()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Evolution API not enabled',
        },
        { status: 400 }
      );
    }

    // Create new instance
    const result = await evolutionWhatsApp.createInstance();

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 400 }
      );
    }

    // Get QR code
    const qrResult = await evolutionWhatsApp.getQRCode();

    return NextResponse.json({
      success: true,
      instance: result.data,
      qrCode: qrResult.success ? qrResult.data?.qrcode : null,
      message: 'Instance created. Scan QR code with WhatsApp to connect.',
    });
  } catch (error: any) {
    console.error('Evolution API Create Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create instance', // Don't expose internal error details
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  // Security checks
  const userAgent = request.headers.get('user-agent') || '';
  
  if (isSuspiciousUserAgent(userAgent)) {
    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 }
    );
  }
  
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'logout'; // 'logout' or 'delete'

    if (!evolutionWhatsApp.isEnabled()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Evolution API not enabled',
        },
        { status: 400 }
      );
    }

    let result;
    if (action === 'delete') {
      result = await evolutionWhatsApp.deleteInstance();
    } else {
      result = await evolutionWhatsApp.logoutInstance();
    }

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Instance ${action}d successfully`,
    });
  } catch (error: any) {
    console.error('Evolution API Delete Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete instance', // Don't expose internal error details
      },
      { status: 500 }
    );
  }
}
