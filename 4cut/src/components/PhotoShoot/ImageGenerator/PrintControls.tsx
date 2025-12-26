import '../../../styles/PhotoShoot/ImageGenerator/ImageGenerator.css'

interface PrintControlsProps {
    count: number;
    isPrinting: boolean;
    isPreparing?: boolean; // 이미지 준비 중 여부 (Optional로 하여 기존 코드 호환성 유지)
    onCountChange: (delta: number) => void;
    onPrint: () => void;
}

export const PrintControls = ({ count, isPrinting, isPreparing = false, onCountChange, onPrint }: PrintControlsProps) => {
    return (
        <div className='print-control-container'>
            <div className='print-title'>인쇄 수량 선택</div>
            
            <div className='count-control-wrapper'>
                <button 
                    className='count-btn' 
                    onClick={() => onCountChange(-1)}
                    disabled={count <= 1 || isPrinting}
                >
                    -
                </button>
                <span className='print-count'>{count}</span>
                <button 
                    className='count-btn' 
                    onClick={() => onCountChange(1)}
                    disabled={count >= 10 || isPrinting}
                >
                    +
                </button>
            </div>

            <button 
                className='print-btn' 
                onClick={onPrint}
                disabled={isPrinting || isPreparing}
                style={isPreparing ? { backgroundColor: '#ccc', cursor: 'not-allowed' } : {}}
            >
                {isPrinting ? (
                    <span>인쇄 요청 중...</span>
                ) : isPreparing ? (
                    <span>이미지 준비 중...</span>
                ) : (
                    <>
                        <span>프린트 하기</span>
                    </>
                )}
            </button>
        </div>
    );
};
