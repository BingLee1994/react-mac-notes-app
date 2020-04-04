import React from 'react';
import ReactDOM from 'react-dom';
import Picker from './base-picker';
import DialogButton from '../button/dialog-button';
import { throttle, _if, callFunc } from '../../utils';

const ColorBarWidth = 180;
const ColorBarHeight = 20;
const DefaultColor = 'red';

function rgb(rgb = []) {
    if (rgb.length < 3) return '';
    let [r, g, b] = rgb;
    return `rgb(${[r,g,b].join(',')})`;
}

function rgb2Hex(rgb) {
    if (rgb.length < 3) return '';
    let result;
    return '#' + [
        (result = Number(rgb[0]).toString(16)).length == 1 ? ('0' + result) : result,
        (result = Number(rgb[1]).toString(16)).length == 1 ? ('0' + result) : result,
        (result = Number(rgb[2]).toString(16)).length == 1 ? ('0' + result) : result,
    ].join('');
}

class ColorPicker extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            canPickColor: false,
            canPickBrightness: false,
            selectedRGB: []
        }
        this.enablePicker = throttle(this.enablePicker.bind(this), 80);
    }

    //TODO 做成canvas component
    drawColorBar() {
        let elColorBar = this.refs.colorBar;
        let colorBarCanvasCtx = elColorBar.getContext('2d');
        let colorGradient = colorBarCanvasCtx.createLinearGradient(0, 0, ColorBarWidth, 0);
        colorGradient.addColorStop(0, 'red'); //红
        colorGradient.addColorStop(1 / 6, '#f0f'); //紫色，洋红
        colorGradient.addColorStop(2 / 6, '#00f'); //靛
        colorGradient.addColorStop(3 / 6, '#0ff'); //青
        colorGradient.addColorStop(4 / 6, '#0f0'); //绿
        colorGradient.addColorStop(5 / 6, '#ff0'); //黄
        colorGradient.addColorStop(1, 'red'); //红

        colorBarCanvasCtx.fillStyle = colorGradient;
        colorBarCanvasCtx.fillRect(0, 0, ColorBarWidth, ColorBarHeight);
    }

    //TODO 做成canvas component
    drawColorBox(initialColor = DefaultColor) {
        let elColorBox = this.refs.colorBox;
        let colorBoxCanvasCtx = elColorBox.getContext('2d');
        colorBoxCanvasCtx.clearRect(0, 0, ColorBarWidth, ColorBarWidth);
        //白色到当前颜色
        var colorGradient = colorBoxCanvasCtx.createLinearGradient(0, 0, 190, 0);
        colorGradient.addColorStop(1, initialColor);
        colorGradient.addColorStop(0, 'rgba(255,255,255,1)');
        colorBoxCanvasCtx.fillStyle = colorGradient;
        colorBoxCanvasCtx.fillRect(0, 0, ColorBarWidth, ColorBarWidth);
        //透明色到纯黑色
        var brightnessGradient = colorBoxCanvasCtx.createLinearGradient(0, 0, 0, ColorBarWidth);
        brightnessGradient.addColorStop(0, 'rgba(0,0,0,0)');
        brightnessGradient.addColorStop(1, 'rgba(0,0,0,1)');
        colorBoxCanvasCtx.fillStyle = brightnessGradient;
        colorBoxCanvasCtx.fillRect(0, 0, ColorBarWidth, ColorBarWidth);
        this.refs.brightnessCursor.style.display = 'none';
    }

    //TODO 做成canvas component
    _moveCursor(x, y, el) {
        let { offsetWidth, offsetHeight }= el;
        el.style.left = x - offsetWidth/2;
        el.style.top = y - offsetHeight/2;
    }

    //TODO 做成canvas component
    _pickPixelData(x, y, el) {
        let ctx = el.getContext('2d');
        let pixel = ctx.getImageData(x, y, 1, 1), data = pixel.data;
        this.state.selectedRGB = data.slice(0,3);
        this.forceUpdate();
    }

    //TODO 做成canvas component
    _pickAndMoveCursor(x, y, el, cursor) {
        this._moveCursor(x, y, cursor);
        return this._pickPixelData(x, y, el);
    }

    //TODO 做成canvas component
    pickColor = e => {
        if (!this.state.canPickColor) return;
        let { nativeEvent: { offsetX, offsetY } } = e;
        this._pickAndMoveCursor(offsetX, offsetY, e.target, this.refs.colorCursor);
        this.drawColorBox(rgb(this.state.selectedRGB));
    };

    //TODO 做成canvas component
    pickBrightness = e => {
        if (!this.state.canPickBrightness) return;
        let { nativeEvent: { offsetX, offsetY } } = e;
        this._pickAndMoveCursor(offsetX, offsetY, e.target, this.refs.brightnessCursor);
    };

    //TODO 做成canvas component
    _getPosition(e, el, width, height, offset = 0) {
        let { x, y } = el.getBoundingClientRect();
        let { clientX, clientY } = e;
        let deltaX = clientX-x, deltaY = clientY-y;
        deltaX <= 0 && (deltaX = 0); deltaX >= width && (deltaX = width - offset);
        deltaY <= 0 && (deltaY = 0); deltaY >= height && (deltaY = height - offset);
        return [deltaX, deltaY];
    }

    //TODO 做成canvas component
    enablePicker(e) {
        if (this.state.canPickBrightness) {
            let { colorBox } = this.refs;
            this._pickAndMoveCursor(...this._getPosition(e, colorBox, ColorBarWidth, ColorBarWidth, 1), colorBox, this.refs.brightnessCursor);
        }
        if (this.state.canPickColor) {
            let { colorBar } = this.refs;
            this._pickAndMoveCursor(...this._getPosition(e, colorBar, ColorBarWidth, ColorBarHeight, 1), colorBar, this.refs.colorCursor);
            this.drawColorBox(rgb(this.state.selectedRGB));
        }
    };

    disablePicker = _ => {
        this.state.canPickBrightness = false;
        this.state.canPickColor = false;
    }

    componentDidMount() {
        this.drawColorBar();
        this.drawColorBox();
        document.addEventListener('mousemove', this.enablePicker);
        document.addEventListener('mouseup', this.disablePicker);
    }

    componentWillUnmount() {
        document.removeEventListener('mouseup', this.disablePicker); 
    }

    onCloseCancel = _ => {
        callFunc(this.props.onCancel)
    }

    onCloseOK = _ => {
        let data = {
            rgb: rgb(this.state.selectedRGB),
            hex: rgb2Hex(this.state.selectedRGB),
            row: [...this.state.selectedRGB]
        }
        callFunc(this.props.onSelect, data)
    }

    render() {
        let selectedRgb = rgb(this.state.selectedRGB),
            selectedHex = rgb2Hex(this.state.selectedRGB);
        return (
            <Picker title={this.props.title || "选取颜色"}
                onClose={this.onCloseCancel}
                x={this.props.x}
                y={this.props.y}
            >
                <div className="color-picker-dialog-wrapper"
                    style={{width: ColorBarWidth, margin: '0 auto'}}
                >
                    <div className="color-picker-wrapper" style={{width: ColorBarWidth}}>
                        <div className="cursor" ref="colorCursor" style={{display: 'none'}}></div>
                        <canvas
                            width={ColorBarWidth}
                            height={ColorBarHeight}
                            style={{position: 'relative'}}
                            ref="colorBar"
                            onMouseDown={e => {
                                this.refs.colorCursor.style.display = 'block';
                                this.state.canPickColor = true;
                                this.pickColor(e);
                            }}
                        ></canvas>
                    </div>
                    <div className="color-picker-wrapper" style={{width: ColorBarWidth, margin:'10px 0'}}>
                        <div className="cursor" ref="brightnessCursor" style={{display: 'none'}}></div>
                        <canvas
                            width={ColorBarWidth}
                            height={ColorBarWidth}
                            style={{position: 'relative'}}
                            ref="colorBox"
                            onMouseDown={e => {
                                this.refs.brightnessCursor.style.display = 'block';
                                this.state.canPickBrightness = true;
                                this.pickBrightness(e);
                            }}
                        ></canvas>
                    </div>
                    <div className="color-info-wrapper">
                        {_if( selectedRgb !== '' ,
                            <div className="color-preview" style={{background: selectedRgb}}></div>
                        )}
                        <p className="color-info"> {selectedRgb} </p>
                        <p className="color-info"> {selectedHex} </p>
                    </div>
                </div>
                <div className="dialog-button-wrapper">
                    <DialogButton
                        positive
                        onClick={this.onCloseOK}
                    >确定</DialogButton>
                    <DialogButton
                        onClick={this.onCloseCancel}
                    >取消</DialogButton>
                </div>
            </Picker>
        )
    }
}

export default ColorPicker;

export function showColorPicker(title, x=0, y=0) {
    let el = document.createElement('div'),
        style = ['position:fixed', 'top:0', 'left:0', 'right:0', 'bottom:0'];
    el.setAttribute('style', style.join(';'));

    function unmount () {
        ReactDOM.unmountComponentAtNode(el);
        document.body.removeChild(el);
    }
    return new Promise((r,j) => {
        let component = (
            <ColorPicker title={title}
                onSelect={data => { r(data); unmount(); }}
                onCancel={_ => { j(); unmount()}}
                x={x}
                y={y}
            />
        );
        document.body.appendChild(el);
        ReactDOM.render(component, el);
    })
}