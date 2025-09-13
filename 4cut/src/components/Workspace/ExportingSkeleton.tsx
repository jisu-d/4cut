import '../../styles/Workspace/ExportingSkeleton.css';

const ExportingSkeleton = () => {
  return (
    <div className="skeleton-container">
      <div className="skeleton-header">
        <div className="skeleton-item skeleton-title"></div>
        <div className="skeleton-item skeleton-switch"></div>
      </div>
      <div className="skeleton-inputs">
        <div className="skeleton-input-row">
          <div className="skeleton-item skeleton-input"></div>
          <div className="skeleton-item skeleton-input"></div>
        </div>
        <div className="skeleton-input-row" style={{width: "calc(50% - 8px)"}}>
            <div className="skeleton-item skeleton-input"></div>
        </div>
        <div className="skeleton-item skeleton-textarea"></div>
        <div className="skeleton-item skeleton-agreements"></div>
      </div>
      <div className="skeleton-button-wrapper">
        <div className="skeleton-item skeleton-button"></div>
      </div>
    </div>
  );
};

export default ExportingSkeleton; 