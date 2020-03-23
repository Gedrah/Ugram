import * as React from 'react';
import {Dropdown, Icon} from 'react-materialize';
import {Link, Route} from "react-router-dom";
import Notifications from "../models/Notifications";
import {Auth} from "../models/Auth";
import * as Cookies from 'js-cookie';
import {observer} from "mobx-react";
import NotificationBadge from 'react-notification-badge';
import * as ReactGA from "react-ga";

require('../scss/navigation.scss');

export interface NavigationState {
    checkBackgroundImage: any;
}

@observer
export class Navigation extends React.Component<NavigationState> {
    private auth;
    private notifications;
    private notifList = [];
    private notifContainer = {
        display: 'inline-block',
    };

    constructor(props) {
        super(props);
        this.auth = new Auth();
        this.notifications = new Notifications();
        this.state =  {
            isActive: false,
            notifList: []
        };
    }

    async componentWillMount() {
        if (Cookies.get("UGramUserId") !== undefined
            && Cookies.get("UGramAccessToken") !== undefined)
            await this.notifications.setAllNotifications();
    }

    validateSelectedNotification(history, notif) {
        this.notifications.validateNotification(notif.id).then((notifList) => {
            this.notifList = notifList;
            this.setState(() => {
                return {
                    notifList: this.notifList
                }
            });
            history.push(`/image?id=${notif.userId}&pictureId=${notif.pictureId}`);
        })
    }

    async checkProfileDropdown() {
        if (Cookies.get("UGramUserId") !== undefined
            && Cookies.get("UGramAccessToken") !== undefined) {
            await this.getAllNotifications();
        } else {
            this.setState(() => {
                return {
                    isActive: false
                }
            });
        }
    }

    async getAllNotifications() {
        this.notifList = await this.notifications.getAllNotifications();
        this.setState(() => {
            return {
                notifList: this.notifList,
                isActive: true
            }
        });
    }

    async componentDidMount() {
        await this.checkProfileDropdown();
    }

    getNotifItem(notifications) {
        if (notifications) {
            return notifications.map((notification) =>
                <div key={notification.id}>
                    {!notification.viewed && <Route render={({history}) => (
                        <li><a className={!notification.viewed ? 'notification-text-color' : ''}
                               onClick={() => this.validateSelectedNotification(history, notification)}>new {notification.typeNotif}</a>
                        </li>
                    )}/>}
                </div>
            );
        } else {
            return "";
        }
    }

    getNotifCount(notifs: any) {
        let count = 0;

        if (notifs && notifs !== undefined) {
            notifs.map((notif) => {
                if (!notif.viewed)
                    count++;
            });
        }
        return count;
    }

    logout(history) {
        this.auth.logout({userId: Cookies.get("UGramUserId")}).then(() =>{
            console.log("here");
            this.props.checkBackgroundImage();
            ReactGA.event({category: 'User', action: 'Logout'});
            this.checkProfileDropdown();
            history.push('/auth');
        });
    }


    render() {
        let notifications = this.notifications.NotificationsInstance;
        return (
            <div>
                <div className={'teal darken-1 navbar-top'}>
                    <Link to="/"><span>UGram</span></Link>
                    {this.state['isActive'] && notifications && <Link to="/search"><Icon className={'large-icon'}>search</Icon></Link>}
                    {this.state['isActive'] && notifications && <Dropdown trigger={
                        <a style={this.notifContainer}>
                            <NotificationBadge className={'notification-icon'} count={this.getNotifCount(notifications)}/>
                            <Icon className={'large-icon'}>notifications</Icon>
                        </a>}>
                        {notifications && this.getNotifItem(notifications)}
                        {notifications && this.getNotifCount(notifications) === 0 ? <li><a>None</a></li> : ''}
                    </Dropdown>}

                    {this.state['isActive'] && notifications && <Dropdown trigger={<a><Icon className={'large-icon'}>person</Icon></a>}>
                        <li><Link to="/profile">Your Profile</Link></li>
                        <Route render={({history}) => (
                            <li><a onClick={() => this.logout(history)}>Log Out</a></li>
                        )} />
                    </Dropdown>}
                </div>
            </div>
        );
    }
}

