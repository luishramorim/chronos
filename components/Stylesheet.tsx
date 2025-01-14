import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { theme } from './Theme';

interface Styles {
  container: ViewStyle;
  textLogo: TextStyle;
  textInput: TextStyle;
  button: ViewStyle;
}

const styles = StyleSheet.create<Styles>({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  textLogo: {
    padding: 20
  },
  textInput: {
    width: '90%',
    maxWidth: 350,
    marginBottom: 10
  },
  button: {
    marginTop: 10
  }
})
export default styles;