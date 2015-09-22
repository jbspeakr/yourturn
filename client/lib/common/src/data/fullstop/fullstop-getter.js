function getPagingInfo(state) {
    return state.get('pagingInfo').toJS();
}

function getViolation(state, violationId) {
    let violation = state.getIn(['violations', String(violationId)]);
    return violation ? violation.toJS() : false;
}

function getViolations(state, accounts, resolved) {
    let violations = state.get('violations').valueSeq();

    if (violations.count() === 0) {
        return [];
    }

    // collect violations from accounts
    if (accounts) {
        violations = violations.filter(v => accounts.indexOf(v.get('account_id')) >= 0);
    }

    // filter by resolution
    if (resolved === true) {
        violations = violations.filter(v => v.get('comment') !== null);
    } else if (resolved === false) {
        violations = violations.filter(v => v.get('comment') === null);
    }
    return violations
            .sortBy(v => v.get('timestamp'))
            .toJS();
}

export {
    getViolations as getViolations,
    getViolation as getViolation,
    getPagingInfo as getPagingInfo
};