import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const stateId = searchParams.get('state_id');
    const cityId = searchParams.get('city_id');
    const mediaType = searchParams.get('media_type');

    let query = `
      SELECT
        m.id,
        m.name,
        m.type,
        m.traffic,
        m.width,
        m.height,
        m.lat,
        m.long,
        m.city_id,
        m.state_id,
        c.name as city_name,
        s.name as state_name
      FROM media m
      LEFT JOIN cities c ON m.city_id = c.id
      LEFT JOIN states s ON m.state_id = s.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 1;

    if (stateId) {
      query += ` AND m.state_id = $${paramCount}`;
      params.push(stateId);
      paramCount++;
    }

    if (cityId) {
      query += ` AND m.city_id = $${paramCount}`;
      params.push(cityId);
      paramCount++;
    }

    if (mediaType) {
      query += ` AND m.type = $${paramCount}`;
      params.push(mediaType);
      paramCount++;
    }

    query += ' ORDER BY m.id LIMIT 100';

    const result = await pool.query(query, params);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch media' },
      { status: 500 }
    );
  }
}
