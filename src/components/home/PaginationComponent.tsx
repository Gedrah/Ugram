import * as React from "react";

interface PaginationComponentProps {
    updatePictureList: any
    currentPage: number
}

require('../../scss/pagination.scss');

export class PaginationComponent extends React.Component<PaginationComponentProps> {
    constructor(props) {
        super(props);
    }

    previousPageChevron(event) {
        let previousPage = this.props.currentPage - 1;
        if (this.props.currentPage > 1)
            this.props.updatePictureList(previousPage);
    }

    nextPageChevron(event) {
        let nextPage = this.props.currentPage + 1;
        this.props.updatePictureList(nextPage);
    }

    getNumberOfPagesToDisplay() {
        let ul = [];

        if (this.props.currentPage > 1) {
            ul.push(<li key={"previousChevron"}><a className={"cursor-pages"} onClick={(event) => this.previousPageChevron(event)}><i className="material-icons">chevron_left</i></a></li>);
            let previousPage = parseFloat(`${this.props.currentPage}`) - parseFloat(`${1}`);
            ul.push(<li className="waves-effect" key={previousPage}><a>{previousPage}</a></li>);
        } else {
            ul.push(<li className="disabled" key={"previousChevron"}><a><i className="material-icons">chevron_left</i></a></li>);
        }
        ul.push(<li className="waves-effect active" key={this.props.currentPage}><a>{this.props.currentPage}</a></li>);
        ul.push(<li key={"nextChevron"}><a className={"cursor-pages"} onClick={(event) => this.nextPageChevron(event)}><i className="material-icons">chevron_right</i></a></li>);

        return ul;
    }

    render() {
        return (
            <div>
                <ul className="pagination">
                    {this.getNumberOfPagesToDisplay()}
                </ul>
            </div>
        );
    }
}
