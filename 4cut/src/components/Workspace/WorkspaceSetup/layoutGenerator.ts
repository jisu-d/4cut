// ----------------------------------------------------------------
// 1. 타입 정의 (Type Definitions)
// ----------------------------------------------------------------

import type { ListCutImage, AspectRatio } from '../../../types/types.ts'

/** 캔버스 크기를 나타내는 타입 */
interface CanvasDimensions {
    width: number;
    height: number;
}

/** 레이아웃 '슬롯'의 상대 위치 및 크기 타입 */
interface RelativeRect {
    x: number; // 0.0 ~ 1.0 (캔버스 너비 대비 x좌표 비율)
    y: number; // 0.0 ~ 1.0 (캔버스 높이 대비 y좌표 비율)
    w: number; // 0.0 ~ 1.0 (캔버스 너비 대비 너비 비율)
    h: number; // 0.0 ~ 1.0 (캔버스 높이 대비 높이 비율)
}

// ----------------------------------------------------------------
// 2. 레이아웃 템플릿 데이터 (Layout Template Data)
// ----------------------------------------------------------------

/**
 * 🖼️ 마스터 템플릿 (Master Templates)
 * 각 캔버스 크기별로 가능한 '모든 슬롯'의 위치 정보를 정의합니다.
 */
const masterLayouts: Record<string, RelativeRect[]> = {
    '3305x4920': [
        // 6개의 모든 슬롯을 정의 (위에서부터 0, 1, 2, 3, 4, 5)
        { x: 0.045, y: 0.044, w: 0.442, h: 0.295 }, // 슬롯 0 (좌상)
        { x: 0.513, y: 0.044, w: 0.442, h: 0.295 }, // 슬롯 1 (우상)
        { x: 0.045, y: 0.350, w: 0.442, h: 0.295 }, // 슬롯 2 (좌중)
        { x: 0.513, y: 0.350, w: 0.442, h: 0.295 }, // 슬롯 3 (우중)
        { x: 0.045, y: 0.656, w: 0.442, h: 0.295 }, // 슬롯 4 (좌하)
        { x: 0.513, y: 0.656, w: 0.442, h: 0.295 }, // 슬롯 5 (우하)
    ],
    '1652x4920': [
        // 4개의 모든 슬롯을 정의
        { x: 0.05, y: 0.03, w: 0.9, h: 0.22 }, // 슬롯 0
        { x: 0.05, y: 0.26, w: 0.9, h: 0.22 }, // 슬롯 1
        { x: 0.05, y: 0.49, w: 0.9, h: 0.22 }, // 슬롯 2
        { x: 0.05, y: 0.72, w: 0.9, h: 0.22 }, // 슬롯 3
    ],
    '4920x1652': [
        // 4개의 모든 슬롯을 정의
        { x: 0.03, y: 0.05, w: 0.22, h: 0.9 }, // 슬롯 0
        { x: 0.26, y: 0.05, w: 0.22, h: 0.9 }, // 슬롯 1
        { x: 0.49, y: 0.05, w: 0.22, h: 0.9 }, // 슬롯 2
        { x: 0.72, y: 0.05, w: 0.22, h: 0.9 }, // 슬롯 3
    ],
};

/**
 * ✨ 채우기 순서 (Fill Orders)
 * 이미지 개수에 따라 어떤 '슬롯'을 채울지 디자인합니다.
 * 값은 masterLayouts의 인덱스 배열입니다.
 */
const fillOrders: Record<string, Record<number, number[]>> = {
    '3305x4920': {
        2: [0, 5],            // 2개: 좌상, 우하
        3: [0, 1, 4],         // 3개: 좌상, 우상, 좌하
        4: [0, 1, 4, 5],      // 4개: 상단 2개, 하단 2개
        5: [0, 1, 2, 4, 5],   // 5개: 우중단 빼고 모두
        6: [0, 1, 2, 3, 4, 5], // 6개: 모든 슬롯
    },
    '1652x4920': {
        2: [0, 2],            // 2개: 1번, 3번 슬롯
        3: [0, 1, 3],         // 3개: 1, 2, 4번 슬롯
        4: [0, 1, 2, 3],      // 4개: 모든 슬롯
    },
    '4920x1652': {
        2: [0, 2],
        3: [0, 1, 3],
        4: [0, 1, 2, 3],
    }
};


// ----------------------------------------------------------------
// 3. 헬퍼 함수 (Helper Functions)
// ----------------------------------------------------------------

/** '3305x4920' 형식의 문자열을 { width, height } 객체로 변환합니다. */
function parseCanvasSize(size: string): CanvasDimensions {
    const [width, height] = size.split('x').map(Number);
    return { width, height };
}

/** '3:4' 형식의 문자열을 숫자 비율(0.75)로 변환합니다. */
function parseAspectRatio(ratio: string): number {
    const [w, h] = ratio.split(':').map(Number);
    // h가 0일 경우 에러 방지
    if (h === 0) return 1;
    return w / h;
}


// ----------------------------------------------------------------
// 4. 메인 함수 (Main Function)
// ----------------------------------------------------------------

/**
 * 주어진 캔버스 크기와 이미지 비율 배열에 맞춰 최적의 레이아웃을 생성합니다.
 * @param canvasSizeStr 캔버스 크기 문자열 (e.g., '3305x4920')
 * @param aspectRatios 이미지 비율 문자열 배열 (e.g., ['3:4', '3:4'])
 * @returns CutLayout 객체 배열
 */
export function generateLayouts(canvasSizeStr: string, aspectRatios: AspectRatio[]):ListCutImage[] {
    const canvasDimensions = parseCanvasSize(canvasSizeStr);
    const numImages = aspectRatios.length;

    // 1. 해당 캔버스 크기의 '마스터 템플릿'을 가져옵니다.
    const masterTemplate = masterLayouts[canvasSizeStr];
    if (!masterTemplate) {
        console.error(`Error: '${canvasSizeStr}'에 대한 마스터 템플릿이 없습니다.`);
        return [];
    }

    // 2. 이미지 개수에 맞는 '채우기 순서'를 가져옵니다.
    const selectedFillOrder = fillOrders[canvasSizeStr]?.[numImages];
    if (!selectedFillOrder) {
        console.error(`Error: '${canvasSizeStr}' 크기에 이미지 ${numImages}개를 위한 채우기 순서가 정의되지 않았습니다.`);
        return [];
    }

    // 3. '채우기 순서'에 따라 입력된 이미지들을 '마스터 슬롯'에 매핑합니다.
    return aspectRatios.map((ratioStr, index) => {
        const slotIndex = selectedFillOrder[index];
        const relativeRect = masterTemplate[slotIndex];

        // 4. 상대 좌표를 실제 픽셀 값으로 변환하여 '영역(bounding box)'을 계산합니다.
        const boxLeft = relativeRect.x * canvasDimensions.width;
        const boxTop = relativeRect.y * canvasDimensions.height;
        const boxWidth = relativeRect.w * canvasDimensions.width;
        const boxHeight = relativeRect.h * canvasDimensions.height;

        // 5. 계산된 '영역' 안에 이미지 비율을 유지하며 이미지 크기를 계산합니다 (Fit-in 로직).
        const imageAspectRatio = parseAspectRatio(ratioStr);
        const boxAspectRatio = boxWidth / boxHeight;

        let finalWidth: number;
        let finalHeight: number;

        if (imageAspectRatio > boxAspectRatio) {
            // 이미지가 영역보다 가로로 넓으면, 너비를 영역에 맞춥니다.
            finalWidth = boxWidth;
            finalHeight = boxWidth / imageAspectRatio;
        } else {
            // 이미지가 영역보다 세로로 높으면, 높이를 영역에 맞춥니다.
            finalHeight = boxHeight;
            finalWidth = boxHeight * imageAspectRatio;
        }

        // 6. 영역 안에서 이미지를 중앙에 배치하기 위한 최종 좌표를 계산합니다.
        const finalLeft = boxLeft + (boxWidth - finalWidth) / 2;
        const finalTop = boxTop + (boxHeight - finalHeight) / 2;

        // 7. 최종 CutLayout 객체를 생성하여 반환합니다.
        return {
            id: `cut${index + 1}`,
            AspectRatio: ratioStr,
            jsonData: {
                left: Math.round(finalLeft),
                top: Math.round(finalTop),
                width: Math.round(finalWidth),
                height: Math.round(finalHeight),
                angle: 0,
                selectable: true,
            },
            checked: false,
        };
    });
}
