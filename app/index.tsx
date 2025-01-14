import { View } from 'react-native'
import { Appbar, Text } from 'react-native-paper'
import React from 'react'
import styles from '@/components/Stylesheet'

const HomeScreen = () => {
  return (
    <>
      <Appbar.Header mode='medium'>
        <Appbar.Content title="Chronos" />
        <Appbar.Action icon="magnify" onPress={() => {}} />
      </Appbar.Header>

      <View style={styles.container}>
        <Text variant='displayLarge'>HomeScreen</Text>
      </View>
    </>
  )
}

export default HomeScreen
