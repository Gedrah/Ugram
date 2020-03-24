import * as React from 'react';
import {observer} from "mobx-react";
import requireAuth from "./auth/AuthGuard";
import {Navigation} from "./Navigation";
import {HomePage} from "./home/HomePage";
import {ProfilePage} from "./user/ProfilePage";
import {ImagePage} from "./image/ImagePage";
import {UserPage} from "./user/UserPage";
import {SearchBar} from "./search/SearchBar";
import {AuthPage} from "./auth/AuthPage";
import {BrowserRouter, Route} from "react-router-dom";
import * as ReactGA from 'react-ga';
import { createBrowserHistory } from "history";
import * as Cookies from "js-cookie";


require('../scss/home.scss');


export interface HistoryState {
    history: any;
    historyState: boolean;
}


@observer
export class App extends React.Component<{},HistoryState> {
    private navigation;
    private historyListener = createBrowserHistory();
    private clientAnalyticsId = process.env.GOOGLE_ANALYTICS_ID;


    constructor(props) {
        super(props);
        this.navigation = React.createRef();
        this.state = {
            history: '',
            historyState: true
        }
    }

    initializeReactGA() {
        ReactGA.initialize(this.clientAnalyticsId);
    }

    async componentWillMount() {
        if (this.historyListener.location.pathname === '/auth') {
            this.checkBackgroundImage('/auth');
        }
        this.initializeReactGA();
    }

    checkProfileDropdown() {
        this.navigation.current.checkProfileDropdown();
    }

    async getAllNotifications() {
        if (Cookies.get("UGramUserId") !== undefined
        && Cookies.get("UGramAccessToken") !== undefined) {
            await this.navigation.current.getAllNotifications();
        }
    }

    checkBackgroundImage(path) {
        this.setState(() => {
            return {
                history: path
            }
        });
    }

    render() {
        return (
            <BrowserRouter>
                <div className={this.state.history === '/auth' ? 'background-auth' : ''}>
                    <Navigation ref={this.navigation} checkBackgroundImage={() => this.checkBackgroundImage('/auth')}/>
                    <Route exact path="/" component={requireAuth((props) => <HomePage {...props} checkNotification={() => this.getAllNotifications()} />)} />
                    <Route path="/profile" render={requireAuth((props) =>
                        <ProfilePage {...props} checkNotification={() => this.getAllNotifications()} checkProfile={() => this.checkProfileDropdown()} />)} />
                    <Route path="/image" component={requireAuth((props) => <ImagePage {...props} checkNotification={() => this.getAllNotifications()} />)} />
                    <Route path="/user" component={requireAuth(UserPage)} />
                    <Route path="/search" component={requireAuth((props) => <SearchBar {...props} checkNotification={() => this.getAllNotifications()} />)} />
                    <Route path="/auth" render={(props) => <AuthPage {...props} checkProfile={() => this.checkProfileDropdown()}  checkBackgroundImage={() => this.checkBackgroundImage('')} />}/>
                </div>
            </BrowserRouter>
        )
    }
}
