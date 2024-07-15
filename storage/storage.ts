import { BlobSASPermissions, BlobServiceClient, StorageSharedKeyCredential, generateBlobSASQueryParameters } from '@azure/storage-blob';
import Jimp from 'jimp';

const AZURE_STORAGE_CONNECTION_STRING = 'DefaultEndpointsProtocol=https;AccountName=donorprojectshumaim;AccountKey=/QMA67uDnzG+Dn+a0PTLlSeURWY9W8GXUKF9QCN4goVcn1hHrUcjHdjW7XREFjRKAeHZoPo+vjBq+AStkTFUxQ==;EndpointSuffix=core.windows.net';
const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
const sharedKeyCredential = new StorageSharedKeyCredential("donorprojectshumaim", "/QMA67uDnzG+Dn+a0PTLlSeURWY9W8GXUKF9QCN4goVcn1hHrUcjHdjW7XREFjRKAeHZoPo+vjBq+AStkTFUxQ==");

export async function getOrCreateContainer(containerName:string, isPublic:boolean = false) {
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const exists = await containerClient.exists();
    if (!exists) {
        if (isPublic) {
            await containerClient.create({access:"blob"});
        } else {
            await containerClient.create();
        }
        console.log(`Container "${containerName}" created.`);
    } else {
        console.log(`Container "${containerName}" already exists.`);
    }
    return containerClient;
}

async function blurImage(inputBuffer: Buffer, blurPercentage: number): Promise<Buffer> {
    const image = await Jimp.read(inputBuffer);
    image.blur(blurPercentage);
    return await image.getBufferAsync(Jimp.MIME_JPEG);
}


function extractContainerAndFilename(url: string) {
    const parts = url.split('/');
    const containerName = parts[parts.length - 2];
    const file = parts[parts.length - 1];
    return { containerName, file };
}



export async function getDownloadUrl(img:string, shouldBlur: boolean) {
    const { containerName, file } = extractContainerAndFilename(img)
    const containerClient = await getOrCreateContainer(containerName);
    const blobClient = containerClient.getBlockBlobClient(file);

    // Define the permissions and expiry time for the SAS
    const permissions = BlobSASPermissions.parse("r"); // r for read access
    const startTime = new Date();
    const expiryDate = new Date();
    startTime.setMinutes(expiryDate.getMinutes() - 60); // start time in 1 hour past
    expiryDate.setMinutes(expiryDate.getMinutes() + 60); // Expires in 1 hour

    // Generate SAS token for the blob
    const sasToken = generateBlobSASQueryParameters({
        containerName,
        blobName: file,
        permissions,
        startsOn: startTime, // Start time for the SAS token
        expiresOn: expiryDate // Expiry time for the SAS token
    }, sharedKeyCredential).toString(); // Convert SAS token to string

    // Construct the full URL with SAS token
    const downloadUrl = `${blobClient.url}?${sasToken}`;

    if (shouldBlur) {
        // Download the image content
        const downloadResponse = await blobClient.download();
        const inputBuffer = await streamToBuffer(downloadResponse.readableStreamBody);

        // Apply blurring effect
        const blurredBuffer = await blurImage(inputBuffer, 20);

        // Upload the blurred image to a new blob
        const blurredBlobClient = containerClient.getBlockBlobClient(`${file}_blurred.jpeg`);
        await blurredBlobClient.uploadData(blurredBuffer, {
            blobHTTPHeaders: { blobContentType: 'image/jpeg' }
        });

        // Generate SAS token for the blurred image
        const blurredSasToken = generateBlobSASQueryParameters({
            containerName,
            blobName: `${file}_blurred.jpeg`,
            permissions,
            startsOn: startTime, // Start time for the SAS token
            expiresOn: expiryDate // Expiry time for the SAS token
        }, sharedKeyCredential).toString(); // Convert SAS token to string

        // Construct the full URL with SAS token for the blurred image
        const blurredDownloadUrl = `${blurredBlobClient.url}?${blurredSasToken}`;

        return blurredDownloadUrl;
    }

    return downloadUrl;
}

async function streamToBuffer(stream: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const chunks: any = [];
        stream.on('data', (chunk: any) => chunks.push(chunk));
        stream.on('error', reject);
        stream.on('end', () => resolve(Buffer.concat(chunks)));
    });
}
