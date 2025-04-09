const fs = require('fs');
const path = require('path');

// Step 1: Modify project.properties to add the asset pack reference
function modifyProjectProperties(platformRoot, assetPackReference) {
    const propertiesFile = path.join(platformRoot, 'project.properties');

    if (!fs.existsSync(propertiesFile)) {
        console.warn('[AssetPack Plugin] project.properties not found!');
        return;
    }

    const content = fs.readFileSync(propertiesFile, 'utf8');
    const referenceLines = content.split('\n').filter(line =>
        line.trim().startsWith('android.library.reference.')
    );

    const alreadyReferenced = referenceLines.some(line => line.includes(`=${assetPackReference}`));
    if (alreadyReferenced) {
        console.log(`[AssetPack Plugin] ${assetPackReference} already referenced.`);
        return;
    }

    const nextRefNumber = referenceLines.length + 1;
    const newLine = `android.library.reference.${nextRefNumber}=${assetPackReference}`;
    fs.appendFileSync(propertiesFile, `\n${newLine}\n`);
    console.log(`[AssetPack Plugin] Added to project.properties: ${newLine}`);
}

// Step 2: Ensure the InstallTimeAssetPack directory and substructure exists
function createInstallTimeAssetPackProject(platformRoot) {
    const assetPackDir = path.join(platformRoot, 'InstallTimeAssetPack');
    const wwwAssetsDir = path.join(assetPackDir, 'src', 'main', 'assets', 'www');

    // Create the full directory structure recursively
    if (!fs.existsSync(wwwAssetsDir)) {
        fs.mkdirSync(wwwAssetsDir, { recursive: true });
        console.log('[AssetPack Plugin] Created InstallTimeAssetPack/src/main/assets/www directory structure.');
    } else {
        console.log('[AssetPack Plugin] Directory structure already exists.');
    }

    return assetPackDir;
}


// Step 3: Copy the plugin's build.gradle into the asset pack directory
function copyBuildGradle(pluginDir, assetPackDir) {
    const pluginGradle = path.join(pluginDir, 'plugin-build.gradle');
    const targetGradle = path.join(assetPackDir, 'build.gradle');

    if (!fs.existsSync(pluginGradle)) {
        console.warn('[AssetPack Plugin] plugin-build.gradle not found in plugin.');
        return;
    }

    if (!fs.existsSync(targetGradle)) {
        fs.copyFileSync(pluginGradle, targetGradle);
        console.log('[AssetPack Plugin] Copied plugin-build.gradle to InstallTimeAssetPack/build.gradle');
    } else {
        console.log('[AssetPack Plugin] build.gradle already exists in InstallTimeAssetPack, skipping copy.');
    }
}

// Main entry point
module.exports = function (context) {
    const projectRoot = context.opts.projectRoot;
    const platformRoot = path.join(projectRoot, 'platforms', 'android');
    const pluginDir = path.join(context.opts.plugin.dir || '', 'src', 'android');
    const assetPackReference = 'InstallTimeAssetPack';

    modifyProjectProperties(platformRoot, assetPackReference);

    const assetPackDir = createInstallTimeAssetPackProject(platformRoot);
    copyBuildGradle(pluginDir, assetPackDir);
};
