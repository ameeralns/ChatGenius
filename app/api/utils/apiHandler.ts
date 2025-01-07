import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function authenticatedHandler(
  handler: (userId: string) => Promise<NextResponse>
) {
  const { userId } = auth();
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    return await handler(userId);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 