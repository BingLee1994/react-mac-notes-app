import React from 'react';

let IconNames = {
    underLine: 'underLine',
    checkBox: 'checkBox',
    fontColor: 'fontColor',
    lineThrough: 'lineThrough',
    cardView: 'cardView',
    listView: 'listView',
    alignLeft: 'alignLeft',
    alignCenter: 'alignCenter',
    alighRight: 'alighRight',
    italics: 'italics',
    listOption: 'listOption',
    titleOption: 'titleOption',
    fontBold: 'fontBold',
    arrowBottom: 'arrowBottom',
    indent: 'indent',
    insertHr: 'insertHr',
    link: 'link',
    image: 'image'
}

export { IconNames };

const FontMapping = {
    underLine: '&#xe609;',
    checkBox: '&#xe60b;',
    fontColor: '&#xe60c;',
    lineThrough: '&#xe60d;',
    cardView: '&#xe60e;',
    listView: '&#xe611;',
    alignLeft: '&#xe60f;',
    alignCenter: '&#xe610;',
    alighRight: '&#xe612;',
    italics: '&#xe60a;',
    listOption: '&#xe614;',
    titleOption: '&#xe615;',
    fontBold: '&#xe613;',
    arrowBottom: '&#xe619',
    indent: '&#xe61a',
    insertHr: '&#xe618',
    link: '&#xe617',
    image: '&#xe61b'
}

export default React.memo(props => (
    <span className="mnf" dangerouslySetInnerHTML={{__html: FontMapping[props.name]||''}}></span>
), (prevProps, nextProps) => prevProps.name === nextProps.name
)