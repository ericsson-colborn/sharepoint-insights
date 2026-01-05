/**
 * SharePoint file and folder types for the file browser
 * Based on Microsoft Graph API DriveItem resource type
 */

/**
 * Parent reference for a SharePoint item
 */
export interface SharePointParentReference {
  driveId: string;
  id: string;
  path?: string;
}

/**
 * File metadata for a SharePoint file
 */
export interface SharePointFileInfo {
  mimeType: string;
  hashes?: {
    quickXorHash?: string;
    sha1Hash?: string;
  };
}

/**
 * Folder metadata for a SharePoint folder
 */
export interface SharePointFolderInfo {
  childCount: number;
}

/**
 * SharePoint Drive Item (file or folder)
 * Represents a DriveItem from Microsoft Graph API
 */
export interface SharePointDriveItem {
  id: string;
  name: string;
  size?: number;
  webUrl?: string;
  lastModifiedDateTime: string;
  createdDateTime?: string;
  file?: SharePointFileInfo;
  folder?: SharePointFolderInfo;
  parentReference: SharePointParentReference;
}

/**
 * SharePoint Site
 */
export interface SharePointSite {
  id: string;
  displayName: string;
  description?: string;
  webUrl: string;
}

/**
 * SharePoint Drive (Document Library)
 */
export interface SharePointDrive {
  id: string;
  name: string;
  driveType: string;
  webUrl?: string;
}

/**
 * File browser navigation state
 */
export interface FileBrowserState {
  selectedSiteId: string | null;
  selectedDriveId: string | null;
  currentFolderId: string;
  breadcrumbs: BreadcrumbItem[];
}

/**
 * Breadcrumb navigation item
 */
export interface BreadcrumbItem {
  id: string;
  name: string;
}

/**
 * Check if a DriveItem is a media file (video, audio, or image)
 */
export function isMediaFile(file: SharePointDriveItem | null | undefined): boolean {
  const mimeType = file?.file?.mimeType || '';
  return (
    mimeType.startsWith('video/') ||
    mimeType.startsWith('audio/') ||
    mimeType.startsWith('image/')
  );
}

/**
 * Check if a DriveItem is a video file
 */
export function isVideoFile(file: SharePointDriveItem | null | undefined): boolean {
  const mimeType = file?.file?.mimeType || '';
  return mimeType.startsWith('video/');
}

/**
 * Check if a DriveItem is an audio file
 */
export function isAudioFile(file: SharePointDriveItem | null | undefined): boolean {
  const mimeType = file?.file?.mimeType || '';
  return mimeType.startsWith('audio/');
}

/**
 * Check if a DriveItem is a folder
 */
export function isFolder(item: SharePointDriveItem): boolean {
  return !!item.folder;
}
