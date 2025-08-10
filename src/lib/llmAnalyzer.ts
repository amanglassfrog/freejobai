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
    jobFit: string;
  };
}

export class LLMAnalyzer {
  private static openai: OpenAI | null = null;
  private static anthropic: Anthropic | null = null;

  private static initializeOpenAI() {
    console.log('LLMAnalyzer: Checking OpenAI API key...');
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey && apiKey.trim().length > 0) {
      console.log('LLMAnalyzer: OpenAI API key found (length:', apiKey.length, ')');
      if (!this.openai) {
        this.openai = new OpenAI({
          apiKey: apiKey,
        });
        console.log('LLMAnalyzer: OpenAI client initialized');
      }
    } else {
      console.log('LLMAnalyzer: No OpenAI API key found or empty');
    }
    return this.openai;
  }

  private static initializeAnthropic() {
    console.log('LLMAnalyzer: Checking Anthropic API key...');
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (apiKey && apiKey.trim().length > 0) {
      console.log('LLMAnalyzer: Anthropic API key found (length:', apiKey.length, ')');
      if (!this.anthropic) {
        this.anthropic = new Anthropic({
          apiKey: apiKey,
        });
        console.log('LLMAnalyzer: Anthropic client initialized');
      }
    } else {
      console.log('LLMAnalyzer: No Anthropic API key found or empty');
    }
    return this.anthropic;
  }

  static async analyzeResume(resumeText: string, targetRole?: string): Promise<LLMAnalysis> {
    console.log('LLMAnalyzer: Starting analysis with text length:', resumeText.length);
    console.log('LLMAnalyzer: Target role:', targetRole || 'general');
    
    const openai = this.initializeOpenAI();
    const anthropic = this.initializeAnthropic();

    console.log('LLMAnalyzer: OpenAI initialized:', !!openai, 'Anthropic initialized:', !!anthropic);

    if (!openai && !anthropic) {
      console.error('LLMAnalyzer: No API keys found');
      throw new Error('No LLM API keys configured. Please set OPENAI_API_KEY or ANTHROPIC_API_KEY in your .env.local file');
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
      console.error('LLMAnalyzer: Both LLM providers failed:', error);
      throw error;
    }

    throw new Error('No LLM provider available');
  }

  private static async analyzeWithOpenAI(resumeText: string, targetRole?: string): Promise<LLMAnalysis> {
    try {
      console.log('LLMAnalyzer: OpenAI analysis starting...');
      
      const prompt = this.buildAnalysisPrompt(resumeText, targetRole);
      console.log('LLMAnalyzer: OpenAI prompt length:', prompt.length);

      const response = await this.openai!.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert resume analyst and career advisor. Analyze resumes and provide detailed, actionable feedback.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 4000,
      });

      const responseText = response.choices[0]?.message?.content;
      console.log('LLMAnalyzer: OpenAI response received, length:', responseText?.length || 0);

      if (!responseText) {
        throw new Error('No response content from OpenAI');
      }

      const analysis = this.parseLLMResponse(responseText);
      console.log('LLMAnalyzer: OpenAI analysis parsed successfully');
      return analysis;
    } catch (error) {
      console.error('LLMAnalyzer: OpenAI analysis failed:', error);
      throw error;
    }
  }

  private static async analyzeWithAnthropic(resumeText: string, targetRole?: string): Promise<LLMAnalysis> {
    try {
      console.log('LLMAnalyzer: Anthropic analysis starting...');
      
      const prompt = this.buildAnalysisPrompt(resumeText, targetRole);
      console.log('LLMAnalyzer: Anthropic prompt length:', prompt.length);

      const response = await this.anthropic!.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
      });

      const responseText = response.content[0];
      if (responseText.type !== 'text') {
        throw new Error('Unexpected response type from Anthropic');
      }

      console.log('LLMAnalyzer: Anthropic response received, length:', responseText.text.length);

      const analysis = this.parseLLMResponse(responseText.text);
      console.log('LLMAnalyzer: Anthropic analysis parsed successfully');
      return analysis;
    } catch (error) {
      console.error('LLMAnalyzer: Anthropic analysis failed:', error);
      throw error;
    }
  }

  private static buildAnalysisPrompt(resumeText: string, targetRole?: string): string {
    const roleContext = targetRole 
      ? `Analyze this resume specifically for a ${targetRole} position. Focus on how well the candidate fits this role and what improvements would make them more competitive.`
      : 'Analyze this resume for general career opportunities.';

    return `You are an expert resume analyst and career advisor. ${roleContext}

RESUME TEXT:
${resumeText}

Please analyze this resume and provide a comprehensive assessment. Respond ONLY with valid JSON in the following format:

{
  "skills": {
    "technical": ["skill1", "skill2"],
    "soft": ["skill1", "skill2"],
    "missing": ["skill1", "skill2"],
    "recommendations": ["recommendation1", "recommendation2"]
  },
  "experience": {
    "summary": "Brief summary of experience",
    "strengths": ["strength1", "strength2"],
    "weaknesses": ["weakness1", "weakness2"],
    "suggestions": ["suggestion1", "suggestion2"]
  },
  "education": {
    "analysis": "Analysis of education background",
    "relevance": "How relevant is the education to the target role",
    "suggestions": ["suggestion1", "suggestion2"]
  },
  "achievements": {
    "identified": ["achievement1", "achievement2"],
    "missed": ["missed achievement1", "missed achievement2"],
    "impact": "Overall impact assessment"
  },
  "gaps": {
    "skillGaps": [{"skill": "skill name", "severity": "high", "reason": "why this gap exists"}],
    "experienceGaps": [{"gap": "gap description", "severity": "medium", "suggestion": "how to address"}],
    "educationGaps": [{"gap": "gap description", "severity": "low", "suggestion": "how to address"}]
  },
  "overall": {
    "score": 85,
    "strengths": ["strength1", "strength2"],
    "weaknesses": ["weakness1", "weakness2"],
    "recommendations": ["recommendation1", "recommendation2"],
    "industryFit": "How well does this resume fit the industry",
    "jobFit": "How well does this resume fit the target role"
  }
}

IMPORTANT: 
- Respond ONLY with valid JSON. Do not include any explanatory text before or after the JSON.
- Ensure all arrays contain at least 2-3 items where applicable.
- Provide specific, actionable feedback.
- Score should be 0-100 based on overall resume quality and fit for the target role.
- Be honest but constructive in your assessment.`;
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
        jobFit: typeof overall?.jobFit === 'string' ? overall.jobFit as string : 'No job fit assessment provided',
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
        jobFit: 'Standard job fit assessment',
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
