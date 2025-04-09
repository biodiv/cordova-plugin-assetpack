# cordova-plugin-assetpack

A Cordova plugin that integrates Android Play Asset Delivery (PAD) with your Cordova app. This plugin allows you to manage and include large assets in your app. It only supports install-time assets.

See the [Play Asset Delivery Doc](https://developer.android.com/guide/playcore/asset-delivery)

## Installation

1. Install the plugin using Cordova CLI:

   ```bash
   cordova plugin add cordova-plugin-assetpack
   ```

2. Build your Cordova project for Android.

3. The plugin will automatically handle asset pack management and integration with the Android build.

## Usage

Once the plugin is installed, simply place your large assets in the `www/asset_pack` directory. During the build process, the assets will be automatically moved to the correct location for Play Asset Delivery.

You can reference your asset_pack files like this:

```
<img src="/asset_pack/your-image.jpg" alt="Your Image" />
```

## Packaging

Play Asset Delivery is not compatible with `.apk` builds. It only works with `.aab`. Make sure to build `.aab` files when using this plugin. Use [bundletool](https://github.com/google/bundletool/releases) for testing `.aab` files.

## Uninstall

To remove the plugin, run:

```bash
cordova plugin rm cordova-plugin-assetpack
```

The plugin will clean up all modifications (such as removing asset references in `project.properties` and `build.gradle`) during uninstallation.

## Features

- Adds the `InstallTimeAssetPack` reference to the `project.properties` file.
- Updates the `build.gradle` file to include asset packs.
- Moves assets from `www/asset_pack` to the `InstallTimeAssetPack` module.
- Cleans and clears target directories before moving assets.
- Handles asset delivery as part of the build process.

## How it Works

- **Before Build**: Moves assets from `www/asset_pack` to the `InstallTimeAssetPack/src/main/assets/www/asset_pack` directory.
- **After Installation**: The plugin modifies `project.properties` and `build.gradle` to set up the asset pack.
- **Before Compile**: The plugin ensures that the assets are moved, and the target directory is cleared.
- **Before Uninstall**: The plugin removes references to the asset pack and clears related files.

## Contributing

Feel free to submit issues, bugs, or improvements. Pull requests are welcome!
