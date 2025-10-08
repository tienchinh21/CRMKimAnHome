import { z } from "zod";
import { VALIDATION_MESSAGES } from "@/lib/constants";

/**
 * Validation function for Google Maps URL
 */
export const isValidGoogleMapsUrl = (url: string): boolean => {
  if (!url.trim()) return false;

  const googleMapsPatterns = [
    /^https:\/\/www\.google\.com\/maps\/place\/.+/,
    /^https:\/\/maps\.google\.com\/.+/,
    /^https:\/\/goo\.gl\/maps\/.+/,
    /^https:\/\/maps\.app\.goo\.gl\/.+/,
  ];

  return googleMapsPatterns.some((pattern) => pattern.test(url));
};

/**
 * Validation schema for creating a project
 */
export const createProjectSchema = z.object({
  name: z
    .string()
    .min(1, VALIDATION_MESSAGES.REQUIRED)
    .min(3, VALIDATION_MESSAGES.MIN_LENGTH(3))
    .max(100, VALIDATION_MESSAGES.MAX_LENGTH(100)),
  googleMapsUrl: z
    .string()
    .min(1, VALIDATION_MESSAGES.REQUIRED)
    .refine(
      (url) => isValidGoogleMapsUrl(url),
      "Vui lòng nhập link Google Maps hợp lệ"
    ),
});

export type CreateProjectForm = z.infer<typeof createProjectSchema>;

/**
 * Interface for project response data
 */
export interface ProjectResponseData {
  error: any;
  content: {
    id: string;
    name: string;
    longitude: string | null;
    latitude: string | null;
    fullAddress: string | null;
    createdAt: string;
    updatedAt: string | null;
    createdBy: string | null;
    updatedBy: string | null;
  };
}

/**
 * Type definitions for project creation
 */
export type DetailItem = { name: string; data: string };
export type ParentAmenity = { id?: string; name: string };
export type ChildAmenity = {
  name: string;
  parentName: string;
  parentId?: string;
};
