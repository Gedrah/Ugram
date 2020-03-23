import * as React from 'react';
import {observer} from "mobx-react";
import {ImageCard} from "./ImageCard";

require('../../scss/home.scss');

interface LatestPostsProps {
    imageList: any;
}

@observer
export class LatestPosts extends React.Component<LatestPostsProps> {
    render() {
        const globalImages = this.props.imageList;
        return (
            <div className="profile-page-recent-posts-style">
                {
                    globalImages && globalImages.map((picture, index) =>
                        <div key={index} className="profile-page-recent-posts-image-style">
                            <ImageCard editable={false} triggerParentUpdate={() => {}} pictureId={picture.id} mentions={picture.mentions} tags={picture.tags}
                                       url={picture.url} userId={picture.userId} description={picture.description}/>
                        </div>
                    )
                }
            </div>
        )
    }
}
