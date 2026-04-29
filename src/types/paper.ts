export interface Author {
  name: string
  id?: string
  affiliation?: string
}

export interface Paper {
  id: string
  title: string
  authors: Author[]
  year: number
  doi?: string
  abstract?: string
  venue?: string
  venueType?: 'journal' | 'conference' | 'preprint' | 'book' | 'unknown'
  citationCount: number
  pdfUrl?: string
  url?: string
  source: string[]
  fieldsOfStudy?: string[]
  tldr?: string
  externalIds?: {
    doi?: string
    arxiv?: string
    pubmed?: string
    openalex?: string
  }
}

export interface SearchResult {
  papers: Paper[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

export interface SearchFilters {
  yearFrom?: number
  yearTo?: number
  venue?: string
  fieldOfStudy?: string
  sortBy: 'relevance' | 'date' | 'citations'
  sortOrder: 'asc' | 'desc'
}

export type ReadingStatus = 'unread' | 'reading' | 'read'

export interface SavedPaper extends Paper {
  tags: string[]
  notes: string
  readingStatus: ReadingStatus
  addedAt: Date
  updatedAt: Date
}

export interface Tag {
  id: string
  name: string
  color: string
  createdAt: Date
}

export interface SearchRecord {
  id?: number
  query: string
  filters?: string
  timestamp: Date
}

export interface Subscription {
  id?: string
  keyword: string
  lastChecked: Date
  createdAt: Date
}
