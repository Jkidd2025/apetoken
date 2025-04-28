import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';

async function validateTokenImage(imagePath: string) {
    try {
        const stats = fs.statSync(imagePath);
        const fileSizeInMB = stats.size / (1024 * 1024);
        
        const image = sharp(imagePath);
        const metadata = await image.metadata();
        
        console.log('Image Validation Results:');
        console.log('------------------------');
        
        // Check dimensions
        console.log('Dimensions:', `${metadata.width}x${metadata.height}`);
        if (metadata.width !== 1000 || metadata.height !== 1000) {
            console.warn('⚠️  Warning: Image dimensions should be 1000x1000 pixels');
        } else {
            console.log('✅ Dimensions are correct (1000x1000)');
        }
        
        // Check format
        console.log('\nFormat:', metadata.format);
        if (metadata.format !== 'png') {
            console.warn('⚠️  Warning: PNG format is recommended');
        } else {
            console.log('✅ Format is correct (PNG)');
        }
        
        // Check file size
        console.log('\nFile size:', fileSizeInMB.toFixed(2) + 'MB');
        if (fileSizeInMB > 5) {
            console.warn('⚠️  Warning: File size should be less than 5MB');
        } else {
            console.log('✅ File size is within recommended limit (<5MB)');
        }
        
        // Check aspect ratio
        const aspectRatio = metadata.width! / metadata.height!;
        console.log('\nAspect ratio:', aspectRatio);
        if (aspectRatio !== 1) {
            console.warn('⚠️  Warning: Aspect ratio should be 1:1');
        } else {
            console.log('✅ Aspect ratio is correct (1:1)');
        }
        
    } catch (error) {
        console.error('Error validating image:', error);
    }
}

// Validate the token image
const imagePath = path.join(__dirname, '..', 'assets', 'token.png');
validateTokenImage(imagePath); 