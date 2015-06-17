import React from 'react';
import {Route, DefaultRoute} from 'react-router';
import FlummoxComponent from 'flummox/component';
import Flux from './flux';
import ViolationList from 'violation/src/violation-list/violation-list.jsx';

const VIO_FLUX = new Flux(),
    VIO_ACTIONS = VIO_FLUX.getActions('fullstop');

function requireTeam(flux) {
    const ACTIONS = flux.getActions('user'),
          STORE = flux.getStore('user');
    if (!STORE.getUserTeams().length) {
        let tokeninfo = STORE.getTokenInfo();
        if (!tokeninfo.uid) {
            return ACTIONS
                    .fetchTokenInfo()
                    .then(token => {
                        return ACTIONS.fetchUserTeams(token.uid);
                    });
        }
        return ACTIONS.fetchUserTeams(tokeninfo.uid);
    }
    return Promise.resolve();
}

class ViolationListHandler extends React.Component {
    constructor() {
        super();
    }
    render() {
        return <FlummoxComponent
                    flux={VIO_FLUX}
                    globalFlux={this.props.globalFlux}
                    connectToStores={['fullstop']}>
                    <ViolationList />
                </FlummoxComponent>;
    }
}
ViolationListHandler.displayName = 'ViolationListHandler';
ViolationListHandler.propTypes = {
    globalFlux: React.PropTypes.object.isRequired
};
ViolationListHandler.fetchData = function(state, globalFlux) {
    return requireTeam(globalFlux)
            .then(() => {
                let userStore = globalFlux.getStore('user'),
                    accounts = userStore.getUserCloudAccounts();
                VIO_ACTIONS.fetchViolations(accounts.map(a => a.id));
            });
};

const ROUTES =
    <Route name='violation-vioList' path='violation'>
        <DefaultRoute handler={ViolationListHandler} />
    </Route>;

export default ROUTES;
