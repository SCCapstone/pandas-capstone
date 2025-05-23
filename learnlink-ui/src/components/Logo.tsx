import React from 'react';
import logo from './logo.svg';
import './components.css';
import { ReactComponent as MySvgFile } from './LearnLink.svg'


// The Logo component renders an SVG logo
function Logo(){
    return(
        <div className = "Logo">
            <MySvgFile data-testid="logo" aria-label="LearnLink Logo"/>
        </div>
    );

}

export default Logo;