import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

export interface LLMAnalysis {
  skills: {
    technical: string[];
    soft: string[];
    missing: string[];
    recommendations: string[];
  };
  experience: {
    summary: string;
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
  };
  education: {
    analysis: string;
    relevance: string;
    suggestions: string[];
  };
  achievements: {
    identified: string[];
    missed: string[];
    impact: string;
  };
  gaps: {
    skillGaps: Array<{skill: string; severity: 'low' | 'medium' | 'high'; reason: string}>;
    experienceGaps: Array<{gap: string; severity: 'low' | 'medium' | 'high'; suggestion: string}>;
    educationGaps: Array<{gap: string; severity: 'low' | 'medium' | 'high'; suggestion: string}>;
  };
  overall: {
    score: number;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    industryFit: string;
  };
}

export class LLMAnalyzer {
  private static openai: OpenAI | null = null;
  private static anthropic: Anthropic | null = null;

  private static initializeOpenAI() {
    console.log('LLMAnalyzer: Checking OpenAI API key...');
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      console.log('LLMAnalyzer: OpenAI API key found (length:', apiKey.length, ')');
      if (!this.openai) {
        this.openai = new OpenAI({
          apiKey: apiKey,
        });
        console.log('LLMAnalyzer: OpenAI client initialized');
      }
    } else {
      console.log('LLMAnalyzer: No OpenAI API key found');
    }
    return this.openai;
  }

  private static initializeAnthropic() {
    console.log('LLMAnalyzer: Checking Anthropic API key...');
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (apiKey) {
      console.log('LLMAnalyzer: Anthropic API key found (length:', apiKey.length, ')');
      if (!this.anthropic) {
        this.anthropic = new Anthropic({
          apiKey: apiKey,
        });
        console.log('LLMAnalyzer: Anthropic client initialized');
      }
    } else {
      console.log('LLMAnalyzer: No Anthropic API key found');
    }
    return this.anthropic;
  }

  static async analyzeResume(resumeText: string, targetRole?: string): Promise<LLMAnalysis> {
    console.log('LLMAnalyzer: Starting analysis with text length:', resumeText.length);
    
    const openai = this.initializeOpenAI();
    const anthropic = this.initializeAnthropic();

    console.log('LLMAnalyzer: OpenAI initialized:', !!openai, 'Anthropic initialized:', !!anthropic);

    if (!openai && !anthropic) {
      console.error('LLMAnalyzer: No API keys found');
      throw new Error('No LLM API keys configured. Please set OPENAI_API_KEY or ANTHROPIC_API_KEY');
    }

    // Try OpenAI first, fallback to Anthropic
    try {
      if (openai) {
        console.log('LLMAnalyzer: Using OpenAI for analysis');
        return await this.analyzeWithOpenAI(resumeText, targetRole);
      } else if (anthropic) {
        console.log('LLMAnalyzer: Using Anthropic for analysis');
        return await this.analyzeWithAnthropic(resumeText, targetRole);
      }
    } catch (error) {
      console.error('LLM analysis error:', error);
      // Fallback to basic analysis
      console.log('LLMAnalyzer: Falling back to basic analysis');
      return this.generateBasicAnalysis(resumeText);
    }

    console.log('LLMAnalyzer: Using basic analysis as fallback');
    return this.generateBasicAnalysis(resumeText);
  }

  private static async analyzeWithOpenAI(resumeText: string, targetRole?: string): Promise<LLMAnalysis> {
    if (!this.openai) {
      throw new Error('OpenAI not initialized');
    }
    
    const prompt = this.buildAnalysisPrompt(resumeText, targetRole);
    console.log('LLMAnalyzer: OpenAI prompt length:', prompt.length);
    
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are an expert resume analyst and career coach with deep knowledge of hiring practices, industry standards, and resume optimization. Analyze the provided resume comprehensively and provide detailed, actionable feedback in JSON format.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 4000,
      });

      const analysisText = response.choices[0]?.message?.content;
      if (!analysisText) {
        throw new Error('No response from OpenAI');
      }

      console.log('LLMAnalyzer: OpenAI response received, length:', analysisText.length);
      return this.parseLLMResponse(analysisText);
    } catch (error) {
      console.error('OpenAI analysis error:', error);
      throw error;
    }
  }

  private static async analyzeWithAnthropic(resumeText: string, targetRole?: string): Promise<LLMAnalysis> {
    const anthropic = this.anthropic!;
    
    const prompt = this.buildAnalysisPrompt(resumeText, targetRole);
    
    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 4000,
      temperature: 0.3,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
    });

    const analysisText = response.content[0];
    if (!analysisText || analysisText.type !== 'text') {
      throw new Error('No valid response from Anthropic');
    }

    return this.parseLLMResponse(analysisText.text);
  }

  private static buildAnalysisPrompt(resumeText: string, targetRole?: string): string {
    const roleContext = targetRole ? `Target Role: ${targetRole}` : 'General analysis for all roles';
    
    return `
You are an expert resume analyst and career coach. Analyze the following resume comprehensively and provide detailed feedback.

${roleContext}

Resume Content:
${resumeText}

IMPORTANT: Respond ONLY with valid JSON. Do not include any explanatory text before or after the JSON.

Provide your analysis in this exact JSON structure:

{
  "skills": {
    "technical": ["skill1", "skill2", "skill3"],
    "soft": ["soft skill1", "soft skill2"],
    "missing": ["missing skill1", "missing skill2"],
    "recommendations": ["recommendation1", "recommendation2"]
  },
  "experience": {
    "summary": "Overall experience summary",
    "strengths": ["strength1", "strength2"],
    "weaknesses": ["weakness1", "weakness2"],
    "suggestions": ["suggestion1", "suggestion2"]
  },
  "education": {
    "analysis": "Education analysis",
    "relevance": "Relevance to target role",
    "suggestions": ["suggestion1", "suggestion2"]
  },
  "achievements": {
    "identified": ["achievement1", "achievement2"],
    "missed": ["potential achievement1"],
    "impact": "Overall impact assessment"
  },
  "gaps": {
    "skillGaps": [
      {"skill": "skill name", "severity": "high|medium|low", "reason": "why it's important"}
    ],
    "experienceGaps": [
      {"gap": "gap description", "severity": "high|medium|low", "suggestion": "how to address"}
    ],
    "educationGaps": [
      {"gap": "gap description", "severity": "high|medium|low", "suggestion": "how to address"}
    ]
  },
  "overall": {
    "score": 85,
    "strengths": ["strength1", "strength2"],
    "weaknesses": ["weakness1", "weakness2"],
    "recommendations": ["recommendation1", "recommendation2"],
    "industryFit": "Assessment of fit for target industry"
  }
}

Focus on:
1. Identifying both technical and soft skills
2. Assessing experience relevance and impact
3. Finding skill gaps that could hinder career growth
4. Providing actionable recommendations
5. Evaluating overall resume strength and industry fit
6. Identifying missed opportunities for achievements
7. Suggesting specific improvements

Be specific, actionable, and professional in your analysis. Return ONLY the JSON response.
`;
  }

  private static parseLLMResponse(responseText: string): LLMAnalysis {
    console.log('LLMAnalyzer: Parsing response text, length:', responseText.length);
    
    try {
      // Try multiple approaches to extract JSON
      let jsonString = '';
      
      // Approach 1: Look for JSON blocks with ```json
      let jsonMatch = responseText.match(/```json\s*(\{[\s\S]*?\})\s*```/);
      if (jsonMatch) {
        jsonString = jsonMatch[1];
        console.log('LLMAnalyzer: Found JSON in code block');
      } else {
        // Approach 2: Look for JSON object at the start
        jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonString = jsonMatch[0];
          console.log('LLMAnalyzer: Found JSON object');
        }
      }
      
      if (jsonString) {
        console.log('LLMAnalyzer: Found JSON match, length:', jsonString.length);
        
        // Clean up common JSON issues
        const cleanedJson = jsonString
          .replace(/,\s*}/g, '}') // Remove trailing commas
          .replace(/,\s*]/g, ']') // Remove trailing commas in arrays
          .replace(/\n\s*/g, ' ') // Replace newlines with spaces
          .replace(/\r/g, '') // Remove carriage returns
          .replace(/\t/g, ' ') // Replace tabs with spaces
          .replace(/\\"/g, '"') // Fix escaped quotes
          .replace(/\\'/g, "'") // Fix escaped single quotes
          .trim();
        
        console.log('LLMAnalyzer: Attempting to parse JSON...');
        const parsed = JSON.parse(cleanedJson);
        console.log('LLMAnalyzer: JSON parsed successfully');
        return this.validateAndCleanAnalysis(parsed);
      } else {
        console.log('LLMAnalyzer: No JSON match found in response');
        console.log('LLMAnalyzer: Response preview:', responseText.substring(0, 500));
      }
    } catch (error) {
      console.error('Failed to parse LLM response as JSON:', error);
      console.log('LLMAnalyzer: Response that failed to parse:', responseText.substring(0, 1000));
    }

    // Fallback to basic analysis if parsing fails
    console.log('LLMAnalyzer: Using fallback analysis');
    return this.generateBasicAnalysis(responseText);
  }

  private static validateAndCleanAnalysis(parsed: unknown): LLMAnalysis {
    // Ensure all required fields exist and are properly typed
    const parsedObj = parsed as Record<string, unknown>;
    
    const skills = parsedObj.skills as Record<string, unknown> | undefined;
    const experience = parsedObj.experience as Record<string, unknown> | undefined;
    const education = parsedObj.education as Record<string, unknown> | undefined;
    const achievements = parsedObj.achievements as Record<string, unknown> | undefined;
    const gaps = parsedObj.gaps as Record<string, unknown> | undefined;
    const overall = parsedObj.overall as Record<string, unknown> | undefined;
    
    return {
      skills: {
        technical: Array.isArray(skills?.technical) ? skills.technical as string[] : [],
        soft: Array.isArray(skills?.soft) ? skills.soft as string[] : [],
        missing: Array.isArray(skills?.missing) ? skills.missing as string[] : [],
        recommendations: Array.isArray(skills?.recommendations) ? skills.recommendations as string[] : [],
      },
      experience: {
        summary: typeof experience?.summary === 'string' ? experience.summary as string : 'No experience summary provided',
        strengths: Array.isArray(experience?.strengths) ? experience.strengths as string[] : [],
        weaknesses: Array.isArray(experience?.weaknesses) ? experience.weaknesses as string[] : [],
        suggestions: Array.isArray(experience?.suggestions) ? experience.suggestions as string[] : [],
      },
      education: {
        analysis: typeof education?.analysis === 'string' ? education.analysis as string : 'No education analysis provided',
        relevance: typeof education?.relevance === 'string' ? education.relevance as string : 'No relevance assessment provided',
        suggestions: Array.isArray(education?.suggestions) ? education.suggestions as string[] : [],
      },
      achievements: {
        identified: Array.isArray(achievements?.identified) ? achievements.identified as string[] : [],
        missed: Array.isArray(achievements?.missed) ? achievements.missed as string[] : [],
        impact: typeof achievements?.impact === 'string' ? achievements.impact as string : 'No impact assessment provided',
      },
      gaps: {
        skillGaps: Array.isArray(gaps?.skillGaps) ? gaps.skillGaps as Array<{skill: string; severity: 'low' | 'medium' | 'high'; reason: string}> : [],
        experienceGaps: Array.isArray(gaps?.experienceGaps) ? gaps.experienceGaps as Array<{gap: string; severity: 'low' | 'medium' | 'high'; suggestion: string}> : [],
        educationGaps: Array.isArray(gaps?.educationGaps) ? gaps.educationGaps as Array<{gap: string; severity: 'low' | 'medium' | 'high'; suggestion: string}> : [],
      },
      overall: {
        score: typeof overall?.score === 'number' ? overall.score as number : 70,
        strengths: Array.isArray(overall?.strengths) ? overall.strengths as string[] : [],
        weaknesses: Array.isArray(overall?.weaknesses) ? overall.weaknesses as string[] : [],
        recommendations: Array.isArray(overall?.recommendations) ? overall.recommendations as string[] : [],
        industryFit: typeof overall?.industryFit === 'string' ? overall.industryFit as string : 'No industry fit assessment provided',
      },
    };
  }

  private static generateBasicAnalysis(resumeText: string): LLMAnalysis {
    // Fallback basic analysis when LLM is not available
    const normalizedText = resumeText.toLowerCase();
    const skills = this.extractBasicSkills(normalizedText);
    
    return {
      skills: {
        technical: skills.filter(skill => this.isTechnicalSkill(skill)),
        soft: skills.filter(skill => !this.isTechnicalSkill(skill)),
        missing: ['Communication', 'Leadership', 'Problem Solving'].filter(skill => 
          !normalizedText.includes(skill.toLowerCase())
        ),
        recommendations: ['Add quantifiable achievements', 'Include specific metrics'],
      },
      experience: {
        summary: 'Basic experience analysis completed',
        strengths: ['Experience detected'],
        weaknesses: ['Limited detail in analysis'],
        suggestions: ['Consider using AI-powered analysis for detailed insights'],
      },
      education: {
        analysis: 'Education section detected',
        relevance: 'Standard education assessment',
        suggestions: ['Highlight relevant coursework'],
      },
      achievements: {
        identified: this.extractBasicAchievements(resumeText),
        missed: ['Quantifiable results', 'Specific metrics'],
        impact: 'Limited impact assessment available',
      },
      gaps: {
        skillGaps: [],
        experienceGaps: [],
        educationGaps: [],
      },
      overall: {
        score: 60,
        strengths: ['Resume structure detected'],
        weaknesses: ['Limited detailed analysis'],
        recommendations: ['Use AI-powered analysis for comprehensive insights'],
        industryFit: 'Standard industry assessment',
      },
    };
  }

  private static extractBasicSkills(text: string): string[] {
    const skillKeywords = [
      'javascript', 'python', 'java', 'react', 'node.js', 'sql', 'mongodb',
      'aws', 'docker', 'kubernetes', 'git', 'agile', 'scrum', 'typescript',
      'html', 'css', 'angular', 'vue.js', 'php', 'ruby', 'go', 'rust',
      'machine learning', 'ai', 'data science', 'tableau', 'power bi'
    ];

    return skillKeywords.filter(skill => text.includes(skill.toLowerCase()));
  }

  private static isTechnicalSkill(skill: string): boolean {
    const technicalSkills = [
      'javascript', 'python', 'java', 'react', 'node.js', 'sql', 'mongodb',
      'aws', 'docker', 'kubernetes', 'git', 'typescript', 'html', 'css',
      'angular', 'vue.js', 'php', 'ruby', 'go', 'rust', 'machine learning',
      'ai', 'data science', 'tableau', 'power bi'
    ];
    return technicalSkills.some(tech => skill.toLowerCase().includes(tech));
  }

  private static extractBasicAchievements(text: string): string[] {
    const achievements: string[] = [];
    const lines = text.split('\n');
    
    for (const line of lines) {
      if (line.includes('achieved') || line.includes('improved') || 
          line.includes('increased') || line.includes('decreased') ||
          line.includes('led') || line.includes('managed')) {
        achievements.push(line.trim());
      }
    }

    return achievements.slice(0, 3); // Limit to 3 achievements
  }

  static async testLLMConnection(): Promise<boolean> {
    console.log('LLMAnalyzer: Testing LLM connection...');
    
    const openai = this.initializeOpenAI();
    const anthropic = this.initializeAnthropic();

    if (!openai && !anthropic) {
      console.error('LLMAnalyzer: No API keys configured');
      return false;
    }

    try {
      if (openai) {
        console.log('LLMAnalyzer: Testing OpenAI connection...');
        const response = await openai.chat.completions.create({
          model: 'gpt-4',
          messages: [
            {
              role: 'user',
              content: 'Say "Hello" if you can see this message.'
            }
          ],
          max_tokens: 10,
        });
        
        const reply = response.choices[0]?.message?.content;
        console.log('LLMAnalyzer: OpenAI test successful:', reply);
        return true;
      } else if (anthropic) {
        console.log('LLMAnalyzer: Testing Anthropic connection...');
        const response = await anthropic.messages.create({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 10,
          messages: [
            {
              role: 'user',
              content: 'Say "Hello" if you can see this message.'
            }
          ],
        });
        
        const reply = response.content[0];
        if (reply && reply.type === 'text') {
          console.log('LLMAnalyzer: Anthropic test successful:', reply.text);
          return true;
        }
      }
    } catch (error) {
      console.error('LLMAnalyzer: Test failed:', error);
      return false;
    }

    return false;
  }
}
