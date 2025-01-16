import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { theme } from './Theme';

interface Styles {
  container: ViewStyle;
  textLogo: TextStyle;
  textInput: TextStyle;
  button: ViewStyle;
  checkbox: ViewStyle;
  dialog: ViewStyle;
  fab: ViewStyle;
  bottomSheet: ViewStyle;
  accordion: ViewStyle;
}

const styles = StyleSheet.create<Styles>({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  textLogo: {
    padding: 20
  },
  textInput: {
    width: '90%',
    maxWidth: 450,
    marginBottom: 20,
    backgroundColor: theme.colors.background
  },
  button: {
    marginTop: 10,
    minWidth: 150,
    minHeight: 50,
    justifyContent: 'center'
  },
  checkbox: {
    flexDirection: 'row',
    alignSelf: 'center',
    marginHorizontal: 10,
    maxWidth: 350
  },
  dialog: {
    maxWidth: 450,
    width: '90%',
    alignSelf: 'center'
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 10,
    bottom: 20,
  },
  bottomSheet: {
    backgroundColor: theme.colors.background,
    justifyContent: 'flex-start',
    maxWidth: 450,
    alignSelf: 'center',
  },
  accordion: {
    width: '100%', 
    minWidth: 350, 
    maxWidth: 500
  }
})
export default styles;