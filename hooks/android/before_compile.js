const fs = require('fs');
const path = require('path');
const ConfigParser = require('cordova-common').ConfigParser;

module.exports = function (context) {
    const projectRoot = context.opts.projectRoot;
    const platformRoot = path.join(projectRoot, 'platforms', 'android');

    // Source path with the 'www' directory included
    const assetPackSourcePath = getAssetPackSourcePath(projectRoot);
    const sourceSubPath = assetPackSourcePath.split('/');
    const sourceDir = path.join(platformRoot, 'app', 'src', 'main', 'assets', 'www', ...sourceSubPath);
    const targetDir = path.join(platformRoot, 'InstallTimeAssetPack', 'src', 'main', 'assets', 'www', ...sourceSubPath);

    try {
        if (!fs.existsSync(sourceDir)) {
            console.warn('[AssetPack Plugin] platforms/android/app/src/main/assets/www/asset_pack does not exist. Skipping asset move.');
            return;
        }

        // Ensure the target directory exists, and empty it before moving new files
        if (fs.existsSync(targetDir)) {
            clearDirectory(targetDir);
            console.log(`[AssetPack Plugin] Cleared target directory: ${targetDir}`);
        } else {
            fs.mkdirSync(targetDir, { recursive: true });
            console.log(`[AssetPack Plugin] Created target directory: ${targetDir}`);
        }

        // Move the content from sourceDir to targetDir
        moveRecursiveSync(sourceDir, targetDir);
        console.log(`[AssetPack Plugin] Moved asset pack contents from ${sourceDir} to ${targetDir}`);

        // After moving, remove the original source directory
        fs.rmSync(sourceDir, { recursive: true });
        console.log(`[AssetPack Plugin] Removed original directory: ${sourceDir}`);

    } catch (error) {
        console.error(`[AssetPack Plugin] Error during asset pack move: ${error.message}`);
    }
};

// Function to get the asset pack source path from config.xml
function getAssetPackSourcePath(projectRoot) {
    const configXmlPath = path.join(projectRoot, 'config.xml');

    // Check if the config.xml exists
    if (!fs.existsSync(configXmlPath)) {
        console.error('[AssetPack Plugin] config.xml not found!');
        return 'asset_pack'; // Default value
    }

    try {
        const config = new ConfigParser(configXmlPath);
        const preference = config.getPreference('AssetPackSourcePath', 'android');
        
        if (preference) {
            console.log(`[AssetPack Plugin] AssetPackSourcePath preference: ${preference}`);
            return preference;
        } else {
            console.log('[AssetPack Plugin] AssetPackSourcePath preference not found. Using default "asset_pack".');
            return 'asset_pack'; // Default fallback
        }
    } catch (error) {
        console.error('[AssetPack Plugin] Error reading config.xml:', error);
        return 'asset_pack'; // Default fallback
    }
}

// Recursively move directory content
function moveRecursiveSync(src, dest) {
    try {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }

        const entries = fs.readdirSync(src, { withFileTypes: true });

        for (let entry of entries) {
            const srcPath = path.join(src, entry.name);
            const destPath = path.join(dest, entry.name);

            if (entry.isDirectory()) {
                moveRecursiveSync(srcPath, destPath); // Recurse into directories
            } else {
                fs.renameSync(srcPath, destPath); // Move files
            }
        }
    } catch (error) {
        console.error(`[AssetPack Plugin] Error moving file: ${error.message}`);
    }
}

// Function to clear a directory (delete all files and subdirectories)
function clearDirectory(directoryPath) {
    try {
        const entries = fs.readdirSync(directoryPath, { withFileTypes: true });
        for (let entry of entries) {
            const entryPath = path.join(directoryPath, entry.name);
            if (entry.isDirectory()) {
                clearDirectory(entryPath); // Recursively clear directories
                fs.rmSync(entryPath, { recursive: true }); // Remove the empty directory
            } else {
                fs.unlinkSync(entryPath); // Delete file
            }
        }
    } catch (error) {
        console.error(`[AssetPack Plugin] Error clearing directory: ${error.message}`);
    }
}
