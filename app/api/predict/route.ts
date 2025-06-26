
import { type NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  const backendUrl = process.env.PYTHON_BACKEND_URL || 'http://localhost:8000'; // Replace with your Render backend URL

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
