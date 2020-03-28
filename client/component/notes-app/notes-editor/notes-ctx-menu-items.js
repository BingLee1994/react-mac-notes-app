
import EditorEventType from './editor-event-type';
export default [{
        text: '剪切',
        command: EditorEventType.cut
    },
    {
        text: '复制',
        command: EditorEventType.copy
    },
    {
        text: '使用百度搜索',
        command: 'search'
    },
    {
        divider: true
    },
    {
        text: '点赞',
        command: 'rate'
    }
]