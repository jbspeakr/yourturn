import React from 'react';
import Icon from 'react-fa';
import _ from 'lodash';
import {Typeahead} from 'react-typeahead';
import fuzzysearch from 'fuzzysearch';
import 'common/asset/less/common/account-selector.less';

function filterOptionFn(input, option) {
    return input
            .trim()
            .split(' ')
            .some(term => fuzzysearch(term, option.name + option.id));
}

class AccountSelector extends React.Component {
    constructor(props) {
        super();
        this.state = {
            allAdded: props.selectedAccounts ? props.selectedAccounts.length === props.selectableAccounts.length : false,
            filter: '',
            selectedAccounts: props.selectedAccounts || []
        };
    }

    _addAll() {
        let selectedAccountIds = this.state.selectedAccounts.map(a => a.id),
            toSelect = this.props.selectableAccounts.filter(a => selectedAccountIds.indexOf(a.id) < 0);
        toSelect.forEach(this._selectAccount.bind(this));
        this.setState({
            allAdded: true
        });
    }

    _selectAccount(account) {
        let {id} = account;
        if (this.state.selectedAccounts.map(a => a.id).indexOf(id) >= 0) {
            return;
        }
        this.state.selectedAccounts.push(account);
        this.state.selectedAccounts
            .sort((a, b) => {
                    let aName = a.name.toLowerCase(),
                        bName = b.name.toLowerCase();
                    return aName < bName ?
                            -1 :
                            bName < aName ?
                                1 : 0;
                 });
        this.setState({
            selectedAccounts: this.state.selectedAccounts
        });
        let {activeAccountIds} = this.props;
        if (activeAccountIds.indexOf(account.id) < 0) {
            this.props.onToggleAccount(activeAccountIds.concat([account.id]));
        }
    }

    _toggleAccount(accountId) {
        let {activeAccountIds} = this.props,
            index = activeAccountIds.indexOf(accountId);
        if (index >= 0) {
            // drop
            activeAccountIds.splice(index, 1);
        } else {
            activeAccountIds.push(accountId);
        }
        if (typeof this.props.onToggleAccount === 'function') {
            this.props.onToggleAccount(activeAccountIds);
        }
    }

    _filter(evt) {
        this.setState({
            filter: evt.target.value
        });
    }

    render() {
        let {selectableAccounts, activeAccountIds} = this.props,
            {selectedAccounts} = this.state,
            displayedAccounts = this.state.filter ?
                                    selectedAccounts.filter(a => fuzzysearch(this.state.filter, a.name)) :
                                    selectedAccounts;
        return <div className='account-selector'>
                    <div>Show violations in accounts:</div>
                    {!this.state.allAdded ?
                        <div>
                            <div>
                                <small>You can search by name or account number or <span
                                    onClick={this._addAll.bind(this)}
                                    className='btn btn-default btn-small'>
                                    <Icon name='plus' /> Add all accounts
                                </span>
                            </small>
                            </div>
                            <div className='input-group'>
                                <Icon name='search' />
                                <Typeahead
                                    placeholder='stups-test 123456'
                                    options={selectableAccounts}
                                    displayOption={option => `${option.name} (${option.id})`}
                                    filterOption={filterOptionFn}
                                    onOptionSelected={this._selectAccount.bind(this)}
                                    maxVisible={10} />
                            </div>
                        </div>
                        :
                        <div className='input-group'>
                            <Icon name='search' />
                            <input
                                onChange={this._filter.bind(this)}
                                placeholder='Search in selected accounts'
                                type='text'/>
                        </div>}
                    <div className='account-selector-list'>
                    {_.sortBy(displayedAccounts, 'name')
                        .map(a =>
                        <label
                            key={a.id}
                            className={activeAccountIds.indexOf(a.id) >= 0 ? 'is-checked' : ''}>
                            <input
                                type='checkbox'
                                value={a.id}
                                onChange={this._toggleAccount.bind(this, a.id)}
                                defaultChecked={activeAccountIds.indexOf(a.id) >= 0}/> {a.name} <small>({a.id})</small>
                        </label>)}
                    </div>
                </div>;
    }
}
AccountSelector.displayName = 'AccountSelector';
AccountSelector.propTypes = {
    selectableAccounts: React.PropTypes.array.isRequired,
    activeAccountIds: React.PropTypes.array.isRequired,
    selectedAccounts: React.PropTypes.array,
    onToggleAccount: React.PropTypes.func.isRequired
};

export default AccountSelector;