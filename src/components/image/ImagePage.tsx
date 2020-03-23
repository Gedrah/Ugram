import * as React from 'react';
import {Button, Card, Icon, MediaBox} from 'react-materialize';
import ImageManager from "../../models/ImageManager";
import {observer} from "mobx-react";
import {Lists} from "../list/Lists";
import * as Cookies from 'js-cookie';
import * as ReactGA from "react-ga";

require("../../scss/image.scss");

interface ImagePageProps {
    checkNotification: any
}

@observer
export class ImagePage extends React.Component<ImagePageProps> {
    private pictureId;
    private userId;
    private image;
    private commentToSend;
    private likesNumber = 0;
    private isLiked = false;

    constructor(props) {
        super(props);
        const params = new URLSearchParams(props.location.search);
        this.userId = params.get('id');
        this.pictureId = params.get('pictureId');
        this.image = new ImageManager(this.userId, this.pictureId);
    };

    async componentWillMount() {
        await this.image.getCurrentImageCommentaries();
        await this.image.getCurrentImageLikes();
        const likes = this.image.LikesInstance;
        this.props.checkNotification();
        this.isMyLike(likes);
        this.likesNumber = likes.length;
        ReactGA.pageview(window.location.pathname + window.location.search);
    }

    async componentDidMount() {
        await this.image.setCurrentImage();
        window.addEventListener('resize', () => this.forceUpdate());
    }

    private onCommentInputListener(e) {
        this.commentToSend = e.currentTarget.value;
    }

    sendComments() {
        this.image.sendComment({pictureId : this.pictureId, userId: Cookies.get("UGramUserId"), content: this.commentToSend}, this.pictureId).then(() => {
            ReactGA.event({category: 'Social', action: 'Send comment on an image : ' + this.pictureId});
            this.clearComment();
            this.props.checkNotification();
        });
    }

    deleteComments(commentaryId, image) {
        image.removeComment(commentaryId).then(() => {
            this.props.checkNotification();
        });
    }

    isMyLike(likes) {
        likes.map((item) => {
            if (item.like_idUser === Cookies.get("UGramUserId")) {
                this.setLike(true);
            }
        });
    }

    setComments(comments) {
        comments.map((item) => {
            item.callback = this.deleteComments;
            item.imageInstance = this.image;
        })
    }

    clearComment() {
        const inputs = document.getElementsByTagName("input");

        for (let i = 0; i < inputs.length; ++i) {
            inputs.item(i).value = "";
            inputs.item(i).className = "";
            inputs.item(i).autofocus = false;
        }
        this.commentToSend = "";
    }

    setLike(value) {
        this.isLiked = value;
        this.forceUpdate();
    }

    pictureLiked() {
        if (!this.isLiked) {
            this.image.sendLike({pictureId : this.pictureId, userId: this.userId}, this.pictureId).then(() => {
                ReactGA.event({category: 'Social', action: 'Liked an image : ' + this.pictureId});
                this.setLike(true);
                this.props.checkNotification();
            });
        } else {
            this.image.removeLike({pictureId : this.pictureId, userId: this.userId}, this.pictureId).then(() => {
                this.setLike(false);
                this.props.checkNotification();
            });
        }
    }

    render() {
        const currentImage = this.image.ImageInstance;
        const commentaries = this.image.CommentariesInstance;
        const likes = this.image.LikesInstance;
        if (commentaries) {
            this.setComments(commentaries);
        }
        if (currentImage) {
            return (
                <div>
                    <Card horizontal={window.innerWidth > 800}
                          header={<MediaBox src={currentImage.url}
                                            caption={currentImage.description}
                                            width={window.innerWidth > 800 ? '100%' : '100%'}/>}>
                        <ul>
                            <li className={'image-lines'}>Description : {currentImage.description}</li>
                            <li className={'image-lines'}>Tags :
                                {currentImage.tags && currentImage.tags.map((tag, index) => {
                                    return <span key={index} className={"image-tag"}>
                                    #{tag.trim()}
                            </span>
                                })
                                }
                            </li>
                            <li className={'image-lines'}>Mentions :
                                {currentImage.mentions && currentImage.mentions.map((mention, index) => {
                                    return <span key={index} className={"image-tag"}>
                                        #{mention.trim()}
                                    </span>
                                })
                                }</li>
                        </ul>
                        <div>
                            <a className={'like-icon-link-style'} onClick={() => this.pictureLiked()}>
                                {this.isLiked ?
                                    (<Icon className={'favorite_icon'}>favorite</Icon>) :
                                    <Icon className={'favorite_icon'}>favorite_border</Icon>
                                }
                            </a>
                            <span className={'like-text-style'}>{likes && likes.length}</span>
                        </div>
                    </Card>
                    <div className={"inline-search"}>
                        <input type="text" placeholder="Add a comment..."
                               onChange={(e) => this.onCommentInputListener(e)}/>
                        <Button onClick={() => this.sendComments()}>Send</Button>
                    </div>
                    <Lists listType={"comments"} list={commentaries}/>
                </div>
            )
        } else {
            return "";
        }
    }

}
