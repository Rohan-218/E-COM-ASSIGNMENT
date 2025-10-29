export const STATUS = Object.freeze({
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
});

export const MESSAGE_TYPES = Object.freeze({
  EMAIL: 'EMAIL',
});

export const IMAGE_MIMES = [
  'image/jpeg',
  'image/pjpeg',
  'image/png',
  'image/bmp',
  'image/tiff',
  'image/webp',
  'image/avif',
  'image/jpg',
];

export const VIDEO_MIMES = [
  'video/mp4',
  'video/ogg',
  'video/webm',
  'video/x-msvideo',
  'video/quicktime',
  'video/x-flv',
  'video/x-ms-wmv',
  'application/x-mpegURL',
  'video/MP2T',
];

export const IMAGE_VIDEO_MIMES = [...IMAGE_MIMES, ...VIDEO_MIMES];

export const FILE_MIMES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ...IMAGE_MIMES,
  'text/plain',
  'text/csv',
  ...VIDEO_MIMES,
];

export const MAPPED_ROLE = Object.freeze({
  USER: 1
});

export const MAX_FILE_SIZE = 4 * 1024 * 1024;
export const MAX_NUM_FILES = 7;
