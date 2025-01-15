import { useFonts } from 'expo-font';
import { Platform } from 'react-native';

export function useCustomFonts() {
  const [fontsLoaded] = useFonts({
    MaterialCommunityIcons: Platform.OS === 'web'
      ? null 
      : require('../assets/fonts/MaterialCommunityIcons.ttf'),
  });

  return fontsLoaded;
}