const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Add SVG transformer with error handling
try {
  const svgTransformerPath = require.resolve('react-native-svg-transformer');
  
  config.transformer = {
    ...config.transformer,
    babelTransformerPath: svgTransformerPath,
  };

  config.resolver = {
    ...config.resolver,
    assetExts: config.resolver.assetExts.filter((ext) => ext !== 'svg'),
    sourceExts: [...config.resolver.sourceExts, 'svg'],
  };
} catch (_error) {
  console.warn('react-native-svg-transformer not found, SVG support will be limited');
  console.warn('Run: npm install react-native-svg-transformer');
}
  
module.exports = withNativeWind(config, { input: './global.css' });