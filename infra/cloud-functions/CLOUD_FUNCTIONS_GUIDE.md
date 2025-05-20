# Google Cloud Functions Implementation Guide

This guide explains how to implement and deploy the image processing Cloud Function for the Compresso Coffee Store.

## Overview

The image processing function automatically creates different sizes of product images when they are uploaded to Cloud Storage. This helps in:
- Optimizing images for different display contexts
- Reducing load times
- Saving bandwidth
- Maintaining consistent image quality

## Prerequisites

1. **Google Cloud Project Setup**
   - Active Google Cloud account
   - Project with billing enabled
   - Required APIs enabled:
     - Cloud Functions API
     - Cloud Storage API
     - Cloud Build API

2. **Required Tools**
   ```bash
   # Install Google Cloud SDK
   # Windows: https://cloud.google.com/sdk/docs/install#windows
   # Mac: brew install google-cloud-sdk
   # Linux: https://cloud.google.com/sdk/docs/install#linux

   # Install Node.js (v16 or later)
   # https://nodejs.org/
   ```

## Project Structure
```
image-processor/
├── index.js          # Main function code
└── package.json      # Dependencies and configuration
```

## Implementation Steps

### 1. Initial Setup
```bash
# Create function directory
mkdir -p infra/cloud-functions/image-processor
cd infra/cloud-functions/image-processor

# Initialize npm project
npm init -y

# Install dependencies
npm install @google-cloud/storage sharp
```

### 2. Create Storage Bucket
```bash
# Create a bucket for product images
gsutil mb gs://compresso-product-images

# Set uniform bucket-level access
gsutil uniformbucketlevelaccess set on gs://compresso-product-images
```

### 3. Deploy the Function
```bash
# Deploy to Google Cloud Functions
gcloud functions deploy process-image \
  --runtime nodejs16 \
  --trigger-event google.storage.object.finalize \
  --trigger-resource compresso-product-images \
  --memory 512MB \
  --timeout 120s
```

### 4. Test the Function

1. **Using Google Cloud Console**
   - Go to Cloud Storage
   - Upload an image to the `compresso-product-images` bucket
   - Check the `processed/` folders for resized images

2. **Using Command Line**
   ```bash
   # Upload test image
   gsutil cp test-image.jpg gs://compresso-product-images/

   # Check processed images
   gsutil ls gs://compresso-product-images/processed/
   ```

## Function Details

### Input/Output
- **Trigger**: New file uploaded to Cloud Storage
- **Input**: Image file in any common format
- **Output**: Three processed images in JPEG format:
  - Thumbnail (150x150)
  - Medium (500x500)
  - Large (1024x1024)

### Processing Rules
- Maintains aspect ratio
- Optimizes quality (80% JPEG)
- Prevents upscaling
- Skips already processed images

## Monitoring and Maintenance

### View Logs
```bash
# View recent logs
gcloud functions logs read process-image

# Stream logs
gcloud functions logs tail process-image
```

### Monitor Performance
1. Go to Google Cloud Console
2. Navigate to Cloud Functions
3. Select the function
4. View:
   - Execution times
   - Memory usage
   - Error rates

## Error Handling

Common issues and solutions:

1. **Function Times Out**
   - Increase timeout duration in deployment
   - Check image size limits
   - Monitor memory usage

2. **Storage Permission Errors**
   - Verify IAM roles
   - Check bucket permissions
   - Ensure service account access

3. **Memory Issues**
   - Increase allocated memory
   - Monitor large image processing
   - Check concurrent executions

## Integration with Frontend

To use processed images in the frontend:

1. **Update Image URLs**
   ```javascript
   const getImageUrl = (imageName, size = 'medium') => {
     return `https://storage.googleapis.com/compresso-product-images/processed/${size}/${imageName}`;
   };
   ```

2. **Use Different Sizes**
   ```javascript
   <img src={getImageUrl(product.image, 'thumbnail')} alt="Product thumbnail" />
   <img src={getImageUrl(product.image, 'medium')} alt="Product preview" />
   <img src={getImageUrl(product.image, 'large')} alt="Product full size" />
   ```

## Cleanup

To remove the function and associated resources:

```bash
# Delete the function
gcloud functions delete process-image

# Optionally, delete the storage bucket
gsutil rm -r gs://compresso-product-images
```

## Best Practices

1. **Security**
   - Use appropriate IAM roles
   - Validate file types
   - Set bucket permissions correctly

2. **Performance**
   - Monitor memory usage
   - Set appropriate timeouts
   - Consider concurrent executions

3. **Maintenance**
   - Regular log checking
   - Monitor error rates
   - Keep dependencies updated

4. **Cost Management**
   - Monitor function invocations
   - Check storage usage
   - Set budget alerts 