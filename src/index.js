import React from 'react';
import { StatusBar } from 'react-native';

import './config/ReactotronConfig';

import Routes from './routes';

export default () => {
    return (
        <>
            <StatusBar barStyle="light-content" backgroundColor="#3b5ab0" />
            <Routes />
        </>
    );
};
