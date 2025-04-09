const fs = require('fs');
const path = require('path');

module.exports = function (context) {
    const projectRoot = context.opts.projectRoot;
    const platformRoot = path.join(projectRoot, 'platforms', 'android');

    // Corrected source path with the 'www' directory included
    const sourceDir = path.join(platformRoot, 'app', 'src', 'main', 'assets', 'www', 'asset_pack');
    const targetDir = path.join(platformRoot, 'InstallTimeAssetPack', 'src', 'main', 'assets', 'www', 'asset_pack');

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
