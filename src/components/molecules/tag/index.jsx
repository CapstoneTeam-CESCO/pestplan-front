import React from 'react';
import PropTypes from 'prop-types';

import './styles.scss';
import SVG from 'src/components/atoms/svg';
import Text from 'src/components/atoms/text';

function Tag({ className, aProps, textProps, svgProps }) {
    return (
        <div className={className}>
            <a {...aProps}>
                <Text {...textProps} />
                <SVG {...svgProps} />
            </a>
        </div>
    );
}

Tag.propTypes = {
    className: PropTypes.string,
    aProps: PropTypes.object,
    textProps: PropTypes.object,
    svgProps: PropTypes.object,
};

export default Tag;
