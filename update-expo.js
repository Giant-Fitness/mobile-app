const { execSync } = require('child_process');
const fs = require('fs');

function runCommand(command, ignoreError = false) {
    try {
        execSync(command, { stdio: 'inherit' });
        return true;
    } catch (error) {
        if (!ignoreError) {
            throw error;
        }
        console.log(`⚠️  Warning: Command "${command}" failed, continuing with update process...`);
        return false;
    }
}

function safeExpoUpdate() {
    try {
        // 1. Backup package.json and yarn.lock
        console.log('📦 Backing up dependency files...');
        fs.copyFileSync('package.json', 'package.json.backup');
        if (fs.existsSync('yarn.lock')) {
            fs.copyFileSync('yarn.lock', 'yarn.lock.backup');
        }

        // 2. Check current expo version
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        const currentExpoVersion = packageJson.dependencies.expo || packageJson.devDependencies.expo;
        console.log(`Current Expo version: ${currentExpoVersion}`);

        // 3. Try to run yarn outdated (but continue if it fails)
        console.log('\n📊 Checking outdated packages...');
        runCommand('yarn outdated', true);

        // 4. Update expo and related packages
        console.log('\n🔄 Updating expo and related packages...');
        runCommand('npx expo install');

        // 5. Clean installation
        console.log('\n🧹 Cleaning installation...');
        runCommand('rm -rf node_modules');
        if (fs.existsSync('yarn.lock')) {
            fs.unlinkSync('yarn.lock');
        }

        // 6. Clear yarn cache and fresh install
        console.log('\n📦 Clearing yarn cache and fresh installation...');
        runCommand('yarn cache clean');
        runCommand('yarn install');

        // 7. Run metro bundler clean
        console.log('\n🧹 Cleaning metro bundler cache...');
        runCommand('npx expo start --clear');

        console.log('\n✅ Update completed successfully!');
        console.log('\nNext steps:');
        console.log('1. Test your app thoroughly');
        console.log('2. If everything works, delete the backup files');
        console.log('3. If issues occur, restore from backups');
    } catch (error) {
        console.error('❌ Error during update:', error);
        console.log('\n🔄 Rolling back to backup...');

        // Restore from backup
        if (fs.existsSync('package.json.backup')) {
            fs.copyFileSync('package.json.backup', 'package.json');
        }
        if (fs.existsSync('yarn.lock.backup')) {
            fs.copyFileSync('yarn.lock.backup', 'yarn.lock');
        }

        console.log('✅ Backup restored. Your project should be back to its original state.');
    }
}

safeExpoUpdate();
