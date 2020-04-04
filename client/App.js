import React, { Suspense, lazy} from 'react';
import SimpleLoading from './component/simple-loading';
let NotesWindow = lazy(_ => import('./component/notes-app/notes-window'));

export default function() {
    return (
        <div>
            <Suspense fallback={SimpleLoading}>
                <NotesWindow></NotesWindow>
            </Suspense>
        </div>
    )
}