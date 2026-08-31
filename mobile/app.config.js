module.exports = () => ({
  expo: {
    name: "Drivo",
    slug: "drivo",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "drivo",
    userInterfaceStyle: "automatic",
    ios: {
      bundleIdentifier: "com.anonymous.drivo",
    },
    android: {
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/images/android-icon-foreground.png",
        backgroundImage: "./assets/images/android-icon-background.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png",
      },
      predictiveBackGestureEnabled: false,
      package: "com.anonymous.drivo",
    },
    web: {
      output: "static",
      favicon: "./assets/images/favicon.png",
      bundler: "metro",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          backgroundColor: "#208AEF",
          image: "./assets/images/splash-icon.png",
          imageWidth: 300,
        },
      ],
      "@clerk/expo",
      "expo-secure-store",
      [
        "@stripe/stripe-react-native",
        {
          merchantIdentifier: "merchant.com.drivo.app",
          enableGooglePay: true,
        },
      ],
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission:
            "Allow Drivo to access your location.",
          isIosBackgroundLocationEnabled: true,
          isAndroidForegroundServiceEnabled: true,
        },
      ],
      [
        "react-native-maps",
        {
          androidGoogleMapsApiKey:
            process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
        },
      ],
    ],
    extra: {
      EXPO_PUBLIC_CLERK_GOOGLE_WEB_CLIENT_ID:
        process.env.EXPO_PUBLIC_CLERK_GOOGLE_WEB_CLIENT_ID,
      EXPO_PUBLIC_CLERK_GOOGLE_ANDROID_CLIENT_ID:
        process.env.EXPO_PUBLIC_CLERK_GOOGLE_ANDROID_CLIENT_ID,
    },
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
  },
})
