import { useEffect, useRef, useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
  Animated,
  Easing,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { WebView } from "react-native-webview";
import * as NavigationBar from "expo-navigation-bar";
import * as Haptics from "expo-haptics";

interface WebViewMessage {
  type: "vibrate" | "exit";
  pattern?: number[];
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (Platform.OS === "android") {
      NavigationBar.setVisibilityAsync("hidden");
    }
  }, []);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1100,
        easing: Easing.linear,
        useNativeDriver: true,
      })
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

      if (msg.type === "exit") {
      } else if (msg.type === "vibrate") {
        const ms = msg.pattern?.[0] ?? 20;
        if (ms >= 100) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        else if (ms >= 40)
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch {
      // Ignore parse errors
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden={true} />
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
      {isLoading && (
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
            <Text style={styles.loaderEmoji}>👶</Text>
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
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  loaderEmoji: {
    fontSize: 96,
  },
});
