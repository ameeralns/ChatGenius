import { NextRequest, NextResponse } from 'next/server';
import { authenticatedHandler } from '../../../utils/apiHandler';

export async function POST(
  req: NextRequest,
  { params }: { params: { messageId: string } }
) {
  return authenticatedHandler(async (userId) => {
    const { messageId } = params;
    const { emoji } = await req.json();
    
    // Here you would:
    // 1. Save the reaction to your database
    // 2. Emit WebSocket event for real-time updates
    
    return NextResponse.json({
      messageId,
      reaction: {
        [emoji]: [userId]
      }
    });
  });
} 