import '../../../styles/PhotoShoot/ImageGenerator/ImageGenerator.css'

interface PrintControlsProps {
    count: number;
    isPrinting: boolean;
    onCountChange: (delta: number) => void;
    onPrint: () => void;
}

export const PrintControls = ({ count, isPrinting, onCountChange, onPrint }: PrintControlsProps) => {
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
                disabled={isPrinting}
            >
                {isPrinting ? (
                    <span>인쇄 요청 중...</span>
                ) : (
                    <>
                        <span>프린트 하기</span>
                    </>
                )}
            </button>
        </div>
    );
};
