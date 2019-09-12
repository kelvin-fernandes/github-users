import React, { Component } from 'react';
import { TouchableWithoutFeedback } from 'react-native';
import PropTypes from 'prop-types';

import api from '../../services/api';

import {
    Container,
    Header,
    Avatar,
    Name,
    Bio,
    Stars,
    Starred,
    OwnerAvatar,
    Info,
    Title,
    Author,
    ActivityIndicator
} from './styles';

export default class User extends Component {
    static navigationOptions = ({ navigation }) => ({
        title: navigation.getParam('user').name
    });

    static propTypes = {
        navigation: PropTypes.shape({
            getParam: PropTypes.func,
            navigate: PropTypes.func
        }).isRequired
    };

    state = {
        stars: [],
        user: {},
        links: {},
        loading: false,
        refreshing: false
    };

    async componentDidMount() {
        const { navigation } = this.props;
        const user = navigation.getParam('user');

        await this.setState({ loading: true, user });

        await this.initialStateStarredRepoList();
    }

    initialStateStarredRepoList = async () => {
        const { user } = this.state;

        const response = await api.get(`/users/${user.login}/starred`);

        const responseLinks = await this.handleResponseLink(response);

        this.setState({
            stars: response.data,
            links: responseLinks,
            loading: false
        });
    };

    handleResponseLink = response => {
        if (!response.headers.link) return;

        const links = response.headers.link
            .replace(new RegExp('<', 'g'), '')
            .replace(new RegExp('>;', 'g'), '')
            .replace(new RegExp('rel=', 'g'), '')
            .replace(new RegExp('"', 'g'), '')
            .replace(new RegExp(',', 'g'), '')
            .replace(new RegExp('https://api.github.com', 'g'), '')
            .split(' ');

        const dict = {};
        for (let i = 1; i < links.length; i += 2) {
            const key = links[i];
            dict[key] = links[i - 1];
        }

        return dict;
    };

    refreshList = async () => {
        this.setState({ refreshing: true });

        await this.initialStateStarredRepoList();

        this.setState({ refreshing: false });
    };

    loadMore = async () => {
        const { stars, links } = this.state;

        if (!links || (links && (!links.next || !links.last))) return;

        const response = await api.get(links.next);

        const responseLinks = await this.handleResponseLink(response);

        this.setState({
            stars: [...stars, ...response.data],
            links: responseLinks,
            loading: false
        });
    };

    handleNavigate = repository => {
        const { navigation } = this.props;

        // console.tron.log(repository);
        navigation.navigate('Repository', { repository });
    };

    render() {
        const { stars, user, loading, refreshing } = this.state;

        return (
            <Container>
                <Header>
                    <Avatar source={{ uri: user.avatar }} />
                    <Name>{user.name}</Name>
                    <Bio>{user.bio}</Bio>
                </Header>

                {loading ? (
                    <ActivityIndicator />
                ) : (
                    <Stars
                        data={stars}
                        keyExtractor={star => String(star.id)}
                        onEndReachedThreshold={0.1}
                        onEndReached={this.loadMore}
                        onRefresh={this.refreshList}
                        refreshing={refreshing}
                        renderItem={({ item }) => (
                            <TouchableWithoutFeedback
                                onPress={() => this.handleNavigate(item)}
                            >
                                <Starred>
                                    <OwnerAvatar
                                        source={{ uri: item.owner.avatar_url }}
                                    />
                                    <Info>
                                        <Title>{item.name}</Title>
                                        <Author>{item.owner.login}</Author>
                                    </Info>
                                </Starred>
                            </TouchableWithoutFeedback>
                        )}
                    />
                )}
            </Container>
        );
    }
}
