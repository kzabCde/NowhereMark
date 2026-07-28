/* Nowhere Mark image worker. Kept as deployable JavaScript so it works with
   both Webpack and Turbopack builds. */

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function normalizeCrop(crop) {
  const xPercent = clamp(crop.xPercent, 0, 99);
  const yPercent = clamp(crop.yPercent, 0, 99);
  return {
    xPercent,
    yPercent,
    widthPercent: clamp(crop.widthPercent, 1, 100 - xPercent),
    heightPercent: clamp(crop.heightPercent, 1, 100 - yPercent),
  };
}

function centerCropForAspect(sourceWidth, sourceHeight, aspectWidth, aspectHeight) {
  const sourceRatio = sourceWidth / sourceHeight;
  const targetRatio = aspectWidth / aspectHeight;
  if (sourceRatio > targetRatio) {
    const widthPercent = (targetRatio / sourceRatio) * 100;
    return {
      xPercent: (100 - widthPercent) / 2,
      yPercent: 0,
      widthPercent,
      heightPercent: 100,
    };
  }
  const heightPercent = (sourceRatio / targetRatio) * 100;
  return {
    xPercent: 0,
    yPercent: (100 - heightPercent) / 2,
    widthPercent: 100,
    heightPercent,
  };
}

function calculateResizeDimensions(sourceWidth, sourceHeight, resize) {
  const safeSourceWidth = Math.max(1, Math.round(sourceWidth));
  const safeSourceHeight = Math.max(1, Math.round(sourceHeight));
  const requestedWidth = resize.width && resize.width > 0 ? Math.round(resize.width) : null;
  const requestedHeight = resize.height && resize.height > 0 ? Math.round(resize.height) : null;

  if (!requestedWidth && !requestedHeight) {
    return { width: safeSourceWidth, height: safeSourceHeight };
  }
  if (!resize.keepAspectRatio) {
    return {
      width: requestedWidth || safeSourceWidth,
      height: requestedHeight || safeSourceHeight,
    };
  }
  const ratio = safeSourceWidth / safeSourceHeight;
  if (requestedWidth) {
    return {
      width: requestedWidth,
      height: Math.max(1, Math.round(requestedWidth / ratio)),
    };
  }
  return {
    width: Math.max(1, Math.round((requestedHeight || safeSourceHeight) * ratio)),
    height: requestedHeight || safeSourceHeight,
  };
}

function trackedTextMetrics(context, text, letterSpacing) {
  const characters = Array.from(text);
  const widths = characters.map((character) => context.measureText(character).width);
  const width = widths.reduce((total, characterWidth) => total + characterWidth, 0)
    + Math.max(0, characters.length - 1) * letterSpacing;
  return { characters, widths, width };
}

function drawTrackedText(context, metrics, letterSpacing, settings) {
  let cursor = -metrics.width / 2;
  metrics.characters.forEach((character, index) => {
    const characterCenter = cursor + metrics.widths[index] / 2;
    if (settings.stroke) {
      context.strokeStyle = settings.textStrokeColor;
      context.lineWidth = settings.strokeWidth;
      context.strokeText(character, characterCenter, 0);
    }
    context.fillText(character, characterCenter, 0);
    cursor += metrics.widths[index] + letterSpacing;
  });
}

function configureWatermarkContext(context, settings) {
  context.globalAlpha = settings.opacity;
  context.globalCompositeOperation = settings.blendMode;
  context.filter = [
    `grayscale(${settings.grayscale}%)`,
    `brightness(${settings.brightness}%)`,
    `contrast(${settings.contrast}%)`,
    `invert(${settings.invert}%)`,
    `blur(${settings.blur}px)`,
  ].join(' ');
  if (settings.shadow) {
    context.shadowColor = settings.shadowColor;
    context.shadowBlur = settings.shadowBlur;
    context.shadowOffsetX = settings.shadowOffsetX;
    context.shadowOffsetY = settings.shadowOffsetY;
  }
}

function drawWatermark(context, canvasWidth, canvasHeight, settings, watermark) {
  const watermarkWidth = (settings.widthPercent / 100) * canvasWidth;
  const watermarkHeight = watermark
    ? watermarkWidth * (watermark.height / watermark.width)
    : Math.max(18, (settings.fontSize / 1000) * canvasWidth * 1.5);
  const fontSize = Math.max(12, (settings.fontSize / 1000) * canvasWidth);
  context.font = `${settings.textItalic ? 'italic ' : ''}${settings.textBold ? '700 ' : '400 '}${fontSize}px Arial, sans-serif`;
  const textMetrics = trackedTextMetrics(context, settings.text, settings.letterSpacing);
  const contentWidth = settings.mode === 'text'
    ? textMetrics.width
    : Math.max(watermarkWidth, textMetrics.width);
  const contentHeight = settings.mode === 'hybrid'
    ? watermarkHeight + fontSize * 1.5
    : Math.max(watermarkHeight, fontSize * 1.5);
  const requestedX = (settings.xPercent / 100) * canvasWidth;
  const requestedY = (settings.yPercent / 100) * canvasHeight;
  const halfWidth = Math.min(canvasWidth / 2, contentWidth / 2);
  const halfHeight = Math.min(canvasHeight / 2, contentHeight / 2);
  const x = clamp(requestedX, halfWidth, canvasWidth - halfWidth);
  const y = clamp(requestedY, halfHeight, canvasHeight - halfHeight);

  context.save();
  configureWatermarkContext(context, settings);

  const drawAt = (drawX, drawY) => {
    context.save();
    context.translate(drawX, drawY);
    context.rotate((settings.rotation * Math.PI) / 180);
    context.scale(settings.flipX ? -1 : 1, settings.flipY ? -1 : 1);

    const hasImage = (settings.mode === 'image' || settings.mode === 'hybrid') && watermark;
    const hasText = settings.mode === 'text' || settings.mode === 'hybrid';
    const imageOffsetY = settings.mode === 'hybrid' ? -fontSize * 0.4 : 0;

    if (hasImage) {
      context.drawImage(
        watermark,
        -watermarkWidth / 2,
        -watermarkHeight / 2 + imageOffsetY,
        watermarkWidth,
        watermarkHeight,
      );
      if (settings.stroke) {
        context.strokeStyle = settings.strokeColor;
        context.lineWidth = settings.strokeWidth;
        context.strokeRect(
          -watermarkWidth / 2,
          -watermarkHeight / 2 + imageOffsetY,
          watermarkWidth,
          watermarkHeight,
        );
      }
    }

    if (hasText) {
      context.font = `${settings.textItalic ? 'italic ' : ''}${settings.textBold ? '700 ' : '400 '}${fontSize}px Arial, sans-serif`;
      context.fillStyle = settings.textColor;
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      const textOffsetY = settings.mode === 'hybrid'
        ? watermarkHeight / 2 + fontSize * 0.45
        : 0;
      context.save();
      context.translate(0, textOffsetY);
      drawTrackedText(context, textMetrics, settings.letterSpacing, settings);
      context.restore();
    }
    context.restore();
  };

  if (settings.repeat) {
    const stepX = Math.max(100, contentWidth * 1.35);
    const stepY = Math.max(80, contentHeight * 1.45);
    for (let tileY = -stepY; tileY < canvasHeight + stepY; tileY += stepY) {
      for (let tileX = -stepX; tileX < canvasWidth + stepX; tileX += stepX) {
        drawAt(tileX, tileY);
      }
    }
  } else {
    drawAt(x, y);
  }
  context.restore();
}

async function renderImage(request) {
  const source = await createImageBitmap(request.sourceBlob);
  const watermark = request.watermarkBlob
    ? await createImageBitmap(request.watermarkBlob)
    : null;
  const configuredCrop = request.settings.transform.crop;
  const crop = configuredCrop.aspectRatio
    ? centerCropForAspect(
      source.width,
      source.height,
      configuredCrop.aspectRatio[0],
      configuredCrop.aspectRatio[1],
    )
    : normalizeCrop(configuredCrop);
  const cropX = Math.round((crop.xPercent / 100) * source.width);
  const cropY = Math.round((crop.yPercent / 100) * source.height);
  const cropWidth = Math.max(1, Math.round((crop.widthPercent / 100) * source.width));
  const cropHeight = Math.max(1, Math.round((crop.heightPercent / 100) * source.height));
  const requestedSize = calculateResizeDimensions(
    cropWidth,
    cropHeight,
    request.settings.transform.resize,
  );
  const swapsDimensions = request.settings.transform.rotation === 90
    || request.settings.transform.rotation === 270;
  const rawOutputWidth = swapsDimensions ? requestedSize.height : requestedSize.width;
  const rawOutputHeight = swapsDimensions ? requestedSize.width : requestedSize.height;
  const previewScale = request.previewMaxDimension
    ? Math.min(1, request.previewMaxDimension / Math.max(rawOutputWidth, rawOutputHeight))
    : 1;
  const drawWidth = Math.max(1, Math.round(requestedSize.width * previewScale));
  const drawHeight = Math.max(1, Math.round(requestedSize.height * previewScale));
  const outputWidth = swapsDimensions ? drawHeight : drawWidth;
  const outputHeight = swapsDimensions ? drawWidth : drawHeight;
  const canvas = new OffscreenCanvas(outputWidth, outputHeight);
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas is unavailable');

  if (request.settings.output.mimeType === 'image/jpeg') {
    context.fillStyle = request.settings.output.backgroundColor;
    context.fillRect(0, 0, outputWidth, outputHeight);
  }

  context.save();
  context.translate(outputWidth / 2, outputHeight / 2);
  context.rotate((request.settings.transform.rotation * Math.PI) / 180);
  context.scale(
    request.settings.transform.flipX ? -1 : 1,
    request.settings.transform.flipY ? -1 : 1,
  );
  const adjustments = request.settings.adjustments;
  context.filter = [
    `brightness(${adjustments.brightness}%)`,
    `contrast(${adjustments.contrast}%)`,
    `saturate(${adjustments.saturation}%)`,
    `grayscale(${adjustments.grayscale}%)`,
    `blur(${adjustments.blur}px)`,
  ].join(' ');
  context.drawImage(
    source,
    cropX,
    cropY,
    Math.min(cropWidth, source.width - cropX),
    Math.min(cropHeight, source.height - cropY),
    -drawWidth / 2,
    -drawHeight / 2,
    drawWidth,
    drawHeight,
  );
  context.restore();
  context.filter = 'none';

  if (request.settings.watermarkEnabled) {
    drawWatermark(
      context,
      outputWidth,
      outputHeight,
      request.settings.watermark,
      watermark,
    );
  }

  const blob = await canvas.convertToBlob({
    type: request.settings.output.mimeType,
    quality: request.settings.output.quality,
  });
  source.close();
  if (watermark) watermark.close();
  return {
    id: request.id,
    ok: true,
    blob,
    width: outputWidth,
    height: outputHeight,
  };
}

self.onmessage = async (event) => {
  try {
    self.postMessage(await renderImage(event.data));
  } catch (error) {
    self.postMessage({
      id: event.data.id,
      ok: false,
      error: error instanceof Error ? error.message : 'Image render failed',
    });
  }
};
