import * as dotenv from "dotenv";
import * as Minio from "minio";

dotenv.config({ path: ".env", override: true });
const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT,
  port: parseInt(process.env.MINIO_PORT),
  useSSL: process.env.MINIO_USE_SSL === "true",
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
});
const expiry = 60 * 60; // 1 hour (in seconds)

const getMimeType = (filePath: string): string => {
  const extension = filePath.split(".").pop()?.toLowerCase();

  switch (extension) {
    case "pdf":
      return "application/pdf";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "gif":
      return "image/gif";
    default:
      return "application/octet-stream";
  }
};

export const getPresignUrl = async (bucketName: string, filePath: string) => {
  const headers = {
    "response-content-type": getMimeType(filePath),
    "response-content-disposition": "inline",
  };

  // Generate the presigned URL with custom headers
  const url = await minioClient.presignedGetObject(
    bucketName,
    filePath,
    expiry,
    headers
  );

  if (process.env.MINIO_DNS) {
    return url.replace(
      "http://" + process.env.MINIO_ENDPOINT + ":" + process.env.MINIO_PORT,
      process.env.MINIO_DNS
    );
  }
  return url;
};

export async function getObjectSize(
  bucketName: string,
  filePath: string
): Promise<number> {
  try {
    const state = await minioClient.statObject(bucketName, filePath);
    return state.size;
  } catch (e) {
    return 0;
  }
}
export default minioClient;
