import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useEffect } from "react";
import { useFonts } from "expo-font";
import { Fraunces_400Regular_Italic, Fraunces_600SemiBold } from "@expo-google-fonts/fraunces";
import { DMSans_400Regular, DMSans_500Medium, DMSans_700Bold } from "@expo-google-fonts/dm-sans";
import { useAuthStore } from "../src/state/useAuthStore";
import { colors } from "../src/theme";

export default function RootLayout() {
  const init = useAuthStore((state) => state.init);
  useEffect(() => init(), [init]);

  useFonts({
    Fraunces_400Regular_Italic,
    Fraunces_600SemiBold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
  });

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <Slot />
      </View>
    </SafeAreaProvider>
  );
}
