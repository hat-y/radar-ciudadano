import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomUUID } from 'crypto';
import { BadRequestException } from '@nestjs/common';
import { Request } from 'express';

export const multerOptions = {
  // Enable file size limits
  limits: {
    fileSize: 1024 * 1024 * 5, // 5MB
  },
  // Check the file type
  fileFilter: (_req: any, file: any, cb: any) => {
    if (file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
      // Allow storage of file
      cb(null, true);
    } else {
      // Reject file
      cb(
        new BadRequestException(
          'Unsupported file type. Only JPG, JPEG, PNG, and GIF are allowed.',
        ),
        false,
      );
    }
  },
  // Storage properties
  storage: diskStorage({
    destination: './uploads', // Destination path for uploaded files
    filename: (_req: Request, file: any, cb: any) => {
      // Generating a random UUID for the filename
      const randomName = randomUUID();
      // Appending extension to random name
      const fileExtension = extname(file.originalname);
      cb(null, `${randomName}${fileExtension}`);
    },
  }),
};
