import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Shield,
  TrendingUp,
  Target,
  Zap,
  Users,
  BookOpen,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  Cpu,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <Cpu className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">FreeJobAI</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/ats-analysis">
                <Button
                  variant="outline"
                  className="border border-gray-900 text-gray-900 hover:bg-gray-50"
                >
                  ATS Analysis
                </Button>
              </Link>
              <Link href="/document-extractor">
                <Button
                  variant="outline"
                  className="border border-gray-900 text-gray-900 hover:bg-gray-50"
                >
                  Document Extractor
                </Button>
              </Link>
              <Link href="/signin">
                <Button
                  variant="outline"
                  className="border border-gray-900 text-gray-900 hover:bg-gray-50"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-black hover:bg-gray-800 text-white">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <Badge
              variant="secondary"
              className="mb-4 bg-yellow-100 text-yellow-800 border border-yellow-200"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              AI Job Displacement - Your Solution is Here
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Future-Proof Your Career with
              <span className="text-blue-600 block">AI-Powered Insights</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              60%+ of knowledge workers are worried about AI replacing their
              jobs. We&apos;re here to help you identify AI-proof skills, plan
              career transitions, and build a future-ready resume.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link href="/signup">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-gray-900 text-gray-900 hover:bg-gray-50"
              >
                <Zap className="w-5 h-5 mr-2 text-blue-600" />
                Start Free Analysis
              </Button>
            </Link>
            <Link href="/dashboard/resume-scanner">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-gray-900 text-gray-900 hover:bg-gray-50"
              >
                <Target className="w-5 h-5 mr-2 text-blue-600" />
                Try Resume Scanner
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center group">
              <div className="text-4xl font-bold text-gray-900 group-hover:scale-110 transition-transform">
                <span className="animate-pulse">60</span>%+
              </div>
              <div className="text-gray-600">Workers concerned about AI</div>
            </div>
            <div className="text-center group">
              <div className="text-4xl font-bold text-gray-900 group-hover:scale-110 transition-transform">
                <span className="animate-pulse">85</span>%
              </div>
              <div className="text-gray-600">
                Average resume score improvement
              </div>
            </div>
            <div className="text-center group">
              <div className="text-4xl font-bold text-gray-900 group-hover:scale-110 transition-transform">
                <span className="animate-pulse">24</span>/7
              </div>
              <div className="text-gray-600">AI-powered analysis</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              AI Job Displacement Solutions
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Don&apos;t just worry about AI taking your job. Take control of
              your career with our comprehensive AI-powered tools.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* AI Skills Assessment Tool */}
            <Card className="group hover:shadow-xl transition-all duration-300 border border-gray-200 bg-white hover:border-blue-300">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">
                  AI Skills Assessment Tool
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Identify which of your skills are &quot;AI-proof&quot; and
                  which need upgrading
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" />
                    AI-proof skill identification
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" />
                    Skill vulnerability analysis
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" />
                    Personalized skill recommendations
                  </li>
                </ul>
                <div className="mt-6">
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 text-blue-800 border border-blue-200"
                  >
                    Coming Soon
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Career Transition Planner */}
            <Card className="group hover:shadow-xl transition-all duration-300 border border-gray-200 bg-white hover:border-blue-300">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">
                  Career Transition Planner
                </CardTitle>
                <CardDescription className="text-gray-600">
                  AI-powered recommendations for pivoting to AI-resistant roles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" />
                    AI-resistant role suggestions
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" />
                    Transition roadmap planning
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" />
                    Market demand analysis
                  </li>
                </ul>
                <div className="mt-6">
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 text-blue-800 border border-blue-200"
                  >
                    Coming Soon
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Reskilling Pathways */}
            <Card className="group hover:shadow-xl transition-all duration-300 border border-gray-200 bg-white hover:border-blue-300">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">
                  Reskilling Pathways
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Personalized learning tracks to make you more valuable
                  alongside AI
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" />
                    Personalized learning paths
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" />
                    AI collaboration skills
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" />
                    Progress tracking
                  </li>
                </ul>
                <div className="mt-6">
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 text-blue-800 border border-blue-200"
                  >
                    Coming Soon
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Current Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Available Now
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Start your AI-proof career journey with our current tools.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Resume Intelligence Scanner */}
            <Card className="group hover:shadow-xl transition-all duration-300 border border-gray-200 bg-white hover:border-blue-300">
              <CardHeader>
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900 text-center">
                  Resume Intelligence Scanner
                </CardTitle>
                <CardDescription className="text-gray-600 text-center">
                  AI-powered resume analysis with comprehensive insights and
                  improvement recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" />
                    Multi-format support (PDF, DOCX, TXT)
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" />
                    Skills analysis (technical & soft skills)
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" />
                    Gap analysis with severity levels
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" />
                    Overall resume scoring (0-100)
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" />
                    Actionable improvement recommendations
                  </li>
                </ul>
                <div className="mt-6">
                  <Link href="/dashboard/resume-scanner">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold">
                      Try Now
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Email Signup */}
            <Card className="group hover:shadow-xl transition-all duration-300 border border-gray-200 bg-white hover:border-blue-300">
              <CardHeader>
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Lightbulb className="w-8 h-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900 text-center">
                  Stay Updated
                </CardTitle>
                <CardDescription className="text-gray-600 text-center">
                  Be the first to know when our AI job displacement solutions
                  launch
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center text-sm text-gray-500">
                    Get early access to:
                  </div>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" />
                      AI Skills Assessment Tool
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" />
                      Career Transition Planner
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" />
                      Reskilling Pathways
                    </li>
                  </ul>
                  <div className="space-y-2">
                    <Input
                      type="email"
                      placeholder="Enter your email address"
                      className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold">
                      <Zap className="w-4 h-4 mr-2" />
                      Notify Me
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Future-Proof Your Career?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of professionals who are taking control of their AI
            future
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100 font-bold"
              >
                <Users className="w-5 h-5 mr-2" />
                Start Free
              </Button>
            </Link>
            <Link href="/signin">
              <Button
                size="lg"
                variant="outline"
                className="border-white font-bold text-black hover:bg-white hover:text-blue-600"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Cpu className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">FreeJobAI</span>
              </div>
              <p className="text-gray-400 max-w-md">
                Empowering professionals to navigate the AI revolution with
                confidence. Future-proof your career with AI-powered insights
                and tools.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/dashboard/resume-scanner"
                    className="hover:text-white transition-colors"
                  >
                    Resume Scanner
                  </Link>
                </li>
                <li>
                  <Link
                    href="/ats-analysis"
                    className="hover:text-white transition-colors"
                  >
                    ATS Analysis
                  </Link>
                </li>
                <li>
                  <Link
                    href="/document-extractor"
                    className="hover:text-white transition-colors"
                  >
                    Document Extractor
                  </Link>
                </li>
                <li>
                  <span className="text-gray-500">
                    AI Skills Assessment (Coming Soon)
                  </span>
                </li>
                <li>
                  <span className="text-gray-500">
                    Career Transition Planner (Coming Soon)
                  </span>
                </li>
                <li>
                  <span className="text-gray-500">
                    Reskilling Pathways (Coming Soon)
                  </span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/signin"
                    className="hover:text-white transition-colors"
                  >
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link
                    href="/signup"
                    className="hover:text-white transition-colors"
                  >
                    Sign Up
                  </Link>
                </li>
                <li>
                  <span className="text-gray-500">About Us</span>
                </li>
                <li>
                  <span className="text-gray-500">Contact</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © 2025 FreeJobAI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
