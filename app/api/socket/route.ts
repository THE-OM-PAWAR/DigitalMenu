import { NextRequest } from 'next/server';
import { Server as ServerIO } from 'socket.io';
import { Server as NetServer } from 'http';

export async function GET(req: NextRequest) {
  return new Response('Socket.IO server endpoint', { status: 200 });
}

export async function POST(req: NextRequest) {
  return new Response('Socket.IO server endpoint', { status: 200 });
}