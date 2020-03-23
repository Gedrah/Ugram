import * as React from "react";
import {withRouter} from 'react-router';
import {Redirect} from 'react-router-dom'
import {Auth} from "../../models/Auth";

interface PropsWithRouter {
    location,
    router,
}

export default function requireAuth(Component) {
    class AuthComponent extends React.PureComponent<PropsWithRouter> {
        private auth;
        private isMount = false;

        constructor(props) {
            super(props);
            this.auth = new Auth();
            this.state = {
                renderedComponent: ""
            }
        }

        componentDidMount(): void {
            this.isMount = true;
            this.checkAuth();
        }

        componentWillUnmount(): void {
            this.isMount = false;
        }

        async checkAuth() {
            const location = this.props.location;
            const redirect = location.pathname + location.search;

            await Auth.verifyToken().then(valid => {
                if (valid) {
                    if (this.isMount) {
                        this.setState({
                            renderedComponent: <Component { ...this.props } />,
                        })
                    }
                } else {
                    if (this.isMount) {
                        this.setState({
                            renderedComponent: <Redirect to={"/auth?redirect=" + redirect}/>,
                        })
                    }
                }
            }).catch(() => {
                if (this.isMount) {
                    this.setState({
                        renderedComponent: <Redirect to={"/auth?redirect=" + redirect}/>,
                    })
                }
            });
        }

        render() {
            return this.state['renderedComponent'];
        }
    }

    return withRouter(AuthComponent);
}
