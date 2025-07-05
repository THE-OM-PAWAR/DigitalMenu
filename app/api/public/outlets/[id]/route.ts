import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Outlet from '@/models/Outlet';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const outlet = await Outlet.findById(params.id).select('-createdBy -adminUserId');

    if (!outlet) {
      return NextResponse.json({ error: 'Outlet not found' }, { status: 404 });
    }

    return NextResponse.json({ outlet });
  } catch (error) {
    console.error('Get public outlet error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}