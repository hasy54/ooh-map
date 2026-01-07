import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const stateId = searchParams.get('state_id');
    const cityId = searchParams.get('city_id');

    let query = 'SELECT DISTINCT type as name FROM media WHERE type IS NOT NULL AND type != \'\'';
    const params: any[] = [];
    let paramCount = 1;

    if (stateId && cityId) {
      query += ` AND state_id = $${paramCount} AND city_id = $${paramCount + 1}`;
      params.push(stateId, cityId);
    }

    query += ' ORDER BY type';

    const result = await pool.query(query, params);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch media types' },
      { status: 500 }
    );
  }
}
