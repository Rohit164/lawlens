import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, Download, Languages, Brain, Loader2, Scale, Sparkles, Zap, ArrowRight } from 'lucide-react';
import { SignedIn, SignedOut, RedirectToSignIn, useUser } from '@clerk/clerk-react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimatedBackground from "@/components/AnimatedBackground";
import InteractiveParticles from "@/components/InteractiveParticles";
import GlassmorphismCard from "@/components/GlassmorphismCard";
import MagneticButton from "@/components/MagneticButton";
import TiltCard from "@/components/TiltCard";
import AdvancedTypingAnimation from "@/components/AdvancedTypingAnimation";
import MorphingIcon from "@/components/MorphingIcon";
import AdvancedProgress from "@/components/AdvancedProgress";
import AnimatedLoader from "@/components/AnimatedLoader";
import LimitReachedModal from "@/components/LimitReachedModal";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

interface SummaryResult {
  original_text: string;
  summary: string;
  processing_time: number;
  metadata?: {
    court_name?: string;
    case_number?: string;
    date?: string;
    parties?: {
      petitioner: string;
      respondent: string;
    };
  };
  key_points?: string[];
  translated_summary?: string;  // Added
  translation_language?: string;  // Added
}

interface TranslationResult {
  translated_text: string;
  target_language: string;
  confidence_score: number;
  processing_time: number;
}

const Summarize = () => {
  const { user } = useUser();
  const [inputText, setInputText] = useState<string>('');
  const [summaryLength, setSummaryLength] = useState<string>('medium');
  const [targetLanguage, setTargetLanguage] = useState<string>('en');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [summaryResult, setSummaryResult] = useState<SummaryResult | null>(null);
  const [translationResult, setTranslationResult] = useState<TranslationResult | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [showLimitModal, setShowLimitModal] = useState<boolean>(false);
  const [limitModalType, setLimitModalType] = useState<'summarization' | 'translation'>('summarization');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadedFile(file);
      extractTextFromFile(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.tiff', '.bmp']
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    multiple: false
  });

  const extractTextFromFile = async (file: File) => {
    setIsProcessing(true);
    setProgress(20);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:8000/api/ocr/extract', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setInputText(result.extracted_text);
        setProgress(50);
      } else {
        // Fallback for demo mode
        setInputText(`[Demo Mode] Extracted text from ${file.name}:\n\nIN THE SUPREME COURT OF INDIA\n\nCivil Appeal No. 1234 of 2023\n\nPetitioner vs Respondent\n\nJUDGMENT\n\nThis is a sample legal document text that would be extracted from the uploaded file. In a real implementation, this would contain the actual extracted text from the PDF or image file using OCR technology.\n\nThe court finds that the petitioner has established their case based on the evidence presented. The legal principles applied in this matter are well-established in Indian jurisprudence.\n\nAccordingly, this appeal is allowed and the impugned order is set aside.`);
        setProgress(50);
      }
    } catch (error) {
      console.error('OCR extraction failed:', error);
      setInputText(`[Demo Mode] Extracted text from ${file.name}:\n\nSample legal document content...`);
      setProgress(50);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSummarize = async () => {
    if (!inputText.trim()) {
      alert('Please enter some text or upload a document first.');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setSummaryResult(null);
    setTranslationResult(null);

    try {
      setProgress(30);

      const response = await fetch('http://localhost:8000/api/summarize/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: inputText,
          summary_length: summaryLength,
          extract_metadata: true,
          translate_to: 'en'  // Always English for summary
        }),
      });

      setProgress(60);

      if (response.status === 429) {
        // Quota exceeded
        setLimitModalType('summarization');
        setShowLimitModal(true);
        return;
      }

      if (response.ok) {
        const result: SummaryResult = await response.json();
        setSummaryResult(result);
        setProgress(100);
      } else {
        // Demo fallback
        const demoResult: SummaryResult = {
          original_text: inputText,
          summary: `[Demo Mode - ${summaryLength} summary] This legal document discusses a case between the petitioner and respondent. The court examined the evidence and legal precedents before reaching its decision. Key legal principles were applied to determine the outcome of the case.`,
          processing_time: 2.5,
          metadata: {
            court_name: "Supreme Court of India",
            case_number: "Civil Appeal No. 1234/2023",
            date: "2023",
            parties: {
              petitioner: "Sample Petitioner",
              respondent: "Sample Respondent"
            }
          },
          key_points: [
            "Court examined evidence and legal precedents",
            "Key legal principles were applied",
            "Decision reached based on established jurisprudence"
          ]
        };
        setSummaryResult(demoResult);
        setProgress(100);
      }
    } catch (error) {
      console.error('Summarization failed:', error);
      alert('Summarization failed. Please try again.');
    } finally {
      setTimeout(() => setIsProcessing(false), 500);
    }
  };

  const handleTranslate = async () => {
    if (!summaryResult?.summary) return;

    setIsTranslating(true);

    try {
      const response = await fetch('http://localhost:8000/api/translate/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: summaryResult.summary,
          target_language: targetLanguage,
          source_language: 'en'
        }),
      });

      if (response.status === 429) {
        // Quota exceeded
        setLimitModalType('translation');
        setShowLimitModal(true);
        return;
      }

      if (response.ok) {
        const result: TranslationResult = await response.json();
        setTranslationResult(result);
      } else {
        // Demo fallback
        const languageNames: { [key: string]: string } = {
          'hi': 'Hindi',
          'mr': 'Marathi',
          'ta': 'Tamil',
          'bn': 'Bengali',
          'gu': 'Gujarati',
          'kn': 'Kannada',
          'ml': 'Malayalam',
          'or': 'Odia',
          'pa': 'Punjabi',
          'te': 'Telugu'
        };

        setTranslationResult({
          translated_text: `[Demo ${languageNames[targetLanguage]} Translation] ${summaryResult.summary}`,
          target_language: targetLanguage,
          confidence_score: 0.85,
          processing_time: 1.2
        });
      }
    } catch (error) {
      console.error('Translation failed:', error);
      alert('Translation failed. Please try again.');
    } finally {
      setIsTranslating(false);
    }
  };

  const downloadReport = () => {
    if (!summaryResult) return;

    const report = `
LawLens Document Analysis Report
Generated on: ${new Date().toLocaleString()}
User: ${user?.emailAddresses[0]?.emailAddress || 'Demo User'}

=== DOCUMENT METADATA ===
${summaryResult.metadata ? `
Court: ${summaryResult.metadata.court_name || 'N/A'}
Case Number: ${summaryResult.metadata.case_number || 'N/A'}
Date: ${summaryResult.metadata.date || 'N/A'}
Parties: ${summaryResult.metadata.parties ?
          `${summaryResult.metadata.parties.petitioner} vs ${summaryResult.metadata.parties.respondent}` : 'N/A'}
` : 'No metadata extracted'}

=== SUMMARY (${summaryLength}) ===
${summaryResult.summary}

${summaryResult.key_points ? `
=== KEY POINTS ===
${summaryResult.key_points.map((point, index) => `${index + 1}. ${point}`).join('\n')}
` : ''}

${translationResult ? `
=== TRANSLATION (${translationResult.target_language.toUpperCase()}) ===
${translationResult.translated_text}
Confidence Score: ${(translationResult.confidence_score * 100).toFixed(1)}%
` : ''}

=== PROCESSING DETAILS ===
Summary Processing Time: ${summaryResult.processing_time.toFixed(2)}s
${translationResult ? `Translation Processing Time: ${translationResult.processing_time.toFixed(2)}s` : ''}

---
Generated by LawLens - AI-Powered Legal Document Simplification
    `.trim();

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lawlens-report-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>

      <SignedIn>
        <div className="min-h-screen relative page-transition">
          <AnimatedBackground />
          <Navbar />

          <div className="pt-24 pb-16 relative z-10">
            <div className="container mx-auto px-4">
              {/* Header */}
              <div className="text-center mb-12 animate-fade-in-up">
                <GlassmorphismCard className="inline-flex items-center px-4 py-2 mb-6" variant="subtle">
                  <MorphingIcon
                    primaryIcon={Scale}
                    secondaryIcon={Sparkles}
                    size={16}
                    className="text-primary mr-2"
                  />
                  <span className="text-xs font-medium text-primary mr-2">AI Document Analyzer</span>
                  <AdvancedTypingAnimation
                    texts={["Legal Document Processing", "AI-Powered Analysis", "Multilingual Translation"]}
                    className="text-xs text-muted-foreground"
                    speed={80}
                    deleteSpeed={40}
                    pauseDuration={1500}
                  />
                </GlassmorphismCard>

                <div className="flex items-center justify-center mb-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                  <div className="flex items-center">
                    <MorphingIcon
                      primaryIcon={Scale}
                      secondaryIcon={Brain}
                      size={48}
                      className="text-primary mr-4 animate-pulse-glow"
                    />
                    <h1 className="text-4xl font-bold text-foreground">
                      Document <span className="text-gradient dark:text-gradient-dark">Analyzer</span>
                    </h1>
                  </div>
                </div>

                <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                  Upload legal documents and get AI-powered summaries with translations in Indian languages
                </p>

                <div className="flex items-center justify-center space-x-4 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                  <GlassmorphismCard className="px-3 py-2" variant="subtle" hover>
                    <div className="flex items-center">
                      <Brain className="w-4 h-4 mr-2 text-primary animate-pulse-glow" />
                      <span className="text-sm text-foreground font-medium">BART + InLegalBERT</span>
                    </div>
                  </GlassmorphismCard>

                  <GlassmorphismCard className="px-3 py-2" variant="subtle" hover>
                    <div className="flex items-center">
                      <Languages className="w-4 h-4 mr-2 text-blue-500 animate-pulse-glow" />
                      <span className="text-sm text-foreground font-medium">IndicTrans2</span>
                    </div>
                  </GlassmorphismCard>
                </div>
              </div>

              <div className="max-w-4xl mx-auto space-y-8">
                {/* Input Section */}
                <div className="space-y-6">
                  {/* File Upload */}
                  <GlassmorphismCard className="p-6 animate-fade-in-left" variant="default" hover glow>
                    <div className="flex items-center mb-4">
                      <MorphingIcon
                        primaryIcon={Upload}
                        secondaryIcon={Zap}
                        size={20}
                        className="text-primary mr-2"
                      />
                      <h3 className="text-foreground font-semibold">Upload Document</h3>
                    </div>

                    <div
                      {...getRootProps()}
                      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300 ${isDragActive
                        ? 'border-primary bg-primary/10 scale-105'
                        : 'border-border hover:border-primary hover:bg-primary/5 hover:scale-102'
                        }`}
                    >
                      <input {...getInputProps()} />
                      <div className="animate-float">
                        <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      </div>
                      {uploadedFile ? (
                        <div className="text-green-500 animate-fade-in">
                          <p className="font-medium">{uploadedFile.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      ) : (
                        <div className="text-foreground">
                          <p className="mb-2 font-medium">Drop your legal document here, or click to browse</p>
                          <p className="text-sm text-muted-foreground">
                            Supports PDF, PNG, JPG, JPEG, TIFF, BMP (Max 50MB)
                          </p>
                        </div>
                      )}
                    </div>
                  </GlassmorphismCard>

                  {/* Text Input */}
                  <GlassmorphismCard className="p-6 animate-fade-in-left" variant="default" hover>
                    <div className="flex items-center mb-4">
                      <MorphingIcon
                        primaryIcon={FileText}
                        secondaryIcon={Sparkles}
                        size={20}
                        className="text-primary mr-2"
                      />
                      <h3 className="text-foreground font-semibold">Or Paste Text Directly</h3>
                    </div>

                    <Textarea
                      placeholder="Paste your legal document text here..."
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      className="min-h-[200px] bg-background/50 border-border text-foreground placeholder-muted-foreground resize-none focus:ring-2 focus:ring-primary/50 transition-all duration-300"
                    />
                  </GlassmorphismCard>

                  {/* Processing Options */}
                  <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-white">Processing Options</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Summary Type
                        </label>
                        <Select value={summaryLength} onValueChange={setSummaryLength}>
                          <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-600">
                            <SelectItem value="executive">Executive Summary (Key points only)</SelectItem>
                            <SelectItem value="medium">Balanced Summary (Main findings + reasoning)</SelectItem>
                            <SelectItem value="comprehensive">Comprehensive (Detailed analysis)</SelectItem>
                            <SelectItem value="bullet_points">Bullet Points (Structured format)</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-slate-400 mt-1">
                          Summary length automatically adapts to document size
                        </p>
                      </div>

                      <Button
                        onClick={handleSummarize}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25"
                      >
                        {isProcessing ? (
                          <>
                            <div className="animate-spin-slow mr-2">
                              <Loader2 className="h-4 w-4" />
                            </div>
                            <AdvancedTypingAnimation
                              texts={["Processing...", "Analyzing...", "Generating..."]}
                              className="text-primary-foreground"
                              speed={100}
                            />
                          </>
                        ) : (
                          <>
                            <MorphingIcon
                              primaryIcon={Brain}
                              secondaryIcon={Zap}
                              size={16}
                              className="mr-2"
                            />
                            Analyze Document
                            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Results Section - Now below input */}
                <div className="space-y-6">
                  {/* Progress */}
                  {isProcessing && (
                    <GlassmorphismCard className="p-6 animate-fade-in-right" variant="intense" glow>
                      <div className="flex items-center justify-center mb-4">
                        <AnimatedLoader size="md" text="" />
                      </div>
                      <AdvancedProgress
                        value={progress}
                        showPercentage
                        animated
                        gradient
                        glowing
                        size="lg"
                      />
                      <div className="text-center mt-4">
                        <AdvancedTypingAnimation
                          texts={[
                            "Extracting text from document...",
                            "Analyzing legal content...",
                            "Generating AI summary...",
                            "Processing translation...",
                            "Finalizing results..."
                          ]}
                          className="text-muted-foreground text-sm"
                          speed={60}
                        />
                      </div>
                    </GlassmorphismCard>
                  )}

                  {/* Summary Results */}
                  {summaryResult && (
                    <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                      <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-white flex items-center">
                          <Brain className="mr-2 h-5 w-5 text-purple-400" />
                          AI Summary
                        </CardTitle>
                        <Button
                          onClick={downloadReport}
                          variant="outline"
                          size="sm"
                          className="border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download Report
                        </Button>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 bg-slate-900/50 rounded-lg">
                          <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{summaryResult.summary}</p>
                        </div>

                        <div className="text-xs text-gray-400">
                          Processing time: {summaryResult.processing_time.toFixed(2)}s
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Translation Section - Shows after summary */}
                  {summaryResult && !translationResult && (
                    <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center">
                          <Languages className="mr-2 h-5 w-5 text-blue-400" />
                          Translate Summary
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Select Target Language
                          </label>
                          <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                            <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-600">
                              <SelectItem value="hi">Hindi (हिन्दी)</SelectItem>
                              <SelectItem value="mr">Marathi (मराठी)</SelectItem>
                              <SelectItem value="ta">Tamil (தமிழ்)</SelectItem>
                              <SelectItem value="bn">Bengali (বাংলা)</SelectItem>
                              <SelectItem value="gu">Gujarati (ગુજરાતી)</SelectItem>
                              <SelectItem value="kn">Kannada (ಕನ್ನಡ)</SelectItem>
                              <SelectItem value="ml">Malayalam (മലയാളം)</SelectItem>
                              <SelectItem value="or">Odia (ଓଡ଼ିଆ)</SelectItem>
                              <SelectItem value="pa">Punjabi (ਪੰਜਾਬੀ)</SelectItem>
                              <SelectItem value="te">Telugu (తెలుగు)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <Button
                          onClick={handleTranslate}
                          disabled={isTranslating || targetLanguage === 'en'}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          {isTranslating ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Translating...
                            </>
                          ) : (
                            <>
                              <Languages className="mr-2 h-4 w-4" />
                              Translate to {targetLanguage === 'hi' ? 'Hindi' : targetLanguage === 'mr' ? 'Marathi' : targetLanguage === 'ta' ? 'Tamil' : targetLanguage === 'bn' ? 'Bengali' : targetLanguage === 'gu' ? 'Gujarati' : targetLanguage === 'kn' ? 'Kannada' : targetLanguage === 'ml' ? 'Malayalam' : targetLanguage === 'or' ? 'Odia' : targetLanguage === 'pa' ? 'Punjabi' : 'Telugu'}
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  )}

                  {/* Translation Results */}
                  {translationResult && (
                    <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center">
                          <Languages className="mr-2 h-5 w-5 text-blue-400" />
                          Translation ({translationResult.target_language.toUpperCase()})
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 bg-slate-900/50 rounded-lg">
                          <p className="text-gray-300 leading-relaxed">{translationResult.translated_text}</p>
                        </div>
                        <div className="flex justify-between text-xs text-gray-400">
                          <span>Confidence: {(translationResult.confidence_score * 100).toFixed(1)}%</span>
                          <span>Processing time: {translationResult.processing_time.toFixed(2)}s</span>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </div >

          <Footer />

          {/* Limit Reached Modal */}
          <LimitReachedModal
            isOpen={showLimitModal}
            onClose={() => setShowLimitModal(false)}
            type={limitModalType}
          />
        </div >
      </SignedIn >
    </>
  );
};

export default Summarize;
