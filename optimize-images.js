import sharp from 'sharp';
import { createReadStream, createWriteStream } from 'fs';
import { stat } from 'fs/promises';

async function optimizeImages() {
  const inputFile = './img/drumming_server.png';
  const outputDir = './img/';
  
  console.log('🚀 Starting image optimization...');
  
  try {
    // Get original file info
    const originalStats = await stat(inputFile);
    const originalSize = originalStats.size;
    console.log(`📊 Original file size: ${(originalSize / 1024 / 1024).toFixed(2)} MB`);
    
    // Define the sizes we need to generate
    const sizes = [
      { name: 'drumming_server16x16', width: 16, height: 16, quality: 90 },
      { name: 'drumming_server32x32', width: 32, height: 32, quality: 90 },
      { name: 'drumming_server64x64', width: 64, height: 64, quality: 85 },
      { name: 'drumming_server128x128', width: 128, height: 128, quality: 80 },
      { name: 'drumming_server256x256', width: 256, height: 256, quality: 75 },
      { name: 'drumming_server_optimized', width: 512, height: 512, quality: 70 } // Main optimized version
    ];

    console.log('🔧 Processing images...');
    
    for (const size of sizes) {
      console.log(`  Processing ${size.name} (${size.width}x${size.height})...`);
      
      // Process PNG version with aggressive optimization
      const pngPath = `${outputDir}${size.name}.png`;
      await sharp(inputFile, { animated: false })
        .resize(size.width, size.height, {
          fit: 'cover',
          position: 'center'
        })
        .png({
          compressionLevel: 9, // Maximum compression
          adaptiveFiltering: true,
          progressive: true,
          quality: size.quality
        })
        .toFile(pngPath);
      
      // Get PNG file size
      const pngStats = await stat(pngPath);
      const pngSize = pngStats.size;
      
      // Process WebP version with even better compression
      const webpPath = `${outputDir}${size.name}.webp`;
      await sharp(inputFile, { animated: false })
        .resize(size.width, size.height, {
          fit: 'cover',
          position: 'center'
        })
        .webp({
          quality: size.quality - 10, // WebP can be more aggressive
          effort: 6, // Maximum effort
          method: 6, // Best compression method
          nearLossless: true
        })
        .toFile(webpPath);
      
      // Get WebP file size
      const webpStats = await stat(webpPath);
      const webpSize = webpStats.size;
      
      console.log(`    ✅ PNG: ${(pngSize / 1024).toFixed(1)} KB, WebP: ${(webpSize / 1024).toFixed(1)} KB`);
    }
    
    // Calculate compression results
    const optimizedStats = await stat(`${outputDir}drumming_server_optimized.png`);
    const optimizedSize = optimizedStats.size;
    const compressionRatio = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);
    
    console.log('\n🎉 Optimization complete!');
    console.log(`📈 Original: ${(originalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`📉 Optimized: ${(optimizedSize / 1024).toFixed(1)} KB`);
    console.log(`💾 Space saved: ${compressionRatio}% (${((originalSize - optimizedSize) / 1024 / 1024).toFixed(2)} MB)`);
    
    console.log('\n📋 Generated files:');
    for (const size of sizes) {
      const pngStats = await stat(`${outputDir}${size.name}.png`);
      const webpStats = await stat(`${outputDir}${size.name}.webp`);
      console.log(`  ${size.name}: PNG ${(pngStats.size / 1024).toFixed(1)} KB, WebP ${(webpStats.size / 1024).toFixed(1)} KB`);
    }
    
  } catch (error) {
    console.error('❌ Error optimizing images:', error);
    process.exit(1);
  }
}

// Run the optimization
optimizeImages();