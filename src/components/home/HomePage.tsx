import * as React from 'react';
import {observer} from "mobx-react";
import {LatestPosts} from "../image/LatestPosts";
import {PaginationComponent} from "./PaginationComponent";
import Home from "../../models/Home";
import * as ReactGA from "react-ga";

require('../../scss/home.scss');

interface HomePageProps {
    checkNotification: any
}

@observer
export class HomePage extends React.Component<HomePageProps> {
    private globalImagesModel;
    private currentPage = 1;

    constructor(props) {
        super(props);
        this.globalImagesModel = new Home();
    }

    async componentWillMount() {
        this.props.checkNotification();
        ReactGA.pageview(window.location.pathname + window.location.search);
        await this.globalImagesModel.setGlobalImages(this.currentPage);
    }

    async getGlobalImages(page) {
        this.currentPage = page;
        await this.globalImagesModel.getGlobalImages(this.currentPage);
    }

    render() {
        const globalImages = this.globalImagesModel.GlobalImagesInstance;
        return (
            <div className={'home-tabs'}>
                <div className={'home-pagination'}>
                    <PaginationComponent currentPage={this.currentPage} updatePictureList={(page) => this.getGlobalImages(page)}/>
                </div>
                <LatestPosts imageList={globalImages}/>
                <div className={'home-pagination'}>
                    <PaginationComponent currentPage={this.currentPage} updatePictureList={(page) => this.getGlobalImages(page)}/>
                </div>
            </div>
        )
    }
}
