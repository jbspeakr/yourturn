import {combineReducers} from 'redux';
import applications from './application-store';
import versions from './version-store';
import approvals from './approval-store';

var KioStore = combineReducers({
    applications,
    versions,
    approvals
});

export default KioStore;
