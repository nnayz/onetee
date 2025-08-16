export function parseLogoImage(
  file: File
): Promise<{ imageData: ImageData; pngBlob: Blob }> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  return new Promise((resolve, reject) => {
    if (!file || !ctx) {
      reject(new Error("Invalid file or context"));
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = function () {
      if (file.type === "image/svg+xml") {
        img.width = 1000;
        img.height = 1000;
      }

      const MAX_SIZE = 1000;
      const MIN_SIZE = 500;
      let width = img.naturalWidth;
      let height = img.naturalHeight;

      if (width > MAX_SIZE || height > MAX_SIZE || width < MIN_SIZE || height < MIN_SIZE) {
        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          } else if (width < MIN_SIZE) {
            height = Math.round((height * MIN_SIZE) / width);
            width = MIN_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          } else if (height < MIN_SIZE) {
            width = Math.round((width * MIN_SIZE) / height);
            height = MIN_SIZE;
          }
        }
      }

      canvas.width = width;
      canvas.height = height;

      const shapeCanvas = document.createElement("canvas");
      shapeCanvas.width = width;
      shapeCanvas.height = height;
      const shapeCtx = shapeCanvas.getContext("2d")!;
      shapeCtx.drawImage(img, 0, 0, width, height);

      const shapeImageData = shapeCtx.getImageData(0, 0, width, height);
      const data = shapeImageData.data;
      const shapeMask = new Array(width * height).fill(false);
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx4 = (y * width + x) * 4;
          const r = data[idx4];
          const g = data[idx4 + 1];
          const b = data[idx4 + 2];
          const a = data[idx4 + 3];
          shapeMask[y * width + x] = !(
            (r === 255 && g === 255 && b === 255 && a === 255) ||
            a === 0
          );
        }
      }

      function inside(x: number, y: number) {
        if (x < 0 || x >= width || y < 0 || y >= height) return false;
        return shapeMask[y * width + x];
      }

      const boundaryMask = new Array(width * height).fill(false);
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = y * width + x;
          if (!shapeMask[idx]) continue;
          let isBoundary = false;
          for (let ny = y - 1; ny <= y + 1 && !isBoundary; ny++) {
            for (let nx = x - 1; nx <= x + 1 && !isBoundary; nx++) {
              if (!inside(nx, ny)) {
                isBoundary = true;
              }
            }
          }
          if (isBoundary) {
            boundaryMask[idx] = true;
          }
        }
      }

      const interiorMask = new Array(width * height).fill(false);
      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          const idx = y * width + x;
          if (shapeMask[idx] && !boundaryMask[idx]) {
            interiorMask[idx] = true;
          }
        }
      }

      ctx.drawImage(img, 0, 0, width, height);
      const imageData = ctx.getImageData(0, 0, width, height);

      canvas.toBlob((blob) => {
        if (blob) {
          resolve({ imageData, pngBlob: blob });
        } else {
          reject(new Error("Failed to create blob"));
        }
      }, "image/png");
    };

    img.onerror = () => {
      reject(new Error("Failed to load image"));
    };

    img.src = URL.createObjectURL(file);
  });
} 