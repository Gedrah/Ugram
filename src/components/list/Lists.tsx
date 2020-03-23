import * as React from 'react';
import {ListItem} from "./ListItem";
import {Collection} from 'react-materialize';

export interface ListsProps {
    listType: string;
    list?: Array<Object>;
}

export class Lists extends React.Component<ListsProps> {

    listItems = [];

    constructor(props) {
        super(props);
    }

    updateList(): void {
        this.listItems = [];
        if (this.props.list) {
            this.props.list.forEach((item, index) =>
                this.listItems.push(
                    <ListItem type={this.props.listType}
                              key={index}
                              object={item}
                    />
                )
            );
        }
    }

    render() {
        this.updateList();
        return (
            <Collection>
                {this.listItems}
            </Collection>
        )
    }
}
