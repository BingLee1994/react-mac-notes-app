
import { uuid, mapDisplayName } from '../../../utils';

const FolderEvent = {
    openFolder: uuid(),
    reload: uuid(),
    rename: uuid(),
    delete: uuid()
};

export default mapDisplayName(FolderEvent, 'NotesFolderEvent');