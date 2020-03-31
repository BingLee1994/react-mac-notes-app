import React , {useState} from 'react';
import Dialog from './dialog';
import InputBox from '../input';
import { callFunc, isObject } from '../../utils';
import { AppClassNames } from '../../utils/app-ui-prop';

export default props => {
    let [value, setValue] = useState('');
    let { positiveButton }  = props;
    if (!isObject(positiveButton)) {
        positiveButton = {
            text: positiveButton,
            disabled: props.required && !props.value
        }
    }
    let [positiveBtn, setButton] = useState({ ...positiveButton});
    return (
        <Dialog
            {...props}
            onConfirm={() => {callFunc(props.onConfirm, value)}}
            positiveButton={positiveBtn}
            className={AppClassNames.dialog.inputboxDialog.wrapper}
        >
            <div className="message">
                <p className="message-title">{props.message}</p>
                <InputBox
                    type='text'
                    value={value}
                    onInput={
                        e => {
                            let newValue = e.target.value;
                            setValue(newValue);
                            positiveBtn.disabled = props.required && newValue === '';
                            setButton({...positiveBtn});
                        }
                    }
                    placeholder={props.placeholder}
                    width="100%"
                />
            </div>
        </Dialog>
    )
}
