import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Appbar, ActivityIndicator, Text, IconButton, Dialog, Portal, Button, Chip, List, Card, Avatar } from 'react-native-paper';
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
  const [visibleDialog, setVisibleDialog] = useState<boolean>(false); 

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
      navigation.goBack();
    } catch (err) {
      setError('Erro ao apagar a tarefa.');
    }
  };

  const handleCompleteTask = async () => {
    try {
      const newCompletionState = !taskData?.isCompleted;
      await firestore
        .collection('users')
        .doc(auth.currentUser?.uid)
        .collection('tasks')
        .doc(taskId)
        .update({
          isCompleted: newCompletionState
        });
      setTaskData(prev => prev ? { ...prev, isCompleted: newCompletionState } : prev);
    } catch (err) {
      setError('Erro ao marcar tarefa como concluída.');
    }
  };

  return (
    <>
      <Appbar.Header mode="large">
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={taskData ? taskData.title : 'Carregando...'} titleStyle={{ textDecorationLine: taskData?.isCompleted ? 'line-through' : 'none' }}/>
        <Appbar.Action icon="trash-can" onPress={() => setVisibleDialog(true)} />
      </Appbar.Header>
      <View style={[styles.container, {width: '100%', maxWidth: 450, alignSelf: 'center'}]}>
        {loading ? (
          <ActivityIndicator animating={true} size="large" />
        ) : error ? (
          <Text style={{ color: 'red' }}>{error}</Text>
        ) : (
          taskData && (
            <ScrollView>
              <Button 
                mode={taskData.isCompleted ? 'elevated' : 'contained'}
                onPress={handleCompleteTask} 
                style={{ marginBottom: 20, width: '40%', alignSelf: 'center' }} 
                >
                {taskData.isCompleted ? 'Concluída' : 'Concluir'}
              </Button>
              <View style={{ justifyContent: 'flex-start'}}>
                <ScrollView horizontal>
                  <View style={{ flexDirection: 'row' }}>
                  </View>
                </ScrollView>
                <View style={{ flexDirection: 'column'}}>
                  <Card style={{ width: '90%', alignSelf: 'center', marginTop: 30 }}>
                    <Card.Title
                      title={new Date(taskData.date.seconds * 1000).toLocaleDateString('pt-BR')}
                      subtitle={taskData.isCompleted ? 'Concluída' : 'Pendente'}
                      left={(props) => <Avatar.Icon {...props} icon="calendar" />}
                    />
                  </Card>
                </View>
              </View>
              <List.Accordion title="Anotações">
                <Text style={{ marginHorizontal: 20 }}>{taskData.note}</Text>
              </List.Accordion>
            </ScrollView>
          )
        )}
      </View>

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