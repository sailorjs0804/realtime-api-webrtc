import { NextRequest, NextResponse } from 'next/server';

// Allowed file extensions
const ALLOWED_EXTENSIONS = ['.pdf', '.txt', '.docx', '.md'];
// Maximum file size in bytes (10MB)
const MAX_SIZE = 10 * 1024 * 1024;
// External API endpoint
const EXTERNAL_API_URL = 'https://tianhuiai.com.cn/api/v1/upload';
// const EXTERNAL_API_URL = 'http://localhost:8000/api/v1/upload';

export async function POST(request: NextRequest) {
  try {
    console.log('Received upload request');

    // Check if the request is a multipart form
    const contentType = request.headers.get('content-type') || '';
    console.log('Content-Type:', contentType);

    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { error: 'Request must be multipart/form-data' },
        { status: 400 }
      );
    }

    // Parse the form data
    const formData = await request.formData();
    console.log('Form data keys:', [...formData.keys()]);

    const file = formData.get('file') as File | null;
    console.log('File received:', file ? `${file.name} (${file.size} bytes)` : 'No file');

    // Validate file exists
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds the ${MAX_SIZE / (1024 * 1024)}MB limit` },
        { status: 400 }
      );
    }

    // Validate file extension
    const fileName = file.name.toLowerCase();
    const fileExtension = '.' + fileName.split('.').pop();
    if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
      return NextResponse.json(
        { error: `File type not allowed. Supported types: ${ALLOWED_EXTENSIONS.join(', ')}` },
        { status: 400 }
      );
    }

    // Create a new FormData object to send to the external API
    const apiFormData = new FormData();

    // This is the key - FastAPI expects 'files' with no brackets
    apiFormData.append('files', file);

    console.log(`Sending file to ${EXTERNAL_API_URL}: ${fileName}, size: ${file.size} bytes`);
    console.log('API form data keys:', [...apiFormData.keys()]);

    // Forward the request to the external API with proper headers for a multipart form
    const apiResponse = await fetch(EXTERNAL_API_URL, {
      method: 'POST',
      body: apiFormData,
    }).catch(err => {
      throw new Error('Failed to connect to the knowledge base service');
    });

    // If the external API request fails
    if (!apiResponse.ok) {
      let errorMessage = `External API returned status ${apiResponse.status}`;

      try {
        const errorData = await apiResponse.json();
        errorMessage = errorData.error || errorData.message || errorData.msg || errorMessage;
        console.error('Formatted error message:', errorMessage);
      } catch (e) {
        console.error('Failed to parse error as JSON:', e);
        // If JSON parsing fails, use the default error message
        try {
          // Try to get text error
          const textError = await apiResponse.text();
          console.error('Error text:', textError);
          if (textError) errorMessage = textError;
        } catch (_) {
          // Ignore if we can't get text either
          console.error('Failed to get error text');
        }
      }

      console.error('External API error:', errorMessage);
      return NextResponse.json(
        { error: errorMessage },
        { status: apiResponse.status }
      );
    }

    // Parse the successful response
    let responseData;
    try {
      responseData = await apiResponse.json();
      console.log('API Response data:', responseData);
    } catch (error) {
      console.warn('Could not parse JSON from API response:', error);
      responseData = { message: 'File processed successfully, but response format was unexpected' };
    }

    console.log('File successfully processed by external API');

    // Return the response from the external API
    const response = NextResponse.json(responseData);

    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');

    return response;

  } catch (error) {
    console.error('Error processing file upload:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error during file upload' },
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