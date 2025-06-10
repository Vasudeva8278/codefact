import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Studio from '@/models/Studio';

// GET /api/studios - Get all studios with optional filters
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const city = searchParams.get('city') || '';
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const minDistance = searchParams.get('minDistance');
    const maxDistance = searchParams.get('maxDistance');
    const minRating = searchParams.get('minRating');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Build query
    let query: any = { isActive: true };

    // Search by studio name or description
    if (search) {
      query.$text = { $search: search };
    }

    // Filter by city
    if (city) {
      query['location.city'] = new RegExp(city, 'i');
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      query.perHourCharge = {};
      if (minPrice) query.perHourCharge.$gte = Number(minPrice);
      if (maxPrice) query.perHourCharge.$lte = Number(maxPrice);
    }

    // Filter by distance range
    if (minDistance || maxDistance) {
      query.maxDistance = {};
      if (minDistance) query.maxDistance.$gte = Number(minDistance);
      if (maxDistance) query.maxDistance.$lte = Number(maxDistance);
    }

    // Filter by minimum rating
    if (minRating) {
      query.rating = { $gte: Number(minRating) };
    }

    // Execute query with pagination
    const studios = await Studio.find(query)
      .sort({ rating: -1, createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    // Ensure images field is always an array
    const formattedStudios = studios.map(studio => {
      const studioObj = studio.toObject() as any;
      return {
        ...studioObj,
        images: studioObj.images || []
      };
    });

    // Get total count for pagination
    const totalCount = await Studio.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: {
        studios: formattedStudios,
        pagination: {
          current: page,
          total: Math.ceil(totalCount / limit),
          hasNext: page < Math.ceil(totalCount / limit),
          hasPrev: page > 1,
          totalCount
        }
      }
    });
  } catch (error) {
    console.error('Get studios error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch studios',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/studios - Create a new studio
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const {
      studioName,
      description,
      address,
      location,
      perHourCharge,
      maxDistance,
      imageUrl,
      services,
      equipment
    } = body;

    // Validate required fields
    if (!studioName || !description || !address || !perHourCharge) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required fields',
          required: ['studioName', 'description', 'address', 'perHourCharge']
        },
        { status: 400 }
      );
    }

    // Validate location object
    if (!location?.city || !location?.state || !location?.zipCode) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Location details are required',
          required: ['city', 'state', 'zipCode']
        },
        { status: 400 }
      );
    }

    // Prepare images array
    const images = imageUrl ? [{ url: imageUrl }] : [];

    // Create new studio
    const studio = new Studio({
      studioName,
      description,
      address,
      location,
      perHourCharge: Number(perHourCharge),
      maxDistance: Number(maxDistance) || 50,
      images,
      services: services || [],
      equipment: equipment || [],
      rating: 0,
      isActive: true
    });

    await studio.save();

    return NextResponse.json({
      success: true,
      data: studio
    }, { status: 201 });
  } catch (error) {
    console.error('Create studio error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to create studio',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PATCH /api/studios/:id - Update a studio
export async function PATCH(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Studio ID is required' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const {
      studioName,
      description,
      address,
      location,
      perHourCharge,
      maxDistance,
      rating,
      isActive
    } = body;

    const updateData: any = {};
    if (studioName) updateData.studioName = studioName;
    if (description) updateData.description = description;
    if (address) updateData.address = address;
    if (location) updateData.location = location;
    if (perHourCharge) updateData.perHourCharge = Number(perHourCharge);
    if (maxDistance) updateData.maxDistance = Number(maxDistance);
    if (rating !== undefined) updateData.rating = Number(rating);
    if (isActive !== undefined) updateData.isActive = isActive;

    const studio = await Studio.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!studio) {
      return NextResponse.json(
        { success: false, error: 'Studio not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: studio
    });
  } catch (error) {
    console.error('Update studio error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update studio',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/studios/:id - Delete a studio
export async function DELETE(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Studio ID is required' },
        { status: 400 }
      );
    }

    const studio = await Studio.findByIdAndDelete(id);

    if (!studio) {
      return NextResponse.json(
        { success: false, error: 'Studio not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Studio deleted successfully'
    });
  } catch (error) {
    console.error('Delete studio error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to delete studio',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}