import { useEffect, useRef, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { Animated, Easing, Platform, StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";
import * as NavigationBar from "expo-navigation-bar";
import * as Haptics from "expo-haptics";
import * as Network from "expo-network";

interface WebViewMessage {
  type: "vibrate" | "exit";
  pattern?: number[];
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [isWebError, setIsWebError] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (Platform.OS === "android") {
      NavigationBar.setVisibilityAsync("hidden");
    }
  }, []);

  useEffect(() => {
    const checkNetwork = async () => {
      const state = await Network.getNetworkStateAsync();
      setIsOnline(Boolean(state.isConnected && state.isInternetReachable !== false));
    };

    checkNetwork();
    const intervalId = setInterval(checkNetwork, 5000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1100,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();

    return () => {
      loop.stop();
    };
  }, [rotateAnim]);

  const handleMessage = ({
    nativeEvent,
  }: {
    nativeEvent: { data: string };
  }) => {
    try {
      const msg = JSON.parse(nativeEvent.data) as WebViewMessage;
      if (msg.type === "vibrate") {
        const ms = msg.pattern?.[0] ?? 20;
        if (ms >= 100) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        else if (ms >= 40) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch {
      // Ignore parse errors
    }
  };

  const showOfflineScreen = !isOnline || isWebError;

  return (
    <View style={styles.container}>
      <StatusBar hidden={true} />

      {showOfflineScreen ? (
        <View style={styles.offlineContainer}>
          <Text style={styles.offlineEmoji}>📴</Text>
          <Text style={styles.offlineTitle}>No internet connection</Text>
          <Text style={styles.offlineBody}>
            The game will open automatically once your connection is back.
          </Text>
        </View>
      ) : (
        <WebView
          source={{ uri: "https://yair8520.github.io/baby-tap/" }}
          style={styles.webview}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          allowsFullscreenVideo={true}
          startInLoadingState={false}
          scalesPageToFit={false}
          bounces={false}
          scrollEnabled={false}
          onMessage={handleMessage}
          mediaPlaybackRequiresUserAction={false}
          allowsInlineMediaPlayback
          originWhitelist={["*"]}
          overScrollMode="never"
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          onError={() => setIsWebError(true)}
          onLoadEnd={() => setIsLoading(false)}
          injectedJavaScript={`
            (function() {
              document.documentElement.style.overflow = 'hidden';
              document.body.style.overflow = 'hidden';
              document.body.style.margin = '0';
              document.body.style.padding = '0';
            })();
            true;
          `}
        />
      )}

      {isLoading && !showOfflineScreen && (
        <View style={styles.loaderOverlay}>
          <Animated.View
            style={{
              transform: [
                {
                  rotate: rotateAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0deg", "360deg"],
                  }),
                },
              ],
            }}
          >
            <Text style={styles.loaderText}>👶🏻</Text>
          </Animated.View>
        </View>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  webview: {
    flex: 1,
  },
  offlineContainer: {
    flex: 1,
    backgroundColor: "#0d1321",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  offlineEmoji: {
    fontSize: 72,
    marginBottom: 12,
  },
  offlineTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
  },
  offlineBody: {
    marginTop: 10,
    color: "#d5d9e2",
    textAlign: "center",
    fontSize: 16,
    lineHeight: 22,
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  loaderText: {
    fontSize: 100,
    fontWeight: "bold",
    color: "#000",
  },
});
