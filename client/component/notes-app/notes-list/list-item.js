import React from 'react';
import { AppClassNames } from '../../../utils/app-ui-prop';
import { callFunc, formatYMD, _if } from '../../../utils';
import t from '../../../i18n';

const { notesList: NotesListClassNames } = AppClassNames;

export default React.memo(
    props => {
        let liClassNames = [];
        let { selected, cardView, blurred, model} = props;

        if (selected) {
            liClassNames.push(AppClassNames.common.listItemSelected);
            if (!blurred) {
                liClassNames.push(AppClassNames.common.listItemFocused);
            }
        }

        return (
            <li
                onClick={e => { callFunc(props.onClick, e) }}
                onContextMenu={e => { callFunc(props.onContextMenu, e) }}
                className={liClassNames.join(' ')}
            >

                <p className={[
                        NotesListClassNames.title,
                        AppClassNames.common.text.primary,
                        AppClassNames.common.text.bold].join(' ')
                }>
                    {model.title || t.emptyNoteTitle}
                </p>

                <div className={NotesListClassNames.preview.wrapper}>

                    <span className={`${NotesListClassNames.preview.date} ${cardView? AppClassNames.common.text.secondary: ''}`}>
                        {formatYMD(model.date)}
                    </span>

                    {/*if*/ !cardView &&
                        <span className={[
                            NotesListClassNames.preview.text,
                            AppClassNames.common.text.trimEllipsis,
                            AppClassNames.common.text.secondary].join(' ')
                        }>
                            {model.previewText}
                        </span>
                    }

                    {/*if*/ cardView &&
                        <div className={NotesListClassNames.preview.cardWrapper}>
                            <span className={`${NotesListClassNames.preview.text}`}>
                                {(model.title || t.emptyNoteTitle) + '\n' + model.previewText}
                            </span>
                        </div>
                    }

                </div>

                {/*if*/ model.previewImage &&
                    <div className={NotesListClassNames.preview.image}>
                        <image src={model.previewImage}/>
                    </div>
                }
            </li>
        )
    }
)