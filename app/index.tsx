// app/index.tsx

import React from "react";
import { StyleSheet, SafeAreaView } from "react-native";
import { Amplify } from "aws-amplify";
import { Authenticator, withAuthenticator } from "@aws-amplify/ui-react-native";
import outputs from "../amplify_outputs.json";
import { Redirect } from 'expo-router';

Amplify.configure(outputs);

const LoginPage = () => {
    return (
        <Authenticator.Provider>
            <Authenticator>
                <Redirect href="/(tabs)/home" />
            </Authenticator>
        </Authenticator.Provider>
    );
};

const styles = StyleSheet.create({
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    button: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default withAuthenticator(LoginPage);
