
import { uuid, mapDisplayName } from '../../../utils';

const ToolbarEvent = {
    listViewStyleChange: uuid(),
    create: uuid()
};

export default mapDisplayName(ToolbarEvent, 'NotesToolbarEvent');