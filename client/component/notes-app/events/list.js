
import { uuid, mapDisplayName } from '../../../utils';

const NotesListEvent = {
    open: uuid(),
    move: uuid(),
    delete: uuid()
};

export default mapDisplayName(NotesListEvent, 'NotesListEvent');