// store/programs/mockData.ts

import { ProgramDay, Exercise, Program } from '@/types';

// Define sample exercises
const sampleExercises: Exercise[] = [
    {
        ExerciseId: 'ex-1',
        ExerciseName: 'Barbell Squat',
        Category: 'Strength',
        MuscleGroups: { Primary: ['Glutes'], Secondary: ['Hips'] },
        InstructionsDetailed: [
            'Stand with your feet shoulder-width apart.',
            'Position the barbell on your shoulders.',
            'Lower your body into a squat until your thighs are parallel to the floor.',
            'Push through your heels to return to the starting position.',
        ],
        QuickTip: 'Use a 3 second down, 1 second hold, 1 second up tempo',
        VideoUrl: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
        BannerUrl: 'https://images.pexels.com/photos/371049/pexels-photo-371049.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        CreationDate: '2024-08-22T12:00:00Z',
        LastModified: '2024-08-22T12:00:00Z',
        Archived: false,
        Sets: 2,
        RepsUpper: 6,
        RepsLower: 4,
        Rest: '90s',
        ORMPercentage: 90,
    },
    {
        ExerciseId: 'ex-2',
        ExerciseName: 'Dumbbell Bench Press',
        Category: 'Strength',
        MuscleGroups: { Primary: ['Chest'], Secondary: ['Triceps'] },
        InstructionsDetailed: [
            'Stand with your feet shoulder-width apart.',
            'Position the barbell on your shoulders.',
            'Lower your body into a squat until your thighs are parallel to the floor.',
            'Push through your heels to return to the starting position.',
        ],
        QuickTip: 'Keep your elbows slightly bent at the top of the movement',
        VideoUrl: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
        BannerUrl: 'https://images.pexels.com/photos/371049/pexels-photo-371049.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        CreationDate: '2024-08-22T12:00:00Z',
        LastModified: '2024-08-22T12:00:00Z',
        Archived: false,
        Sets: 2,
        RepsUpper: 6,
        RepsLower: 4,
        Rest: '90s',
        ORMPercentage: 90,
    },
    {
        ExerciseId: 'ex-3',
        ExerciseName: 'Pull-Up',
        Category: 'Strength',
        MuscleGroups: { Primary: ['Back'], Secondary: ['Biceps'] },
        InstructionsDetailed: [
            'Stand with your feet shoulder-width apart.',
            'Position the barbell on your shoulders.',
            'Lower your body into a squat until your thighs are parallel to the floor.',
            'Push through your heels to return to the starting position.',
        ],
        QuickTip: 'Engage your shoulder blades before pulling up',
        VideoUrl: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
        BannerUrl: 'https://images.pexels.com/photos/371049/pexels-photo-371049.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        CreationDate: '2024-08-22T12:00:00Z',
        LastModified: '2024-08-22T12:00:00Z',
        Archived: false,
        Sets: 2,
        RepsUpper: 6,
        RepsLower: 4,
        Rest: '90s',
        ORMPercentage: 90,
    },
];

// Define sample program days for program1 (Lean Machine Challenge)
const sampleProgramDaysProgram1: ProgramDay[] = [
    // Week 1
    {
        ProgramId: 'program1',
        DayId: '1',
        DayTitle: 'Introduction & Light Cardio',
        RestDay: false,
        Exercises: [sampleExercises[0], sampleExercises[1]],
        PhotoUrl: 'https://images.pexels.com/photos/3253501/pexels-photo-3253501.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        CreationDate: '2024-07-01',
        LastModified: '2024-07-01',
        Time: 45,
        MuscleGroups: ['Legs', 'Chest'],
        EquipmentCategory: 'Full Gym',
        Equipment: ['Barbell', 'Dumbbells'],
    },
    {
        ProgramId: 'program1',
        DayId: '2',
        DayTitle: 'Upper Body Strength',
        RestDay: false,
        Exercises: [sampleExercises[1], sampleExercises[2]],
        PhotoUrl: 'https://images.pexels.com/photos/1886487/pexels-photo-1886487.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        CreationDate: '2024-07-02',
        LastModified: '2024-07-02',
        Time: 50,
        MuscleGroups: ['Chest', 'Back'],
        EquipmentCategory: 'Basic Equipment',
        Equipment: ['Dumbbells', 'Pull-Up Bar'],
    },
    {
        ProgramId: 'program1',
        DayId: '3',
        DayTitle: 'Lower Body Strength',
        RestDay: false,
        Exercises: [sampleExercises[0]],
        PhotoUrl: 'https://images.pexels.com/photos/841130/pexels-photo-841130.jpeg',
        CreationDate: '2024-07-03',
        LastModified: '2024-07-03',
        Time: 60,
        MuscleGroups: ['Legs'],
        EquipmentCategory: 'Full Gym',
        Equipment: ['Barbell'],
    },
    {
        ProgramId: 'program1',
        DayId: '4',
        DayTitle: 'Rest Day',
        RestDay: true,
        Exercises: [],
        PhotoUrl:
            'https://images.pexels.com/photos/27302737/pexels-photo-27302737/free-photo-of-a-woman-in-blue-and-white-is-doing-a-squat.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        CreationDate: '2024-07-04',
        LastModified: '2024-07-04',
        Time: 0,
        MuscleGroups: [],
        EquipmentCategory: 'None',
        Equipment: [],
    },
    // Week 2
    {
        ProgramId: 'program1',
        DayId: '5',
        DayTitle: 'Full Body Circuit',
        RestDay: false,
        Exercises: [sampleExercises[0], sampleExercises[1], sampleExercises[2]],
        PhotoUrl: 'https://images.pexels.com/photos/3253501/pexels-photo-3253501.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        CreationDate: '2024-07-05',
        LastModified: '2024-07-05',
        Time: 60,
        MuscleGroups: ['Legs', 'Chest', 'Back'],
        EquipmentCategory: 'Full Gym',
        Equipment: ['Barbell', 'Dumbbells', 'Pull-Up Bar'],
    },
    {
        ProgramId: 'program1',
        DayId: '6',
        DayTitle: 'Upper Body Hypertrophy',
        RestDay: false,
        Exercises: [sampleExercises[1], sampleExercises[2]],
        PhotoUrl: 'https://images.pexels.com/photos/1886487/pexels-photo-1886487.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        CreationDate: '2024-07-06',
        LastModified: '2024-07-06',
        Time: 55,
        MuscleGroups: ['Chest', 'Back'],
        EquipmentCategory: 'Basic Equipment',
        Equipment: ['Dumbbells', 'Pull-Up Bar'],
    },
    {
        ProgramId: 'program1',
        DayId: '7',
        DayTitle: 'Lower Body Power',
        RestDay: false,
        Exercises: [sampleExercises[0]],
        PhotoUrl: 'https://images.pexels.com/photos/841130/pexels-photo-841130.jpeg',
        CreationDate: '2024-07-07',
        LastModified: '2024-07-07',
        Time: 65,
        MuscleGroups: ['Legs'],
        EquipmentCategory: 'Full Gym',
        Equipment: ['Barbell'],
    },
    {
        ProgramId: 'program1',
        DayId: '8',
        DayTitle: 'Rest Day',
        RestDay: true,
        Exercises: [],
        PhotoUrl:
            'https://images.pexels.com/photos/27302737/pexels-photo-27302737/free-photo-of-a-woman-in-blue-and-white-is-doing-a-squat.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        CreationDate: '2024-07-08',
        LastModified: '2024-07-08',
        Time: 0,
        MuscleGroups: [],
        EquipmentCategory: 'None',
        Equipment: [],
    },
    // Weeks 3 to 6 for program1...
    // To keep the response concise, I'll provide a function to generate the remaining days.
];

// Function to generate ProgramDays for a given program
const generateProgramDays = (
    programId: string,
    totalWeeks: number,
    totalDays: number,
    exercises: Exercise[],
    restDayFrequency: number, // e.g., every 4th day
): ProgramDay[] => {
    const programDays: ProgramDay[] = [];
    let dayCounter = 1;

    for (let week = 1; week <= totalWeeks; week++) {
        for (let day = 1; day <= 7; day++) {
            if (dayCounter > totalDays) break;

            // Determine if it's a rest day
            const isRestDay = dayCounter % restDayFrequency === 0;

            programDays.push({
                ProgramId: programId,
                DayId: dayCounter.toString(),
                DayTitle: isRestDay ? 'Rest Day' : `Workout Day ${dayCounter}`,
                RestDay: isRestDay,
                Exercises: isRestDay ? [] : exercises,
                PhotoUrl: 'https://images.pexels.com/photos/3253501/pexels-photo-3253501.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
                CreationDate: `2024-07-${dayCounter < 10 ? '0' + dayCounter : dayCounter}`,
                LastModified: `2024-07-${dayCounter < 10 ? '0' + dayCounter : dayCounter}`,
                Time: isRestDay ? 0 : 60,
                MuscleGroups: isRestDay ? [] : ['Back', 'Chest', 'Legs'],
                EquipmentCategory: isRestDay ? 'None' : 'Full Gym',
                Equipment: isRestDay ? [] : ['Barbell', 'Dumbbells', 'Pull-Up Bar'],
            });

            dayCounter++;
        }
    }

    return programDays;
};

// Generate ProgramDays for program1 (Lean Machine Challenge)
const fullProgramDaysProgram1 = [
    ...sampleProgramDaysProgram1,
    ...generateProgramDays('program1', 4, 28, sampleExercises, 4).filter((day) => parseInt(day.DayId) > 8),
];

// Define sample program days for program2 (Beginner's Yoga Flow)
const sampleProgramDaysProgram2: ProgramDay[] = generateProgramDays('program2', 8, 56, sampleExercises, 7); // Yoga has rest days every 7th day

// Define sample program days for program3 (Advanced HIIT Series)
const sampleProgramDaysProgram3: ProgramDay[] = generateProgramDays('program3', 12, 84, sampleExercises, 4); // HIIT has rest days every 4th day

// Combine all ProgramDays
const sampleProgramDays: ProgramDay[] = [
    // Program 1
    ...fullProgramDaysProgram1,

    // Program 2
    ...sampleProgramDaysProgram2,

    // Program 3
    ...sampleProgramDaysProgram3,
];

// Define mock programs
const mockPrograms: Program[] = [
    {
        ProgramId: 'program1',
        ProgramName: 'Lean Machine Challenge',
        TrainerId: 'trainer123',
        Weeks: 4,
        Days: 28,
        DescriptionShort: 'Strength building 4-week challenge designed for all levels',
        DescriptionLong:
            "Transform your body with the 4-week Lean Machine Challenge. This program combines strength training and progressive overload to help you build lean muscle and boost metabolism.\n\nSuitable for all fitness levels, each workout can be scaled to match your abilities. You'll see visible changes in your physique and experience significant improvements in strength and endurance.",
        Level: 'All Levels',
        Type: 'Strength',
        Goal: 'Fat loss',
        CreationDate: '2024-07-01',
        LastModified: '2024-07-12',
        PhotoUrl: 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        Archived: false,
        CalendarOverview: [
            { Title: 'Weeks 1-2', Description: "We'll ramp up onto the program by starting with lower weights and volume" },
            { Title: 'Weeks 3', Description: 'Start to feel the difference in your body. Feel faster, stronger, and lighter on your feet' },
            {
                Title: 'Week 4',
                Description: "We'll de-load this week and focus on muscle recovery - setting you up for a solid base to start your next program",
            },
        ],
        EquipmentCategory: 'Full Gym',
        Equipment: ['Dumbbells', 'Barbell', 'Cable Machine'],
        Frequency: '4x / week',
        DesignedFor: 'At the gym, for all levels: beginner or expert',
    },
    {
        ProgramId: 'program2',
        ProgramName: "Beginner's Yoga Flow",
        TrainerId: 'trainer124',
        Weeks: 8,
        Days: 56,
        DescriptionShort: '8-week introduction to yoga for beginners focusing on flexibility and relaxation',
        DescriptionLong:
            "Discover the fundamentals of yoga with the 8-week Beginner's Yoga Flow program. Perfect for newcomers, this course focuses on building flexibility, strength, and inner peace.\n\nYou'll start with basic poses and proper alignment, gradually progressing to more challenging sequences. Throughout the program, you'll also learn breathing techniques to cultivate mindfulness and reduce stress.",
        Level: 'Beginner',
        Type: 'Yoga',
        Goal: 'Flexibility',
        CreationDate: '2024-06-01',
        LastModified: '2024-06-15',
        PhotoUrl: 'https://images.pexels.com/photos/1375883/pexels-photo-1375883.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        Archived: false,
        CalendarOverview: [
            { Title: 'Weeks 1-2', Description: 'Introduction to basic yoga poses and breathing techniques' },
            { Title: 'Weeks 3-5', Description: 'Building strength and flexibility with intermediate poses' },
            { Title: 'Weeks 6-8', Description: 'Advanced poses and combined flow sequences for relaxation' },
        ],
        EquipmentCategory: 'Basic Equipment',
        Equipment: ['Yoga Mat', 'Block', 'Strap'],
        Frequency: '3x / week',
        DesignedFor: 'At home or at the studio, ideal for beginners',
    },
    {
        ProgramId: 'program3',
        ProgramName: 'Advanced HIIT Series',
        TrainerId: 'trainer125',
        Weeks: 12,
        Days: 84,
        DescriptionShort: '12-week high-intensity interval training program designed for advanced athletes',
        DescriptionLong:
            "Elevate your fitness with the Advanced HIIT Series, a 12-week program designed for seasoned athletes and fitness enthusiasts. This high-intensity interval training combines cardio and strength exercises for maximum results.\n\nEach week builds upon the last, incorporating more complex movements and increased intensity. You'll push past your limits, optimize performance, and achieve breakthrough results in both cardiovascular fitness and body composition.",
        Level: 'Advanced',
        Type: 'HIIT',
        Goal: 'Cardio and Strength',
        CreationDate: '2024-08-01',
        LastModified: '2024-08-10',
        PhotoUrl: 'https://images.pexels.com/photos/2294403/pexels-photo-2294403.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        Archived: false,
        CalendarOverview: [
            { Title: 'Weeks 1-2', Description: 'High-intensity interval training focusing on strength and conditioning' },
            { Title: 'Weeks 3-5', Description: 'Increased intensity with added plyometric exercises' },
            { Title: 'Weeks 6-10', Description: 'Advanced HIIT techniques and combination workouts for peak performance' },
            { Title: 'Week 11-12', Description: 'De-load weeks with a focus on muscle recovery - setting you up for a solid base to start your next program' },
        ],
        EquipmentCategory: 'Full Gym',
        Equipment: ['Dumbbells', 'Kettlebells', 'Medicine Ball'],
        Frequency: '5x / week',
        DesignedFor: 'Advanced athletes looking for high-intensity workouts',
    },
];

export { sampleProgramDays, mockPrograms };
