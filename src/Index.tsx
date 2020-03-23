import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {App} from "./components/App";

require('./scss/app.scss');

ReactDOM.render(<App/>, document.getElementById('app'));
