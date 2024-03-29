import React, { Component } from 'react';
import {
    Keyboard,
    ActivityIndicator,
    TouchableWithoutFeedback
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import PropTypes from 'prop-types';

import api from '../../services/api';

import {
    Container,
    Form,
    Input,
    SubmitButton,
    List,
    User,
    Avatar,
    Name,
    Bio
} from './styles';

export default class Main extends Component {
    static navigationOptions = {
        title: 'Users'
    };

    static propTypes = {
        navigation: PropTypes.shape({
            navigate: PropTypes.func
        }).isRequired
    };

    state = {
        newUser: '',
        users: [],
        loading: false
    };

    async componentDidMount() {
        const users = await AsyncStorage.getItem('users');

        if (users) {
            this.setState({ users: JSON.parse(users) });
        }
    }

    componentDidUpdate(_, prevState) {
        const { users } = this.state;

        if (prevState.users !== users) {
            AsyncStorage.setItem('users', JSON.stringify(users));
        }
    }

    handleAddUser = async () => {
        const { newUser, users } = this.state;

        if (!newUser) return;

        this.setState({ loading: true });

        const response = await api.get(`/users/${newUser}`);

        const data = {
            name: response.data.name,
            login: response.data.login,
            bio: response.data.bio,
            avatar: response.data.avatar_url
        };

        this.setState({
            users: [...users, data],
            newUser: '',
            loading: false
        });

        Keyboard.dismiss();
    };

    handleNavigate = user => {
        const { navigation } = this.props;

        navigation.navigate('User', { user });
    };

    render() {
        const { newUser, users, loading } = this.state;

        return (
            <Container>
                <Form>
                    <Input
                        autoCorrect={false}
                        autoCapitalize="none"
                        placeholder="Type a github username"
                        onChangeText={text => this.setState({ newUser: text })}
                        value={newUser}
                        returnKeyType="send"
                        onSubmitEditing={this.handleAddUser}
                    />
                    <SubmitButton
                        loading={loading}
                        onPress={this.handleAddUser}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Icon name="add" size={20} color="#FFF" />
                        )}
                    </SubmitButton>
                </Form>

                <List
                    data={users}
                    keyExtractor={user => user.login}
                    renderItem={({ item }) => (
                        <TouchableWithoutFeedback
                            onPress={() => this.handleNavigate(item)}
                        >
                            <User>
                                <Avatar source={{ uri: item.avatar }} />
                                <Name>{item.name}</Name>
                                <Bio>{item.bio}</Bio>
                            </User>
                        </TouchableWithoutFeedback>
                    )}
                />
            </Container>
        );
    }
}
