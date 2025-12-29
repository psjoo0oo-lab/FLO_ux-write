export enum ToneLevel {
  DRY = 1,
  NEUTRAL = 2,
  FRIENDLY = 3,
  EMOTIONAL = 4,
  EXPRESSIVE = 5
}

export enum WritingContext {
  PRODUCT_UI = 'PRODUCT_UI', // 버튼, 토스트, 에러메시지 등
  MARKETING = 'MARKETING', // 배너, 푸시 알림, 프로모션
  CREATIVE = 'CREATIVE', // 감성적인 온보딩, 브랜드 스토리
  BUSINESS = 'BUSINESS', // B2B, 파트너센터, 공지사항
}

export enum WritingMode {
  CREATE = 'CREATE', // 신규 제안
  REFINE = 'REFINE'  // 검토/교정
}

export interface Attachment {
  id: string;
  name: string;
  type: string; // e.g., 'application/pdf'
  data: string; // Base64 string
}

export interface WritingGuide {
  id: string;
  title: string;
  content: string;
  lastUpdated: string;
  category: 'PRINCIPLE' | 'TERM' | 'PATTERN';
}

export interface GuideHistory {
  date: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  description: string;
}

export interface AnalysisResult {
  thinking?: string; // AI 사고 과정
  improvedText: string;
  reasoning: string;
  alternatives: string[];
  score?: number;
  usedModel?: string;
}

export interface CompareResult {
  winner: string; // Changed from fixed enum to string to support "Option N"
  reason: string;
  suggestion: string;
  usedModel?: string;
}

export interface UserFeedback {
  id: string;
  type: 'OPINION' | 'CASE_STUDY';
  content: string;
  date: string;
}