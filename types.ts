export interface UploadedImage {
  id: string;
  file: File;
  previewUrl: string;
  base64Data: string; // Pure base64 without prefix
  mimeType: string;
}

export enum GenerationStatus {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  GENERATING = 'GENERATING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR',
}

export interface GeneratedVideo {
  url: string;
  filename: string;
}

export interface VideoResult {
  url: string;
  expiry?: number;
}