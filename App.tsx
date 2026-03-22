import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { BackHandler, StyleSheet, View, Platform } from "react-native";
import { WebView } from "react-native-webview";
import * as NavigationBar from "expo-navigation-bar";
import * as Haptics from "expo-haptics";

interface WebViewMessage {
  type: "vibrate" | "exit";
  pattern?: number[];
}

export default function App() {
  useEffect(() => {
    if (Platform.OS === "android") {
      NavigationBar.setVisibilityAsync("hidden");
    }
  }, []);

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
        overScrollMode="never"
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
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
});
