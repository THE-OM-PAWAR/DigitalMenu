import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Item from '@/models/Item';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const outletId = request.nextUrl.searchParams.get('outletId');
    const categoryId = request.nextUrl.searchParams.get('categoryId');
    
    if (!outletId) {
      return NextResponse.json({ error: 'Outlet ID is required' }, { status: 400 });
    }

    const query: any = {
      outletId,
      isActive: true,
      isAvailable: true,
    };

    if (categoryId) {
      query.categoryId = categoryId;
    }

    const items = await Item.find(query)
      .populate('categoryId', 'name')
      .populate('quantityPrices.quantityId', 'value description')
      .select('-createdBy -isActive -isAvailable')
      .sort({ sortOrder: 1, createdAt: -1 });

    return NextResponse.json({ items });
  } catch (error) {
    console.error('Get public items error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}