import React from 'react';
import Icon from 'react-fa';
import Griddle from 'griddle-react';
import Tooltip from 'react-tooltip';
import ViolationViz from 'violation/src/violation-viz.jsx';

function padLeading(digit, number, totalLength) {
    let strNumber = number.toString();
    if (strNumber.length >= totalLength) {
        return strNumber;
    }
    let padding = totalLength - strNumber.length;
    while(padding) {
        strNumber = digit + strNumber;
        padding -= 1;
    }
    return strNumber;
}


function formatDate(ts) {
    try {
        const date = new Date(ts);
        let year = date.getUTCFullYear();
        let month = date.getUTCMonth() + 1;
        let day = date.getUTCDate();
        let hour = date.getUTCHours();
        let minute = date.getUTCMinutes();

        month = padLeading(0, month, 2);
        day = padLeading(0, day, 2);
        hour = padLeading(0, hour, 2);
        minute = padLeading(0, minute, 2);
        return `${year}-${month}-${day} ${hour}:${minute}`;
    } catch(e) {
        return '-';
    }
}

const FORMATTED_DATES = {};
function cacheFormat(ts) {
    if (!FORMATTED_DATES[ts]) {
        FORMATTED_DATES[ts] = formatDate(ts);
    }
    return FORMATTED_DATES[ts];
}

// Deliberately not using react-time here because
// when we have a page size of 100, it gets really
// slow to recreate all the timestamp fields
function TimestampCell({data}) {
    return <div>{cacheFormat(data)}</div>;
}
TimestampCell.displayName = 'TimestampCell';
TimestampCell.propTypes = {data: React.PropTypes.string};

function DefaultValueCell({data}) {
    return <div>{data || '-'}</div>;
}
DefaultValueCell.displayName = 'DefaultValueCell';
DefaultValueCell.propTypes = {data: React.PropTypes.string};

function BooleanCell({data}) {
    return <Icon name={data ? 'check' : 'times'} />
}
BooleanCell.displayName = 'BooleanCell';
BooleanCell.propTypes = {data: React.PropTypes.bool};

function PriorityCell({data}) {
    return <ViolationViz priority={data} />;
}
PriorityCell.displayName = 'PriorityCell';
PriorityCell.propTypes = {data: React.PropTypes.number};

/*eslint-disable react/display-name, react/prop-types */
function AccountCell(accounts) {
    return function(props) {
        const acc = accounts[props.data];
        if (acc) {
            return <div>{acc.name}</div>;
        }
        return <div>{props.data}</div>;
    }
}
/*eslint-enable react/display-name, react/prop-types */
AccountCell.displayName = 'AccountCell';
// TODO make propTypes more specific
AccountCell.propTypes = {
    data: React.PropTypes.any
}


/*eslint-disable react/display-name, react/prop-types */
function TeamCell(accounts) {
    return function(props) {
        const acc = accounts[props.data];
        if (acc) {
            return <div>{acc.owner}</div>;
        }
        return <div>{props.data}</div>;
    }
}
/*eslint-enable react/display-name, react/prop-types */
TeamCell.displayName = 'TeamCell';
TeamCell.propTypes = React.PropTypes.arrayOf(React.PropTypes.shape({owner: React.PropTypes.string}));

function TooltipCell({data}) {
    return <div><Tooltip /><span data-tip={data}>{data}</span></div>;
}
TooltipCell.displayName = 'TooltipCell';
// TODO make propTypes more specific
TooltipCell.propTypes = {
    data: React.PropTypes.any
}

class Pager extends React.Component {
    constructor() {
        super();
    }

    pageChange(page) {
        this.props.setPage(page);
    }

    render() {
        const pages = new Array(this.props.maxPage).fill(1).map((n, i) => i);
        return <div className='violationTable-pager'>
                <div
                    className='violationTable-pager-gotofirst'
                    disabled={this.props.currentPage === 0}
                    onClick={() => this.pageChange(0)}>
                    <Icon name='fast-backward' /> First
                </div>
                <div
                    className='violationTable-pager-gotoprev'
                    disabled={this.props.currentPage === 0}
                    onClick={() => this.props.previous()}>
                    <Icon name='step-backward' /> {this.props.previousText}
                </div>
                <div>Page <select
                            value={this.props.currentPage}
                            onChange={(evt) => this.pageChange(evt.target.value)}>
                            {pages.map(p => <option key={p} value={p}>{p + 1}</option>)}
                        </select> / {this.props.maxPage}
                </div>
                <div
                    className='violationTable-pager-gotonext'
                    disabled={this.props.maxPage - 1 === this.props.currentPage}
                    onClick={() => this.props.next()}>
                    {this.props.nextText} <Icon name='step-forward' />
                </div>
                <div
                    className='violationTable-pager-gotolast'
                    disabled={this.props.maxPage - 1 === this.props.currentPage}
                    onClick={() => this.pageChange(this.props.maxPage - 1)}>
                    Last <Icon name='fast-forward' />
                </div>
        </div>
    }
}

Pager.displayName = 'Pager';
Pager.propTypes = {
    currentPage: React.PropTypes.number,
    maxPage: React.PropTypes.number,
    next: React.PropTypes.func,
    nextText: React.PropTypes.string,
    pageChange: React.PropTypes.func,
    previous: React.PropTypes.func,
    previousText: React.PropTypes.string,
    setPage: React.PropTypes.func
};

class ViolationTable extends React.Component {
    constructor() {
        super();
        this.state = {
            numPages: 100,
            page_size: 15,
            results: []
        };
    }

    changeSort(sort, sortAsc) {
        this.props.onChangeSort(sort, sortAsc);
    }

    setFilter(filter) { // eslint-disable-line no-unused-vars
        // TODO either remove or fill with code
    }

    setPage(page) {
        this.props.onSetPage(page);
    }

    setPageSize(size) {
        this.props.onSetPageSize(size);
    }

    shouldComponentUpdate(nextProps, nextState) {
        return this.props.violations !== nextProps.violations ||
                this.props.accounts !== nextProps.accounts ||
                this.props.params !== nextProps.params ||
                this.state.numPages !== nextState.numPages;
    }

    render() {
        var gridColumns = [
                'account_id',
                'owner',
                'created',
                'application_id',
                'version_id',
                'priority',
                'violation_type_id',
                'is_resolved'
            ],
            columnMetadata = [{
                displayName: 'Team',
                columnName: 'account_id',
                customComponent: TeamCell(this.props.accounts)
            }, {
                displayName: 'Account',
                columnName: 'owner',
                customComponent: AccountCell(this.props.accounts)
            } ,{
                displayName: 'Created',
                columnName: 'created',
                customComponent: TimestampCell
            }, {
                displayName: 'Application',
                columnName: 'application_id',
                customComponent: DefaultValueCell
            }, {
                displayName: 'Version',
                columnName: 'version_id',
                customComponent: DefaultValueCell
            }, {
                displayName: 'Priority',
                columnName: 'priority',
                customComponent: PriorityCell
            },{
                displayName: 'Type',
                columnName: 'violation_type_id',
                customComponent: TooltipCell
            }, {
                displayName: 'Resolved?',
                columnName: 'is_resolved',
                customComponent: BooleanCell
            }];

        // ui of setting page size broken because of this https://github.com/GriddleGriddle/Griddle/issues/283
        return <Griddle
                    tableClassName='violationTable'
                    noDataMessage={this.props.loading ? 'Waiting for data…' : 'No violations matching your filters.'}
                    onRowClick={this.props.onRowClick}
                    useGriddleStyles={false}
                    useCustomPagerComponent={true}
                    customPagerComponent={Pager}
                    useExternal={true}
                    externalSetPage={this.setPage.bind(this)}
                    externalSetPageSize={this.setPageSize.bind(this)}
                    externalSetFilter={this.setFilter.bind(this)}
                    externalChangeSort={this.changeSort.bind(this)}
                    externalMaxPage={this.props.pagingInfo.total_pages}
                    externalCurrentPage={this.props.params.page}
                    externalSortColumn={this.props.params.sortBy}
                    externalSortAscending={this.props.params.sortAsc}
                    resultsPerPage={this.props.pagingInfo.size}
                    showFilter={false}
                    showSetPageSize={true}
                    showSettings={true}
                    columns={gridColumns}
                    columnMetadata={columnMetadata}
                    results={this.props.violations} />;
    }
}

ViolationTable.displayName = 'ViolationTable';

// TODO make propTypes more specific
ViolationTable.propTypes = {
    accounts: React.PropTypes.object,
    loading: React.PropTypes.bool,
    onChangeSort: React.PropTypes.func.isRequired,
    onRowClick: React.PropTypes.func.isRequired,
    onSetPage: React.PropTypes.func.isRequired,
    onSetPageSize: React.PropTypes.func.isRequired,
    pagingInfo: React.PropTypes.shape({
        last: React.PropTypes.bool,
        size: React.PropTypes.number,
        page: React.PropTypes.number,
        total: React.PropTypes.number,
        total_pages: React.PropTypes.number
    }).isRequired,
    params: React.PropTypes.shape({
        page: React.PropTypes.number,
        sortBy: React.PropTypes.string,
        sortAsc: React.PropTypes.bool
    }).isRequired,
    violations : React.PropTypes.arrayOf(React.PropTypes.shape({
        comment: React.PropTypes.string,
        id: React.PropTypes.number,
        account_id: React.PropTypes.string,
        region: React.PropTypes.string,
        instance_id: React.PropTypes.string,
        username: React.PropTypes.string,
        message: React.PropTypes.string,
        rule_id: React.PropTypes.string,
        meta_info: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.object]),
        is_whitelisted: React.PropTypes.bool,
        violation_type: React.PropTypes.shape({
            priority: React.PropTypes.number
        }),
        last_modified_by: React.PropTypes.string,
        timestamp: React.PropTypes.number,
        last_modified: React.PropTypes.string
    })).isRequired
};

export default ViolationTable;
