import {createActionTypes} from 'common/src/util';

const TYPES = [
    'BEGIN_FETCH_APPLICATIONS',
    'RECEIVE_APPLICATIONS',
    'FAIL_FETCH_APPLICATIONS',
    'BEGIN_FETCH_APPLICATION',
    'RECEIVE_APPLICATION',
    'FAIL_FETCH_APPLICATION',
    'RECEIVE_APPLICATION_VERSIONS',
    'BEGIN_FETCH_APPLICATION_VERSION',
    'RECEIVE_APPLICATION_VERSION',
    'FAIL_FETCH_APPLICATION_VERSION',
    'RECEIVE_APPROVALS',
    'RECEIVE_APPROVAL_TYPES'
];

export default createActionTypes(TYPES);