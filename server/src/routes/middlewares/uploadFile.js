import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import {
  FILE_MIMES, IMAGE_MIMES, IMAGE_VIDEO_MIMES, MAX_FILE_SIZE, MAX_NUM_FILES,
} from '../../utils';

function fileFilterFunction(mimes) {
  return function fileFilter(req, file, cb) {
    if (mimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('error.upload.invalidFileType'));
    }
  };
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}`;
    if (!req.filenames) {
      req.filenames = [];
    }
    req.filenames.push({
      filename: uniqueFilename,
      mimeType: file.mimetype,
      originalName: file.originalname,
    });
    cb(null, uniqueFilename);
  },
});

function uploadMiddlewareFunction(mimes) {
  const upload = multer({
    storage,
    fileFilter: fileFilterFunction(mimes),
    limits: {
      fileSize: MAX_FILE_SIZE,
    },
  });

  const uploadFiles = upload.array('files', MAX_NUM_FILES);

  return function uploadMiddleware(req, res, next) {
    uploadFiles(req, res, (err) => {
      if (err) {
        switch (err.code) {
          case 'LIMIT_UNEXPECTED_FILE':
            res.status(400).send({
              message: 'error.upload.exceededMaxNumberOfFiles',
            });
            break;
          case 'LIMIT_FILE_SIZE':
            res.status(400).send({
              message: 'error.upload.exceededMaxFileSize',
            });
            break;
          case 'LIMIT_FILE_COUNT':
            res.status(400).send({
              message: 'error.upload.exceededMaxNumberOfFilesAllowed',
            });
            break;
          default:
            console.log('[ERROR] FROM MULTER: ', err);
            res.status(400).send({
              message: err.message,
            });
            break;
        }
      } else {
        next();
      }
    });
  };
}

export const uploadImage = uploadMiddlewareFunction(IMAGE_MIMES);
export const uploadImageVideo = uploadMiddlewareFunction(IMAGE_VIDEO_MIMES);
export const uploadFile = uploadMiddlewareFunction(FILE_MIMES);
