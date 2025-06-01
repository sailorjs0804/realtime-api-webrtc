import { NextRequest, NextResponse } from 'next/server';
import { apiConfig } from '@/config/api';

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    console.log('Query request body:', body);

    const queryUrl = apiConfig.getUrl('query');
    // Forward the request to the external API
    const apiResponse = await fetch(queryUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    // If the external API request fails
    if (!apiResponse.ok) {
      let errorMessage = `External API returned status ${apiResponse.status}`;

      try {
        const errorData = await apiResponse.json();
        errorMessage = errorData.error || errorData.message || errorData.msg || errorMessage;
      } catch {
        // If JSON parsing fails, try to get text
        try {
          const textError = await apiResponse.text();
          if (textError) errorMessage = textError;
        } catch {
          // Ignore if we can't get text either
        }
      }

      console.error('External API error:', errorMessage);
      return NextResponse.json(
        { error: errorMessage },
        { status: apiResponse.status }
      );
    }

    // Parse the successful response
    const responseData = await apiResponse.json();
    console.log('API Response data:', responseData);

    // Return the response from the external API
    const response = NextResponse.json(responseData);

    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');

    return response;

  } catch (error) {
    console.error('Error processing query:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error during query' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 });

  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');

  return response;
}