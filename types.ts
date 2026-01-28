export interface JobSite {
  id: string;
  name: string;
  url: string;
  keywords: string; // Comma separated keywords to look for
  lastChecked: string | null;
  lastResult: string | null;
  status: 'idle' | 'loading' | 'success' | 'error';
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface ScanResult {
  text: string;
  sources: GroundingSource[];
}
