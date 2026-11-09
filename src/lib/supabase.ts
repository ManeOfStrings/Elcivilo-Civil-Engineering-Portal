/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const env = (import.meta as any).env || {};
const supabaseUrl = env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('your-project-id') &&
  !supabaseAnonKey.includes('your-anon-key')
);

// Fallback dummy client for build-time or when keys are placeholders
export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://placeholder.supabase.co',
  isSupabaseConfigured ? supabaseAnonKey : 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

/**
 * Storage bucket name for academic assets
 */
export const STORAGE_BUCKET = 'academic-vault';

export interface UploadProgressInfo {
  percent: number;
  loadedBytes: number;
  totalBytes: number;
  speedText: string;
}

/**
 * Uploads a file to Supabase Storage with real-time streaming progress tracking
 */
export function uploadAcademicFile(
  file: File,
  folder: string = 'general',
  onProgress?: (progress: UploadProgressInfo) => void
): Promise<{ publicUrl: string; storagePath: string }> {
  if (!isSupabaseConfigured) {
    // Generate an in-memory/blob data URL as fallback
    const mockUrl = URL.createObjectURL(file);
    return Promise.resolve({
      publicUrl: mockUrl,
      storagePath: `${folder}/${Date.now()}_${file.name}`,
    });
  }

  return new Promise((resolve, reject) => {
    const fileExt = file.name.split('.').pop() || 'pdf';
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    supabase.auth.getSession().then(({ data }) => {
      const token = data.session?.access_token;
      const xhr = new XMLHttpRequest();
      const uploadUrl = `${supabaseUrl}/storage/v1/object/${STORAGE_BUCKET}/${filePath}`;
      const startTime = Date.now();

      xhr.open('POST', uploadUrl, true);
      xhr.setRequestHeader('apikey', supabaseAnonKey);
      xhr.setRequestHeader('Authorization', `Bearer ${token || supabaseAnonKey}`);
      xhr.setRequestHeader('x-upsert', 'true');
      xhr.setRequestHeader('cache-control', '3600');
      if (file.type) {
        xhr.setRequestHeader('Content-Type', file.type);
      }

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) {
          const percent = Math.min(99, Math.round((e.loaded / e.total) * 100));
          const elapsedSec = (Date.now() - startTime) / 1000;
          const speedBytesPerSec = elapsedSec > 0 ? e.loaded / elapsedSec : 0;
          const speedText =
            speedBytesPerSec > 1024 * 1024
              ? `${(speedBytesPerSec / (1024 * 1024)).toFixed(1)} MB/s`
              : `${Math.round(speedBytesPerSec / 1024)} KB/s`;

          onProgress({
            percent,
            loadedBytes: e.loaded,
            totalBytes: e.total,
            speedText,
          });
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          onProgress?.({
            percent: 100,
            loadedBytes: file.size,
            totalBytes: file.size,
            speedText: 'Complete',
          });
          const { data: pubData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);
          resolve({
            publicUrl: pubData.publicUrl,
            storagePath: filePath,
          });
        } else {
          try {
            const parsed = JSON.parse(xhr.responseText);
            reject(new Error(parsed.message || parsed.error || `Upload failed (Status ${xhr.status})`));
          } catch {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        }
      };

      xhr.onerror = () => {
        reject(new Error('Network connection error while uploading to Supabase.'));
      };

      xhr.ontimeout = () => {
        reject(new Error('Upload request timed out. Please try a smaller file or faster connection.'));
      };

      xhr.timeout = 180000; // 3 minutes timeout for large files
      xhr.send(file);
    }).catch(reject);
  });
}

/**
 * Deletes a file from Supabase Storage
 */
export async function deleteAcademicFile(storagePath: string): Promise<void> {
  if (!isSupabaseConfigured || !storagePath) return;

  const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([storagePath]);
  if (error) {
    console.warn('Could not delete storage object:', error.message);
  }
}
