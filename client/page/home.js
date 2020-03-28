import React from 'react';
import QMSlider from '../component/qm-slider';
import MusicPlayer from '../component/music-player/music-player';

export default class extends React.Component {
    constructor() {
        super(...arguments);
        this.state = {
            imgs: [
                {
                    id: 123, 
                    src: "https://y.gtimg.cn/music/common/upload/MUSIC_FOCUS/1940740.jpg?max_age=2592000"
                },
                {
                    id: 456, 
                    src: "https://y.gtimg.cn/music/common/upload/MUSIC_FOCUS/1940665.jpg?max_age=2592000"
                },
                {
                    id: 567,
                    src: "https://y.gtimg.cn/music/common/upload/MUSIC_FOCUS/1940742.jpg?max_age=2592000"
                },
                {
                    id: 4856,
                    src: "https://y.gtimg.cn/music/common/upload/MUSIC_FOCUS/1940347.jpg?max_age=2592000"
                }
            ]
        }
    }
    render() {
        let musicList = [
            {
              id: "1",
              title: "打上花火",
              artist: "DAOKO,米津玄師",
            },
            {
              id: "2",
              title: "渡月橋 ~君 想ふ~",
              artist: "倉木麻衣"
            },
            {
              id: "3",
              title: "美丽的神话Ⅰ",
              artist: "成龙,金喜善"
            }
          ];
        return (
            <div>
            <div className="search-bar">
                <span className="heading">音乐馆</span>
                <div className="search-wrapper">
                    <span className="search-btn placeholder-txt">搜索</span>
                </div>
                <a className="nav-me"></a>
            </div>

            <div className="content-wrapper">
                {/*<QMSlider imgs={this.state.imgs}/>*/}

            </div>
            <MusicPlayer list={musicList} />
            </div>
        );
    }
}