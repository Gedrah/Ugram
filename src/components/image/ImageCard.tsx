import * as React from 'react';
import {Button, Card, CardTitle, Collection, Dropdown, Icon, Input, Modal, NavItem} from 'react-materialize';
import {observer} from "mobx-react";
import ImageManager from "../../models/ImageManager";
import {ToastContainer} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import {ListItem} from "../list/ListItem";
import * as ReactGA from "react-ga";

require("../../scss/image.scss");

export interface SinglePageImageProps {
    mentions: any;
    tags: any;
    url: string;
    userId: string;
    pictureId: string;
    description: string;
    triggerParentUpdate: any;
    editable: boolean;
}

@observer
export class ImageCard extends React.Component<SinglePageImageProps> {
    private stockMentions: string;
    private stockHashtags: string;
    private image;
    private objectForm = {
        description: "",
        mentions: [],
        tags: []
    };


    constructor(props) {
        super(props);
        this.image = new ImageManager(this.props.userId, this.props.pictureId);
        this.state = {
            modalDeleteOpen: false,
            modalEditOpen: false
        };
    }

    async componentWillMount() {
        await this.image.setCurrentImage();
        await this.image.getCurrentImageLikes();
        await this.image.getCurrentImage();
    }

    componentDidMount(): void {
        window.addEventListener('resize', () => this.forceUpdate());
    }

    handlerDescriptionOnChange = e => {
        this.objectForm.description = e.currentTarget.value;
    };

    handlerMentionOnChange = e => {
        this.stockMentions = e.currentTarget.value;
    };

    handleHashtagOnChange = e => {
        this.stockHashtags = e.currentTarget.value;
    };

    deleteImage = e => {
        if (this.image) {
            this.image.deleteImage(this.props.pictureId).then(() => {
                ReactGA.event({category: 'Image', action: 'Deleted an image : ' + this.props.pictureId});
                this.setState(() => {
                    return {
                        modalDeleteOpen: false,
                        modalEditOpen: false
                    }
                });
                this.props.triggerParentUpdate();
            });
        }
    };

    editImage = e => {
        if (this.stockMentions)
            this.objectForm.mentions = this.stockMentions.split(" ");
        if (this.stockHashtags)
            this.objectForm.tags = this.stockHashtags.split(" ");
        this.image.editImage({
            description: this.objectForm.description,
            mentions: this.objectForm.mentions,
            tags: this.objectForm.tags
        }, this.props.pictureId).then(() => {
            ReactGA.event({category: 'Image', action: 'Edited an image : ' + this.props.pictureId});
            this.setState(() => {
                return {
                    modalDeleteOpen: false,
                    modalEditOpen: false
                }
            });
            this.clearObjectEditPicture();
            this.props.triggerParentUpdate();
        });
    };

    clearObjectEditPicture() {
        const inputs = document.getElementsByTagName("input");
        const labels = document.getElementsByTagName("label");

        for (let i = 0; i < labels.length; ++i) {
            labels.item(i).className = "";
        }

        for (let i = 0; i < inputs.length; ++i) {
            inputs.item(i).value = "";
            inputs.item(i).className = "";
            inputs.item(i).autofocus = false;
        }
        this.objectForm.mentions = [];
        this.objectForm.tags = [];
        this.objectForm.description = "";
    }

    render() {
        const likes = this.image.LikesInstance;
        const currentImage = this.image.ImageInstance;
        let lastCommentary = '';
        if (currentImage) {
            lastCommentary = currentImage.lastCommentary;
        }
        return (
            <Card horizontal={window.innerWidth > 800}
                  className={"card-container"}
                  header={<CardTitle className={'image-container'} image={this.props.url}/>}
                  actions={[<a key={this.props.pictureId}
                               href={"/image?id=" + this.props.userId + "&pictureId=" + this.props.pictureId}
                               className={'visualize-image-link'}>Visualize</a>]}>
                <ToastContainer autoClose={2000}/>
                <div>
                    {this.props.editable &&
                    <div className={"dropdown-right"}>
                        <span className={'user-name'}>{this.props.userId}</span>
                        <Dropdown trigger={
                            <a><Icon className={"icon-trigger"}>more_vert</Icon></a>
                        }>
                            <Modal
                                header='Edit Image'
                                actions={[
                                    <Button onClick={this.editImage}>Edit</Button>
                                ]}
                                open={this.state['modalEditOpen']}
                                trigger={<NavItem>Edit</NavItem>}>
                                <form>
                                    <Input label="Description" onChange={this.handlerDescriptionOnChange}/>
                                    <Input label="Mentions" onChange={this.handlerMentionOnChange}/>
                                    <Input label="Tags" onChange={this.handleHashtagOnChange}/>
                                </form>
                            </Modal>

                            <Modal
                                header='Delete Image'
                                actions={[
                                    <Button waves='light' className='red' onClick={this.deleteImage}>Delete</Button>
                                ]}
                                open={this.state['modalDeleteOpen']}
                                trigger={<NavItem><span className={"red-text"}>Delete</span></NavItem>}>

                                <form>
                                    <span>Do you really want to delete this image ?</span>
                                </form>
                            </Modal>
                        </Dropdown>

                    </div>
                    }
                    <ul>
                        <li className={'image-lines'}>Description : {this.props.description}</li>
                        <li className={'image-lines'}>Tags :
                            {this.props.tags && this.props.tags.map((tag, index) => {
                                return <span key={index} className={"image-tag"}>
                                    {' #' + tag.trim()}
                            </span>
                            })
                            }
                        </li>
                        <li className={'image-lines'}>Mentions :
                            {this.props.mentions && this.props.mentions.map((mention, index) => {
                                return <span key={index} className={"image-tag"}>
                                        {' @' + mention.trim()}
                                    </span>
                            })
                            }</li>
                    </ul>
                    <div>
                        <a className={'like-icon-link-style'}>
                            <Icon className={'favorite_icon'}>favorite</Icon>
                        </a>
                        <span className={'like-text-style'}>{likes && likes.length}</span>
                        {lastCommentary['user'] &&
                        <Collection>
                                <ListItem object={lastCommentary} type={'comments'}/>
                        </Collection>
                        }
                    </div>
                </div>
            </Card>
        )
    }
}
