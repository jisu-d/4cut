import { encode, type UnencodedFrame } from 'modern-gif';

interface WorkerMessage {
    width: number;
    height: number;
    frames: ImageData[];
    delay: number;
}

self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
    const { width, height, frames, delay } = e.data;

    try {
        const unencodedFrames: UnencodedFrame[] = frames.map((frame) => ({
            data: frame.data,
            width: frame.width,
            height: frame.height,
            delay: delay
        }));

        const blob = await encode({
            width,
            height,
            frames: unencodedFrames,
            format: 'blob',
        });

        self.postMessage({ success: true, blob });
    } catch (error) {
        self.postMessage({ success: false, error: error});
    }
};