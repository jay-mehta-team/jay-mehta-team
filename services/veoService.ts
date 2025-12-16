import { UploadedImage, GeneratedVideo } from "../types";

export const generateCardVideo = async (
  frontImage: UploadedImage,
  backImage: UploadedImage
): Promise<GeneratedVideo> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    // Use a high-quality square resolution that accommodates most card aspect ratios
    const size = 1080;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d', { alpha: false }); // Opaque for better performance
    
    if (!ctx) {
      reject(new Error("Could not create canvas context"));
      return;
    }

    const frontImg = new Image();
    const backImg = new Image();
    let imagesLoaded = 0;
    
    const onLoad = () => {
      imagesLoaded++;
      if (imagesLoaded === 2) startRecording();
    };

    const onError = () => {
      reject(new Error("Failed to load images for rendering."));
    };

    frontImg.crossOrigin = "anonymous";
    backImg.crossOrigin = "anonymous";
    frontImg.onload = onLoad;
    backImg.onload = onLoad;
    frontImg.onerror = onError;
    backImg.onerror = onError;
    
    frontImg.src = frontImage.previewUrl;
    backImg.src = backImage.previewUrl;

    const startRecording = () => {
      // Prioritize MP4, then WebM
      const mimeTypes = [
        'video/mp4; codecs="avc1.42E01E, mp4a.40.2"', // Standard H.264
        'video/mp4',
        'video/webm; codecs=vp9',
        'video/webm'
      ];

      let selectedMimeType = '';
      for (const type of mimeTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          selectedMimeType = type;
          break;
        }
      }

      if (!selectedMimeType) {
        // Fallback for Safari if standard checks fail but it might still work with basic mp4
        selectedMimeType = 'video/mp4';
      }

      // Check if MediaRecorder is supported at all
      if (typeof MediaRecorder === 'undefined') {
        reject(new Error("Your browser does not support video recording."));
        return;
      }

      let recorder: MediaRecorder;
      try {
        const stream = canvas.captureStream(60); // 60 FPS for smoothness
        // Video bitrate: 8Mbps for high quality
        recorder = new MediaRecorder(stream, { mimeType: selectedMimeType, videoBitsPerSecond: 8000000 });
      } catch (e) {
        // Fallback to default if specific mime fails
        try {
           const stream = canvas.captureStream(60);
           recorder = new MediaRecorder(stream);
           selectedMimeType = 'video/webm'; // Assume default is webm
        } catch(e2) {
           reject(new Error("Failed to initialize video recorder."));
           return;
        }
      }

      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        // Determine extension based on actual mime type used
        const isMp4 = selectedMimeType.includes('mp4');
        const extension = isMp4 ? 'mp4' : 'webm';
        
        const blob = new Blob(chunks, { type: selectedMimeType });
        const url = URL.createObjectURL(blob);
        
        resolve({
          url,
          filename: `safehaven-cardspin.${extension}`
        });
      };

      recorder.start();

      // Animation parameters
      const duration = 4000; // 4 seconds for a full 360 spin
      const fps = 60;
      const totalFrames = (duration / 1000) * fps;
      let frame = 0;

      // Layout calculations
      const padding = 120;
      
      // Base Parameters
      // Adjusted positioning to ensure text is centered on the face and card doesn't clip
      const baseX = size / 2;
      const baseY = size - 170; // Moved down slightly to give card more clearance
      const baseRadiusX = 240;  
      const baseRadiusY = 45;
      const baseHeight = 100;   // Taller base for elegance and text space

      // Card positioning
      // Shift card to hover safely above base
      const verticalShift = -60; 
      
      const availableHeight = size - (padding * 2) - 120; 
      const imgAspect = frontImg.width / frontImg.height;
      
      let drawWidth = availableHeight * imgAspect;
      let drawHeight = availableHeight;

      if (drawWidth > size - padding * 2) {
         drawWidth = size - padding * 2;
         drawHeight = drawWidth / imgAspect;
      }

      const renderFrame = () => {
        if (frame > totalFrames) {
          recorder.stop();
          return;
        }

        // 1. Background
        ctx.fillStyle = '#f8fafc'; // Matches app background
        ctx.fillRect(0, 0, size, size);

        // --- DRAW BASE ---
        
        // Base Shadow (Floor)
        ctx.save();
        ctx.translate(baseX, baseY + baseHeight + 10);
        ctx.scale(1, 0.2);
        ctx.beginPath();
        ctx.arc(0, 0, baseRadiusX + 30, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,0.1)'; // Soft shadow on floor
        ctx.filter = 'blur(15px)';
        ctx.fill();
        ctx.restore();

        // Base Body (Cylinder Side)
        ctx.save();
        const baseGradient = ctx.createLinearGradient(baseX - baseRadiusX, 0, baseX + baseRadiusX, 0);
        // Create a very clean white look with subtle shading only at edges
        baseGradient.addColorStop(0, '#e2e8f0');    // Slate 200 edge
        baseGradient.addColorStop(0.15, '#ffffff'); // Pure White
        baseGradient.addColorStop(0.5, '#ffffff');  // Pure White Center
        baseGradient.addColorStop(0.85, '#ffffff'); // Pure White
        baseGradient.addColorStop(1, '#e2e8f0');    // Slate 200 edge
        ctx.fillStyle = baseGradient;

        ctx.beginPath();
        // The visible face is between the widest points of the top and bottom ellipses
        ctx.moveTo(baseX - baseRadiusX, baseY); 
        ctx.lineTo(baseX + baseRadiusX, baseY);
        ctx.lineTo(baseX + baseRadiusX, baseY + baseHeight);
        // Bottom curve
        ctx.ellipse(baseX, baseY + baseHeight, baseRadiusX, baseRadiusY, 0, 0, Math.PI, false);
        ctx.lineTo(baseX - baseRadiusX, baseY + baseHeight);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // Base Text "safehavenexchange.com"
        ctx.save();
        // Slightly larger, high-quality font settings for professional look
        ctx.font = '600 22px Inter, sans-serif'; 
        ctx.fillStyle = '#0f172a'; // Slate 900 (Very Dark/High Contrast)
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Use a property check or just simple assignment as canvas context allows custom props or modern spacing
        // @ts-ignore
        ctx.letterSpacing = "0.5px";
        
        // Add subtle shadow to text to give it an "imprinted" or professional product feel
        ctx.shadowColor = "rgba(0,0,0,0.1)";
        ctx.shadowBlur = 2;
        ctx.shadowOffsetY = 1;

        // Calculate exact center of the visible front face
        // The front face extends from (baseY + baseRadiusY) down to (baseY + baseHeight + baseRadiusY)
        const textY = baseY + baseRadiusY + (baseHeight / 2);
        
        ctx.fillText('safehavenexchange.com', baseX, textY);
        ctx.restore();

        // Base Top (The platform surface)
        ctx.save();
        ctx.fillStyle = '#ffffff'; // Pure white top
        ctx.beginPath();
        ctx.ellipse(baseX, baseY, baseRadiusX, baseRadiusY, 0, 0, Math.PI * 2);
        ctx.fill();
        // Subtle rim definition
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#f1f5f9';
        ctx.stroke();
        ctx.restore();

        // --- DRAW CARD ---

        // 2. Rotation Physics
        const progress = frame / totalFrames;
        const angle = progress * Math.PI * 2; // 0 to 360 degrees
        
        const cos = Math.cos(angle);
        
        // Determine visible side
        // 0 to 90 (Front shrinking), 90 to 270 (Back), 270 to 360 (Front growing)
        const isBack = angle > Math.PI / 2 && angle < 3 * Math.PI / 2;
        const currentImg = isBack ? backImg : frontImg;
        
        // Scale X based on rotation (foreshortening)
        const currentScale = Math.abs(cos);
        
        // 3. Card Shadow (projected onto the base top)
        // Shadow grows/shrinks slightly with rotation
        const shadowOpacity = 0.15 * Math.max(0.3, currentScale);

        ctx.save();
        // Translate to the base center surface
        ctx.translate(baseX, baseY);
        ctx.scale(currentScale, 0.2); 
        ctx.beginPath();
        ctx.arc(0, 0, drawWidth / 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,0,0,${shadowOpacity})`;
        ctx.filter = 'blur(5px)';
        ctx.fill();
        ctx.restore();

        // 4. Draw Card
        if (currentScale > 0.01) { // Avoid rendering at 0 scale (singularity)
          ctx.save();
          // Position card above base
          ctx.translate(size / 2, size / 2 + verticalShift);
          ctx.scale(currentScale, 1);
          
          // Draw the image
          ctx.drawImage(
            currentImg, 
            -drawWidth / 2, 
            -drawHeight / 2, 
            drawWidth, 
            drawHeight
          );

          // 5. Simulate "Plastic Slab" Glare
          let glarePos = Math.sin(angle * 2); 
          if (isBack) glarePos = -glarePos;

          const gradient = ctx.createLinearGradient(
            -drawWidth/2, -drawHeight/2, 
             drawWidth/2,  drawHeight/2
          );
          
          // Dynamic alpha based on angle
          const reflectionIntensity = 0.25 * (1 - Math.abs(cos)); 
          
          gradient.addColorStop(0, `rgba(255,255,255,0)`);
          gradient.addColorStop(0.4, `rgba(255,255,255,0)`);
          gradient.addColorStop(0.5, `rgba(255,255,255,${reflectionIntensity + 0.1})`);
          gradient.addColorStop(0.6, `rgba(255,255,255,0)`);
          gradient.addColorStop(1, `rgba(255,255,255,0)`);

          ctx.fillStyle = gradient;
          ctx.globalCompositeOperation = 'source-over';
          ctx.fillRect(-drawWidth/2, -drawHeight/2, drawWidth, drawHeight);

          // Subtle Border for definition
          ctx.strokeStyle = 'rgba(0,0,0,0.1)';
          ctx.lineWidth = 1 / currentScale; 
          ctx.strokeRect(-drawWidth/2, -drawHeight/2, drawWidth, drawHeight);

          ctx.restore();
        }

        frame++;
        requestAnimationFrame(renderFrame);
      };

      renderFrame();
    };
  });
};