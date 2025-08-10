import mammoth from 'mammoth';
import { LLMAnalyzer, LLMAnalysis } from './llmAnalyzer';

export type { LLMAnalysis } from './llmAnalyzer';

export interface ParsedResume {
  text: string;
  skills: string[];
  experience: ExperienceItem[];
  education: EducationItem[];
  achievements: string[];
  gaps: GapAnalysis[];
  suggestions: string[];
  llmAnalysis?: LLMAnalysis; // New field for LLM analysis
}

export interface ExperienceItem {
  title: string;
  company: string;
  duration: string;
  description: string;
  skills: string[];
}

export interface EducationItem {
  degree: string;
  institution: string;
  year: string;
  gpa?: string;
}

export interface GapAnalysis {
  type: 'skill' | 'experience' | 'education';
  description: string;
  severity: 'low' | 'medium' | 'high';
}

export class ResumeParser {
  private static skillKeywords = [
    'javascript', 'python', 'java', 'react', 'node.js', 'sql', 'mongodb',
    'aws', 'docker', 'kubernetes', 'git', 'agile', 'scrum', 'typescript',
    'html', 'css', 'angular', 'vue.js', 'php', 'ruby', 'go', 'rust',
    'machine learning', 'ai', 'data science', 'tableau', 'power bi'
  ];

  static async parseFile(file: File, targetRole?: string): Promise<ParsedResume> {
    const fileType = file.name.toLowerCase();
    let text = '';

    console.log('Processing file:', file.name, 'Type:', file.type);

    if (fileType.endsWith('.pdf')) {
      text = await this.parsePDF(file);
    } else if (fileType.endsWith('.docx')) {
      text = await this.parseDOCX(file);
    } else if (fileType.endsWith('.txt')) {
      text = await this.parseTXT(file);
    } else {
      throw new Error('Unsupported file format. Please upload PDF, DOCX, or TXT files.');
    }

    console.log('Extracted text length:', text.length);

    // Get basic analysis
    const basicAnalysis = this.analyzeResume(text);
    
    // Enhance with LLM analysis if available
    try {
      console.log('Attempting LLM analysis...');
      const llmAnalysis = await LLMAnalyzer.analyzeResume(text, targetRole);
      console.log('LLM analysis completed successfully');
      return {
        ...basicAnalysis,
        llmAnalysis
      };
    } catch (error) {
      console.warn('LLM analysis failed, using basic analysis only:', error);
      return basicAnalysis;
    }
  }

  private static async parsePDF(file: File): Promise<string> {
    try {
      console.log('Starting PDF parsing for file:', file.name, 'Size:', file.size);
      
      // Convert File to Buffer for pdf-parse
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      console.log('Converted to buffer, size:', buffer.length);
      
      // Dynamic import for pdf-parse to avoid server-side issues
      const pdfParse = await import('pdf-parse');
      const data = await pdfParse.default(buffer);
      
      if (data.text && data.text.trim().length > 0) {
        console.log('PDF parsed successfully, extracted text length:', data.text.length);
        return data.text;
      } else {
        console.warn('No text extracted from PDF or empty content');
        return `PDF content from ${file.name} - No text content found or empty document.`;
      }
    } catch (error) {
      console.error('PDF parsing error:', error);
      // Fallback: return a more informative placeholder
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('PDF parsing failed:', errorMessage);
      return `PDF content from ${file.name} - PDF parsing encountered an error: ${errorMessage}`;
    }
  }

  private static async parseDOCX(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  }

  private static async parseTXT(file: File): Promise<string> {
    return await file.text();
  }

  private static analyzeResume(text: string): ParsedResume {
    const normalizedText = text.toLowerCase();
    const lines = text.split('\n').filter(line => line.trim());

    return {
      text: text,
      skills: this.extractSkills(normalizedText),
      experience: this.extractExperience(lines),
      education: this.extractEducation(lines),
      achievements: this.extractAchievements(lines),
      gaps: this.analyzeGaps(text),
      suggestions: this.generateSuggestions(text)
    };
  }

  private static extractSkills(text: string): string[] {
    const foundSkills: string[] = [];
    
    for (const skill of this.skillKeywords) {
      if (text.includes(skill.toLowerCase())) {
        foundSkills.push(skill);
      }
    }

    // Extract skills from common patterns
    const skillPatterns = [
      /skills?[:\-]?\s*([^.]*)/gi,
      /technologies?[:\-]?\s*([^.]*)/gi,
      /languages?[:\-]?\s*([^.]*)/gi
    ];

    for (const pattern of skillPatterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match[1]) {
          const skills = match[1].split(/[,;]/).map(s => s.trim()).filter(s => s.length > 2);
          foundSkills.push(...skills);
        }
      }
    }

    return [...new Set(foundSkills)];
  }

  private static extractExperience(lines: string[]): ExperienceItem[] {
    const experience: ExperienceItem[] = [];
    const experiencePatterns = [
      /(.+?)\s*-\s*(.+?)\s*(\d{4}\s*-\s*\d{4}|\d{4}\s*-\s*present|present)/gi,
      /(.+?)\s*at\s*(.+?)\s*(\d{4}\s*-\s*\d{4}|\d{4}\s*-\s*present|present)/gi
    ];

    for (const pattern of experiencePatterns) {
      const matches = [...lines.join('\n').matchAll(pattern)];
      for (const match of matches) {
        if (match[1] && match[2] && match[3]) {
          experience.push({
            title: match[1].trim(),
            company: match[2].trim(),
            duration: match[3].trim(),
            description: '',
            skills: []
          });
        }
      }
    }

    return experience;
  }

  private static extractEducation(lines: string[]): EducationItem[] {
    const education: EducationItem[] = [];
    const educationPatterns = [
      /(.+?)\s*-\s*(.+?)\s*(\d{4})/gi,
      /(.+?)\s*from\s*(.+?)\s*(\d{4})/gi
    ];

    for (const pattern of educationPatterns) {
      const matches = [...lines.join('\n').matchAll(pattern)];
      for (const match of matches) {
        if (match[1] && match[2] && match[3]) {
          education.push({
            degree: match[1].trim(),
            institution: match[2].trim(),
            year: match[3].trim()
          });
        }
      }
    }

    return education;
  }

  private static extractAchievements(lines: string[]): string[] {
    const achievements: string[] = [];
    
    for (const line of lines) {
      if (line.includes('achieved') || line.includes('improved') || 
          line.includes('increased') || line.includes('decreased') ||
          line.includes('led') || line.includes('managed')) {
        achievements.push(line.trim());
      }
    }

    return achievements;
  }

  private static analyzeGaps(text: string): GapAnalysis[] {
    const gaps: GapAnalysis[] = [];
    const normalizedText = text.toLowerCase();

    // Check for missing common skills
    const missingSkills = this.skillKeywords.filter(skill => 
      !normalizedText.includes(skill.toLowerCase())
    );

    if (missingSkills.length > 0) {
      gaps.push({
        type: 'skill',
        description: `Missing common skills: ${missingSkills.slice(0, 5).join(', ')}`,
        severity: missingSkills.length > 3 ? 'high' : 'medium'
      });
    }

    // Check for experience gaps
    const experienceYears = this.extractExperience(text.split('\n'));
    if (experienceYears.length === 0) {
      gaps.push({
        type: 'experience',
        description: 'No work experience found',
        severity: 'high'
      });
    }

    return gaps;
  }

  private static generateSuggestions(text: string): string[] {
    const suggestions: string[] = [];
    const normalizedText = text.toLowerCase();

    if (!normalizedText.includes('linkedin')) {
      suggestions.push('Add LinkedIn profile URL');
    }

    if (!normalizedText.includes('github')) {
      suggestions.push('Add GitHub profile URL');
    }

    if (!normalizedText.includes('achievement') && !normalizedText.includes('result')) {
      suggestions.push('Add quantifiable achievements and results');
    }

    if (normalizedText.split(' ').length < 200) {
      suggestions.push('Consider adding more detailed descriptions');
    }

    return suggestions;
  }
}
