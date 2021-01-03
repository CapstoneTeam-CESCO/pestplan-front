import React from 'react';

import './Board.scss';
import './Notice.scss';
import BoardHeader from '../atoms/BoardHeader';
import NoticeBoardBody from '../atoms/NoticeBoardBody';
import BoardNav from './../molecules/BoardNav';

function Notice(props) {
    const { className } = props;

    return (
        <div className={`board ${className}`}>
            <BoardHeader
                className="bdHeader"
                header="Notice" />
            <NoticeBoardBody
                className="bdBody" />
            <BoardNav
                className="bdNav"
                isNotice={true} />
        </div>
    );
}

export default Notice;