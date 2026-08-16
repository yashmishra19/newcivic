// ============================================================================
// CLOUDINARY MEDIA UPLOAD SERVICE
// Adapted from C:\Users\SHREE\Desktop\krrish\src\apiService.js
// ============================================================================

export function isCloudinaryConfigured(): boolean {
  const cloudName = (import.meta as any).env?.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = (import.meta as any).env?.VITE_CLOUDINARY_UPLOAD_PRESET;
  return !!(
    cloudName &&
    cloudName !== 'your_cloud_name_here' &&
    uploadPreset &&
    uploadPreset !== 'your_preset_here' &&
    cloudName.trim().length > 2
  );
}

export async function uploadImageToCloudinary(file: File | Blob): Promise<string> {
  // If not configured, provide an instant local Object URL or simulated CDN delay
  if (!isCloudinaryConfigured()) {
    console.info('[Cloudinary Service] Cloudinary credentials not configured or in Demo Mode. Using local object URL.');
    await new Promise((r) => setTimeout(r, 600));
    if (file instanceof File || file instanceof Blob) {
      return URL.createObjectURL(file);
    }
    return 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80';
  }

  const cloudName = (import.meta as any).env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = (import.meta as any).env.VITE_CLOUDINARY_UPLOAD_PRESET;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errorDetail = await res.json().catch(() => ({}));
    console.error('[Cloudinary Service] Upload error response:', errorDetail);
    throw new Error('Cloudinary upload failed. Check cloud name and upload preset.');
  }

  const data = await res.json();
  return data.secure_url;
}
