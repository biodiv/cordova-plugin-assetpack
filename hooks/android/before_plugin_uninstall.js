const fs = require('fs');
const path = require('path');

module.exports = function (context) {
    const projectRoot = context.opts.projectRoot;
    const platformRoot = path.join(projectRoot, 'platforms', 'android');
    const assetPackReference = 'InstallTimeAssetPack';

    removeAssetPackFromProperties(platformRoot, assetPackReference);
    removeAssetPacksLineFromGradle(platformRoot, assetPackReference);
    removeAssetPackDirectory(platformRoot, assetPackReference);
};

// Remove lines from project.properties that reference the asset pack
function removeAssetPackFromProperties(platformRoot, assetPackReference) {
    const propertiesFile = path.join(platformRoot, 'project.properties');
    
    if (!fs.existsSync(propertiesFile)) {
        console.warn('[AssetPack Plugin] project.properties not found!');
        return;
    }

    const content = fs.readFileSync(propertiesFile, 'utf8');
    const filteredContent = content
        .split('\n')
        .filter(line => !line.includes(assetPackReference))
        .join('\n');

    fs.writeFileSync(propertiesFile, filteredContent, 'utf8');
    console.log(`[AssetPack Plugin] Removed all lines with ${assetPackReference} from project.properties`);
}

// Remove the assetPacks line from app/build.gradle
function removeAssetPacksLineFromGradle(platformRoot, assetPackReference) {
    const gradleFile = path.join(platformRoot, 'app', 'build.gradle');

    if (!fs.existsSync(gradleFile)) {
        console.warn('[AssetPack Plugin] build.gradle not found during uninstall.');
        return;
    }

    const content = fs.readFileSync(gradleFile, 'utf8');
    const regex = new RegExp(`^\\s*assetPacks\\s*=\\s*\\[":${assetPackReference}"\\]\\s*(\\/\\/.*)?$`, 'gm');
    const cleaned = content.replace(regex, '').replace(/\n{2,}/g, '\n');

    fs.writeFileSync(gradleFile, cleaned, 'utf8');
    console.log(`[AssetPack Plugin] Removed assetPacks line from build.gradle`);
}

// Recursively delete the InstallTimeAssetPack directory
function removeAssetPackDirectory(platformRoot, assetPackReference) {
    const assetPackDir = path.join(platformRoot, assetPackReference);

    if (!fs.existsSync(assetPackDir)) {
        console.log(`[AssetPack Plugin] Directory not found for removal: ${assetPackDir}`);
        return;
    }

    fs.rmSync(assetPackDir, { recursive: true, force: true });
    console.log(`[AssetPack Plugin] Removed directory: ${assetPackDir}`);
}
