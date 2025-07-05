import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const outletId = request.nextUrl.searchParams.get('outletId');
    
    if (!outletId) {
      return NextResponse.json({ error: 'Outlet ID is required' }, { status: 400 });
    }

    const categories = await Category.find({
      outletId,
      isActive: true,
    })
      .select('-createdBy -isActive')
      .sort({ sortOrder: 1, createdAt: -1 });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Get public categories error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}