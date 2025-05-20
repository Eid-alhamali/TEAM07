const sharp = require('sharp');
const {Storage} = require('@google-cloud/storage');
const storage = new Storage();

/**
 * Cloud Function to process images uploaded to Cloud Storage
 * Triggers when a file is uploaded to the specified bucket
 * Creates three versions: thumbnail, medium, and large
 */
exports.processImage = async (event, context) => {
    try {
        const bucket = storage.bucket(event.bucket);
        const file = bucket.file(event.name);
        
        // Skip if the image is already in a processed folder
        if (event.name.startsWith('processed/')) {
            console.log('Skipping already processed image');
            return;
        }

        // Download the original file
        const [buffer] = await file.download();
        
        // Process images in different sizes
        const sizes = {
            thumbnail: { width: 150, height: 150 },
            medium: { width: 500, height: 500 },
            large: { width: 1024, height: 1024 }
        };

        for (const [size, dimensions] of Object.entries(sizes)) {
            const processedImage = await sharp(buffer)
                .resize(dimensions.width, dimensions.height, {
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .jpeg({ quality: 80 })
                .toBuffer();

            // Upload processed image
            const processedFile = bucket.file(`processed/${size}/${event.name}`);
            await processedFile.save(processedImage, {
                metadata: {
                    contentType: 'image/jpeg',
                    metadata: {
                        originalName: event.name,
                        processedAt: new Date().toISOString()
                    }
                }
            });
        }

        console.log(`Successfully processed ${event.name}`);
        
    } catch (error) {
        console.error(`Error processing ${event.name}:`, error);
        throw error;
    }
}; 