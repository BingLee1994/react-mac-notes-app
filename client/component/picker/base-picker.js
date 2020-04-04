import React, { useEffect, useRef } from 'react';
import TitleBar from '../title-bar/simple-title-bar';
import { callFunc, enableSimpleDrag, getTranslate } from '../../utils';

export default function(props) {
    let container = useRef();
    let titleBar = useRef();
    let baseX = 0, baseY = 0, curX = props.x||0, curY = props.y||0;
    useEffect(() => {
        let remove = enableSimpleDrag(
            titleBar,
            () => {
                let translate = getTranslate(container);
                baseX = translate.x;
                baseY = translate.y;
            },
            (disX, disY) => {
                curX = baseX + disX;
                curY = baseY + disY;
                container.style.transform = `translate(${curX}px, ${curY}px)`;
            }
        );

        return _ => { remove(); }
    });
    return (
        <div className="mc-picker-wrapper"
            ref={el => container = el}
            style={{transform: `translate(${props.x|| 0}px, ${props.y||0}px)`}}
        >
            <TitleBar title={props.title}
                onClose={e => callFunc(props.onClose, e)}
                onRef = {el => titleBar = el}
            />
            <div className="picker-content">
                {props.children}
            </div>
        </div>
    )
}