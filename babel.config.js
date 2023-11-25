module.exports = {
  presets: ["module:metro-react-native-babel-preset"],
  env: {
    production: {
      plugins: ["react-native-paper/babel"]
    }
  },
  // react-native-reanimated/plugin needs to be last
  // see https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started/
  plugins: ["react-native-reanimated/plugin"]
};
