import { decodeFrames } from 'modern-gif';

self.onmessage = async (e: MessageEvent) => {
    const { gifBlob, index } = e.data;
    // console.log(`[Worker] Started decoding for slot ${index}`);

    try {
        const buffer = await gifBlob.arrayBuffer();
        const frames = decodeFrames(buffer);

        // 프레임 하나씩 처리하고 즉시 전송 (Real Streaming)
        for (let i = 0; i < frames.length; i++) {
            const frame = frames[i];
            
            // 1. ImageData -> ImageBitmap 생성
            const imageData = new ImageData(frame.data, frame.width, frame.height);
            // [Full Resolution] 원본 화질 유지 (리사이징 제거)
            const bitmap = await createImageBitmap(imageData);

            // 2. 즉시 전송 (ImageBitmap만 전송)
            const message = {
                success: true,
                index,
                frameIndex: i,
                bitmap,
                isPartial: true
            };

            (self as DedicatedWorkerGlobalScope).postMessage(message, [bitmap]);

            // [Throttling] 메인 스레드 과부하 방지 (20ms로 증가하여 안정성 확보)
            await new Promise(resolve => setTimeout(resolve, 10));
        }

        // 3. 모든 전송 완료 알림
        // console.log(`[Worker] Finished decoding for slot ${index}`);
        self.postMessage({ success: true, index, isComplete: true });

    } catch (error) {
        console.error(`[Worker] Error in slot ${index}:`, error);
        self.postMessage({ success: false, index, error });
    }
};
