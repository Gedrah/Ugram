import * as React from 'react';
import {Lists} from "../list/Lists";
import {Autocomplete, Button} from 'react-materialize';
import {observer} from "mobx-react";
import Search from "../../models/Search"
import * as ReactGA from "react-ga";

require('../../scss/users.scss');
require('../../scss/search.scss');

interface SearchBarProps {
    checkNotification: any
}

@observer
export class SearchBar extends React.Component<SearchBarProps> {
    private searchModel;
    protected listType = {
        'users': true,
        'tags': true,
        'descriptions': true
    };
    private pathNameForCall = "";
    private searchInput;

    private autocompleteObject : any = {};

    constructor (props) {
        super(props);
        this.searchModel = new Search();
        this.state = {
            loading: true
        }
    }

    async componentWillMount() {
        this.pathNameForCall = "?details=true&scope=users,tags,descriptions&search=";
        await this.searchModel.setLists(this.pathNameForCall, this.listType, true);
        this.props.checkNotification();
        ReactGA.pageview(window.location.pathname + window.location.search);
        this.setState({
            loading: false
        });
    }

    async searchList(value, autocomplete) {
        this.pathNameForCall = "";
        let detailsPath = "?details=";
        let input = value;

        if (!autocomplete) {
            detailsPath += "true";
        }

        this.pathNameForCall += detailsPath + "&scope=";

        if (this.listType.users == true ||
            this.listType.tags == true ||
            this.listType.descriptions == true) {

            for (let value in this.listType) {
                if (this.listType.hasOwnProperty(value)) {
                    if (this.listType[value] == true) {
                        this.pathNameForCall += value;
                        this.pathNameForCall += ",";
                    }
                }
            }
            if (this.pathNameForCall.endsWith(',')) {
                this.pathNameForCall = this.pathNameForCall.slice(0, this.pathNameForCall.length - 1);
            }
        }

        this.pathNameForCall += "&search=" + (input == undefined ? "" : input);

        await this.searchModel.setLists(this.pathNameForCall, this.listType, !autocomplete);
        this.props.checkNotification();
    }

    async handleOnAutoComplete(event) {
        (document.getElementsByClassName('autocomplete').item(0) as HTMLInputElement).value = event;
        await this.searchList((document.getElementsByClassName('autocomplete').item(0) as HTMLInputElement).value, false);
        this.forceUpdate();
    }

    async onSearchInputListener() {
        this.searchInput = (document.getElementsByClassName('autocomplete').item(0) as HTMLInputElement).value;
        await this.searchList((document.getElementsByClassName('autocomplete').item(0) as HTMLInputElement).value, true);
        this.updateAutocomplete();
        this.forceUpdate();
    }

    async getFilteredList(event) {
        if (event.key === 'Enter') {
            this.searchList((document.getElementsByClassName('autocomplete').item(0) as HTMLInputElement).value, false);
            this.forceUpdate();
        }
    }

    async changeListType() {
        let inputs = document.getElementsByTagName('input');
        for (let i = 0; i < inputs.length; i++) {
            if (inputs.item(i).type == "checkbox") {
                let value = inputs.item(i).value;
                switch (value) {
                    case 'users' :
                        this.listType.users = inputs.item(i).checked;
                        break;
                    case 'tags' :
                        this.listType.tags = inputs.item(i).checked;
                        break;
                    case 'descriptions' :
                        this.listType.descriptions = inputs.item(i).checked;
                        break;
                    case 'default' :
                        break;
                }
            }
        }
        await this.searchList(this.searchInput, true);
        this.updateAutocomplete();
        this.forceUpdate();
    }

    getListTypeForUsers() {
        return (
            <div>
                <span>Users</span>
                <Lists listType={'usersProfile'} list={this.searchModel.UserList}/>
            </div>
        );
    }

    getListTypeForImages(imageList, type) {
        return (
            <div>
                <span>{type}</span>
                <Lists listType={'images'} list={imageList}/>
            </div>
        );
    }

    updateAutocomplete() {
        this.autocompleteObject = {};
        this.searchModel.autocompleteList.forEach(item => {
            this.autocompleteObject[item] = null;
        });
    }

    renderLists() {
        if (this.state['loading'] === false && this.searchModel.ImageListByDesc && this.searchModel.ImageListByTag && this.searchModel.UserList) {
            if (this.searchModel.ImageListByDesc.length !== 0 || this.searchModel.ImageListByTag.length !== 0 || this.searchModel.UserList.length !== 0) {
                return (
                    <div>
                        {this.listType.tags == true ? this.getListTypeForImages(this.searchModel.ImageListByTag, 'Tags') : ''}
                        {this.listType.descriptions == true ? this.getListTypeForImages(this.searchModel.ImageListByDesc, 'Descriptions') : ''}
                        {this.listType.users == true ? this.getListTypeForUsers() : ''}
                    </div>
                );
            } else {
                return (
                    <div className="centered">
                        <span className="grey-text">No results found !</span>
                    </div>
                );
            }
        }
    }

    render() {
        return (
            <div className="main-div-container-style">
                <div>
                    <div className={"inline-search"}>
                        <Autocomplete type="text" placeholder="Enter your search terms"
                                      data={this.autocompleteObject}
                                      onChange={() => this.onSearchInputListener()}
                                      onAutocomplete={(event) => this.handleOnAutoComplete(event)}
                                      onKeyPress={event => this.getFilteredList(event)}
                        />
                        <Button onClick={() => this.searchList(this.searchInput, false)}>Search</Button>
                    </div>
                    <div className="inline-filters">
                        <div>
                            <input type="checkbox" id="checkboxSearchHashtag" value='tags' defaultChecked={true} onChange={() => this.changeListType()}/>
                            <label htmlFor="checkboxSearchHashtag">Tag</label>
                        </div>
                        <div>
                            <input type="checkbox" id="checkboxSearchDescription" value='descriptions' defaultChecked={true} onChange={() => this.changeListType()}/>
                            <label htmlFor="checkboxSearchDescription">Description</label>
                        </div>
                        <div>
                            <input type="checkbox" id="checkboxSearchUser" value='users' defaultChecked={true} onChange={() => this.changeListType()}/>
                            <label htmlFor="checkboxSearchUser">User</label>
                        </div>
                    </div>
                </div>
                {this.renderLists()}
            </div>
        );
    }
}
