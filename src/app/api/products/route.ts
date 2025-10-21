import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Product from '@/models/Product';
import { requireAuth } from '@/lib/auth/middleware';
import { ApiResponse } from '@/types';

export const GET = requireAuth(async (request: NextRequest, user) => {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const category = searchParams.get('category');
    const inStock = searchParams.get('inStock');
    const search = searchParams.get('search');

    const skip = (page - 1) * limit;

    const query: any = {};
    if (category) {
      query.category = category;
    }
    if (inStock !== null && inStock !== undefined) {
      query.inStock = inStock === 'true';
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments(query);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          products,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get products error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
});

export const POST = requireAuth(async (request: NextRequest, user) => {
  try {
    await connectDB();

    const body = await request.json();
    const { name, description, price, currency, imageUrl, category, sku, inStock } = body;

    if (!name || !description || price === undefined) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'Name, description, and price are required',
        },
        { status: 400 }
      );
    }

    const product = new Product({
      name,
      description,
      price,
      currency: currency || 'USD',
      imageUrl,
      category,
      sku,
      inStock: inStock !== undefined ? inStock : true,
      createdBy: user.userId,
    });

    await product.save();

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: product,
        message: 'Product created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
});
