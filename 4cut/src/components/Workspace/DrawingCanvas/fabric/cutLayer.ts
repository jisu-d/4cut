import * as fabric from 'fabric';

export function syncAspectRatioRects(
  canvas: fabric.Canvas,
  cuts: { id: string; AspectRatio: string; checked: boolean; position?: {x:number, y:number}, size?: {width:number, height:number}, angle?: number }[],
  onRectClick?: (id: string) => void,
  onRectTransform?: (id: string, position: {x:number, y:number}, size: {width:number, height:number}, angle: number) => void,
  selectable: boolean = true
) {
  // rect를 id별로 관리
  if (!(canvas as any)._aspectRects) {
    (canvas as any)._aspectRects = new Map();
  }
  const rectMap: Map<string, fabric.Rect> = (canvas as any)._aspectRects;

  // cuts에 없는 rect는 삭제
  for (const [id, rect] of rectMap.entries()) {
    if (!cuts.find(cut => cut.id === id)) {
      canvas.remove(rect);
      rectMap.delete(id);
    }
  }

  cuts.forEach((cut, idx) => {
    let rect: fabric.Rect | undefined = rectMap.get(cut.id);
    let width = cut.size?.width ?? 200, height = cut.size?.height ?? 200;
    switch (cut.AspectRatio) {
      case '4:3': width = width || 200; height = height || 150; break;
      case '3:4': width = width || 150; height = height || 200; break;
      case '1:1': width = width || 200; height = height || 200; break;
      case '16:9': width = width || 240; height = height || 135; break;
    }
    const left = cut.position?.x ?? (50 + idx * 250);
    const top = cut.position?.y ?? ((canvas.height! - height) / 2);
    const angle = cut.angle ?? 0;

    if (!rect) {
      rect = new fabric.Rect({
        left,
        top,
        width,
        height,
        angle,
        fill: 'rgb(255, 255, 255)',
        stroke: cut.checked ? 'red' : 'black',
        strokeWidth: 3,
        selectable: selectable, // 선택 되었을때만 수정가능하게 함.
        evented: selectable,
        scaleX: 1,
        scaleY: 1,
      });
      (rect as any).set('data', { type: 'aspect-ratio', id: cut.id });

      // 컨트롤(핸들) 설정: 엣지(상,하,좌,우) 비활성화, 모서리만 활성화
      if (selectable) {
        rect.setControlsVisibility({
          mt: false, // top middle
          mb: false, // bottom middle
          ml: false, // left middle
          mr: false, // right middle
          mtr: true, // rotate handle
          tl: true,  // top left
          tr: true,  // top right
          bl: true,  // bottom left
          br: true   // bottom right
        });
        
        // 균등 비율 유지를 위한 설정
        rect.lockScalingX = false;
        rect.lockScalingY = false;
        rect.lockScalingFlip = true;
      } else {
        // 선택 불가능할 때는 모든 컨트롤 비활성화
        rect.setControlsVisibility({
          mt: false, mb: false, ml: false, mr: false,
          mtr: false, tl: false, tr: false, bl: false, br: false
        });
      }

      // 클릭 이벤트 등록
      if (onRectClick) {
        rect.on('mousedown', () => onRectClick(cut.id));
      }
      // 이동/크기조절/회전 이벤트 등록
      if (onRectTransform) {
        rect.on('modified', () => {
          if (rect) {
            onRectTransform(
              cut.id,
              {
                x: rect.left ?? 0,
                y: rect.top ?? 0
              },
              {
                width: rect.width! * (rect.scaleX ?? 1),
                height: rect.height! * (rect.scaleY ?? 1)
              },
              rect.angle ?? 0
            );
          }
        });
      }
      canvas.add(rect);
      rectMap.set(cut.id, rect);
    } else {
      // 이미 있는 rect의 속성만 업데이트
      rect.set({
        left,
        top,
        width,
        height,
        angle,
        stroke: cut.checked ? 'red' : 'black',
        selectable: selectable,
        evented: selectable,
      });
      rect.set('scaleX', 1);
      rect.set('scaleY', 1);
      rect.setCoords();
      // 컨트롤(핸들) 설정: 엣지(상,하,좌,우) 비활성화, 모서리만 활성화
      rect.setControlsVisibility({
        mt: false, // top middle
        mb: false, // bottom middle
        ml: false, // left middle
        mr: false, // right middle
      });
    }
  });
  canvas.renderAll();
}

export function drawAllAspectRatioRects(
  canvas: fabric.Canvas,
  cuts: { id: string; AspectRatio: string; checked: boolean; position?: {x:number, y:number}, size?: {width:number, height:number}, angle?: number }[],
  onRectClick?: (id: string) => void,
  onRectTransform?: (id: string, position: {x:number, y:number}, size: {width:number, height:number}, angle: number) => void
) {
  cuts.forEach((cut, idx) => {
    let width = cut.size?.width ?? 200, height = cut.size?.height ?? 200;
    switch (cut.AspectRatio) {
      case '4:3': width = width || 200; height = height || 150; break;
      case '3:4': width = width || 150; height = height || 200; break;
      case '1:1': width = width || 200; height = height || 200; break;
      case '16:9': width = width || 240; height = height || 135; break;
    }
    const left = cut.position?.x ?? (50 + idx * 250);
    const top = cut.position?.y ?? ((canvas.height! - height) / 2);
    const angle = cut.angle ?? 0;

    const rect = new fabric.Rect({
      left,
      top,
      width,
      height,
      angle,
      fill: 'rgba(0,0,0,0.2)',
      stroke: cut.checked ? 'red' : 'black',
      strokeWidth: 3,
      selectable: true,
      evented: true,
      scaleX: 1,
      scaleY: 1,
    });
    (rect as any).set('data', { type: 'aspect-ratio', id: cut.id });

    // 클릭 이벤트 등록
    if (onRectClick && rect) {
      rect.on('mousedown', () => onRectClick(cut.id));
    }

    // 이동/크기조절/회전 이벤트 등록
    if (onRectTransform) {
      rect.on('modified', () => {
        onRectTransform(
          cut.id,
          {
            x: rect.left ?? 0,
            y: rect.top ?? 0
          },
          {
            width: rect.width! * (rect.scaleX ?? 1),
            height: rect.height! * (rect.scaleY ?? 1)
          },
          rect.angle ?? 0
        );
      });
    }

    canvas.add(rect);
  });
  canvas.renderAll();
} 