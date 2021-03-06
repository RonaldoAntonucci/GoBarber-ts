import multer from 'multer';
import crypto from 'crypto';
import path from 'path';

const tmpFolder = path.resolve(__dirname, '..', '..', 'tmp');

export default {
  tmpFolder,
  uploadsFolder: path.resolve(tmpFolder, 'uploads'),

  storage: multer.diskStorage({
    destination: tmpFolder,
    filename(_request, file, callback) {
      const fileHash = crypto.randomBytes(10).toString('HEX');
      const fileName = `${fileHash}-${Date.now()}-${file.originalname}`.replace(
        '_',
        '-',
      );

      return callback(null, fileName);
    },
  }),
};
