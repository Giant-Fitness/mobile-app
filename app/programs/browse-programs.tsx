import React, { useEffect } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { useSharedValue } from 'react-native-reanimated';
import { AnimatedHeader } from '@/components/navigation/AnimatedHeader';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { Spaces } from '@/constants/Spaces';
import { AppDispatch, RootState } from '@/store/rootReducer';
import { getAllProgramsAsync } from '@/store/programs/thunks';
import { REQUEST_STATE } from '@/constants/requestStates';
import { BasicSplash } from '@/components/base/BasicSplash';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProgramCard } from '@/components/programs/ProgramCard';

export default function BrowseProgramsScreen() {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];
    const dispatch = useDispatch<AppDispatch>();
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const userProgramProgress = useSelector((state: RootState) => state.user.userProgramProgress);
    const userProgramProgressState = useSelector((state: RootState) => state.user.userProgramProgress);
    const { programs, allProgramsState } = useSelector((state: RootState) => state.programs);

    React.useEffect(() => {
        navigation.setOptions({ headerShown: false });
    }, [navigation]);

    useEffect(() => {
        if (allProgramsState === REQUEST_STATE.IDLE) {
            dispatch(getAllProgramsAsync());
        }
    }, [dispatch, allProgramsState]);

    if (allProgramsState !== REQUEST_STATE.FULFILLED && userProgramProgressState !== REQUEST_STATE.FULFILLED) {
        return <BasicSplash />;
    }

    const navigateToProgramOverview = (programId: string) => {
        navigation.navigate('programs/program-overview', {
            programId: programId,
        });
    };

    const keyExtractor = (item: any) => item.ProgramId;

    const renderItem = ({ item }: { item: any }) => (
        <ProgramCard
            program={item}
            isActive={item.ProgramId === userProgramProgress?.ProgramId}
            onPress={() => navigateToProgramOverview(item.ProgramId)}
            activeProgramUser={userProgramProgress?.ProgramId}
            recommendedProgram={false}
        />
    );

    const renderHeader = () => (
        <ThemedView style={[styles.infoContainer, { marginTop: Spaces.SM }, userProgramProgress.ProgramId && { marginTop: insets.top + Spaces.XXL }]}>
            <ThemedText type='bodySmall' style={[styles.infoText, { color: themeColors.subText }]}>
                Programs are multi-week routines, designed to help you achieve your goals
            </ThemedText>
        </ThemedView>
    );

    return (
        <ThemedView style={[styles.mainContainer, { backgroundColor: themeColors.background }]}>
            {userProgramProgress?.ProgramId && <AnimatedHeader disableColorChange={true} title='Browse Programs' headerBackground={themeColors.background} />}
            <FlatList
                data={Object.values(programs)}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                ListHeaderComponent={renderHeader}
                contentContainerStyle={[
                    styles.contentContainer,
                    { backgroundColor: themeColors.background },
                    userProgramProgress?.ProgramId && { paddingBottom: Spaces.XXL },
                ]}
                showsVerticalScrollIndicator={false}
            />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
    },
    contentContainer: {
        flexGrow: 1,
        paddingBottom: Spaces.MD,
        marginHorizontal: Spaces.LG,
    },
    infoContainer: {
        paddingTop: Spaces.MD,
        paddingBottom: Spaces.XL,
        marginHorizontal: Spaces.XXL,
    },
    infoText: {
        textAlign: 'center',
    },
});
