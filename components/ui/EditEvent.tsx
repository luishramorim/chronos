import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Platform,
  Dimensions,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import {
  Switch,
  Button,
  TextInput,
  Appbar,
  Text,
  SegmentedButtons,
  Divider
} from 'react-native-paper';
import { DatePickerModal, TimePickerModal } from 'react-native-paper-dates';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

import { updateEvent, updateTask, getEvent, getTask } from '../../services/userService';
import { storage, firestore, auth } from '../../config/FirebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { serverTimestamp } from 'firebase/firestore';

import styles from '../Stylesheet';

const EditEvent: React.FC<{ sheetRef: React.Ref<any>; navigation: any, route: any }> = ({ sheetRef, navigation, route }) => {
  const { eventId, taskId } = route.params;
  const [title, setTitle] = useState<string>('');
  const [isAllDay, setIsAllDay] = useState<boolean>(false);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [openDatePicker, setOpenDatePicker] = useState<boolean>(false);
  const [openTimePicker, setOpenTimePicker] = useState<boolean>(false);
  const [selectedTime, setSelectedTime] = useState<Date | undefined>(undefined);
  const [selectedDate, setSelectedDate] = useState<'start' | 'end'>('start');
  const [value, setValue] = useState('event');
  const [note, setNote] = useState<string>('');
  const [attachment, setAttachment] = useState<{ uri: string; name: string; type: string } | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (taskId) {
        const task = await getTask(taskId);
        setTitle(task.title);
        setStartDate(task.date.toDate());
        setNote(task.note);
        setSelectedTime(task.time ? task.time.toDate() : undefined);
        setValue('task');
      } else if (eventId) {
        const event = await getEvent(eventId);
        setTitle(event.title);
        setStartDate(event.startDate.toDate());
        setEndDate(event.endDate ? event.endDate.toDate() : undefined);
        setIsAllDay(event.isAllDay);
        setNote(event.note);
        setValue('event');
      }
    };
    loadData();
  }, [eventId, taskId]);

  const handleFilePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
      if (result.type === 'cancel') {
        return;
      }

      if (result.type === 'success') {
        const localUri = `${FileSystem.documentDirectory}${result.name}`;
        const fileInfo = await FileSystem.getInfoAsync(result.uri);
        if (!fileInfo.exists) {
          console.error('Arquivo não encontrado');
          return;
        }

        await FileSystem.moveAsync({ from: result.uri, to: localUri });
        setAttachment({ uri: localUri, name: result.name, type: result.mimeType || 'application/octet-stream' });
      }
    } catch (error) {
      console.error('Erro ao selecionar arquivo', error);
    }
  };

  const onDismissDatePicker = useCallback(() => {
    setOpenDatePicker(false);
  }, []);

  const onConfirmDatePicker = useCallback((params: { date: Date | undefined }) => {
    setOpenDatePicker(false);
    if (params.date) {
      if (selectedDate === 'start') {
        setStartDate(params.date);
      } else if (selectedDate === 'end') {
        setEndDate(params.date);
      }
    }
  }, [selectedDate]);

  const onDismissTimePicker = useCallback(() => {
    setOpenTimePicker(false);
  }, []);

  const onConfirmTimePicker = useCallback((params: { hours: number; minutes: number }) => {
    setOpenTimePicker(false);
    const { hours, minutes } = params;
    const time = new Date();
    time.setHours(hours, minutes, 0, 0);
    setSelectedTime(time);
  }, []);

  const formatDate = (date: Date) => date.toLocaleDateString();

  const formatTime = (time: Date | undefined) => {
    if (!time) return 'Escolher horário';
    const hours = time.getHours().toString().padStart(2, '0');
    const minutes = time.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const handleSave = async () => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Usuário não autenticado');

      let fileUrl = '';
      if (attachment) {
        const fileRef = ref(storage, `users/${user.uid}/data/${attachment.name}`);
        const fileBlob = await FileSystem.readAsStringAsync(attachment.uri, { encoding: FileSystem.EncodingType.Base64 });
        const response = await fetch(`data:${attachment.type};base64,${fileBlob}`);
        const file = await response.blob();
        await uploadBytes(fileRef, file);
        fileUrl = await getDownloadURL(fileRef);
      }

      if (value === 'task') {
        await updateTask(taskId, title, startDate, selectedTime, note, fileUrl);
        console.log('Tarefa editada!');
      } else if (value === 'event') {
        await updateEvent(eventId, title, startDate, endDate, isAllDay, note, fileUrl);
        console.log('Evento editado!');
      }

      navigation.goBack();
    } catch (error) {
      console.error('Erro ao salvar:', error);
    }
  };

  const Content = (
    <View style={[styles.container, { justifyContent: 'flex-start', alignItems: 'center' }]}>
      <TextInput mode="outlined" label="Título" value={title} onChangeText={setTitle} style={styles.textInput} />
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
          <Switch value={isAllDay} onValueChange={() => setIsAllDay((prev) => !prev)} />
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
      <TextInput mode="outlined" label="Notas" value={note} onChangeText={setNote} multiline style={[styles.textInput, { height: 120, textAlignVertical: 'top', marginTop: 20 }]} />
      <Button mode="contained" style={[styles.button, { marginBottom: 50 }]} onPress={handleSave}>
        Salvar
      </Button>
    </View>
  );

  return (
    <View style={styles.container}>
      <Appbar.Header mode="small">
        {Platform.OS !== 'web' && <Appbar.BackAction onPress={() => navigation.goBack()} />}
        <Appbar.Content title={value === 'task' ? 'Editar Tarefa' : 'Editar Evento'} />
      </Appbar.Header>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>{Content}</ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default EditEvent;