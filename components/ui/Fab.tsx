import * as React from 'react';
import { FAB } from 'react-native-paper';
import BottomSheet, { BottomSheetMethods } from '@devvie/bottom-sheet';
import { Platform } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';

import CreateEvent from './CreateEvent';
import styles from '../Stylesheet';

type FabProps = {
  navigation?: NavigationProp<any>;
};

const Fab: React.FC<FabProps> = () => {
  const sheetRef = React.useRef<BottomSheetMethods>(null);
  const navigation = useNavigation();

  const handlePress = () => {
    if (Platform.OS === 'web') {
      // Se for na web, abre o BottomSheet
      sheetRef.current?.open();
    } else {
      navigation.navigate('CreateEvent');
    }
  };

  return (
    <>
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handlePress}
      />
      <BottomSheet height="80%" ref={sheetRef} style={styles.bottomSheet}>
        <CreateEvent sheetRef={sheetRef} navigation={navigation} />
      </BottomSheet>
    </>
  );
};

export default Fab;