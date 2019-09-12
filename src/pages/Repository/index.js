import React, { Component } from 'react';
import { WebView } from 'react-native-webview';
import PropTypes from 'prop-types';

import { ActivityIndicator } from './styles';

export default class Repository extends Component {
    static navigationOptions = ({ navigation }) => ({
        title: navigation.getParam('repository').name
    });

    static propTypes = {
        navigation: PropTypes.shape({
            getParam: PropTypes.func
        }).isRequired
    };

    state = {
        repository: {},
        loading: true
    };

    async componentDidMount() {
        const { navigation } = this.props;
        const repository = navigation.getParam('repository');

        await this.setState({ repository });
    }

    render() {
        const { repository, loading } = this.state;

        return (
            <>
                <WebView
                    onLoad={() => this.setState({ loading: false })}
                    source={{ uri: repository.html_url }}
                />
                {loading && <ActivityIndicator />}
            </>
        );
    }
}
