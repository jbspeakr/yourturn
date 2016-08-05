import React from 'react';

import { AreaChart } from 'react-d3-components';
import d3 from 'd3';

const MARGINS = {top: 10, bottom: 50, left: 50, right: 20};
const CHART_HORIZONTAL_MARGINS = MARGINS.left + MARGINS.right;
const CHART_INTERPOLATION = 'step-after';

const transformData = function(inData) {
    const values = inData.events.map( e => {return {x: Date.parse(e.timestamp), y: e.count}});

    return {
        label : inData.version_id,
        values
    };
};

const Chart = (props) => {
    const { dataSet, width, height, startDate, endDate } = props;
    const transformedData = transformData(dataSet);
    const xScale = d3.time.scale().domain([startDate, endDate]).range([0, width - CHART_HORIZONTAL_MARGINS]);

    return (
            <AreaChart
                data        = {transformedData}
                xScale      = {xScale}
                interpolate = {CHART_INTERPOLATION}
                height      = {height}
                margin      = {MARGINS}
                width       = {width}
            />
    )
};

Chart.propTypes = {
    width: React.PropTypes.number,
    height: React.PropTypes.number,
    dataSet: React.PropTypes.arrayOf(
        React.PropTypes.shape({
            timestamp: React.PropTypes.instanceOf(Date),
            count: React.PropTypes.number,
            instances: React.PropTypes.object
        })).isRequired,
    startDate: React.PropTypes.instanceOf(Date).isRequired,
    endDate: React.PropTypes.instanceOf(Date).isRequired
};

export default Chart;
