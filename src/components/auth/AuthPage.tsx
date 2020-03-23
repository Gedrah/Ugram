import * as React from 'react';
import {Button, Card, Input, Row} from 'react-materialize';
import GoogleLogin from "react-google-login";
import {Auth} from "../../models/Auth";
import * as ReactGA from "react-ga";
import {Navigation} from "../Navigation";

require('../../scss/auth.scss');

interface AuthPageProps {
    checkProfile: any
    history: any
    checkBackgroundImage: any
}

export class AuthPage extends React.Component<AuthPageProps, any> {
    private userInfo;
    private auth;
    private redirect;
    private isMount = false;
    private errorMessageLogin = "Failed to login.";
    private clientId = process.env.GOOGLE_CLIENT_ID;
    private url = process.env.CLIENT_URL;

    constructor(props) {
        super(props);
        this.auth = new Auth();
        this.state = {
            isRegister: false,
            isFailedLogin: false
        };
        this.userInfo = {
            firstName: '',
            lastName: '',
            email: '',
            phoneNumber: '',
        };
        const params = new URLSearchParams(props.location.search);
        this.redirect = params.get('redirect');
    }

    componentWillMount() {
        this.isMount = false;
        ReactGA.pageview(window.location.pathname + window.location.search);
    }

    componentWillUnmount(): void {
        this.isMount = false;
    }

    componentDidMount() {
        this.isMount = true;
    }

    validateField() {
        let nameValid = /^[A-Za-z]+$/;
        let emailValid = (/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i);
        let phoneNumberValid = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;

        return !(!nameValid.test(this.userInfo.lastName)
            || !nameValid.test(this.userInfo.firstName)
            || !emailValid.test(this.userInfo.email)
            || !phoneNumberValid.test(this.userInfo.phoneNumber));
    }

    register() {
        if (this.validateField()) {
            const user = {
                firstName: this.userInfo.firstName,
                lastName: this.userInfo.lastName,
                email: this.userInfo.email,
                phoneNumber: this.userInfo.phoneNumber,
                id: '',
                pictureUrl: '',
            };
            this.auth.register(user).then(() => {
                if (this.isMount) {
                    ReactGA.event({category: 'User', action: 'Created an Account'});
                    this.props.checkBackgroundImage();
                    let redirection = (this.redirect ? this.redirect : "/");
                    this.props.history.push(redirection);
                    this.props.checkProfile();
                }
            });
        }
    }

    login() {
        const user = {
            email: this.userInfo.email,
        };
        this.auth.login(user).then((value) => {
            if (this.isMount) {
                if (value) {
                    ReactGA.event({category: 'User', action: 'Logged in with email'});
                    this.props.checkBackgroundImage();
                    let redirection = (this.redirect ? this.redirect : "/");
                    this.props.history.push(redirection);
                    this.props.checkProfile();
                    this.showErrorMessageLogin(value);
                } else {
                    this.showErrorMessageLogin(value);
                }
            }
        });
    }

    async registerGoogle(gResponse) {
        const user = {
            firstName: gResponse.profileObj.givenName,
            lastName: gResponse.profileObj.familyName,
            email: gResponse.profileObj.email,
            phoneNumber: '',
            id: '',
            pictureUrl: gResponse.profileObj.imageUrl,
        };
        Auth.verifyExists(user.email).then(res => {
            if (res) {
                ReactGA.event({category: 'User', action: 'Logged in with google'});
                this.userInfo.email = user.email;
                this.login()
            } else {
                this.auth.register(user).then(() => {
                    if (this.isMount) {
                        ReactGA.event({category: 'User', action: 'Registered with google'});
                        this.props.checkBackgroundImage();
                        let redirection = (this.redirect ? this.redirect : "/");
                        this.props.history.push(redirection);
                        this.props.checkProfile();
                    }
                });
            }
        }).catch(() => {
        });

    }

    setIsRegister(value: boolean) {
        this.setState(() => {
            return {
                isRegister: value
            };
        })
    }

    showErrorMessageLogin(value) {
        this.setState(() => {
            return {
                isFailedLogin: !value
            };
        })
    }

    render() {
        if (this.state['isRegister']) {
            return (
                <div className="container">
                    <div className="form">
                        <Card title="Create an Account" actions={[
                            <p key={1}>You already have an account?<span onClick={() => this.setIsRegister(false)}>Log In</span>
                            </p>
                        ]}>
                            <Row>
                                <Input s={6} label="First Name" onChange={this.handleFirstNameChange}/>
                                <Input s={6} label="Last Name" onChange={this.handleLastNameChange}/>
                                <Input s={12} label="Email Address" type="email" onChange={this.handleEmailChange}/>
                                <Input s={6} label="Phone Number" type="tel" onChange={this.handlePhoneNumberChange}/>
                                <div className="button-centered-register">
                                    <Button onClick={this.register.bind(this)}>Register</Button>
                                </div>
                            </Row>
                        </Card>
                    </div>
                </div>
            )
        } else {
            return (
                <div className="container">
                    <div className="form">
                        <Card title="Log in to an existing Account" actions={[
                            <p key={1}>You do not have an account?<span
                                onClick={() => this.setIsRegister(true)}>Sign Up</span></p>
                        ]}>
                            <Row>
                                <Input s={12} label="Email Address" type="email" onChange={this.handleEmailChange}/>
                                {this.state['isFailedLogin'] &&
                                <div className="error-login">{this.errorMessageLogin}</div>}
                                <div className="button-centered-login">
                                    <Button onClick={this.login.bind(this)}>Log In</Button>
                                    <GoogleLogin
                                        clientId={this.clientId}
                                        buttonText="Log In with Google"
                                        uxMode="popup"
                                        redirectUri={this.url}
                                        onSuccess={gResponse => this.registerGoogle(gResponse)}
                                        onFailure={() => this.showErrorMessageLogin(false)}
                                    />
                                </div>
                            </Row>
                        </Card>
                    </div>
                    <script src="https://apis.google.com/js/platform.js" async defer/>
                </div>
            )
        }
    }

    handleFirstNameChange = e => {
        this.userInfo.firstName = e.currentTarget.value;
    };

    handleLastNameChange = e => {
        this.userInfo.lastName = e.currentTarget.value;
    };

    handleEmailChange = e => {
        this.userInfo.email = e.currentTarget.value;
    };

    handlePhoneNumberChange = e => {
        this.userInfo.phoneNumber = e.currentTarget.value;
    };
}
