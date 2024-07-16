import multer from 'multer';
import { MulterAzureStorage, MASNameResolver, MASObjectResolver } from 'multer-azure-blob-storage';
import { AZURE_STORAGE_CONNECTION_STRING, AZURE_ACCOUNT_KEY, AZURE_ACCOUNT_NAME, AZURE_STORAGE_CONTAINER_NAME } from './constants';
import { BlobSASPermissions } from "@azure/storage-blob";
// Azure Storage Configuration (Replace placeholders with your credentials)



const resolveBlobName: MASNameResolver = (req: any, file: Express.Multer.File): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
        const blobName: string = Date.now() + '-' + file.originalname;
        resolve(blobName);
    });
};

export type MetadataObj = { [k: string]: string };


const resolveContentSettings: MASObjectResolver = (req: any, file: Express.Multer.File): Promise<MetadataObj> => {
    return new Promise<MetadataObj>((resolve, reject) => {
        const contentSettings: MetadataObj = {
            contentDisposition: "inline", // Force browser to display inline
            cacheControl: "public, max-age=31536000", // Cache for a year
        };

        contentSettings.blobAccess = "r";
        resolve(contentSettings);
    });
};

const azureStorage: MulterAzureStorage = new MulterAzureStorage({
    connectionString: AZURE_STORAGE_CONNECTION_STRING,
    accessKey: AZURE_ACCOUNT_KEY,
    accountName: AZURE_ACCOUNT_NAME,
    containerName: AZURE_STORAGE_CONTAINER_NAME,
    blobName: resolveBlobName,
    contentSettings: resolveContentSettings,
    containerAccessLevel: 'blob',
    urlExpirationTime: 60
});

export const uploader:any = multer({
    storage: azureStorage
});