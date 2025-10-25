import { IUser } from './index';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      tenantId?: string;
      requestTime?: string;
      file?: Multer.File;
      files?: Multer.File[];
    }
  }
}

// Extend Multer types
declare namespace Multer {
  interface File {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    destination?: string;
    filename?: string;
    path?: string;
    buffer: Buffer;
  }
}

export {};