import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  return new Response(
    JSON.stringify({ message: 'Socket.IO server is running' }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}
