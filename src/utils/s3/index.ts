import { S3Client } from "@aws-sdk/client-s3";

const REGION = process.env.AWS_S3_REGION;
export const s3Client = new S3Client({
  region: REGION,
});
