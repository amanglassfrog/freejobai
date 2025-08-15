# FreeJobAI - AI-Powered Job Tools

A comprehensive AI-powered platform for job seekers, featuring document extraction, ATS analysis, and career tools built with Next.js, TypeScript, Tailwind CSS, and OpenAI.

## Features

- ⚡ Next.js 14 with App Router
- 🎨 shadcn/ui components
- 🎯 TypeScript
- 🎨 Tailwind CSS
- 🤖 OpenAI-powered document extraction
- 📄 PDF, DOC, DOCX, TXT, CSV file support
- 📊 ATS Resume Analysis
- 📱 Responsive design
- 🔐 Authentication system
- 📧 Email notification signup

## New Features

### 📄 Document Extractor

- **AI-Powered Extraction**: Uses OpenAI GPT-4 Vision for comprehensive PDF analysis
- **Complete Page Analysis**: Extracts text from all pages with page-by-page breakdown
- **Metadata Extraction**: Title, author, creation date, page count, and more
- **Multiple Formats**: Support for PDF, DOC, DOCX, TXT, and CSV files
- **Page Statistics**: Word count, character count, paragraph count per page
- **Visual Elements Detection**: Identifies images, tables, and special formatting

### 🎯 ATS Analysis

- Resume compatibility analysis
- Keyword optimization
- Format recommendations

## Getting Started

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory:

   ```env
   # OpenAI API Key for PDF extraction
   OPENAI_API_KEY=your_openai_api_key_here

   # NextAuth configuration
   NEXTAUTH_SECRET=your_nextauth_secret_here
   NEXTAUTH_URL=http://localhost:3000
   ```

4. Get your OpenAI API key:

   - Visit [OpenAI Platform](https://platform.openai.com/api-keys)
   - Create a new API key
   - Add it to your `.env.local` file

5. Run the development server:

   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Document Extractor Usage

1. Navigate to `/document-extractor`
2. Upload your PDF, DOC, DOCX, TXT, or CSV files
3. Click "Extract Data from Documents"
4. View comprehensive analysis including:
   - Complete text extraction
   - Page-by-page breakdown
   - Document metadata
   - Statistics (words, characters, paragraphs, sentences, pages)
   - Visual elements detection

## Tech Stack

- **Framework:** Next.js 14
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Icons:** Lucide React
- **AI:** OpenAI GPT-4 Vision
- **PDF Processing:** pdf-parse, OpenAI Vision
- **Document Processing:** mammoth (DOCX)

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── document-extractor/
│   │   │   └── route.ts
│   │   └── ats-analysis/
│   │       └── route.ts
│   ├── document-extractor/
│   │   └── page.tsx
│   ├── ats-analysis/
│   │   └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── badge.tsx
│   └── ResumeScanner.tsx
└── lib/
    ├── utils.ts
    ├── api.ts
    ├── config.ts
    └── mongodb.ts
```

## API Endpoints

- `POST /api/document-extractor` - Extract data from uploaded documents
- `POST /api/ats-analysis` - Analyze resume for ATS compatibility

## Design Features

- Clean, professional design
- Modern card-based layout
- Real-time file processing
- Comprehensive data visualization
- Responsive design
- Accessible components
- AI-powered insights

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs)
