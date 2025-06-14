// src/components/Dashboard.js
// import React, { useState } from 'react';
import '../styles/Workspace/Workspace.css'; 

import Dashboard from '../components/Workspace/Dashboard';

function Workspace() {
  return (
    <div className='main-layout'>
        <div className='tools-panel'>
            <Dashboard />
        </div>
        <div className='canvas-area'>

        </div>
    </div>
  )
}

export default Workspace;