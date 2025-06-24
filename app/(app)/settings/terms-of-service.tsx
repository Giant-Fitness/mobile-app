import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { AnimatedHeader } from '@/components/navigation/AnimatedHeader';
import { Colors } from '@/constants/Colors';
import { Sizes } from '@/constants/Sizes';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { useSharedValue } from 'react-native-reanimated';

const TermsOfService = () => {
    const scrollY = useSharedValue(0);
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    return (
        <ThemedView style={[styles.container, { backgroundColor: themeColors.background }]}>
            <AnimatedHeader scrollY={scrollY} disableColorChange={true} headerBackground={themeColors.background} title='Terms and Conditions' />
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.contentContainer}>
                <View style={styles.section}>
                    <ThemedText type='titleLarge' style={styles.sectionTitle}>
                        Terms and Conditions
                    </ThemedText>
                    <ThemedText type='body' style={styles.paragraph}>
                        Last updated: {new Date().toLocaleDateString()}
                    </ThemedText>
                </View>

                <View style={styles.section}>
                    <ThemedText type='title' style={styles.sectionTitle}>
                        1. Acceptance of Terms
                    </ThemedText>
                    <ThemedText type='body' style={styles.paragraph}>
                        By accessing and using the Kyn mobile application (&quot;App&quot;), you accept and agree to be bound by the terms and provision of this
                        agreement.
                    </ThemedText>
                </View>

                <View style={styles.section}>
                    <ThemedText type='title' style={styles.sectionTitle}>
                        2. Use License
                    </ThemedText>
                    <ThemedText type='body' style={styles.paragraph}>
                        Permission is granted to temporarily download one copy of the App for personal, non-commercial transitory viewing only. This is the
                        grant of a license, not a transfer of title, and under this license you may not:
                    </ThemedText>
                    <ThemedText type='body' style={styles.paragraph}>
                        • Modify or copy the materials{'\n'}• Use the materials for any commercial purpose or for any public display{'\n'}• Attempt to reverse
                        engineer any software contained in the App{'\n'}• Remove any copyright or other proprietary notations from the materials
                    </ThemedText>
                </View>

                <View style={styles.section}>
                    <ThemedText type='title' style={styles.sectionTitle}>
                        3. Disclaimer
                    </ThemedText>
                    <ThemedText type='body' style={styles.paragraph}>
                        The materials within the App are provided on an &apos;as is&apos; basis. Kyn makes no warranties, expressed or implied, and hereby
                        disclaims and negates all other warranties including without limitation, implied warranties or conditions of merchantability, fitness
                        for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                    </ThemedText>
                </View>

                <View style={styles.section}>
                    <ThemedText type='title' style={styles.sectionTitle}>
                        4. Limitations
                    </ThemedText>
                    <ThemedText type='body' style={styles.paragraph}>
                        In no event shall Kyn or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or
                        due to business interruption) arising out of the use or inability to use the App, even if Kyn or a Kyn authorized representative has
                        been notified orally or in writing of the possibility of such damage.
                    </ThemedText>
                </View>

                <View style={styles.section}>
                    <ThemedText type='title' style={styles.sectionTitle}>
                        5. Health and Safety
                    </ThemedText>
                    <ThemedText type='body' style={styles.paragraph}>
                        The App provides fitness and wellness information and guidance. You acknowledge that:
                    </ThemedText>
                    <ThemedText type='body' style={styles.paragraph}>
                        • You should consult with a healthcare professional before starting any fitness program{'\n'}• You are responsible for your own health
                        and safety during workouts{'\n'}• The App is not a substitute for professional medical advice{'\n'}• You should stop exercising
                        immediately if you experience pain or discomfort
                    </ThemedText>
                </View>

                <View style={styles.section}>
                    <ThemedText type='title' style={styles.sectionTitle}>
                        6. Privacy
                    </ThemedText>
                    <ThemedText type='body' style={styles.paragraph}>
                        Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the App, to understand our practices.
                    </ThemedText>
                </View>

                <View style={styles.section}>
                    <ThemedText type='title' style={styles.sectionTitle}>
                        7. Revisions and Errata
                    </ThemedText>
                    <ThemedText type='body' style={styles.paragraph}>
                        The materials appearing in the App could include technical, typographical, or photographic errors. Kyn does not warrant that any of the
                        materials on the App are accurate, complete or current. Kyn may make changes to the materials contained in the App at any time without
                        notice.
                    </ThemedText>
                </View>

                <View style={styles.section}>
                    <ThemedText type='title' style={styles.sectionTitle}>
                        8. Links
                    </ThemedText>
                    <ThemedText type='body' style={styles.paragraph}>
                        Kyn has not reviewed all of the sites linked to the App and is not responsible for the contents of any such linked site. The inclusion
                        of any link does not imply endorsement by Kyn of the site. Use of any such linked website is at the user&apos;s own risk.
                    </ThemedText>
                </View>

                <View style={styles.section}>
                    <ThemedText type='title' style={styles.sectionTitle}>
                        9. Modifications
                    </ThemedText>
                    <ThemedText type='body' style={styles.paragraph}>
                        Kyn may revise these terms of service for the App at any time without notice. By using the App you are agreeing to be bound by the then
                        current version of these Terms of Service.
                    </ThemedText>
                </View>

                <View style={styles.section}>
                    <ThemedText type='title' style={styles.sectionTitle}>
                        10. Governing Law
                    </ThemedText>
                    <ThemedText type='body' style={styles.paragraph}>
                        These terms and conditions are governed by and construed in accordance with the laws and you irrevocably submit to the exclusive
                        jurisdiction of the courts in that location.
                    </ThemedText>
                </View>

                <View style={styles.section}>
                    <ThemedText type='body' style={styles.paragraph}>
                        If you have any questions about these Terms and Conditions, please contact us at kynfitin@gmail.com
                    </ThemedText>
                </View>
            </ScrollView>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Sizes.headerHeight,
    },
    scrollView: {
        flex: 1,
    },
    contentContainer: {
        paddingBottom: Spaces.XXL,
    },
    section: {
        paddingHorizontal: Spaces.XL,
        paddingVertical: Spaces.MD,
    },
    sectionTitle: {
        marginBottom: Spaces.SM,
        fontWeight: '600',
    },
    paragraph: {
        lineHeight: 24,
        marginBottom: Spaces.SM,
    },
});

export default TermsOfService;
