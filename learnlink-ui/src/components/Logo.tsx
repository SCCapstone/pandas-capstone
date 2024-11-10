import React from 'react';
import logo from './logo.svg';
import '../App.css';
import { ReactComponent as MySvgFile } from '../LearnLink.svg'

function Logo(){
    return(
        <div className = "Logo">
            <MySvgFile />
        </div>
    );

}

export default Logo;