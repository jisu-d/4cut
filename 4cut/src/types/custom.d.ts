
  
  // Vite의 "?react" 접미사를 위한 타입 선언 추가
  declare module "*.svg?react" {
    import * as React from 'react';
    export const ReactComponent: React.FC<React.PropsWithChildren<React.SVGProps<SVGSVGElement>>>;
    const src: string;
    export default src;
  }