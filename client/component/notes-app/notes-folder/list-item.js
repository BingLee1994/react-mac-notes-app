import React from 'react';
import { AppClassNames } from '../../../utils/app-ui-prop';
import { callFunc } from '../../../utils';

const FolderClassNames = AppClassNames.notesFolder;

export default React.memo(
    props => {
        let liClassNames = [FolderClassNames.listItem,
            AppClassNames.common.text.trimEllipsis,
            FolderClassNames.title];
        let { selected, blurred, title, count } = props;

        if (selected) {
            liClassNames.push(AppClassNames.common.listItemSelected);
            if (!blurred) {
                liClassNames.push(AppClassNames.common.listItemFocused);
            }
        }

        return (
            <div
                onClick={e => { callFunc(props.onClick, e) }}
                onContextMenu={e => { callFunc(props.onContextMenu, e) }}
                className={liClassNames.join(' ')}
            >
                {title}
                <span className={FolderClassNames.numbers}>
                    {count}
                </span>
            </div>
        )
    }
)