import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Appbar, ActivityIndicator, Text, IconButton, Dialog, Portal, Button } from 'react-native-paper';
import { auth, firestore } from '../../config/FirebaseConfig';
import { DocumentData } from 'firebase/firestore'; 
import styles from '../Stylesheet';
import { ScrollView } from 'react-native-gesture-handler';

interface TaskViewProps {
  route: {
    params: {
      taskId: string; 
    };
  };
}

const TaskView: React.FC<TaskViewProps> = ({ route, navigation }) => {
  const { taskId } = route.params; 
  const [taskData, setTaskData] = useState<DocumentData | null>(null); 
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleDialog, setVisibleDialog] = useState<boolean>(false); // Controle do Dialog

  // Carregar detalhes da tarefa
  useEffect(() => {
    const fetchTaskDetails = async () => {
      try {
        const taskDoc = await firestore
          .collection('users')
          .doc(auth.currentUser?.uid)
          .collection('tasks')
          .doc(taskId)
          .get();

        if (taskDoc.exists) {
          const data = taskDoc.data();
          if (data) {
            setTaskData(data);
          } else {
            setError('Tarefa não encontrada.');
          }
        } else {
          setError('Tarefa não encontrada.');
        }
      } catch (err) {
        setError('Erro ao carregar detalhes da tarefa.');
      } finally {
        setLoading(false);
      }
    };

    fetchTaskDetails();
  }, [taskId]);

  const handleDeleteTask = async () => {
    try {
      await firestore
        .collection('users')
        .doc(auth.currentUser?.uid)
        .collection('tasks')
        .doc(taskId)
        .delete();
      navigation.goBack(); // Voltar para a tela anterior após deletar
    } catch (err) {
      setError('Erro ao apagar a tarefa.');
    }
  };

  return (
    <>
      <Appbar.Header mode="large">
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={taskData ? taskData.title : 'Carregando...'} />
        <Appbar.Action icon="pencil" onPress={() => {}} />
        <Appbar.Action icon="trash-can" onPress={() => setVisibleDialog(true)} />
      </Appbar.Header>
      
      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator animating={true} size="large" />
        ) : error ? (
          <Text style={{ color: 'red' }}>{error}</Text>
        ) : (
          taskData && (
            <ScrollView>
              <View style={{ justifyContent: 'flex-start' }}>
                <Text style={{ marginTop: 10, textAlign: 'left' }}>
                  Data: {new Date(taskData.date.seconds * 1000).toLocaleString()}
                </Text>
                <Text style={{ marginTop: 10, textAlign: 'left' }}>
                  Status: {taskData.isCompleted ? 'Concluída' : 'Pendente'}
                </Text>
              </View>
            </ScrollView>
          )
        )}
      </View>

      {/* Dialog de Confirmação */}
      <Portal>
        <Dialog visible={visibleDialog} onDismiss={() => setVisibleDialog(false)}>
          <Dialog.Title>Confirmar Exclusão</Dialog.Title>
          <Dialog.Content>
            <Text>Você tem certeza que deseja apagar esta tarefa?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setVisibleDialog(false)}>Cancelar</Button>
            <Button onPress={handleDeleteTask}>Confirmar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
};

export default TaskView;