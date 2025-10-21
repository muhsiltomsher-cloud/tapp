import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Product from '@/models/Product';
import { authenticateRequest } from '@/lib/auth/middleware';
import { ApiResponse, UserRole } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = authenticateRequest(request);
  if (!user) {
    return NextResponse.json<ApiResponse>(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    await connectDB();
    const { id } = await params;

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'Product not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: product,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get product error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = authenticateRequest(request);
  if (!user || ![UserRole.ADMIN, UserRole.MASTER_ADMIN].includes(user.role as UserRole)) {
    return NextResponse.json<ApiResponse>(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    await connectDB();
    const { id } = await params;

    const body = await request.json();
    const { name, description, price, currency, imageUrl, category, inStock, sku } = body;

    const updateData: Record<string, unknown> = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = price;
    if (currency) updateData.currency = currency;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (category) updateData.category = category;
    if (inStock !== undefined) updateData.inStock = inStock;
    if (sku) updateData.sku = sku;

    const product = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!product) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'Product not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: product,
        message: 'Product updated successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = authenticateRequest(request);
  if (!user || ![UserRole.ADMIN, UserRole.MASTER_ADMIN].includes(user.role as UserRole)) {
    return NextResponse.json<ApiResponse>(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    await connectDB();
    const { id } = await params;

    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'Product not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        message: 'Product deleted successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
