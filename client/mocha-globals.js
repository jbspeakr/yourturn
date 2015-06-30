/* global global, require */
var chai = require('chai'),
    sinon = require('sinon'),
    domino = require('domino'),
    assign = require('object-assign'),
    HTML = '<!doctype html><html><body></body></html>',
    React = require('react/addons'),
    TestUtils = require('react-testutils-additions'),
    Mitm = require('mitm'),
    OAuth = require('oauth2-client-js'),
    localStorage = new OAuth.MemoryStorage();

// necessary because when React is loaded it looks for a window
// if it's not available, this result is stored
// however we create a virtual window further down
// so override that
//
// http://stackoverflow.com/a/26872245
require('react/lib/ExecutionEnvironment').canUseDOM = true;


/**
 * STUB ROUTER
 */
var RouterStub = function () {};
assign(RouterStub, {
    makePath: sinon.spy(),
    makeHref: sinon.spy(),
    transitionTo: sinon.spy(),
    replaceWith: sinon.spy(),
    goBack: sinon.spy(),
    getCurrentPath: sinon.spy(),
    getCurrentRoutes: sinon.spy(),
    getCurrentPathname: sinon.spy(),
    getCurrentParams: sinon.spy(),
    getCurrentQuery: sinon.spy(),
    isActive: sinon.spy(),
    getRouteAtDept: sinon.spy(),
    setRouteComponentAtDepth: sinon.spy()
});

var Wrapper = function (Component, props) {
    return React.createClass({
        childContextTypes: {
            router: React.PropTypes.func
        },
        getChildContext: function () {
            return {
                router: RouterStub
            };
        },
        render: function () {
            return React.createElement(Component, props);
        }
    });
};

TestUtils.findRenderedDOMComponentWithAttributeValue = function (component, attr, val) {
    var doms = TestUtils.scryRenderedDOMComponentsWithAttributeValue(component, attr, val);
    if (doms.length > 1) {
        throw new Error('More than one element with attribute ' + attr + '=' + val + ' found!');
    }
    if (doms.length === 0) {
        throw new Error('No element with attribute ' + attr + '=' + val + ' found!');
    }
    return doms[0];
};

localStorage.set('stups-access_token', 'access_token');
global.window = {
    localStorage: localStorage
};

global.render = function (Component, props) {
    var clazz = Wrapper(Component, props),
        element = React.createElement(clazz),
        component;
    try {
        component = TestUtils.renderIntoDocument(element);
    } catch (e) {
        console.log(e.stack); //eslint-disable-line
        throw e;
    }
    return component;
};

global.reset = function () {
    global.window = domino.createWindow(HTML);
    global.document = global.window.document;
    global.$ = require('jquery'); // needs a document
    global.window.localStorage = localStorage;
    global.navigator = {
        userAgent: 'mocha'
    };
};

// globals for tests
global.sinon = sinon;
global.expect = chai.expect;
global.Mitm = Mitm;
global.TestUtils = TestUtils;
global.React = React;
// these are set by env.js in production
global.YTENV_TWINTIP_BASE_URL = '';
global.YTENV_KIO_BASE_URL = '';
global.YTENV_MINT_BASE_URL = '';
global.YTENV_ESSENTIALS_BASE_URL = '';
global.YTENV_PIERONE_BASE_URL = '';
global.YTENV_FULLSTOP_BASE_URL = '';
global.YTENV_OAUTH_CLIENT_ID = '';
global.YTENV_OAUTH_AUTH_URL = '';
global.YTENV_OAUTH_TOKENINFO_URL = '';
global.YTENV_OAUTH_REDIRECT_URI = '';
global.YTENV_OAUTH_SCOPES = '';
global.YTENV_SERVICE_URL_TLD = '';
global.YTENV_DOCKER_REGISTRY = '';
global.YTENV_RESOURCE_WHITELIST = '';
global.YTENV_USER_REPLACEMENT_MAP = '';
