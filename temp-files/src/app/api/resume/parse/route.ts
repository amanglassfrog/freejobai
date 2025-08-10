import { NextRequest, NextResponse } from 'next/server';
import { ResumeParser } from '@/lib/resumeParser';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const targetRole = formData.get('targetRole') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Unsupported file type. Please upload PDF, DOCX, or TXT files.' },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Please upload a file smaller than 10MB.' },
        { status: 400 }
      );
    }

    // Parse the resume with LLM analysis
    const parsedResume = await ResumeParser.parseFile(file, targetRole);

    return NextResponse.json({
      success: true,
      data: parsedResume
    });

  } catch (error: unknown) {
    console.error('Resume parsing error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to parse resume' },
      { status: 500 }
    );
  }
}
