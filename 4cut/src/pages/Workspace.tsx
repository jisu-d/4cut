import '../styles/Workspace/Workspace.css';

import Dashboard from '../components/Workspace/Dashboard';
import AppContext from '../contexts/AppContext';
import {useEffect, useMemo, useState, useRef} from 'react';
import ExportContent from '../components/Workspace/export/ExportContent';
import DrawingCanvas from '../components/Workspace/DrawingCanvas/DrawingCanvas';

import WorkspaceSetup from '../components/Workspace/WorkspaceSetup/WorkspaceSetup.tsx'

import type {AppContextType, CanvasSize, HSL, ListCutImage, ListDrawingItem, UserLayerDataType, ImgData, BrushData, ImagesData} from '../types/types'
import * as fabric from 'fabric';

function Workspace() {
  const [imagesData, setImagesData] = useState<ImagesData[]>([
    { src: '/src/assets/Icon/test.jpg', alt: '캠퍼스 맵' },
    { src: '/Wsrc/assets/Icon/AlertCrcle.svg', alt: '파일 미리보기 큰 캘린더' },
    { src: '/src/assets/Icon/test.jpg', alt: '캠퍼스 맵' },
    { src: '/src/assets/test/Bear.png', alt: '곰' },
    { src: '/src/assets/Icon/brush.svg', alt: '파일 미리보기 작은 캘린더' },
    { src: '/src/assets/Icon/test.jpg', alt: '캠퍼스 맵' },
    { src: '/src/assets/test/Carrot.png', alt: '당근' },
    { src: '/src/assets/Icon/brush.svg', alt: '파일 미리보기 작은 캘린더' },
    { src: '/src/assets/Icon/brush.svg', alt: '짧은 텍스트 미리보기' },
    { src: '/src/assets/Icon/brush.svg', alt: '파일 미리보기 작은 캘린더' },
  ])

  const [isPublic, setIsPublic] = useState(true); // 공개 비공개 여부
  const [author, setAuthor] = useState(''); // 제작자 -> 로그인 되어있으면 자동 입력 id등 으로
  const [frameName, setFrameName] = useState(''); // 프레임 이름
  const [authorPw, setAuthorPw] = useState(''); // 제작자 구분 비밀번호
  const [desc, setDesc] = useState(''); // 프레임 설명

  const processedImageRef = useRef<Blob | null>(null)


  const [brushData, setBrushData] = useState<BrushData>({
    brushType: 'pen',
    brushPath: '',
    brushSize: 1,
    eraserSize: 1,
  })

  const [cutImages, setCutImages] = useState<ListCutImage[]>([]);

  const [drawingData, setDrawingData] = useState<ListDrawingItem>({});
  const [isExportPopupOpen, setIsExportPopupOpen] = useState(false);

  const [userLayerDataType, setUserLayerDataType] = useState<UserLayerDataType[]>([
    {
      id: 'img-456',
      text: 'img-1',
      LayerType: 'Img',
      visible: true,
      active: false,
    },
    {
      id: 'img-123',
      text: 'img-2',
      LayerType: 'Img',
      visible: true,
      active: false,
    },
    {
      id: '1',
      text: 'cutData',
      LayerType: 'Cut',
      visible: true,
      active: true,
    },
    {
      id: 'drawing-123',
      text: 'drawing-1',
      LayerType: 'Drawing',
      visible: true,
      active: false,
    },
  ])

  const [imgData, setImgData] = useState<ImgData>({
    'img-123': {
      id: 'img-123',
      url: '/src/assets/test/Bear.png',
      left: 146,
      top: 4086,
      scaleX: 1,
      scaleY: 1,
      angle: 0
    },
    'img-456': {
      id: 'img-456',
      url: '/src/assets/test/Carrot.png',
      left: 2272,
      top: 140,
      scaleX: 1,
      scaleY: 1,
      angle: 0
    },
  })

  const [hsl, setHsl] = useState<HSL>({h:0, s:0, l:0})
  const [alpha, setAlpha] = useState<number>(1)
  const [historyColor, setHistoryColor] = useState<{
    hslData: { hsl: HSL },
    alphaData: { alpha: number }
  }[]>([]);

  // 캔버스 크기 상태 추가
  const [canvasSize, setCanvasSize] = useState<CanvasSize>({ width: 1652, height: 4920 });
  
  // 캔버스 배경색 상태 추가
  const [backgroundColor, setBackgroundColor] = useState<string>('#ffffff');
  //TODO 이부분 최적화 -> 왜 이딴식으로 짜야할지;; 코드는 동작함
  const hslRef = useRef(hsl);
  const alphaRef = useRef(alpha);
  useEffect(() => { hslRef.current = hsl; }, [hsl]);
  useEffect(() => { alphaRef.current = alpha; }, [alpha]);

  const addHistoryColor = () => {
    setHistoryColor((prev) => {
      const next = [...prev, { hslData: { hsl: hslRef.current }, alphaData: { alpha: alphaRef.current } }];
      if (next.length > 15) {
        return next.slice(next.length - 15);
      }
      return next;
    });
  };

  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);

  useEffect(() => { // 임시 데이터
    setCutImages([
      {
        id: 'cut1',
        AspectRatio: '3:4',
        jsonData: {
          left: 150,
          top: 217, 
          width: 1463,
          height: 1950,
          angle: 0,
          selectable: true
        },
        checked: false,
      },
      {
        id: 'cut2',
        AspectRatio: '3:4',
        jsonData: {
          left: 1703,
          top: 729,
          width: 1463,
          height: 1950,
          angle: 0,
          selectable: true
        },
        checked: false,
      },
      {
        id: 'cut3',
        AspectRatio: '3:4',
        jsonData: {
          left: 137,
          top: 2242,
          width: 1463,
          height: 1950,
          angle: 0,
          selectable: true
        },
        checked: false,
      },
      {
        id: 'cut4',
        AspectRatio: '3:4',
        jsonData: {
          left: 1690,
          top: 2754,
          width: 1463,
          height: 1950,
          angle: 0,
          selectable: true
        },
        checked: false,
      },
    ]);

    setDrawingData({
      'drawing-123': [
        {
          id: 'drawing-2',
          brushType: "pen",
          jsonData: {
            points: [
              { x: 20, y: 30 },
              { x: 120, y: 30 }
            ],
            options: {
              stroke: 'red',
              strokeWidth: 2,
              strokeLineCap: 'round',
              strokeLineJoin: 'round',
              fill: '',
              left: 20,
              top: 30,
              width: 100,
              height: 0,
              angle: 0,
              scaleX: 1,
              scaleY: 1,
            }
          }
        }
      ]
    });

    setCanvasSize({
      width: 3304,
      height: 4920
    });

    setBackgroundColor('#4F46E5');
  }, []);

  const appProvidedValue: AppContextType = useMemo(() => ({
    addImg: {
      imagesData: imagesData,
      setImageData: setImagesData
    },
    export: {
      Image: {
        processedImage: processedImageRef,
        setProcessedImage: (blob: Blob | null) => {
          processedImageRef.current = blob;
        }
      },
      frameInfo: {
        isPublic: { // 공개 비공개 여부
          isPublic: isPublic,
          setIsPublic: setIsPublic
        },
        author: { // 제작자 -> 로그인 되어있으면 자동 입력 id등 으로
          author: author,
          setAuthor: setAuthor
        },
        frameName: { // 프레임 이름
          frameName: frameName,
          setFrameName: setFrameName
        },
        authorPw: { // 제작자 구분 비밀번호
          authorPw: authorPw,
          setAuthorPw: setAuthorPw
        },
        desc: { // 프레임 설명
          desc: desc,
          setDesc: setDesc
        },
      }
    },
    brush: {
      brushData: brushData,
      setBrushData: setBrushData,
    },
    layer: {
      userLayerDataType: {
        userLayerDataType: userLayerDataType,
        setUserLayerDataType: setUserLayerDataType
      },
      cutImageData: {
        cutImageData: cutImages,
        setCutImageData: setCutImages,
      },
      DrawingData: {
        drawingData: drawingData,
        setDrawingData: setDrawingData,
      },
      imgData: {
        imgData: imgData,
        setImgData: setImgData
      },
    },
    colors: {
      chosenColor: {
        hslData : {
          hsl: hsl,
          setHsl : setHsl
        },
        alphaData: {
          alpha: alpha,
          setAlpha: setAlpha
        }
      },
      history:{
        historyColor: historyColor,
        setHistoryColor: setHistoryColor,
        addHistoryColor: addHistoryColor
      }
    },
    canvas: {
      canvasSize: canvasSize,
      setCanvasSize: setCanvasSize,
      backgroundColor: backgroundColor,
      setBackgroundColor: setBackgroundColor,
      fabricCanvasRef: fabricCanvasRef,
    }
  }), [
    // 이미지 관련
    imagesData,
    //브러쉬 관련
    brushData,
    // 레이어 관련
    cutImages, 
    userLayerDataType, 
    drawingData,
    imgData,
    // 색상 관련
    hsl, 
    alpha, 
    historyColor, 
    // 캔버스 관련
    canvasSize, 
    backgroundColor,
    fabricCanvasRef,
    processedImageRef,
  ]);

  const openExportPopup = () => setIsExportPopupOpen(true);
  const closeExportPopup = () => setIsExportPopupOpen(false);

  return (
    <div className='main-layout'>
      <AppContext.Provider value={appProvidedValue}>
        {/*<div className='tools-panel'>*/}
        {/*  <Dashboard openExportPopup={openExportPopup} isExportPopupOpen={isExportPopupOpen} />*/}
        {/*</div>*/}
        {/*<div className='canvas-area'>*/}
        {/*  <DrawingCanvas />*/}
        {/*</div>*/}
        {/*{isExportPopupOpen && (*/}
        {/*  <div className="popup-overlay" onClick={closeExportPopup}>*/}
        {/*    <div className="popup-content" onClick={e => e.stopPropagation()}>*/}
        {/*      <ExportContent closeExportPopup={closeExportPopup}/>*/}
        {/*    </div>*/}
        {/*  </div>*/}
        {/*)}*/}
        <WorkspaceSetup />
      </AppContext.Provider>
    </div>
  );
}

export default Workspace;