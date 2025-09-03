import '../../../styles/PhotoShoot/PhotoCapture/ImgeGrid.css';

interface ImageGridProps {
    ratios: string[];
}

function ImageGrid({ ratios }: ImageGridProps) {

    const getRatioType = (ratio: string): 'wide' | 'tall' | 'square' => {
        const [w, h] = ratio.split('/').map(Number);
        if (w > h) return 'wide';
        if (h > w) return 'tall';
        return 'square';
    };

    return (
        <div className='image-grid-container'>
            {ratios.map((ratio, index) => (
                <div key={index} className='grid-item'>
                    <div
                        className='image-placeholder'
                        data-ratio-type={getRatioType(ratio)}
                        style={{ aspectRatio: ratio }}
                    >
                        <span>{ratio}</span>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default ImageGrid;