import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || text.length < 50) {
      return NextResponse.json(
        { error: "Text is too short for meaningful analysis" },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Enhanced engineering analysis with comprehensive prompts
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are an expert engineering document analyzer with deep knowledge across all engineering disciplines. Your task is to analyze technical documents and extract comprehensive engineering information.

ANALYSIS REQUIREMENTS:

1. ENGINEERING DISCIPLINES: Identify specific engineering fields mentioned (e.g., "Mechanical Engineering", "Civil Engineering", "Electrical Engineering", "Software Engineering", "Chemical Engineering", "Biomedical Engineering", "Aerospace Engineering", "Computer Engineering", "Industrial Engineering", "Materials Engineering", "Nuclear Engineering", "Environmental Engineering", "Structural Engineering", "Systems Engineering", "Robotics Engineering", etc.)

2. TECHNICAL KEYWORDS: Extract important technical terms, technologies, methodologies, standards, tools, and concepts related to engineering. Include:
   - Programming languages and frameworks (Python, Java, C++, React, Angular, etc.)
   - Engineering software (CAD, SolidWorks, MATLAB, ANSYS, etc.)
   - Hardware and electronics (Arduino, Raspberry Pi, FPGA, PCB, etc.)
   - AI/ML technologies (Machine Learning, Neural Networks, Computer Vision, etc.)
   - Engineering standards (ISO, ASTM, ASME, IEEE, etc.)
   - Manufacturing processes (Lean, Six Sigma, Agile, etc.)
   - Analysis methods (FEA, CFD, Stress Analysis, etc.)

3. SPECIALIZATIONS: Identify sub-specializations or specific areas within engineering disciplines (e.g., "Control Systems", "Power Electronics", "Structural Analysis", "Machine Learning", "Robotics", "Thermal Management", "Fluid Dynamics", etc.)

4. TECHNICAL COMPLEXITY: Assess the technical complexity level (Basic, Intermediate, Advanced, Expert)

5. DOCUMENT TYPE: Identify the type of engineering document (Research Paper, Technical Specification, Design Document, User Manual, Standards Document, Patent, etc.)

RESPONSE FORMAT (JSON only):
{
  "disciplines": ["discipline1", "discipline2", ...],
  "keywords": ["keyword1", "keyword2", ...],
  "specializations": ["specialization1", "specialization2", ...],
  "complexity": "Basic|Intermediate|Advanced|Expert",
  "documentType": "document_type",
  "confidence": 0.85
}

Be thorough but only include terms that are clearly engineering-related. Avoid generic words. Provide accurate, specific technical terms.`,
        },
        {
          role: "user",
          content: `Analyze this engineering document and extract comprehensive technical information:\n\n${text.substring(0, 4000)}`,
        },
      ],
      max_tokens: 1500,
      temperature: 0.1,
    });

    const response = completion.choices[0]?.message?.content?.trim();

    if (!response) {
      return NextResponse.json(
        { error: "Failed to analyze text" },
        { status: 500 }
      );
    }

    try {
      const parsed = JSON.parse(response);
      
      // Validate and clean the parsed data
      const disciplines = Array.isArray(parsed.disciplines) ? parsed.disciplines as string[] : [];
      const keywords = Array.isArray(parsed.keywords) ? parsed.keywords as string[] : [];
      const specializations = Array.isArray(parsed.specializations) ? parsed.specializations as string[] : [];
      const complexity = parsed.complexity || "Intermediate";
      const documentType = parsed.documentType || "Technical Document";
      const confidence = typeof parsed.confidence === 'number' ? parsed.confidence : 0.8;

      // Remove duplicates and clean up terms
      const cleanDisciplines = [...new Set(disciplines)].filter(term => term.length > 2);
      const cleanKeywords = [...new Set(keywords)].filter(term => term.length > 2);
      const cleanSpecializations = [...new Set(specializations)].filter(term => term.length > 2);

      return NextResponse.json({
        success: true,
        disciplines: cleanDisciplines,
        keywords: cleanKeywords,
        specializations: cleanSpecializations,
        technicalTerms: cleanKeywords,
        complexity: complexity,
        documentType: documentType,
        confidence: confidence,
        analysisSummary: {
          totalTerms: cleanDisciplines.length + cleanKeywords.length + cleanSpecializations.length,
          primaryDiscipline: cleanDisciplines[0] || "General Engineering",
          technicalLevel: complexity,
          documentCategory: documentType
        }
      });
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      console.error("Raw response:", response);
      
      // Fallback: try to extract basic information from the response
      const fallbackDisciplines = response.match(/(?:mechanical|electrical|civil|software|chemical|biomedical|aerospace|computer|industrial|materials|nuclear|environmental|structural|systems|robotics)\s+engineering/gi) || [];
      const fallbackKeywords = response.match(/\b(?:python|java|c\+\+|react|angular|cad|solidworks|matlab|arduino|machine\s+learning|iso|astm|asme|ieee|lean|agile|scrum|fmea|fea|cfd)\b/gi) || [];
      
      return NextResponse.json({
        success: true,
        disciplines: [...new Set(fallbackDisciplines)],
        keywords: [...new Set(fallbackKeywords)],
        specializations: [],
        technicalTerms: [...new Set(fallbackKeywords)],
        complexity: "Intermediate",
        documentType: "Technical Document",
        confidence: 0.6,
        analysisSummary: {
          totalTerms: fallbackDisciplines.length + fallbackKeywords.length,
          primaryDiscipline: fallbackDisciplines[0] || "General Engineering",
          technicalLevel: "Intermediate",
          documentCategory: "Technical Document"
        }
      });
    }

  } catch (error: any) {
    console.error("Engineering analysis error:", error);
    return NextResponse.json(
      { error: "Analysis failed: " + error.message },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
