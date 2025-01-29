const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resolver: {
    unstable_enableFabric: false, // Desabilita o Fabric
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
