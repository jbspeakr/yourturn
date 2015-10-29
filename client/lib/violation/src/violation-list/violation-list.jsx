import React from 'react';
import Icon from 'react-fa';
import Infinite from 'react-infinite-scroll';
import Tabs from 'react-tabs';
import moment from 'moment';
import lzw from 'lz-string';
import {merge} from 'common/src/util';
import Datepicker from 'common/src/datepicker.jsx';
import Clipboard from 'react-copy-to-clipboard';
import AccountOverview from 'violation/src/violation-overview-account/violation-overview-account.jsx';
import AccountSelector from 'violation/src/account-selector.jsx';
import ViolationAnalysis from 'violation/src/violation-analysis/violation-analysis.jsx';
import Violation from 'violation/src/violation-detail/violation-detail.jsx';
import 'promise.prototype.finally';
import 'common/asset/less/violation/violation-list.less';

const InfiniteList = Infinite(React);

class ViolationList extends React.Component {
    constructor(props, context) {
        super();
        this.stores = {
            fullstop: props.fullstopStore,
            team: props.teamStore,
            user: props.userStore
        };
        this.actions = props.fullstopActions;
        // make initial list of accounts
        let searchParams = this.stores.fullstop.getSearchParams(),
            selectableAccounts = this.stores.team.getAccounts(), // these we can in theory select
            activeAccountIds = searchParams.accounts, // these are actively searched for
            selectedAccounts = this.stores.user.getUserCloudAccounts(), // these the user has access to
            inspectedAccount = searchParams.inspectedAccount, // this the user has selected for the chart
            activeTab = searchParams.activeTab;

        // if there are no active account ids, use those of selected accounts
        // otherwise select accounts with active account ids
        //
        // GOD is this confusing
        if (activeAccountIds.length) {
            Array.prototype.push.apply(selectedAccounts, selectableAccounts.filter(a => activeAccountIds.indexOf(a.id) >= 0));
            // deduplicate
            selectedAccounts = selectedAccounts
                                .reduce((accs, cur) => {
                                    if (accs.map(a => a.id).indexOf(cur.id) < 0) {
                                        accs.push(cur);
                                    }
                                    return accs;
                                },
                                []);
            inspectedAccount = inspectedAccount || selectedAccounts[0].id;
            this.updateSearch({
                inspectedAccount,
                activeTab: activeTab || 0
            }, context);
        } else {
            Array.prototype.push.apply(activeAccountIds, selectedAccounts.map(a => a.id));
            this.updateSearch({
                accounts: activeAccountIds,
                inspectedAccount: inspectedAccount || activeAccountIds[0],
                activeTab: activeTab || 0
            }, context);
        }
        this.state = {
            selectedAccounts,
            dispatching: false,
            shortUrl: ''
        };
    }

    /**
     * Updates search parameters in fullstop store and query params in route.
     * @param  {Object} params  The new params
     * @param  {Object} context Router context
     */
    updateSearch(params, context = this.context) {
        this.actions.deleteViolations();
        this.actions.updateSearchParams(params);
        Object.keys(params).forEach(k => {
            if (moment.isMoment(params[k])) {
                // dates have to parsed to timestamp again
                params[k] = params[k].toISOString();
            }
        });
        context.router.transitionTo('violation-vioList', {}, merge(context.router.getCurrentQuery(), params));
    }

    toggleAccount(activeAccountIds) {
        // check if inspected account is still among active account ids
        let params = this.stores.fullstop.getSearchParams(),
            {inspectedAccount} = params;
        if (inspectedAccount) {
            if (activeAccountIds.indexOf(inspectedAccount) < 0) {
                // IT IS NOT
                inspectedAccount = activeAccountIds[0] || null;
            }
        } else {
            inspectedAccount = activeAccountIds[0] || null;
        }
        this.updateSearch({
            accounts: activeAccountIds,
            page: 0,
            inspectedAccount
        });
    }

    showSince(day) {
        this.updateSearch({
            from: moment(day),
            page: 0
        });
    }

    showUntil(day) {
        this.updateSearch({
            to: moment(day),
            page: 0
        });
    }

    /**
     * Used by infinite list, used to fetch next page of results.
     *
     * @param  {Number} page The page to fetch
     */
    loadMore(page) {
        // we get an error if we don't track this ;_;
        if (!this.state.dispatching) {
            this.setState({
                dispatching: true
            });
            this.actions.updateSearchParams({
                page: page
            });
            this.actions
            .fetchViolations(this.stores.fullstop.getSearchParams())
            .finally(() => {
                this.setState({
                    dispatching: false
                });
            });
        }
    }

    _handleCopy() {
        this.props.notificationActions.addNotification('Copied URL to clipboard', 'info');
    }

    _selectTab(current) {
        this.updateSearch({
            activeTab: current
        });
    }

    _toggleShowResolved(type) {
        let searchParams = this.stores.fullstop.getSearchParams(),
            newParams = {};
        newParams['show' + type] = !searchParams['show' + type];
        newParams.page = 0;
        this.updateSearch(newParams);
    }

    render() {
        let searchParams = this.stores.fullstop.getSearchParams(),
            {selectedAccounts} = this.state,
            selectableAccounts = this.stores.team.getAccounts(),
            activeAccountIds = searchParams.accounts,
            showingSince = searchParams.from.toDate(),
            showingUntil = searchParams.to.toDate(),
            violations = this.stores.fullstop.getViolations(activeAccountIds).map(v => v.id),
            pagingInfo = this.stores.fullstop.getPagingInfo(),
            shareURL = '/violation/v/' + lzw.compressToEncodedURIComponent(JSON.stringify(searchParams)),
            violationCards = violations.map(v => <Violation
                                                    key={v}
                                                    fullstopStore={this.props.fullstopStore}
                                                    fullstopActions={this.props.fullstopActions}
                                                    userStore={this.props.userStore}
                                                    violationId={v} />);
        return <div className='violationList'>
                    <h2 className='violationList-headline'>Violations</h2>
                    <div className='u-info'>
                        Violations of the STUPS policy and bad practices in accounts you have access to.
                    </div>
                    <div>
                        Show violations between:
                    </div>
                    <div className='violationList-datepicker'>
                        <Datepicker
                            onChange={this.showSince.bind(this)}
                            selectedDay={showingSince} />
                        <Datepicker
                            onChange={this.showUntil.bind(this)}
                            selectedDay={showingUntil} />
                    </div>
                    <small>You can filter by resolved or unresolved violations.</small>
                    <div className='btn-group'>
                        <div
                            data-selected={searchParams.showResolved}
                            onClick={this._toggleShowResolved.bind(this, 'Resolved')}
                            className='btn btn-default'>
                            <Icon name='check-circle' /> Show resolved
                        </div>
                        <div
                            data-selected={searchParams.showUnresolved}
                            onClick={this._toggleShowResolved.bind(this, 'Unresolved')}
                            className='btn btn-default'>
                            <Icon name='circle-o' /> Show unresolved
                        </div>
                    </div>
                    <AccountSelector
                        selectableAccounts={selectableAccounts}
                        selectedAccounts={selectedAccounts}
                        activeAccountIds={activeAccountIds}
                        onToggleAccount={this.toggleAccount.bind(this)} />

                    <Clipboard
                        onCopy={this._handleCopy.bind(this)}
                        text={window.location.origin + shareURL}>
                        <div className='btn btn-default'>
                            <Icon name='bullhorn' /> Copy sharing URL
                        </div>
                    </Clipboard>

                    <Tabs.Tabs
                        onSelect={this._selectTab.bind(this)}
                        selectedIndex={searchParams.activeTab}>
                        <Tabs.TabList>
                            <Tabs.Tab>Cross-Account Analysis</Tabs.Tab>
                            <Tabs.Tab>Account Analysis</Tabs.Tab>
                            <Tabs.Tab>Violations</Tabs.Tab>
                        </Tabs.TabList>
                        <Tabs.TabPanel>
                            <ViolationAnalysis
                                teamStore={this.stores.team}
                                userStore={this.stores.user}
                                fullstopActions={this.actions}
                                fullstopStore={this.stores.fullstop} />
                        </Tabs.TabPanel>
                        <Tabs.TabPanel>
                            <AccountOverview
                                fullstopStore={this.props.fullstopStore} />
                        </Tabs.TabPanel>
                        <Tabs.TabPanel>
                            <div
                                data-block='violation-list'
                                className='violationList-list'>
                                <InfiniteList
                                    loadMore={this.loadMore.bind(this)}
                                    hasMore={!pagingInfo.last}
                                    loader={<Icon spin name='circle-o-notch u-spinner' />}>
                                    {violationCards}
                                </InfiniteList>
                            </div>
                        </Tabs.TabPanel>
                    </Tabs.Tabs>
                </div>;
    }
}
ViolationList.displayName = 'ViolationList';
ViolationList.propTypes = {
    fullstopStore: React.PropTypes.object.isRequired,
    teamStore: React.PropTypes.object.isRequired,
    userStore: React.PropTypes.object.isRequired,
    fullstopActions: React.PropTypes.object.isRequired,
    notificationActions: React.PropTypes.object.isRequired
};
ViolationList.contextTypes = {
    router: React.PropTypes.func.isRequired
};

export default ViolationList;
