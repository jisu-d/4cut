import '../../../styles/PhotoShoot/ImageGenerator/ImageGenerator.css'

interface QrResultProps {
    qrUrl: string;
    printCount: number;
    onReset: () => void;
}

export const QrResult = ({ qrUrl, printCount, onReset }: QrResultProps) => {
    return (
        <div className='qr-result-container'>
            <div className='qr-title'>QR 이미지 다운로드</div>
            <div className='qr-image-wrapper'>
                <img src={qrUrl} alt='QR Code' />
            </div>
            <div className='qr-description'>
                모바일로 사진을 다운로드하세요<br />
                (총 {printCount}장 인쇄됨)
            </div>
            <button className='reset-btn' onClick={onReset}>처음으로</button>
        </div>
    );
};
