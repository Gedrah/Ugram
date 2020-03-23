import * as React from 'react';
import {CollectionItem, Icon} from 'react-materialize';
import {ImageCard} from "../image/ImageCard";
import * as Cookies from 'js-cookie';

require('../../scss/list-item.scss');

export interface ListItemProps {
    object: any;
    type: string;
}

export class ListItem extends React.Component<ListItemProps, any> {

    componentWillMount() {
        this.setState({iconFavorite: 'favorite_border'});
    }

    commentsList() {
        return (<CollectionItem className="list-items">
                <img style={{width: '50px', height: '50px'}} src={this.props.object.user.pictureUrl ? this.props.object.user.pictureUrl : require("../../assets/favicon.png")}/>
                <a className={'commentary-text-overflow-style commentary-text-name-style'}>{this.props.object.user.firstName} {this.props.object.user.lastName}</a>
                <a className={'commentary-text-overflow-style'}>{this.props.object.content}</a>
                <a className={'favorite_icon'} onClick={() => this.deleteComment(this.props.object.callback,
                    this.props.object.id, this.props.object.imageInstance)}>
                    {this.props.object.callback && this.props.object.user.userId === Cookies.get("UGramUserId") ? (
                        <Icon className={'favorite_icon'}>remove_circle</Icon>) : ''
                    }
                </a>
            </CollectionItem>
        )
    }

    deleteComment(callback, commentaryId, imageInstance) {
        callback(commentaryId, imageInstance);
    }

    profileList() {
        return (
            <CollectionItem className="list-items">
                <img style={{width: '50px', height: '50px'}}
                     src={this.props.object.pictureUrl ? this.props.object.pictureUrl : require("../../assets/favicon.png")}/>
                <a>{this.props.object.firstName + ' ' + this.props.object.lastName}</a>
                <a href={"/user?id=" + this.props.object['userId']}><Icon className={'visit-profile-icon'}>person</Icon></a>
            </CollectionItem>
        )
    }

    imageList() {
        return (
            <CollectionItem className="list-items">
                <div className="profile-page-recent-posts-image-style">
                    <ImageCard editable={false} triggerParentUpdate={() => {}} pictureId={this.props.object.id} mentions={this.props.object.mentions} tags={this.props.object.tags}
                               url={this.props.object.url} userId={this.props.object.userId} description={this.props.object.description}/>
                </div>
            </CollectionItem>
        );
    }

    render() {
        return (
            <div>
                {this.props.type === 'comments' ? this.commentsList() : ''}
                {this.props.type === 'usersProfile' ? this.profileList() : ''}
                {this.props.type === 'images' ? this.imageList() : ''}
            </div>
        )
    }
}
