import {
    MaterialTopTabNavigationEventMap,
    MaterialTopTabNavigationOptions,
    createMaterialTopTabNavigator
} from "@react-navigation/material-top-tabs";
import { withLayoutContext } from "expo-router";
import { ParamListBase, TabNavigationState } from "@react-navigation/native";
import Constants from 'expo-constants';
import React from "react";

const { Navigator } = createMaterialTopTabNavigator();

export const MaterialTopTabs = withLayoutContext<
  MaterialTopTabNavigationOptions,
  typeof Navigator,
  TabNavigationState<ParamListBase>,
  MaterialTopTabNavigationEventMap
>(Navigator);

export default function TabLayout() {
    return (
        <MaterialTopTabs 
            // style={{ marginTop: Constants.statusBarHeight }} 
            screenOptions={{
                tabBarLabelStyle: { textTransform: 'none', fontSize: 15 }
            }}
        >
            <MaterialTopTabs.Screen name="programs" options={{ title: "Programs" }} />
            <MaterialTopTabs.Screen name="workouts" options={{ title: "Workouts" }} />
        </MaterialTopTabs>
    );
}