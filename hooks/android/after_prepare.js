const fs = require('fs');
const path = require('path');

module.exports = function (context) {
    const projectRoot = context.opts.projectRoot;
    const gradleFile = path.join(projectRoot, 'platforms', 'android', 'app', 'build.gradle');
    const assetPackLine = `    assetPacks = [":InstallTimeAssetPack"] // Added by cordova-plugin-assetpack`;

    if (!fs.existsSync(gradleFile)) {
        console.warn('[AssetPack Plugin] build.gradle not found at expected path:', gradleFile);
        return;
    }

    const content = fs.readFileSync(gradleFile, 'utf8');

    // Avoid duplicate injection
    if (content.includes(assetPackLine)) {
        console.log('[AssetPack Plugin] assetPacks already present in build.gradle');
        return;
    }

    const lines = content.split('\n');
    let inAndroidBlock = false;
    let braceDepth = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Start tracking inside android block
        if (line.trim().startsWith('android {')) {
            inAndroidBlock = true;
            braceDepth = 1;
            continue;
        }

        if (inAndroidBlock) {
            if (line.includes('{')) braceDepth++;
            if (line.includes('}')) braceDepth--;

            // End of android block
            if (braceDepth === 0) {
                // Insert the line just before this closing brace
                lines.splice(i, 0, assetPackLine);
                fs.writeFileSync(gradleFile, lines.join('\n'), 'utf8');
                console.log('[AssetPack Plugin] assetPacks line appended at end of android block');
                return;
            }
        }
    }

    console.warn('[AssetPack Plugin] Could not find end of android block in build.gradle');
};
