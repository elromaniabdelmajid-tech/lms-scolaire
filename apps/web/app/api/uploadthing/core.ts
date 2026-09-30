import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { auth } from '@clerk/nextjs/server';

const f = createUploadthing();

export const ourFileRouter = {
  // Upload de PDF
  pdfUploader: f({ pdf: { maxFileSize: "16MB", maxFileCount: 5 } })
    .middleware(async ({ req }) => {
      const { userId } = await auth();
      if (!userId) throw new UploadThingError("Non authentifié");
      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload PDF terminé:", file.ufsUrl);
      return { url: file.ufsUrl, name: file.name };
    }),

  // Upload de vidéo
  videoUploader: f({ video: { maxFileSize: "256MB", maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      const { userId } = await auth();
      if (!userId) throw new UploadThingError("Non authentifié");
      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload vidéo terminé:", file.ufsUrl);
      return { url: file.ufsUrl, name: file.name };
    }),

  // Upload d'image
  imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      const { userId } = await auth();
      if (!userId) throw new UploadThingError("Non authentifié");
      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload image terminé:", file.ufsUrl);
      return { url: file.ufsUrl, name: file.name };
    }),

  // Upload de document
  documentUploader: f({ 
    pdf: { maxFileSize: "16MB", maxFileCount: 3 },
    "application/msword": { maxFileSize: "16MB", maxFileCount: 3 },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": { maxFileSize: "16MB", maxFileCount: 3 }
  })
    .middleware(async ({ req }) => {
      const { userId } = await auth();
      if (!userId) throw new UploadThingError("Non authentifié");
      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload document terminé:", file.ufsUrl);
      return { url: file.ufsUrl, name: file.name };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;