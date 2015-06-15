import React from 'react';
import Markdown from 'common/src/markdown.jsx';
import 'common/asset/less/resource/resource-detail.less';

class ResourceDetail extends React.Component {
    constructor(props) {
        super();
        this.stores = {
            essentials: props.flux.getStore('essentials'),
            user: props.globalFlux.getStore('user')
        };

        this._forceUpdate = this.forceUpdate.bind(this);
        this.stores.user.on('change', this._forceUpdate);
    }

    componentWillUnmount() {
        this.stores.user.off('change', this._forceUpdate);
    }

    render() {
        let {essentials, user} = this.stores,
            {resourceId} = this.props,
            whitelisted = user.isWhitelisted(),
            resource = essentials.getResource(resourceId),
            scopes = essentials.getScopes(resourceId),
            appScopes = scopes.filter(s => !s.is_resource_owner_scope),
            ownerScopes = scopes.filter(s => s.is_resource_owner_scope);
        return <div className='resourceDetail'>
                    <h2>{resource.name || resourceId}</h2>
                    <div className='btn-group'>
                        <a
                            href='/resource'
                            className='btn btn-default'>
                            <i className='fa fa-chevron-left'></i> Resource Types
                        </a>
                        <a
                            href={`/resource/edit/${resource.id}`}
                            className={`btn btn-default ${ whitelisted ? '' : 'btn-disabled'}`}>
                            <i className='fa fa-pencil'></i> Edit {resource.name}
                        </a>
                        <a
                            href={`/resource/detail/${resource.id}/scope/create`}
                            className={`btn btn-primary ${ whitelisted ? '' : 'btn-disabled'}`}>
                            <i className='fa fa-plus'></i> Create Scope
                        </a>
                    </div>
                    <table className='table'>
                        <tbody>
                            <tr>
                                <th>ID</th>
                                <td>{resource.id}</td>
                            </tr>
                            <tr>
                                <th>Name</th>
                                <td>{resource.name}</td>
                            </tr>
                            <tr>
                                <th>Resource Owners</th>
                                <td>
                                    {resource.resource_owners && resource.resource_owners.length ?
                                        resource.resource_owners.map(
                                            owner => <li>{owner}</li>)
                                        :
                                        <span>Nobody owns {resource.name}.</span>}
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <div className='grid with-gutter'>
                        <div className='grid-col'>
                            <h4 className='resourceDetail-appScopeTitle'>Application Scopes</h4>
                            {appScopes.length ?
                                <ul>
                                    {appScopes.map(
                                        scope => <li key={scope.id}>
                                                    <a href={`/resource/detail/${resourceId}/scope/detail/${scope.id}`}>
                                                        {scope.id}
                                                    </a>
                                                </li>)}
                                </ul>
                                :
                                <span>No application scopes.</span>}
                        </div>
                        <div className='grid-col'>
                            <h4 className='resourceDetail-ownerScopeTitle'>Resource Owner Scopes</h4>
                            {ownerScopes.length ?
                                <ul>
                                    {ownerScopes.map(
                                        scope => <li key={scope.id}>
                                                    <a href={`/resource/detail/${resourceId}/scope/detail/${scope.id}`}>
                                                        {scope.id}
                                                    </a>
                                                </li>)}
                                </ul>
                                :
                                <span>No resource owner scopes.</span>}
                        </div>
                    </div>
                    <h4 className='resourceDetail-descriptionTitle'>Description</h4>
                    <Markdown
                        src={resource.description}
                        className='resourceDetail-description'
                        block='description' />
                </div>;
    }
}

export default ResourceDetail;