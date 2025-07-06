import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    console.log('Testing CORS with API:', {
      apiUrl: process.env.NEXT_PUBLIC_API_URL,
      body
    });

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      credentials: 'include',
    });

    const data = await response.text();
    
    console.log('API Response:', {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      data
    });

    if (!response.ok) {
      return NextResponse.json(
        { 
          error: 'API request failed', 
          status: response.status,
          data,
          headers: Object.fromEntries(response.headers.entries())
        },
        { status: response.status }
      );
    }

    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    console.error('CORS test error:', error);
    return NextResponse.json(
      { 
        error: 'CORS test failed', 
        message: error instanceof Error ? error.message : 'Unknown error',
        apiUrl: process.env.NEXT_PUBLIC_API_URL
      },
      { status: 500 }
    );
  }
}