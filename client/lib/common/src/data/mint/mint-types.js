import {createActionTypes} from 'common/src/util';

const TYPES = [
    'FETCH_OAUTH_CONFIG',
    'SAVE_OAUTH_CONFIG',
    'RENEW_CREDENTIALS'
];

export default createActionTypes(TYPES);