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
    'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'SQL', 'MongoDB',
    'AWS', 'Docker', 'Kubernetes', 'Git', 'TypeScript', 'Angular', 'Vue.js',
    'Machine Learning', 'AI', 'Data Analysis', 'Project Management', 'Leadership'
  ];

  static async parseFile(file: File, targetRole?: string): Promise<ParsedResume> {
    const fileType = file.name.toLowerCase();
    let text = '';

    console.log('Processing file:', file.name, 'Type:', file.type, 'Size:', file.size);

    try {
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
      console.log('First 200 characters of extracted text:', text.substring(0, 200));

      if (!text || text.trim().length === 0) {
        throw new Error('No text content could be extracted from the file. Please ensure the file contains readable text.');
      }

      // Get basic analysis
      const basicAnalysis = this.analyzeResume(text);
      console.log('Basic analysis completed:', {
        skillsCount: basicAnalysis.skills.length,
        experienceCount: basicAnalysis.experience.length,
        educationCount: basicAnalysis.education.length
      });
      
      // Enhance with LLM analysis if available
      try {
        console.log('Attempting LLM analysis with target role:', targetRole || 'general');
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
    } catch (error) {
      console.error('Resume parsing failed:', error);
      throw error;
    }
  }

  private static async parsePDF(file: File): Promise<string> {
    try {
      console.log('Starting PDF parsing for file:', file.name, 'Size:', file.size);
      
      // Convert File to ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      
      console.log('Converted to arrayBuffer, size:', arrayBuffer.byteLength);
      
      // Try multiple PDF parsing approaches
      let extractedText = '';
      
      // Approach 1: Try using pdf-parse with error handling
      try {
        const pdfParse = await import('pdf-parse');
        const buffer = Buffer.from(arrayBuffer);
        const data = await pdfParse.default(buffer);
        
        if (data.text && data.text.trim().length > 0) {
          extractedText = data.text.trim();
          console.log('PDF parsed successfully with pdf-parse, extracted text length:', extractedText.length);
          return extractedText;
        }
      } catch (pdfParseError) {
        console.warn('pdf-parse failed, trying alternative approach:', pdfParseError);
      }
      
      // Approach 2: Try using pdfjs-dist with server-side configuration
      try {
        const pdfjsLib = await import('pdfjs-dist');
        
        // Configure for server-side
        if (typeof window === 'undefined') {
          pdfjsLib.GlobalWorkerOptions.workerSrc = false;
        }
        
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        
        console.log('PDF loaded with pdfjs-dist, pages:', pdf.numPages);
        
        let fullText = '';
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          
          const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ');
          
          fullText += pageText + '\n';
        }
        
        if (fullText && fullText.trim().length > 0) {
          extractedText = fullText.trim();
          console.log('PDF parsed successfully with pdfjs-dist, extracted text length:', extractedText.length);
          return extractedText;
        }
      } catch (pdfjsError) {
        console.warn('pdfjs-dist failed, trying final approach:', pdfjsError);
      }
      
      // Approach 3: Basic text extraction from file metadata
      try {
        // Try to extract any text-like content from the file
        const uint8Array = new Uint8Array(arrayBuffer);
        const textDecoder = new TextDecoder('utf-8');
        const decodedText = textDecoder.decode(uint8Array);
        
        // Look for readable text patterns
        const textPatterns = decodedText.match(/[A-Za-z0-9\s\.\,\-\_]+/g);
        if (textPatterns && textPatterns.length > 0) {
          const readableText = textPatterns.join(' ').substring(0, 1000); // Limit to first 1000 chars
          if (readableText.trim().length > 50) { // Must have at least 50 readable characters
            console.log('PDF parsed with basic text extraction, extracted text length:', readableText.length);
            return readableText.trim();
          }
        }
      } catch (basicError) {
        console.warn('Basic text extraction failed:', basicError);
      }
      
      // If all approaches fail
      throw new Error('Unable to extract text from PDF. The file might be image-based, corrupted, or in an unsupported format.');
      
    } catch (error) {
      console.error('PDF parsing error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`PDF parsing failed: ${errorMessage}. Please ensure the PDF contains readable text and is not corrupted.`);
    }
  }

  private static async parseDOCX(file: File): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      
      if (result.value && result.value.trim().length > 0) {
        console.log('DOCX parsed successfully, extracted text length:', result.value.length);
        return result.value;
      } else {
        throw new Error('No text content found in DOCX file.');
      }
    } catch (error) {
      console.error('DOCX parsing error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`DOCX parsing failed: ${errorMessage}`);
    }
  }

  private static async parseTXT(file: File): Promise<string> {
    try {
      const text = await file.text();
      if (text && text.trim().length > 0) {
        console.log('TXT parsed successfully, extracted text length:', text.length);
        return text;
      } else {
        throw new Error('No text content found in TXT file.');
      }
    } catch (error) {
      console.error('TXT parsing error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`TXT parsing failed: ${errorMessage}`);
    }
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
