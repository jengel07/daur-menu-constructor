/**
 * Утилита сжатия изображений через Canvas.
 * Сжимает фото до нужных размеров ДО конвертации в base64,
 * чтобы не хранить огромные строки в БД.
 */

export interface CompressOptions {
  maxWidth: number;   // Максимальная ширина px
  maxHeight: number;  // Максимальная высота px
  quality: number;    // Качество JPEG от 0 до 1 (0.6 = 60%)
  outputFormat?: 'image/jpeg' | 'image/webp' | 'image/png';
}

/**
 * Сжимает File/Blob изображение через Canvas и возвращает base64 data URL.
 * Прозрачность (PNG) сохраняется при outputFormat: 'image/png'.
 */
export function compressImage(file: File, options: CompressOptions): Promise<string> {
  const {
    maxWidth,
    maxHeight,
    quality,
    outputFormat = 'image/jpeg',
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;

      // Вычисляем новые размеры с сохранением пропорций
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas не поддерживается'));
        return;
      }

      // Для JPEG рисуем белый фон (избегаем чёрного фона при прозрачности)
      if (outputFormat === 'image/jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
      }

      ctx.drawImage(img, 0, 0, width, height);

      const dataUrl = canvas.toDataURL(outputFormat, quality);
      resolve(dataUrl);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Не удалось прочитать изображение'));
    };

    img.src = objectUrl;
  });
}

// ============================================================
// Готовые пресеты для разных типов изображений (оптимизированные)
// ============================================================

/** Фото блюда: 400×300, JPEG 60% — надежно защищает от переполнения localStorage */
export const compressDishImage = (file: File): Promise<string> =>
  compressImage(file, { maxWidth: 400, maxHeight: 300, quality: 0.60 });

/** Обложка ресторана: 900×300, JPEG 75% */
export const compressCoverImage = (file: File): Promise<string> =>
  compressImage(file, { maxWidth: 900, maxHeight: 300, quality: 0.75 });

/** Аватар ресторана: 180×180, JPEG 75% */
export const compressAvatarImage = (file: File): Promise<string> =>
  compressImage(file, { maxWidth: 180, maxHeight: 180, quality: 0.75 });