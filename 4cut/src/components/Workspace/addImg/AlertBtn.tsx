import {useState} from 'react';
import '../../../styles/Workspace/addImg/AlertBtn.css'

import AlertCrcleIcon from '../../../assets/Icon/AlertCrcle.svg'
import AlertPopup from './AlertPopup';

function AlertBtn() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div 
            className='alertBtn-container'
        >
            <button
                className='alertBtn'
                onClick={() => setIsOpen(!isOpen)}
            >
                <img src={AlertCrcleIcon} alt="Alert info" />
            </button>
            {isOpen && <AlertPopup />}
        </div>
    )
} 

export default AlertBtn;