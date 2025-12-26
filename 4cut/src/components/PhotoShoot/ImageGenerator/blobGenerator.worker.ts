import { encode } from 'modern-gif';
import type { ImgPlaceData } from '../../../types/types';

// 워커에서 수신할 메시지 타입 정의
interface GeneratorMessage {
    type: 'GENERATE_GIF' | 'GENERATE_STATIC';
    frameBitmap: ImageBitmap;
    slotBitmaps: (ImageBitmap | null)[];
    gifFrames: { bitmaps: ImageBitmap[] }[]; // 디코딩된 GIF 프레임들
    imgPlaceData: ImgPlaceData[]; 
    scale?: number;
}

self.onmessage = async (e: MessageEvent<GeneratorMessage>) => {
    const { type, frameBitmap, slotBitmaps, gifFrames, imgPlaceData } = e.data;

    try {
        if (type === 'GENERATE_GIF') {
            const blob = await generateGif(frameBitmap, slotBitmaps, gifFrames, imgPlaceData);
            self.postMessage({ success: true, blob });
        } else if (type === 'GENERATE_STATIC') {
            const blob = await generateStatic(frameBitmap, slotBitmaps, imgPlaceData);
            self.postMessage({ success: true, blob });
        }
    } catch (error) {
        console.error("Worker Error:", error);
        self.postMessage({ success: false, error });
    }
};

async function generateGif(
    frameBitmap: ImageBitmap,
    slotBitmaps: (ImageBitmap | null)[],
    gifFrames: { bitmaps: ImageBitmap[] }[],
    imgPlaceData: ImgPlaceData[]
): Promise<Blob | null> {
    
    // 1. 캔버스 설정 (OffscreenCanvas)
    const MAX_WIDTH = 720; // 최적화: 1000px -> 720px (HD급 유지하되 용량 대폭 감소)
    let scale = 1;
    if (frameBitmap.width > MAX_WIDTH) {
        scale = MAX_WIDTH / frameBitmap.width;
    }
    const canvasWidth = Math.floor(frameBitmap.width * scale);
    const canvasHeight = Math.floor(frameBitmap.height * scale);

    const offCanvas = new OffscreenCanvas(canvasWidth, canvasHeight);
    const ctx = offCanvas.getContext('2d', { willReadFrequently: true });

    if (!ctx) throw new Error("Failed to get OffscreenCanvas context");

    // 2. 총 프레임 수 계산 및 최적화 (프레임 스키핑)
    const maxDurationFrames = Math.max(
        ...gifFrames.map(d => d && d.bitmaps ? d.bitmaps.length : 0),
        10 // 최소 프레임
    );

    // 최적화: 출력 GIF의 최대 프레임 수를 제한하여 용량과 생성 속도 개선
    const MAX_OUTPUT_FRAMES = 25; 
    const step = Math.ceil(maxDurationFrames / MAX_OUTPUT_FRAMES);

    const composedFrames: ImageData[] = [];

    // 3. 프레임별 그리기 (드로잉 로직) - step만큼 건너뛰며 샘플링
    for (let i = 0; i < maxDurationFrames; i += step) {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        imgPlaceData.forEach((slot, idx) => {
            const gifData = gifFrames[idx];
            const staticImg = slotBitmaps[idx];
            let source: ImageBitmap | null = null;

            // GIF 프레임이 있으면 그거 쓰고, 없으면 정적 이미지 사용
            if (gifData && gifData.bitmaps && gifData.bitmaps.length > 0) {
                source = gifData.bitmaps[i % gifData.bitmaps.length];
            } else if (staticImg) {
                source = staticImg;
            }

            if (source) {
                ctx.save();
                const scaledLeft = slot.left * scale;
                const scaledTop = slot.top * scale;
                const scaledWidth = slot.width * scale;
                const scaledHeight = slot.height * scale;
                const cx = scaledLeft + scaledWidth / 2;
                const cy = scaledTop + scaledHeight / 2;

                ctx.translate(cx, cy);
                ctx.rotate((slot.angle * Math.PI) / 180);
                ctx.translate(-cx, -cy);
                ctx.drawImage(source, scaledLeft, scaledTop, scaledWidth, scaledHeight);
                ctx.restore();
            }
        });

        // 프레임(배경) 그리기
        ctx.drawImage(frameBitmap, 0, 0, canvasWidth, canvasHeight);
        
        // 픽셀 데이터 추출
        composedFrames.push(ctx.getImageData(0, 0, canvasWidth, canvasHeight));
    }

    // 4. 인코딩
    return await encode({
        width: canvasWidth,
        height: canvasHeight,
        frames: composedFrames.map(frame => ({
            data: frame.data,
            width: frame.width,
            height: frame.height,
            delay: 100
        })),
        format: 'blob',
    });
}

async function generateStatic(
    frameBitmap: ImageBitmap,
    slotBitmaps: (ImageBitmap | null)[],
    imgPlaceData: ImgPlaceData[]
): Promise<Blob | null> {
    
    // 정적 이미지는 원본 해상도 유지 (고화질 인쇄용)
    const canvasWidth = frameBitmap.width;
    const canvasHeight = frameBitmap.height;

    const offCanvas = new OffscreenCanvas(canvasWidth, canvasHeight);
    const ctx = offCanvas.getContext('2d');
    if (!ctx) throw new Error("Failed to get OffscreenCanvas context");

    // 1. 슬롯 이미지 그리기
    imgPlaceData.forEach((data, index) => {
        const img = slotBitmaps[index];
        if (img) {
            ctx.drawImage(img, data.left, data.top, data.width, data.height);
        }
    });

    // 2. 프레임 그리기
    ctx.drawImage(frameBitmap, 0, 0);

    // 3. Blob 변환
    return await offCanvas.convertToBlob({ type: 'image/jpeg', quality: 0.95 });
}