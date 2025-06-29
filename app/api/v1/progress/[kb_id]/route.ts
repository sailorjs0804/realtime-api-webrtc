import { NextRequest, NextResponse } from 'next/server';
import { apiConfig } from '@/config/api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ kb_id: string }> }
) {
  try {
    const { kb_id } = await params;

    if (!kb_id) {
      return NextResponse.json(
        { error: 'kb_id is required' },
        { status: 400 }
      );
    }

    // 构建进度查询URL
    const progressUrl = `${apiConfig.getUrl('progress')}/${kb_id}`;
    console.log(`Fetching progress from: ${progressUrl}`);

    // 查询进度
    const response = await fetch(progressUrl, {
      method: 'GET',
    }).catch(() => {
      throw new Error('Failed to connect to the knowledge base service');
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Progress not found' },
          { status: 404 }
        );
      }

      let errorMessage = `External API returned status ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorData.detail || errorMessage;
      } catch (e) {
        console.error('Failed to parse error as JSON:', e);
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    // 解析响应
    const progressData = await response.json();

    // 添加CORS头
    const responseObj = NextResponse.json(progressData);
    responseObj.headers.set('Access-Control-Allow-Origin', '*');
    responseObj.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    responseObj.headers.set('Access-Control-Allow-Headers', 'Content-Type');

    return responseObj;

  } catch (error) {
    console.error('Error fetching progress:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}