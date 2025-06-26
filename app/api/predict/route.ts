import { type NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const formData = await request.formData();

  const backendUrl = process.env.PYTHON_BACKEND_URL || 'http://localhost:8000'; // Replace with your Render backend URL
  console.log('Backend URL being used:', backendUrl);

  try {
    const response = await fetch(`${backendUrl}/predict/`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ error: errorData.detail || 'Error from backend' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error communicating with backend:', error);
    return NextResponse.json({ error: 'Failed to connect to backend' }, { status: 500 });
  }
}