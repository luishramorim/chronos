import React, { useState, useCallback } from 'react'
import { View, Platform } from 'react-native'
import { Switch, Button, TextInput, Appbar, Text, SegmentedButtons, Divider } from 'react-native-paper'
import { DatePickerModal, TimePickerModal } from 'react-native-paper-dates'

import styles from '../Stylesheet'

import { createEvent, createTask } from '@/services/userService'

const CreateEvent: React.FC<{ sheetRef: React.Ref<any>, navigation: any }> = ({ sheetRef, navigation }) => {
  const [title, setTitle] = useState<string>('')
  const [isAllDay, setIsAllDay] = useState<boolean>(false)
  const [startDate, setStartDate] = useState<Date>(new Date())
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [openDatePicker, setOpenDatePicker] = useState<boolean>(false)
  const [openTimePicker, setOpenTimePicker] = useState<boolean>(false)
  const [selectedTime, setSelectedTime] = useState<Date | undefined>(undefined)
  const [selectedDate, setSelectedDate] = useState<'start' | 'end'>('start')
  const [value, setValue] = useState('event')

  const onToggleSwitch = () => setIsAllDay((prev) => !prev)

  const onDismissDatePicker = useCallback(() => {
    setOpenDatePicker(false)
  }, [])

  const onConfirmDatePicker = useCallback(
    (params: { date: Date | undefined }) => {
      setOpenDatePicker(false)
      if (params.date) {
        if (selectedDate === 'start') {
          setStartDate(params.date)
        } else if (selectedDate === 'end') {
          setEndDate(params.date)
        }
      }
    },
    [selectedDate]
  )

  const onDismissTimePicker = useCallback(() => {
    setOpenTimePicker(false)
  }, [])

  const onConfirmTimePicker = useCallback(
    (params: { hours: number; minutes: number }) => {
      setOpenTimePicker(false)
      const { hours, minutes } = params
      const time = new Date()
      time.setHours(hours, minutes, 0, 0)
      setSelectedTime(time)
    },
    []
  )

  const formatDate = (date: Date) => date.toLocaleDateString()

  const formatTime = (time: Date | undefined) => {
    if (!time) return 'Escolher horário'
    const hours = time.getHours().toString().padStart(2, '0')
    const minutes = time.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
  }

  const handleClose = () => {
    if (sheetRef && 'current' in sheetRef && sheetRef.current) {
      sheetRef.current.close()
    }
  }

  return (
    <>
      <Appbar.Header mode="small">
        {Platform.OS === 'web' ? null : <Appbar.BackAction onPress={() => navigation.goBack()} />}
        <Appbar.Content title="Novo evento" />
        {Platform.OS === 'web' ? <Appbar.Action icon="close" onPress={handleClose} /> : null}
      </Appbar.Header>
      <View style={[styles.container, { justifyContent: 'flex-start', alignItems: 'center' }]}>
        <TextInput
          mode="outlined"
          label="Título"
          value={title}
          onChangeText={setTitle}
          style={styles.textInput}
        />
        <SegmentedButtons
          style={{ width: '100%', maxWidth: 350, marginVertical: 20 }}
          value={value}
          onValueChange={setValue}
          buttons={[
            { value: 'event', label: 'Evento' },
            { value: 'task', label: 'Tarefa' },
          ]}
        />

        <Divider />

        {value === 'event' && (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', maxWidth: 350, marginTop: 20, alignItems: 'center' }}>
            <Text variant="titleMedium">Dia todo</Text>
            <Switch value={isAllDay} onValueChange={onToggleSwitch} />
          </View>
        )}

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', maxWidth: 350, marginTop: 20, alignItems: 'center' }}>
          <Text variant="titleMedium">{value === 'event' ? 'Início' : 'Data'}</Text>
          <Button onPress={() => { setSelectedDate('start'), setOpenDatePicker(true) }} mode="text">
            {startDate ? formatDate(startDate) : 'Escolher data início'}
          </Button>
        </View>

        {value === 'task' && (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', maxWidth: 350, marginTop: 20, alignItems: 'center' }}>
            <Text variant="titleMedium">Hora</Text>
            <Button onPress={() => setOpenTimePicker(true)} mode="text">
              {formatTime(selectedTime)}
            </Button>
          </View>
        )}

        {value === 'event' && (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', maxWidth: 350, marginTop: 20, alignItems: 'center' }}>
            <Text variant="titleMedium">Término</Text>
            <Button onPress={() => { setSelectedDate('end'), setOpenDatePicker(true) }} mode="text" disabled={isAllDay}>
              {endDate ? formatDate(endDate) : 'Escolher data término'}
            </Button>
          </View>
        )}

        <DatePickerModal
          locale="pt-BR"
          mode="single"
          visible={openDatePicker}
          onDismiss={onDismissDatePicker}
          date={selectedDate === 'start' ? startDate : endDate}
          onConfirm={onConfirmDatePicker}
          saveLabel="Salvar"
          label="Selecione a data"
        />
        <TimePickerModal
          visible={openTimePicker}
          onDismiss={onDismissTimePicker}
          onConfirm={onConfirmTimePicker}
          hours={12}
          minutes={0}
          label="Selecione a hora"
        />

        <Button
          mode="contained"
          style={[
            styles.button,
            Platform.OS === 'android' || Platform.OS === 'ios' ? { position: 'absolute', bottom: 50 } : null,
          ]}
          onPress={async () => {
            try {
              if (value === 'task') {
                await createTask(title, startDate, selectedTime)
                console.log('Tarefa salva!')
              } else if (value === 'event') {
                await createEvent(title, startDate, endDate, isAllDay)
                console.log('Evento salvo!')
              }

              if (Platform.OS === 'android' || Platform.OS === 'ios') {
                navigation.goBack()
              } else if (Platform.OS === 'web') {
                if (sheetRef && 'current' in sheetRef && sheetRef.current) {
                  sheetRef.current.close()
                }
              }
            } catch (error) {
              console.error('Erro ao salvar:', error)
            }
          }}
        >
          Salvar
        </Button>
      </View>
    </>
  )
}

export default CreateEvent