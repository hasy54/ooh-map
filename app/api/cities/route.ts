import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const stateId = searchParams.get('state_id');

    let query = 'SELECT id, name FROM cities';
    const params: any[] = [];

    if (stateId) {
      query += ' WHERE state_id = $1';
      params.push(stateId);
    }

    query += ' ORDER BY name';

    const result = await pool.query(query, params);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cities' },
      { status: 500 }
    );
  }
}
