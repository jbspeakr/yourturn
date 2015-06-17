/* globals expect, $, TestUtils, reset, render, React */
import {Flummox} from 'flummox';
import KioStore from 'common/src/data/kio/kio-store';
import KioActions from 'common/src/data/kio/kio-actions';
import TwintipStore from 'common/src/data/twintip/twintip-store';
import TwintipActions from 'common/src/data/twintip/twintip-actions';
import UserStore from 'common/src/data/user/user-store';
import UserActions from 'common/src/data/user/user-actions';
import Detail from 'application/src/application-detail/application-detail.jsx';

const APP = 'kio',
      API = 'twintip',
      ID = 'kio';

class MockFlux extends Flummox {
    constructor() {
        super();

        this.createActions(APP, KioActions);
        this.createStore(APP, KioStore, this);

        this.createActions(API, TwintipActions);
        this.createStore(API, TwintipStore, this);
    }
}

class GlobalFlux extends Flummox {
    constructor() {
        super();

        this.createActions('user', UserActions);
        this.createStore('user', UserStore, this);
    }
}

describe('The application detail view', () => {
    var flux,
        globalFlux,
        TEST_APP,
        props,
        detail;

    beforeEach(() => {
        reset();
        flux = new MockFlux();
        globalFlux = new GlobalFlux();
        flux.getStore(API).receiveApi({
            application_id: ID
        });
        TEST_APP = {
            documentation_url: 'https://github.com/zalando-stups/kio',
            scm_url: 'https://github.com/zalando-stups/kio.git',
            service_url: 'https://kio.example.org/',
            description: '# Kio',
            subtitle: 'STUPS application registry',
            name: 'Kio',
            active: true,
            team_id: 'stups',
            id: ID
        };
        props = {
            flux: flux,
            globalFlux: globalFlux,
            applicationId: ID
        };
        detail = render(Detail, props);
    });

    it('should display a placeholder when the application is Pending', () => {
        flux.getStore(APP).beginFetchApplication(ID);
        detail = render(Detail, props);
        let placeholders = TestUtils.scryRenderedDOMComponentsWithClass(detail, 'u-placeholder');
        expect(placeholders.length).to.equal(1);
    });

    it('should not a display a placeholder when the api is Pending', () => {
        flux.getStore(APP).receiveApplication(TEST_APP);
        flux.getStore(API).beginFetchApi(ID);
        detail = render(Detail, props);
        let placeholders = TestUtils.scryRenderedDOMComponentsWithClass(detail, 'u-placeholder');
        expect(placeholders.length).to.equal(0);
    });

    it('should display an inactive badge when the application is inactive', () => {
        TEST_APP.active = false;
        flux.getStore(APP).receiveApplication(TEST_APP);
        detail = render(Detail, props);
        let inactiveBadges = TestUtils.scryRenderedDOMComponentsWithAttributeValue(detail, 'data-block', 'inactive-badge');
        expect(inactiveBadges.length).to.equal(1);
    });

    it('should not display a badge when the application is active', () => {
        flux.getStore(APP).receiveApplication(TEST_APP);
        detail = render(Detail, props);
        let inactiveBadges = TestUtils.scryRenderedDOMComponentsWithAttributeValue(detail, 'data-block', 'inactive-badge');
        expect(inactiveBadges.length).to.equal(0);
    });

    it('should contain rendered markdown', () => {
        flux.getStore(APP).receiveApplication(TEST_APP);
        detail = render(Detail, props);
        expect($(React.findDOMNode(detail)).find('[data-block="description"] h1').length).to.equal(1);
    });
});