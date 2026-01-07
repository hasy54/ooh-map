import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET /api/media/[id]/images - Fetch all images for a media listing
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const result = await pool.query(
      'SELECT id, image_url, display_order FROM media_images WHERE media_id = $1 ORDER BY display_order ASC, created_at ASC',
      [id]
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching media images:', error);
    return NextResponse.json(
      { error: 'Failed to fetch images' },
      { status: 500 }
    );
  }
}

// POST /api/media/[id]/images - Add image URLs to a media listing
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { image_url, display_order = 0 } = body;

    if (!image_url) {
      return NextResponse.json(
        { error: 'image_url is required' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      'INSERT INTO media_images (media_id, image_url, display_order) VALUES ($1, $2, $3) RETURNING id, image_url, display_order',
      [id, image_url, display_order]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error adding media image:', error);
    return NextResponse.json(
      { error: 'Failed to add image' },
      { status: 500 }
    );
  }
}
