import { S3Client } from "@aws-sdk/client-s3";

export const toS3PublicUrl = (filename: string) => {
  return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${filename}`;
};

export const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION,
});
