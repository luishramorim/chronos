import React, { useState, useEffect } from 'react';
import { View, ScrollView, Platform, Dimensions, StyleSheet } from 'react-native';
import { Appbar, Button, Text, ActivityIndicator, List } from 'react-native-paper';
import styles from '@/components/Stylesheet';
import { logout } from '@/services/authService';
import { getUserData, getUserTasks, UserData, Task } from '@/services/userService';
import Fab from '@/components/ui/Fab';
import CardTask from '@/components/ui/CardTask';

interface HomeScreenProps {}

const HomeScreen: React.FC<HomeScreenProps> = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loadingUserData, setLoadingUserData] = useState<boolean>(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState<boolean>(true);
  const [expandedAccordion, setExpandedAccordion] = useState<string>('hoje');
  const [error, setError] = useState<string | null>(null);
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);

  useEffect(() => {
    const updateWidth = () => {
      const width = Dimensions.get(Platform.OS === 'web' ? 'window' : 'screen').width;
      setScreenWidth(width);
    };

    const subscription = Dimensions.addEventListener('change', updateWidth);

    return () => subscription?.remove?.();
  }, []);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await logout();
      console.log('Usuário desconectado.');
    } catch (error) {
      console.error('Erro ao sair:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await getUserData();
        setUserData(data);
      } catch (err) {
        setError('Erro ao carregar dados do usuário');
      } finally {
        setLoadingUserData(false);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchUserTasks = () => {
      const unsubscribe = getUserTasks((updatedTasks: Task[]) => {
        const sortedTasks = updatedTasks.sort((a, b) => a.date.seconds - b.date.seconds);
        setTasks(sortedTasks);
        setLoadingTasks(false);
      });

      return unsubscribe;
    };

    fetchUserTasks();
  }, []);

  const formatDate = (timestamp: any) => {
    const date = timestamp.toDate();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${hours}:${minutes}, ${day}/${month}`;
  };

  const groupTasksByDate = (tasks: Task[]) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const groupedTasks: { [key: string]: Task[] } = {
      ontem: [],
      hoje: [],
      amanhã: [],
      outros: [],
    };

    tasks.forEach((task) => {
      const taskDate = task.date.toDate();
      const taskDateString = taskDate.toISOString().split('T')[0];

      if (taskDateString === yesterday.toISOString().split('T')[0]) {
        groupedTasks.ontem.push(task);
      } else if (taskDateString === today.toISOString().split('T')[0]) {
        groupedTasks.hoje.push(task);
      } else if (taskDateString === tomorrow.toISOString().split('T')[0]) {
        groupedTasks.amanhã.push(task);
      } else {
        groupedTasks.outros.push(task);
      }
    });

    return groupedTasks;
  };

  const groupedTasks = groupTasksByDate(tasks);

  return (
    <>
      <Appbar.Header mode='small'>
        <Appbar.Content title="Chronos" />
        <Appbar.Action icon="account" onPress={() => {}} />
        {Platform.OS === 'web' && (
          <Button mode="contained" onPress={handleSignOut} loading={isLoading} disabled={isLoading}>
            {isLoading ? 'Saindo' : 'Sair'}
          </Button>
        )}
      </Appbar.Header>
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        {loadingUserData ? (
          <ActivityIndicator animating size="large" />
        ) : error ? (
          <Text style={{ color: 'red' }}>{error}</Text>
        ) : (
          <View>
            {loadingTasks ? (
              <ActivityIndicator animating size="large" />
            ) : (
              <ScrollView>
                {Object.entries(groupedTasks).map(([key, taskGroup]) => (
                  <List.Accordion
                  style={{ width: screenWidth, justifyContent: 'center' }}
                    key={key}
                    title={key.charAt(0).toUpperCase() + key.slice(1)}
                    expanded={expandedAccordion === key}
                    onPress={() => setExpandedAccordion(expandedAccordion === key ? '' : key)}
                  >
                    <View style={{ alignItems: 'center' }}>
                      {taskGroup.map((task) => (
                        <View key={task.id}>
                          <CardTask
                            title={task.title}
                            subtitle={formatDate(task.date)}
                            taskId={task.id}
                            onToggle={task.isCompleted}
                            isCompleted={task.isCompleted}
                          />
                        </View>
                      ))}
                    </View>
                  </List.Accordion>
                ))}
                {tasks.length === 0 && !loadingTasks && (
                  <Text style={{ textAlign: 'center', marginTop: 20 }}>Sem tarefas</Text>
                )}
              </ScrollView>
            )}
          </View>
        )}
        <Fab />
      </View>
    </>
  );
};

export default HomeScreen;