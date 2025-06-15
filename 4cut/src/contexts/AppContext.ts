import React from 'react';

import type { AppContextType } from '../types/types'

const AppContext = React.createContext<AppContextType>({
  addImg : null,
  export: null,
  brush: null,
  layer: null,
  colors: null
});

export default AppContext;