/**
 * Extract white-on-black art → transparent pixel sprite (nearest-neighbor).
 */
export function makePixelTexture(scene, sourceKey, destKey, targetPixelWidth, threshold = 140) {
  const src = scene.textures.get(sourceKey).getSourceImage();
  const sw = src.width;
  const sh = src.height;

  const read = document.createElement('canvas');
  read.width = sw;
  read.height = sh;
  const readCtx = read.getContext('2d', { willReadFrequently: true });
  readCtx.drawImage(src, 0, 0);

  const source = readCtx.getImageData(0, 0, sw, sh);
  const { data } = source;
  let minX = sw;
  let minY = sh;
  let maxX = 0;
  let maxY = 0;

  for (let y = 0; y < sh; y += 1) {
    for (let x = 0; x < sw; x += 1) {
      const i = (y * sw + x) * 4;
      const lum = (data[i] + data[i + 1] + data[i + 2]) / 3;
      if (lum >= threshold) {
        data[i] = 255;
        data[i + 1] = 255;
        data[i + 2] = 255;
        data[i + 3] = 255;
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      } else {
        data[i + 3] = 0;
      }
    }
  }

  if (maxX < minX || maxY < minY) {
    throw new Error(`No shape found in texture: ${sourceKey}`);
  }

  readCtx.putImageData(source, 0, 0);

  const cropW = maxX - minX + 1;
  const cropH = maxY - minY + 1;
  const crop = document.createElement('canvas');
  crop.width = cropW;
  crop.height = cropH;
  const cropCtx = crop.getContext('2d');
  cropCtx.drawImage(read, minX, minY, cropW, cropH, 0, 0, cropW, cropH);

  const targetPixelHeight = Math.max(1, Math.round(cropH * (targetPixelWidth / cropW)));
  const out = document.createElement('canvas');
  out.width = targetPixelWidth;
  out.height = targetPixelHeight;
  const outCtx = out.getContext('2d');
  outCtx.imageSmoothingEnabled = false;
  outCtx.drawImage(crop, 0, 0, cropW, cropH, 0, 0, targetPixelWidth, targetPixelHeight);

  if (scene.textures.exists(destKey)) {
    scene.textures.remove(destKey);
  }
  scene.textures.addCanvas(destKey, out);

  const texture = scene.textures.get(destKey);
  if (texture?.setFilter) {
    texture.setFilter(1);
  }

  return {
    key: destKey,
    pixelWidth: targetPixelWidth,
    pixelHeight: targetPixelHeight,
  };
}
