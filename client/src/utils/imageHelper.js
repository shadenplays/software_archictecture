// client/src/utils/imageHelper.js

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

/**
 * Get the correct image URL for any product image
 * Supports:
 * - /uploads/ (admin uploaded images)
 * - /images/ (default images)
 * - http:// (full URLs)
 * - Just filename (fallback)
 */
export function getImageUrl(image) {
  // If no image, return default
  if (!image) return "/images/default.png";
  
  // If it's already a full URL (http:// or https://)
  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }
  
  // If it's an uploaded image from admin (/uploads/...)
  if (image.startsWith("/uploads/")) {
    return `${API_URL}${image}`;
  }
  
  // If it's already a complete path starting with /images/
  if (image.startsWith("/images/")) {
    return image;
  }
  
  // If it's just a filename like "milo.jpg", add /images/ prefix
  if (!image.startsWith("/")) {
    return `/images/${image}`;
  }
  
  // Default fallback
  return "/images/default.png";
}

/**
 * Get thumbnail image URL (smaller version, useful for cart/orders)
 */
export function getThumbnailUrl(image) {
  return getImageUrl(image);
}

/**
 * Check if image is from admin upload
 */
export function isUploadedImage(image) {
  return image && image.startsWith("/uploads/");
}