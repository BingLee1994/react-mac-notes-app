import React from 'react';
import FloatingMenu from '../floating-menu/floating-menu';
import Button from '.';
import { callFunc } from '../../utils';

export default class OptionButton extends React.Component {
    state = {
        open: false,
        animated: false,
    };

    closeOptionListener = (e) => {
        let { target } = e;
        if (target !== this.button && this.state.open) {
            this.toggleMenu(e, true);
        }
    };

    componentDidMount() {
        document.addEventListener('mousedown', this.closeOptionListener);
    }

    componentWillUnmount() {
        document.removeEventListener('mousedown', this.closeOptionListener);
    }

    onSelectItem = (optionData, e) => {
        callFunc(this.props.onSelectOption, optionData, e);
        this.toggleMenu(null, true);
    }

    toggleMenu = (_, isClose) => {
        let isOpen = isClose? false: !this.state.open;
        this.setState({
            open: isOpen,
            animated: !isOpen
        });
    };

    render() {
        return (
            <div
                ref="optionButtonWrapper"
                className="mc-option-button-wrapper"
                style={{display: 'inline-block'}}
                title={this.props.title} 
            >
                <span ref="button">
                    <Button
                        className="option-button"
                        onClick={this.toggleMenu}
                        active={this.state.open}
                        onRef={ref => this.button = ref}
                    >{this.props.children}</Button>
                </span>
                <FloatingMenu
                    menuItems={this.props.options}
                    open={this.state.open}
                    animated={this.state.animated}
                    onSelectItem={this.onSelectItem}
                    onCloseComplete={() => {
                        this.state.open && (this.state.open = false)
                    }}
                />
            </div>
        );
    }
}