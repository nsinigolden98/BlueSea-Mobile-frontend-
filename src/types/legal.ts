import type { ReactNode } from 'react';

export type LegalStatus = 'active' | 'under_review' | 'archived' | 'draft';

export type LegalCalloutType = 
  | 'important' 
  | 'warning' 
  | 'security' 
  | 'information' 
  | 'success' 
  | 'tip';

export interface LegalMetadata {
  id: string;
  title: string;
  shortDescription: string;
  version: string;
  lastUpdated: string;
  effectiveDate: string;
  estimatedReadingTime: string;
  applicableRegion: string;
  status: LegalStatus;
  category: 'User Agreements' | 'Privacy & Data' | 'Financial & Services' | 'Compliance';
}

export interface LegalSubSection {
  id: string;
  title: string;
  content: ReactNode;
}

export interface LegalCalloutData {
  type: LegalCalloutType;
  title: string;
  description: ReactNode;
}

export interface LegalSectionData {
  id: string;
  chapterNumber: string;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  body: ReactNode;
  callouts?: LegalCalloutData[];
  illustration?: ReactNode;
  subSections?: LegalSubSection[];
}

export interface LegalNavigationLink {
  title: string;
  path: string;
  description?: string;
}

export interface LegalDocumentConfig {
  metadata: LegalMetadata;
  sections: LegalSectionData[];
  previousDoc?: LegalNavigationLink;
  nextDoc?: LegalNavigationLink;
}