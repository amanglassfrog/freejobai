"use client";

import React, { useState, useEffect } from "react";
import { Upload, FileText, Download, Loader2, Copy, Check } from "lucide-react";

interface ExtractionResult {
  fileName: string;
  fileSize: number;
  extractedText: string;
  textLength: number;
  pageCount: number;
  wordCount: number;
  readableWords: number;
  readabilityScore: number;
  extractionMethod?: string;
  qualityWarning?: string;
  // Engineering-specific fields
  engineeringDisciplines?: string[];
  engineeringKeywords?: string[];
  technicalTerms?: string[];
  engineeringScore?: number;
  // Enhanced analysis fields
  complexity?: string;
  documentType?: string;
  confidence?: number;
  analysisSummary?: {
    totalTerms: number;
    primaryDiscipline: string;
    technicalLevel: string;
    documentCategory: string;
  };
}

declare global {
  interface Window {
    pdfjsLib: any;
  }
}

export default function DocumentExtractorPage() {
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);

  // Load PDF.js on component mount
  useEffect(() => {
    const loadPDFJS = async () => {
      if (typeof window !== "undefined" && !window.pdfjsLib) {
        // Load PDF.js from CDN
        const script = document.createElement("script");
        script.src =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
        script.onload = () => {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc =
            "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
        };
        document.head.appendChild(script);
      }
    };
    loadPDFJS();
  }, []);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset previous results
    setResult(null);
    setError(null);
    setIsUploading(true);
    setProgress(0);

    try {
      // Check if it's a PDF
      if (file.type !== "application/pdf") {
        throw new Error("Please select a PDF file");
      }

      // Check file size (50MB limit)
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (file.size > maxSize) {
        throw new Error("File size must be less than 50MB");
      }

      // Extract text using PDF.js
      await extractTextFromPDF(file);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  const extractTextFromPDF = async (file: File) => {
    try {
      // Wait for PDF.js to be loaded
      if (!window.pdfjsLib) {
        throw new Error("PDF.js is not loaded yet. Please try again.");
      }

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer })
        .promise;

      let fullText = "";

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        setProgress((pageNum / pdf.numPages) * 100);

        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();

        let pageText = "";
        textContent.items.forEach((item: any) => {
          pageText += item.str + " ";
        });

        fullText += `--- Page ${pageNum} ---\n${pageText.trim()}\n\n`;
      }

      // Process the extracted text
      const processedResult = await processExtractedText(
        fullText,
        file,
        pdf.numPages
      );
      setResult(processedResult);
    } catch (error: any) {
      throw new Error(`Error extracting PDF: ${error.message}`);
    }
  };

  const processExtractedText = async (
    text: string,
    file: File,
    pageCount: number
  ): Promise<ExtractionResult> => {
    // Enhanced text cleaning
    let cleanedText = text
      // Remove page markers
      .replace(/--- Page \d+ ---/g, "")
      // Remove excessive whitespace
      .replace(/\n{3,}/g, "\n\n")
      .replace(/\s{2,}/g, " ")
      // Remove common PDF artifacts
      .replace(/[^\x20-\x7E\n\t]/g, " ")
      // Clean up bullet points and lists
      .replace(/^\s*[•·▪▫◦‣⁃]\s*/gm, "• ")
      // Remove header/footer artifacts
      .replace(/^\s*\d+\s*$/gm, "")
      // Clean up email patterns
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, "")
      // Remove URL patterns
      .replace(/https?:\/\/[^\s]+/g, "")
      .trim();

    // Extract structured information
    const lines = cleanedText
      .split("\n")
      .filter((line) => line.trim().length > 0);
    const words = cleanedText.split(/\s+/).filter((word) => word.length > 1);
    const readableWords = words.filter((word) => /^[a-zA-Z]/.test(word));
    const readabilityScore =
      words.length > 0
        ? Math.round((readableWords.length / words.length) * 100)
        : 0;

    // Extract potential engineering terms using pattern matching
    const engineeringPatterns = {
      disciplines: [
        /mechanical\s+engineering/gi,
        /electrical\s+engineering/gi,
        /civil\s+engineering/gi,
        /software\s+engineering/gi,
        /chemical\s+engineering/gi,
        /biomedical\s+engineering/gi,
        /aerospace\s+engineering/gi,
        /computer\s+engineering/gi,
        /industrial\s+engineering/gi,
        /materials\s+engineering/gi,
        /nuclear\s+engineering/gi,
        /environmental\s+engineering/gi,
        /structural\s+engineering/gi,
        /systems\s+engineering/gi,
        /robotics\s+engineering/gi,
      ],
      technologies: [
        /\b(?:python|java|c\+\+|javascript|react|angular|vue|node\.js|docker|kubernetes|aws|azure|gcp|sql|mongodb|redis|git|jenkins|ansible|terraform)\b/gi,
        /\b(?:cad|solidworks|autocad|matlab|simulink|ansys|abaqus|comsol|stata|r\b|spss|minitab)\b/gi,
        /\b(?:arduino|raspberry\s+pi|microcontroller|fpga|asic|pcb|sensor|actuator|motor|pump|valve|circuit)\b/gi,
        /\b(?:machine\s+learning|artificial\s+intelligence|deep\s+learning|neural\s+network|computer\s+vision|nlp)\b/gi,
        /\b(?:agile|scrum|waterfall|lean|six\s+sigma|kaizen|kanban|devops|ci\/cd)\b/gi,
      ],
      standards: [
        /\b(?:iso|astm|asme|ieee|ansi|nist|ul|ce|rohs|reach|fda|epa|osh|api|asnt|aws|aisc|aci|aashto)\b/gi,
        /\b(?:iso\s+\d+|astm\s+[a-z]\d+|asme\s+[a-z]\d+|ieee\s+\d+|ansi\s+[a-z]\d+)\b/gi,
      ],
      methodologies: [
        /\b(?:design\s+thinking|systems\s+thinking|lean\s+manufacturing|tqm|fmea|root\s+cause\s+analysis|poka\s+yoke)\b/gi,
        /\b(?:finite\s+element\s+analysis|computational\s+fluid\s+dynamics|stress\s+analysis|thermal\s+analysis)\b/gi,
        /\b(?:project\s+management|risk\s+assessment|quality\s+assurance|testing|validation|verification)\b/gi,
      ],
    };

    // Extract engineering terms using patterns
    const extractedTerms = {
      disciplines: new Set<string>(),
      technologies: new Set<string>(),
      standards: new Set<string>(),
      methodologies: new Set<string>(),
    };

    // Apply patterns to extract terms
    Object.entries(engineeringPatterns).forEach(([category, patterns]) => {
      patterns.forEach((pattern) => {
        const matches = cleanedText.match(pattern);
        if (matches) {
          matches.forEach((match) => {
            extractedTerms[category as keyof typeof extractedTerms].add(
              match.toLowerCase().trim()
            );
          });
        }
      });
    });

    // Extract additional technical terms using word frequency and context
    const technicalWords = words.filter((word) => {
      const lowerWord = word.toLowerCase();
      return (
        // Engineering-related suffixes
        /(?:ing|tion|sion|ment|ance|ence|ity|ness|ship|hood|dom|ism|ist|er|or|al|ic|ical|ous|ive|able|ible)$/.test(
          lowerWord
        ) ||
        // Technical prefixes
        /^(?:micro|macro|nano|pico|tera|giga|mega|kilo|milli|centi|deci|semi|bi|tri|quad|multi|poly|mono|uni|omni|inter|intra|trans|sub|super|hyper|ultra|infra|pre|post|re|un|dis|mis|over|under|out|up|down|in|ex|pro|anti|auto|self|bio|geo|hydro|thermo|electro|mechano|chemo|photo|radio|tele|cyber|info|data|tech|comp|sys|net|web|soft|hard|firm|real|virtual|digital|analog|linear|non|semi|quasi|pseudo|meta|para|peri|epi|endo|ecto|meso|iso|homo|hetero|poly|mono|di|tri|tetra|penta|hexa|hepta|octa|nona|deca|centi|milli|micro|nano|pico|femto|atto|zepto|yocto)/.test(
          lowerWord
        ) ||
        // Common technical terms
        /^(?:algorithm|analysis|architecture|assembly|automation|benchmark|calibration|certification|compliance|configuration|deployment|diagnostic|documentation|encryption|framework|implementation|integration|maintenance|monitoring|optimization|protocol|regulation|specification|standardization|validation|verification)$/.test(
          lowerWord
        ) ||
        // Units and measurements
        /^(?:watt|volt|ampere|ohm|farad|henry|tesla|weber|joule|newton|pascal|hertz|decibel|candela|mole|kelvin|radian|steradian|meter|kilogram|second|ampere|kelvin|mole|candela|radian|steradian|meter|kilogram|second|ampere|kelvin|mole|candela|radian|steradian)$/.test(
          lowerWord
        ) ||
        // Mathematical and scientific terms
        /^(?:algorithm|analysis|approximation|calculation|coefficient|constant|derivative|equation|formula|function|gradient|integral|matrix|parameter|polynomial|probability|statistics|theorem|variable|vector)$/.test(
          lowerWord
        )
      );
    });

    // AI-powered engineering analysis (if OpenAI API is available)
    let engineeringDisciplines: string[] = [];
    let engineeringKeywords: string[] = [];
    let technicalTerms: string[] = [];
    let enhancedData: any = {};

    if (process.env.NEXT_PUBLIC_OPENAI_API_KEY && cleanedText.length > 100) {
      try {
        const response = await fetch("/api/analyze-engineering", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: cleanedText.substring(0, 4000), // Limit to first 4000 chars
          }),
        });

        if (response.ok) {
          const analysis = await response.json();
          engineeringDisciplines = analysis.disciplines || [];
          engineeringKeywords = analysis.keywords || [];
          technicalTerms = analysis.technicalTerms || [];

          // Store enhanced analysis data
          enhancedData = {
            complexity: analysis.complexity,
            documentType: analysis.documentType,
            confidence: analysis.confidence,
            analysisSummary: analysis.analysisSummary,
          };
        }
      } catch (aiError) {
        console.log("AI analysis failed, continuing without it");
      }
    }

    // Combine pattern-based extraction with AI results
    const allDisciplines = [
      ...new Set([
        ...engineeringDisciplines,
        ...Array.from(extractedTerms.disciplines).map((term) =>
          term
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")
        ),
      ]),
    ];

    const allKeywords = [
      ...new Set([
        ...engineeringKeywords,
        ...Array.from(extractedTerms.technologies),
        ...Array.from(extractedTerms.standards),
        ...Array.from(extractedTerms.methodologies),
        ...technicalWords.slice(0, 50), // Limit to top 50 technical words
      ]),
    ];

    // Calculate enhanced engineering score
    const baseScore = allDisciplines.length * 10 + allKeywords.length * 2;
    const complexityBonus = Math.min(pageCount * 2, 20); // Bonus for multi-page documents
    const technicalDensity = Math.min(
      (allKeywords.length / words.length) * 1000,
      50
    ); // Technical term density
    const engineeringScore = Math.min(
      baseScore + complexityBonus + technicalDensity,
      100
    );

    // Generate quality assessment
    let qualityWarning: string | undefined;
    if (readabilityScore < 50) {
      qualityWarning =
        "Text quality is low. This may be a scanned document or contain many formatting artifacts.";
    } else if (readabilityScore < 70) {
      qualityWarning =
        "Text quality is moderate. Some formatting may be lost during extraction.";
    } else if (allKeywords.length < 5) {
      qualityWarning =
        "Limited technical content detected. This may not be an engineering document.";
    }

    // Extract document structure information
    const hasTableOfContents = /table\s+of\s+contents|contents|toc/i.test(
      cleanedText
    );
    const hasReferences = /references?|bibliography|works\s+cited/i.test(
      cleanedText
    );
    const hasAbstract = /abstract|summary|executive\s+summary/i.test(
      cleanedText
    );
    const hasFigures = /figure\s+\d+|fig\.\s*\d+/i.test(cleanedText);
    const hasTables = /table\s+\d+|tab\.\s*\d+/i.test(cleanedText);

    // Add document structure to extraction method
    const structureInfo = [];
    if (hasTableOfContents) structureInfo.push("TOC");
    if (hasReferences) structureInfo.push("References");
    if (hasAbstract) structureInfo.push("Abstract");
    if (hasFigures) structureInfo.push("Figures");
    if (hasTables) structureInfo.push("Tables");

    const extractionMethod = `Client-side PDF.js extraction${
      structureInfo.length > 0 ? ` (${structureInfo.join(", ")})` : ""
    }`;

    return {
      fileName: file.name,
      fileSize: file.size,
      extractedText: cleanedText,
      textLength: cleanedText.length,
      pageCount: pageCount,
      wordCount: words.length,
      readableWords: readableWords.length,
      readabilityScore: readabilityScore,
      extractionMethod: extractionMethod,
      qualityWarning: qualityWarning,
      engineeringDisciplines: allDisciplines,
      engineeringKeywords: allKeywords,
      technicalTerms: technicalTerms,
      engineeringScore: Math.round(engineeringScore),
      ...enhancedData, // Include enhanced analysis data
    };
  };

  const downloadText = () => {
    if (!result) return;

    const blob = new Blob([result.extractedText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${result.fileName.replace(".pdf", "")}_extracted.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = async () => {
    if (!result) return;

    try {
      await navigator.clipboard.writeText(result.extractedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            📄 PDF Data Extractor
          </h1>
          <div className="mb-4">
            <span className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
              🔧 Client-side PDF.js Extraction
            </span>
          </div>
          <p className="text-gray-600 text-lg">
            Fast, reliable PDF text extraction using advanced client-side
            processing
          </p>
        </div>

        {/* Upload Area */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-200">
          <div className="border-2 border-dashed border-blue-300 rounded-xl p-12 text-center hover:border-blue-400 transition-all duration-300 hover:shadow-lg">
            <Upload className="mx-auto h-16 w-16 text-blue-500 mb-6" />
            <div className="text-xl font-medium text-gray-900 mb-4">
              Drop your PDF file here
            </div>
            <p className="text-gray-600 mb-6">or click to browse files</p>
            <label className="cursor-pointer">
              <span className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl">
                <Upload className="w-5 h-5 mr-2" />
                Choose PDF File
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isUploading}
                />
              </span>
            </label>
          </div>
        </div>

        {/* Progress Bar */}
        {isUploading && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-center mb-4">
              <Loader2 className="animate-spin h-6 w-6 text-blue-600 mr-3" />
              <span className="text-gray-700 font-medium">
                Extracting text from PDF...
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="text-center mt-2 text-sm text-gray-600">
              {Math.round(progress)}% complete
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
            <div className="flex items-center">
              <div className="text-red-600 font-medium">
                <strong>Error:</strong> {error}
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Engineering Analysis Results */}
            {(result.engineeringDisciplines?.length ||
              result.engineeringKeywords?.length) && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-lg p-6 border border-blue-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  🔧 Engineering Analysis Results
                </h3>

                {/* Enhanced Analysis Summary */}
                {(result.engineeringScore || result.analysisSummary) && (
                  <div className="mb-6 p-4 bg-white rounded-lg border border-blue-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Engineering Score */}
                      {result.engineeringScore &&
                        result.engineeringScore > 0 && (
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                              {result.engineeringScore}
                            </div>
                            <div className="text-sm text-gray-600">
                              Engineering Score
                            </div>
                          </div>
                        )}

                      {/* Technical Level */}
                      {result.complexity && (
                        <div className="text-center">
                          <div className="text-lg font-semibold text-green-600">
                            {result.complexity}
                          </div>
                          <div className="text-sm text-gray-600">
                            Technical Level
                          </div>
                        </div>
                      )}

                      {/* Document Type */}
                      {result.documentType && (
                        <div className="text-center">
                          <div className="text-sm font-medium text-purple-600">
                            {result.documentType}
                          </div>
                          <div className="text-sm text-gray-600">
                            Document Type
                          </div>
                        </div>
                      )}

                      {/* Confidence */}
                      {result.confidence && (
                        <div className="text-center">
                          <div className="text-lg font-semibold text-orange-600">
                            {Math.round(result.confidence * 100)}%
                          </div>
                          <div className="text-sm text-gray-600">
                            Analysis Confidence
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Analysis Summary */}
                    {result.analysisSummary && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="text-sm text-gray-600">
                          <strong>Primary Discipline:</strong>{" "}
                          {result.analysisSummary.primaryDiscipline} •
                          <strong> Total Terms:</strong>{" "}
                          {result.analysisSummary.totalTerms} •
                          <strong> Category:</strong>{" "}
                          {result.analysisSummary.documentCategory}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Engineering Disciplines */}
                {result.engineeringDisciplines &&
                  result.engineeringDisciplines.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">
                        🎓 Engineering Disciplines
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {result.engineeringDisciplines.map(
                          (discipline, index) => (
                            <span
                              key={index}
                              className="inline-block bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium"
                            >
                              {discipline}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {/* Technical Keywords */}
                {result.engineeringKeywords &&
                  result.engineeringKeywords.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">
                        ⚙️ Technical Keywords & Terms
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {result.engineeringKeywords
                          .slice(0, 20)
                          .map((keyword, index) => (
                            <span
                              key={index}
                              className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm border border-green-200"
                            >
                              {keyword}
                            </span>
                          ))}
                        {result.engineeringKeywords.length > 20 && (
                          <span className="inline-block bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                            +{result.engineeringKeywords.length - 20} more...
                          </span>
                        )}
                      </div>
                    </div>
                  )}
              </div>
            )}

            {/* Document Analysis Details */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <FileText className="mr-3 h-6 w-6 text-blue-600" />
                Document Analysis Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <span className="font-medium text-gray-500 text-sm">
                    File Name:
                  </span>
                  <p className="text-gray-900 font-medium">{result.fileName}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <span className="font-medium text-gray-500 text-sm">
                    File Size:
                  </span>
                  <p className="text-gray-900 font-medium">
                    {formatFileSize(result.fileSize)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <span className="font-medium text-gray-500 text-sm">
                    Pages:
                  </span>
                  <p className="text-gray-900 font-medium">
                    {result.pageCount}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <span className="font-medium text-gray-500 text-sm">
                    Text Length:
                  </span>
                  <p className="text-gray-900 font-medium">
                    {result.textLength.toLocaleString()} characters
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <span className="font-medium text-gray-500 text-sm">
                    Word Count:
                  </span>
                  <p className="text-gray-900 font-medium">
                    {result.wordCount.toLocaleString()} words
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <span className="font-medium text-gray-500 text-sm">
                    Text Quality:
                  </span>
                  <p
                    className={`font-medium ${
                      result.readabilityScore >= 70
                        ? "text-green-600"
                        : result.readabilityScore >= 30
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    {result.readabilityScore}% readable
                  </p>
                </div>
              </div>

              {/* Quality Warning */}
              {result.qualityWarning && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex">
                    <div className="text-yellow-800 text-sm">
                      <strong>Quality Notice:</strong> {result.qualityWarning}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 mb-6">
                <button
                  onClick={downloadText}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-lg"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Text
                </button>
                <button
                  onClick={copyToClipboard}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
                >
                  {copied ? (
                    <Check className="w-4 h-4 mr-2" />
                  ) : (
                    <Copy className="w-4 h-4 mr-2" />
                  )}
                  {copied ? "Copied!" : "Copy Text"}
                </button>
              </div>

              {/* Extracted Text */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3 text-lg">
                  📋 Extracted Text:
                </h4>
                <div className="bg-gray-50 rounded-lg p-6 max-h-96 overflow-y-auto border border-gray-200">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono leading-relaxed">
                    {result.extractedText}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
