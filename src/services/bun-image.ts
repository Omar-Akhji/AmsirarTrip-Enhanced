import type { ImageTransform, LocalImageService } from "astro";

type ImageFit = "fill" | "contain" | "cover" | "none" | "scale-down" | "outside" | "inside";
type ImageOutputFormat = "jpeg" | "jpg" | "png" | "webp" | "avif" | "gif" | "svg" | "tiff";

interface BaseServiceTransform {
  src: string;
  width?: number;
  height?: number;
  format?: string;
  quality?: string | null;
  fit?: ImageFit;
  position?: string;
  background?: string;
}

interface BunImageServiceConfig {
  kernel?:
    | "nearest"
    | "box"
    | "bilinear"
    | "linear"
    | "cubic"
    | "mitchell"
    | "lanczos2"
    | "lanczos3"
    | "mks2013"
    | "mks2021";
}

const qualityTable: Record<string, number> = { low: 25, mid: 50, high: 80, max: 100 };

function parseQuality(quality: string): string | number {
  const result = Number.parseInt(quality);
  return Number.isNaN(result) ? quality : result;
}

function resolveQuality(quality: BaseServiceTransform["quality"]): number | undefined {
  if (!quality) return undefined;
  const parsed = parseQuality(quality);
  if (typeof parsed === "number") return parsed;
  return Object.hasOwn(qualityTable, quality) ? qualityTable[quality] : undefined;
}

const fitMap: Record<ImageFit, "fill" | "inside"> = {
  fill: "fill",
  contain: "inside",
  cover: "fill",
  none: "inside",
  "scale-down": "inside",
  outside: "fill",
  inside: "inside",
};

function isESMImportedImage(
  source: any,
): source is { src: string; width: number; height: number; format: string } {
  return (
    source
    && typeof source === "object"
    && "src" in source
    && "width" in source
    && "height" in source
  );
}

function isRemoteImage(source: any): source is string {
  return (
    typeof source === "string" && (source.startsWith("http://") || source.startsWith("https://"))
  );
}

function isLocalImage(source: any): source is string {
  return typeof source === "string" && source.startsWith("/");
}

const sortNumeric = (a: number, b: number) => a - b;

function getTargetDimensions(options: ImageTransform) {
  let targetWidth = options.width;
  let targetHeight = options.height;
  if (isESMImportedImage(options.src)) {
    const aspectRatio = options.src.width / options.src.height;
    if (targetHeight && !targetWidth) {
      targetWidth = Math.round(targetHeight * aspectRatio);
    } else if (targetWidth && !targetHeight) {
      targetHeight = Math.round(targetWidth / aspectRatio);
    } else if (!targetWidth && !targetHeight) {
      targetWidth = options.src.width;
      targetHeight = options.src.height;
    }
  }
  return { targetWidth: targetWidth!, targetHeight: targetHeight! };
}

const bunImageService: LocalImageService<BunImageServiceConfig> = {
  propertiesToHash: [
    "src",
    "width",
    "height",
    "format",
    "quality",
    "fit",
    "position",
    "background",
  ],

  validateOptions(options) {
    if (
      !options.src
      || (!isRemoteImage(options.src)
        && !isESMImportedImage(options.src)
        && !isLocalImage(options.src))
    ) {
      throw new Error(`Invalid image source: ${JSON.stringify(options.src)}`);
    }
    if (
      !isESMImportedImage(options.src)
      && !isLocalImage(options.src)
      && !options.width
      && !options.height
    ) {
      throw new Error(`Missing required width/height for remote image: ${options.src}`);
    }
    if (options.width) options.width = Math.round(options.width);
    if (options.height) options.height = Math.round(options.height);
    if (options["layout"]) delete options["layout"];
    if (options.fit === "none") delete options["fit"];
    return options;
  },

  getURL(options, imageConfig) {
    const searchParameters = new URLSearchParams();
    if (isESMImportedImage(options.src)) {
      searchParameters.append("href", options.src.src);
    } else if (isRemoteImage(options.src)) {
      searchParameters.append("href", options.src);
    } else {
      return options.src;
    }
    const parameters: Record<string, keyof typeof options> = {
      w: "width",
      h: "height",
      q: "quality",
      f: "format",
      fit: "fit",
      position: "position",
      background: "background",
    };
    for (const [parameter, key] of Object.entries(parameters)) {
      if (Object.hasOwn(options, key)) searchParameters.append(parameter, String(options[key]));
    }
    const imageEndpoint = `${import.meta.env.BASE_URL}${imageConfig.endpoint.route}`;
    return `${imageEndpoint}?${searchParameters}`;
  },

  parseURL(url) {
    const parameters = url.searchParams;
    if (!parameters.has("href")) return;
    return {
      src: parameters.get("href")!,
      width: parameters.has("w") ? Number.parseInt(parameters.get("w")!) : undefined,
      height: parameters.has("h") ? Number.parseInt(parameters.get("h")!) : undefined,
      format: parameters.has("f") ? parameters.get("f") : undefined,
      quality: parameters.get("q"),
      fit: parameters.get("fit") as ImageFit,
      position: parameters.get("position") ?? undefined,
      background: parameters.get("background") ?? undefined,
    };
  },

  getHTMLAttributes(options) {
    const { targetWidth, targetHeight } = getTargetDimensions(options);
    const {
      src: _source,
      width: _width,
      height: _height,
      format: _format,
      quality: _quality,
      densities: _densities,
      widths: _widths,
      formats: _formats,
      layout: _layout,
      priority: _priority,
      fit: _fit,
      position: _position,
      background: _background,
      ...attributes
    } = options as any;
    return {
      ...attributes,
      width: targetWidth,
      height: targetHeight,
      loading: attributes.loading ?? "lazy",
      decoding: attributes.decoding ?? "async",
    };
  },

  getSrcSet(options) {
    const { targetWidth, targetHeight } = getTargetDimensions(options);
    const aspectRatio = targetWidth / targetHeight;
    const { widths, densities } = options;
    const targetFormat = options.format;
    let transformedWidths = (widths ?? []).toSorted(sortNumeric);
    let maxWidth = Infinity;
    if (isESMImportedImage(options.src)) {
      maxWidth = options.src.width;
      if (transformedWidths.length > 0 && transformedWidths.at(-1)! > maxWidth) {
        transformedWidths = transformedWidths.filter((w) => w <= maxWidth);
        transformedWidths.push(maxWidth);
      }
    }
    transformedWidths = [...new Set(transformedWidths)];
    const { width: _w, height: _h, ...transformWithoutDimensions } = options as any;
    let allWidths: { width: number; descriptor: string }[] = [];
    if (densities) {
      const densityValues = densities.map((d: any) => (typeof d === "number" ? d : Number(d)));
      const densityWidths = densityValues
        .toSorted(sortNumeric)
        .map((d: number) => Math.round(targetWidth * d));
      allWidths = densityWidths.map((w, index) => ({
        width: w,
        descriptor: `${densityValues[index]}x`,
      }));
    } else if (transformedWidths.length > 0) {
      allWidths = transformedWidths.map((w) => ({ width: w, descriptor: `${w}w` }));
    }
    return allWidths.map(({ width, descriptor }) => {
      const height = Math.round(width / aspectRatio);
      return {
        transform: { ...transformWithoutDimensions, width, height },
        descriptor,
        attributes: targetFormat ? { type: `image/${targetFormat}` } : {},
      };
    });
  },

  async transform(inputBuffer, transformOptions, config) {
    const transform: BaseServiceTransform = transformOptions as BaseServiceTransform;
    const kernel = config.service.config.kernel ?? "lanczos3";
    const outputFormat = transform.format ?? "webp";
    const quality = resolveQuality(transform.quality);

    const img = new Bun.Image(inputBuffer, { autoOrient: true });

    if (transform.width && transform.height) {
      const fit = transform.fit ? (fitMap[transform.fit] ?? "inside") : "inside";
      img.resize(Math.round(transform.width), Math.round(transform.height), {
        fit,
        withoutEnlargement: true,
        filter: kernel,
      });
    } else if (transform.height && !transform.width) {
      const meta = await img.metadata();
      const aspectRatio = meta.width / meta.height;
      img.resize(Math.round(transform.height * aspectRatio), Math.round(transform.height), {
        withoutEnlargement: true,
        filter: kernel,
      });
    } else if (transform.width) {
      img.resize(Math.round(transform.width), undefined, {
        withoutEnlargement: true,
        filter: kernel,
      });
    }

    let data: Uint8Array;

    switch (outputFormat) {
      case "jpeg":
      case "jpg": {
        data = await img.jpeg({ quality: quality ?? 80 }).bytes();
        break;
      }
      case "png": {
        data = await img.png({ compressionLevel: 6 }).bytes();
        break;
      }
      case "webp": {
        data = await img.webp({ quality: quality ?? 80 }).bytes();
        break;
      }
      case "avif": {
        data = await img.avif({ quality: quality ?? 80 }).bytes();
        break;
      }
      default: {
        data = await img.webp({ quality: quality ?? 80 }).bytes();
        break;
      }
    }

    return { data, format: outputFormat as ImageOutputFormat };
  },
};

export default bunImageService;
