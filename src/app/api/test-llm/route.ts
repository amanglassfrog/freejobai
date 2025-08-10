import { NextResponse } from 'next/server';
import { LLMAnalyzer } from '@/lib/llmAnalyzer';

export async function GET() {
  try {
    console.log('Testing LLM connection...');
    const isConnected = await LLMAnalyzer.testLLMConnection();
    
    return NextResponse.json({
      success: true,
      connected: isConnected,
      message: isConnected ? 'LLM connection successful' : 'LLM connection failed'
    });
  } catch (error) {
    console.error('LLM test error:', error);
    return NextResponse.json(
      { 
        success: false, 
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
