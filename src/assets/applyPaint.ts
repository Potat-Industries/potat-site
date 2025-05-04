/* eslint-disable no-confusing-arrow */
/* eslint-disable no-underscore-dangle */

import type {
  ComputedLayerStyle,
  PaintLayerTypeImage,
  PaintLayerTypeLinearGradient,
  PaintLayerTypeRadialGradient,
  PaintLayerTypeSingleColor,
  PaintRawData,
} from '../types/misc';

const computeLinearGradientLayer = (
  layer: PaintLayerTypeLinearGradient,
  opacity: number,
): ComputedLayerStyle => {
  if (layer.stops.length === 0) {
    return undefined;
  }

  const prefix = layer.repeating ? 'repeating-' : '';
  const stops = layer.stops.map((stop) => `${stop.color.hex} ${stop.at * 100}%`).join(', ');
  const gradient = `${prefix}linear-gradient(${layer.angle}deg, ${stops})`;
  return {
    opacity,
    image: gradient,
  };
};

const computeRadialGradientLayer = (
  layer: PaintLayerTypeRadialGradient,
  opacity: number,
): ComputedLayerStyle => {
  if (layer.stops.length === 0) {
    return undefined;
  }

  const prefix = layer.repeating ? 'repeating-' : '';
  const shape = layer.shape === 'CIRCLE' ? 'circle' : 'ellipse';
  const stops = layer.stops.map((stop) => `${stop.color.hex} ${stop.at * 100}%`).join(', ');
  const gradient = `${prefix}radial-gradient(${shape}, ${stops})`;
  return {
    opacity,
    image: gradient,
  };
};

const computeImageLayer = (
  layer: PaintLayerTypeImage,
  opacity: number,
): ComputedLayerStyle => {
  const isAnimated = layer.images.some((img) => img.frameCount > 1);
  const img = layer.images.find(
    (i) => i.scale === 1 && (isAnimated ? i.frameCount > 1 : true),
  );

  if (!img) {
    return undefined;
  }

  return {
    opacity,
    image: `url(${img.url})`,
  };
};

const computeSingleColorLayer = (
  layer: PaintLayerTypeSingleColor,
  opacity: number,
): ComputedLayerStyle => ({
  opacity,
  color: layer.color.hex,
});

const computeDropShadows = (
  shadows: PaintRawData['data']['shadows'],
): string | undefined => {
  if (shadows.length === 0) {
    return undefined;
  }

  return shadows
    .map((s) => `drop-shadow(${s.color.hex} ${s.offsetX}px ${s.offsetY}px ${s.blur}px)`)
    .join(' ');
};

const computePaintStyle = (paint: PaintRawData): string => {
  if (!paint?.data?.layers || paint.data.layers?.length === 0) {
    return '';
  }

  const layers = paint.data.layers.map((layer) => {
    switch (layer.ty.__typename) {
      case 'PaintLayerTypeLinearGradient':
        return computeLinearGradientLayer(layer.ty, layer.opacity);
      case 'PaintLayerTypeRadialGradient':
        return computeRadialGradientLayer(layer.ty, layer.opacity);
      case 'PaintLayerTypeImage':
        return computeImageLayer(layer.ty, layer.opacity);
      case 'PaintLayerTypeSingleColor':
        return computeSingleColorLayer(layer.ty, layer.opacity);
      default:
        return undefined;
    }
  }).filter((l) => l !== undefined);

  const styleParts = [];

  const backgroundImages = layers.flatMap((l) => l.image ? [l.image] : []);
  const backgroundColors = layers.flatMap((l) => l.color ? [l.color] : []);
  const background = [...backgroundColors, ...backgroundImages].join(', ');
  if (background.trim().length > 0) {
    styleParts.push(`background: ${background};`);
  }

  styleParts.push(
    '-webkit-background-clip: text;',
    'background-clip: text;',
    'background-size: cover;',
    'background-position: center;',
    'color: transparent;',
  );

  const filter = computeDropShadows(paint.data.shadows);
  if (filter !== undefined) {
    styleParts.push(`filter: ${filter};`);
  }

  const opacities = layers.map((l) => l.opacity).filter((o) => o < 1);
  if (opacities.length > 0) {
    styleParts.push(`opacity: ${Math.min(...opacities)};`);
  }

  return styleParts.join(' ');
};

export default computePaintStyle;
