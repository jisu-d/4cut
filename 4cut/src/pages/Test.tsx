import '../styles/test.css'
import * as fabric from 'fabric';

import { useEffect, useRef, useState } from "react";

const CanvasSection = () => {
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [activeTool, setActiveTool] = useState<"pen" | "select" | "hand">("pen");

  useEffect(() => {
    const canvasContainer = canvasContainerRef.current;
    if (!canvasRef.current || !canvasContainer) return;

    // 캔버스 생성
    const newCanvas = new fabric.Canvas(canvasRef.current, {
      width: canvasContainer.offsetWidth,
      height: canvasContainer.offsetHeight,
    });
    setCanvas(newCanvas);

    // 브러쉬 명시적으로 할당 (fabric v5+)
    if (!newCanvas.freeDrawingBrush) {
      newCanvas.freeDrawingBrush = new fabric.PencilBrush(newCanvas);
    }
    newCanvas.freeDrawingBrush.width = 10;
    newCanvas.isDrawingMode = true;

    // 휠을 이용해서 줌인/줌아웃
    newCanvas.on("mouse:wheel", function (opt: fabric.TEvent<WheelEvent>) {
      const delta = opt.e.deltaY;
      let zoom = newCanvas.getZoom();
      zoom *= 0.999 ** delta;
      if (zoom > 20) zoom = 20;
      if (zoom < 0.01) zoom = 0.01;
      const point = new fabric.Point(opt.e.offsetX, opt.e.offsetY);
      newCanvas.zoomToPoint(point, zoom);
      opt.e.preventDefault();
      opt.e.stopPropagation();
    });

    console.log(newCanvas.getObjects());

    // mouse:up 이벤트에 오브젝트 목록 출력
    newCanvas.on("mouse:up", () => {
      console.log(newCanvas.getObjects());
    });

    // 윈도우가 리사이즈가 되었을 때 실행
    const handleResize = () => {
      if (!canvasContainer) return;
      newCanvas.setDimensions({
        width: canvasContainer.offsetWidth,
        height: canvasContainer.offsetHeight,
      });
    };
    window.addEventListener("resize", handleResize);

    // 언마운트 시 캔버스 정리, 이벤트 제거
    return () => {
      newCanvas.dispose();
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (!canvasContainerRef.current || !canvasRef.current || !canvas) return;

    canvas.off("mouse:down");
    canvas.off("mouse:move");
    canvas.off("mouse:up");


    switch (activeTool) {
      case "select":
        handleSelectTool();
        break;
      case "pen":
        handlePenTool();
        break;
      case "hand":
        handleHandTool();
        break;
    }
  }, [activeTool, canvas]);

  const handleSelectTool = () => {
    if (!canvas) return;
    canvas.isDrawingMode = false;
    canvas.selection = true;
    canvas.defaultCursor = "default";
  };
  const handlePenTool = () => {
    if (!canvas) return;
    if (!canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
    }
    console.log(canvas.getObjects());
    canvas.freeDrawingBrush.width = 10;
    canvas.isDrawingMode = true;
  };
  const handleHandTool = () => {
    if (!canvas) return;
    canvas.isDrawingMode = false;
    canvas.selection = false;
    canvas.defaultCursor = "move";

    let panning = false;
    const handleMouseDown = () => {
      panning = true;
    };
    const handleMouseMove = (event: fabric.TEvent<MouseEvent>) => {
      if (panning && event.e) {
        const delta = new fabric.Point(event.e.movementX, event.e.movementY);
        canvas.relativePan(delta);
      }
    };
    const handleMouseUp = () => {
      panning = false;
    };
    // @ts-ignore
    canvas.on("mouse:down", handleMouseDown);
    // @ts-ignore
    canvas.on("mouse:move", handleMouseMove);
    // @ts-ignore
    canvas.on("mouse:up", handleMouseUp);
  };

  return (
    <div className="canvas-container" ref={canvasContainerRef}>
      <canvas ref={canvasRef} />
      <div className="tool-bar">
        <button
          onClick={() => setActiveTool("select")}
          disabled={activeTool === "select"}
        >
          {/* 선택 아이콘 */}
          <svg width="20" height="20" viewBox="0 0 20 20" fill="black">
            <path d="M10.833 0.891602V7.49993H16.6663C16.6663 4.09993 14.1247 1.29993 10.833 0.891602ZM3.33301 12.4999C3.33301 16.1833 6.31634 19.1666 9.99967 19.1666C13.683 19.1666 16.6663 16.1833 16.6663 12.4999V9.1666H3.33301V12.4999ZM9.16634 0.891602C5.87467 1.29993 3.33301 4.09993 3.33301 7.49993H9.16634V0.891602Z" fill="inherit" />
          </svg>
        </button>
        <button
          onClick={() => setActiveTool("pen")}
          disabled={activeTool === "pen"}
        >
          {/* 펜 아이콘 */}
          <svg width="20" height="20" viewBox="0 0 20 20" fill="black">
            <path d="M2.5 14.3751V17.5001H5.625L14.8417 8.28342L11.7167 5.15842L2.5 14.3751ZM17.2583 5.86675C17.3356 5.78966 17.3969 5.69808 17.4387 5.59727C17.4805 5.49646 17.502 5.38839 17.502 5.27925C17.502 5.17011 17.4805 5.06204 17.4387 4.96123C17.3969 4.86042 17.3356 4.76885 17.2583 4.69175L15.3083 2.74175C15.2312 2.6645 15.1397 2.60321 15.0389 2.56139C14.938 2.51957 14.83 2.49805 14.7208 2.49805C14.6117 2.49805 14.5036 2.51957 14.4028 2.56139C14.302 2.60321 14.2104 2.6645 14.1333 2.74175L12.6083 4.26675L15.7333 7.39175L17.2583 5.86675Z" fill="inherit" />
          </svg>
        </button>
        <button
          onClick={() => setActiveTool("hand")}
          disabled={activeTool === "hand"}
        >
          {/* 손 아이콘 */}
          <svg width="20" height="20" viewBox="0 0 20 20" fill="black">
            <path d="M10.8334 20C8.11674 20 5.67508 18.3417 4.66674 15.8167L2.14174 9.475C2.08322 9.32784 2.06785 9.16705 2.09742 9.01146C2.12699 8.85587 2.20029 8.71193 2.30872 8.59651C2.41716 8.48108 2.55624 8.39894 2.70967 8.35971C2.86311 8.32048 3.02455 8.32578 3.17508 8.375L3.83341 8.59167C4.30008 8.74167 4.68341 9.1 4.86674 9.55833L6.04174 12.5H6.66674V2.70833C6.66674 2.43207 6.77649 2.16711 6.97184 1.97176C7.16719 1.77641 7.43214 1.66667 7.70841 1.66667C7.98468 1.66667 8.24963 1.77641 8.44498 1.97176C8.64033 2.16711 8.75008 2.43207 8.75008 2.70833V10H9.58341V1.04167C9.58341 0.765399 9.69316 0.500447 9.88851 0.305097C10.0839 0.109747 10.3488 0 10.6251 0C10.9013 0 11.1663 0.109747 11.3616 0.305097C11.557 0.500447 11.6667 0.765399 11.6667 1.04167V10H12.5001V2.29167C12.5001 2.0154 12.6098 1.75045 12.8052 1.5551C13.0005 1.35975 13.2655 1.25 13.5417 1.25C13.818 1.25 14.083 1.35975 14.2783 1.5551C14.4737 1.75045 14.5834 2.0154 14.5834 2.29167V10H15.4167V4.79167C15.4167 4.5154 15.5265 4.25045 15.7218 4.0551C15.9172 3.85975 16.1821 3.75 16.4584 3.75C16.7347 3.75 16.9996 3.85975 17.195 4.0551C17.3903 4.25045 17.5001 4.5154 17.5001 4.79167V13.3333C17.5001 17.0167 14.5167 20 10.8334 20Z" fill="inherit" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default CanvasSection;
