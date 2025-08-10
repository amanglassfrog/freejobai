'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ParsedResume, LLMAnalysis } from "@/lib/resumeParser";

interface ResumeScannerProps {
  onAnalysisComplete?: (analysis: ParsedResume) => void;
}

export default function ResumeScanner({ onAnalysisComplete }: ResumeScannerProps) {
  const [file, setFile] = useState<File | null>(null);
  const [targetRole, setTargetRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<ParsedResume | null>(null);
  const [error, setError] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
      setAnalysis(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (targetRole) {
        formData.append('targetRole', targetRole);
      }

      const response = await fetch('/api/resume/parse', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to parse resume');
      }

      setAnalysis(result.data);
      onAnalysisComplete?.(result.data);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const renderLLMAnalysis = (llmAnalysis: LLMAnalysis) => (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Resume Score</CardTitle>
          <CardDescription>AI-powered assessment of your resume strength</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-gray-200 flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                  {llmAnalysis.overall.score}
                </span>
              </div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500" 
                   style={{transform: `rotate(${llmAnalysis.overall.score * 3.6}deg)`}}></div>
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-400">
                {llmAnalysis.overall.score >= 80 ? 'Excellent' : 
                 llmAnalysis.overall.score >= 60 ? 'Good' : 
                 llmAnalysis.overall.score >= 40 ? 'Fair' : 'Needs Improvement'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Industry Fit: {llmAnalysis.overall.industryFit}
              </p>
              {llmAnalysis.overall.jobFit && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Job Fit: {llmAnalysis.overall.jobFit}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Skills Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Skills Analysis</CardTitle>
          <CardDescription>Comprehensive skills assessment</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-400 mb-2">Technical Skills</h4>
            <div className="flex flex-wrap gap-2">
              {llmAnalysis.skills.technical.length > 0 ? (
                llmAnalysis.skills.technical.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {skill}
                  </Badge>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No technical skills detected</p>
              )}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-400 mb-2">Soft Skills</h4>
            <div className="flex flex-wrap gap-2">
              {llmAnalysis.skills.soft.length > 0 ? (
                llmAnalysis.skills.soft.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    {skill}
                  </Badge>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No soft skills detected</p>
              )}
            </div>
          </div>

          {llmAnalysis.skills.missing.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-400mb-2">Missing Skills</h4>
              <div className="flex flex-wrap gap-2">
                {llmAnalysis.skills.missing.map((skill, index) => (
                  <Badge key={index} variant="outline" className="border-red-300 text-red-700 dark:border-red-700 dark:text-red-300">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {llmAnalysis.skills.recommendations.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-400mb-2">Skill Recommendations</h4>
              <ul className="space-y-1">
                {llmAnalysis.skills.recommendations.map((rec, index) => (
                  <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Experience Analysis */}
      {llmAnalysis.experience && (
        <Card>
          <CardHeader>
            <CardTitle>Experience Analysis</CardTitle>
            <CardDescription>Detailed assessment of your work experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-400mb-2">Summary</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">{llmAnalysis.experience.summary}</p>
            </div>
            
            {llmAnalysis.experience.strengths.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-400mb-2">Strengths</h4>
                <ul className="space-y-1">
                  {llmAnalysis.experience.strengths.map((strength, index) => (
                    <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {llmAnalysis.experience.weaknesses.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-400mb-2">Areas for Improvement</h4>
                <ul className="space-y-1">
                  {llmAnalysis.experience.weaknesses.map((weakness, index) => (
                    <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      {weakness}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {llmAnalysis.experience.suggestions.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-400mb-2">Experience Suggestions</h4>
                <ul className="space-y-1">
                  {llmAnalysis.experience.suggestions.map((suggestion, index) => (
                    <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Education Analysis */}
      {llmAnalysis.education && (
        <Card>
          <CardHeader>
            <CardTitle>Education Analysis</CardTitle>
            <CardDescription>Assessment of your educational background</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-400mb-2">Analysis</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">{llmAnalysis.education.analysis}</p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-400mb-2">Relevance to Target Role</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">{llmAnalysis.education.relevance}</p>
            </div>

            {llmAnalysis.education.suggestions.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-400mb-2">Education Suggestions</h4>
                <ul className="space-y-1">
                  {llmAnalysis.education.suggestions.map((suggestion, index) => (
                    <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Achievements Analysis */}
      {llmAnalysis.achievements && (
        <Card>
          <CardHeader>
            <CardTitle>Achievements Analysis</CardTitle>
            <CardDescription>Assessment of your accomplishments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {llmAnalysis.achievements.identified.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-400mb-2">Identified Achievements</h4>
                <ul className="space-y-1">
                  {llmAnalysis.achievements.identified.map((achievement, index) => (
                    <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      {achievement}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {llmAnalysis.achievements.missed.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-400mb-2">Potential Achievements to Highlight</h4>
                <ul className="space-y-1">
                  {llmAnalysis.achievements.missed.map((achievement, index) => (
                    <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      {achievement}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {llmAnalysis.achievements.impact && (
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-400mb-2">Overall Impact Assessment</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{llmAnalysis.achievements.impact}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Gap Analysis */}
      {llmAnalysis.gaps && (
        <Card>
          <CardHeader>
            <CardTitle>Gap Analysis</CardTitle>
            <CardDescription>Areas where your resume could be strengthened</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {llmAnalysis.gaps.skillGaps.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-400mb-2">Skill Gaps</h4>
                <div className="space-y-2">
                  {llmAnalysis.gaps.skillGaps.map((gap, index) => (
                    <div key={index} className="p-3 border rounded-md">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900 dark:text-gray-100">{gap.skill}</span>
                        <Badge className={getSeverityColor(gap.severity)}>
                          {gap.severity.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{gap.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {llmAnalysis.gaps.experienceGaps.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-400mb-2">Experience Gaps</h4>
                <div className="space-y-2">
                  {llmAnalysis.gaps.experienceGaps.map((gap, index) => (
                    <div key={index} className="p-3 border rounded-md">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900 dark:text-gray-100">Experience Gap</span>
                        <Badge className={getSeverityColor(gap.severity)}>
                          {gap.severity.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{gap.gap}</p>
                      <p className="text-sm text-blue-600 dark:text-blue-400">{gap.suggestion}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {llmAnalysis.gaps.educationGaps.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-400mb-2">Education Gaps</h4>
                <div className="space-y-2">
                  {llmAnalysis.gaps.educationGaps.map((gap, index) => (
                    <div key={index} className="p-3 border rounded-md">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900 dark:text-gray-100">Education Gap</span>
                        <Badge className={getSeverityColor(gap.severity)}>
                          {gap.severity.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{gap.gap}</p>
                      <p className="text-sm text-blue-600 dark:text-blue-400">{gap.suggestion}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Overall Recommendations */}
      {llmAnalysis.overall && (
        <Card>
          <CardHeader>
            <CardTitle>Overall Recommendations</CardTitle>
            <CardDescription>Key actions to improve your resume</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {llmAnalysis.overall.strengths.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-400mb-2">Key Strengths</h4>
                  <ul className="space-y-1">
                    {llmAnalysis.overall.strengths.map((strength, index) => (
                      <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start">
                        <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {llmAnalysis.overall.weaknesses.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-400mb-2">Areas to Address</h4>
                  <ul className="space-y-1">
                    {llmAnalysis.overall.weaknesses.map((weakness, index) => (
                      <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start">
                        <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {weakness}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {llmAnalysis.overall.recommendations.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-400mb-2">Priority Actions</h4>
                  <ul className="space-y-1">
                    {llmAnalysis.overall.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Upload Form */}
      <Card>
        <CardHeader>
          <CardTitle>Resume Analysis</CardTitle>
          <CardDescription>
            Upload your resume to get AI-powered insights and recommendations for your target role
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="targetRole" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Target Role (Optional but Recommended)
              </label>
              <Input
                id="targetRole"
                type="text"
                placeholder="e.g., Senior Software Engineer, Product Manager, Data Scientist"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Adding a target role helps provide more specific and relevant analysis
              </p>
            </div>

            <div>
              <label htmlFor="resumeFile" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Resume File
              </label>
              <Input
                id="resumeFile"
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleFileChange}
                className="w-full"
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Supported formats: PDF, DOCX, TXT (Max 10MB)
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={!file || loading}
              className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Analyzing with AI...</span>
                </div>
              ) : (
                'Analyze Resume'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-6">
          {/* Show LLM Analysis if available */}
          {analysis.llmAnalysis ? (
            renderLLMAnalysis(analysis.llmAnalysis)
          ) : (
            /* Fallback to basic analysis display */
            <div className="space-y-6">
              {/* Basic Skills Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Skills Found</CardTitle>
                  <CardDescription>Detected skills in your resume</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {analysis.skills.length > 0 ? (
                      analysis.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400">No skills detected</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Basic Experience Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Work Experience</CardTitle>
                  <CardDescription>Extracted work experience</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analysis.experience.length > 0 ? (
                      analysis.experience.map((exp, index) => (
                        <div key={index} className="border-l-4 border-gray-200 dark:border-gray-700 pl-4">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                            {exp.title}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {exp.company} • {exp.duration}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400">No work experience detected</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Basic Suggestions */}
              <Card>
                <CardHeader>
                  <CardTitle>Suggestions</CardTitle>
                  <CardDescription>Recommendations for improvement</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analysis.suggestions.length > 0 ? (
                      analysis.suggestions.map((suggestion, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-sm text-gray-700 dark:text-gray-300">{suggestion}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400">No suggestions at this time</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
