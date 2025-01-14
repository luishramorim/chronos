import React, { useState, useEffect } from 'react';
import { View, ScrollView, Platform } from 'react-native';
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
  const [error, setError] = useState<string | null>(null);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await logout();
      console.log('Usuário desconectado.');
    } catch (error) {
      if (error instanceof Error) {
        console.error('Erro ao sair:', error.message);
      } else {
        console.error('Erro desconhecido ao sair.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await getUserData();
        setUserData(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Erro desconhecido ao carregar os dados do usuário');
        }
      } finally {
        setLoadingUserData(false);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchUserTasks = () => {
      const unsubscribe = getUserTasks((updatedTasks: Task[]) => {
        const sortedTasks = updatedTasks.sort((a, b) => {
          return a.date.seconds - b.date.seconds;
        });
        setTasks(sortedTasks);
        setLoadingTasks(false);
      });

      return unsubscribe;
    };

    fetchUserTasks();
  }, []);

  const formatDate = (timestamp: any) => {
    const date = timestamp.toDate();
    const formattedDate = new Intl.DateTimeFormat('pt-BR', {
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    }).format(date);
    return formattedDate;
  };

  const groupTasksByDate = (tasks: Task[]) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const groupedTasks: {
      yesterday: Task[];
      today: Task[];
      tomorrow: Task[];
      others: Task[];
    } = {
      yesterday: [],
      today: [],
      tomorrow: [],
      others: []
    };

    tasks.forEach((task) => {
      const taskDate = task.date.toDate();
      const taskDateString = taskDate.toISOString().split('T')[0]; // YYYY-MM-DD format

      if (taskDateString === yesterday.toISOString().split('T')[0]) {
        groupedTasks.yesterday.push(task);
      } else if (taskDateString === today.toISOString().split('T')[0]) {
        groupedTasks.today.push(task);
      } else if (taskDateString === tomorrow.toISOString().split('T')[0]) {
        groupedTasks.tomorrow.push(task);
      } else {
        groupedTasks.others.push(task);
      }
    });

    return groupedTasks;
  };

  const groupedTasks = groupTasksByDate(tasks);

  return (
    <>
      <Appbar.Header mode="small">
        <Appbar.Content title="Chronos" />
        <Appbar.Action icon="account" onPress={() => {}} />

        {Platform.OS === 'web' && (
          <Button
            style={{ marginRight: 10 }}
            mode="contained"
            onPress={handleSignOut}
            loading={isLoading}
            disabled={isLoading}
          >
            {isLoading ? 'Saindo' : 'Sair'}
          </Button>
        )}
      </Appbar.Header>
      <View style={styles.container}>
        {loadingUserData ? (
          <ActivityIndicator animating={true} size="large" />
        ) : error ? (
          <Text variant="bodyLarge" style={{ color: 'red' }}>
            {error}
          </Text>
        ) : (
          <View>
            {loadingTasks ? (
              <ActivityIndicator animating={true} size="large" />
            ) : (
              <ScrollView>
                {groupedTasks.yesterday.length > 0 ? (
                  <List.Accordion style={styles.accordion} title="Ontem" id="yesterday">
                    {groupedTasks.yesterday.map((item) => (
                      <CardTask
                        key={item.id}
                        title={item.title}
                        subtitle={formatDate(item.date)} 
                        taskId={item.id}
                        onToggle={item.isCompleted} 
                        isCompleted={item.isCompleted}                   
                      />
                    ))}
                  </List.Accordion>
                ) : null}

                {groupedTasks.today.length > 0 ? (
                  <List.Accordion style={styles.accordion} title="Hoje" id="today">
                    {groupedTasks.today.map((item) => (
                      <CardTask
                        key={item.id}
                        title={item.title}
                        subtitle={formatDate(item.date)} 
                        taskId={item.id}
                        onToggle={item.isCompleted} 
                        isCompleted={item.isCompleted}                   
                      />
                    ))}
                  </List.Accordion>
                ) : null}

                {groupedTasks.tomorrow.length > 0 ? (
                  <List.Accordion style={styles.accordion} title="Amanhã" id="tomorrow">
                    {groupedTasks.tomorrow.map((item) => (
                      <CardTask
                        key={item.id}
                        title={item.title}
                        subtitle={formatDate(item.date)} 
                        taskId={item.id}
                        onToggle={item.isCompleted} 
                        isCompleted={item.isCompleted}                   
                      />
                    ))}
                  </List.Accordion>
                ) : null}

                {groupedTasks.others.length > 0 ? (
                  <List.Accordion style={styles.accordion} title="Outros Dias" id="others">
                    {groupedTasks.others.map((item) => (
                      <CardTask
                        key={item.id}
                        title={item.title}
                        subtitle={formatDate(item.date)} 
                        taskId={item.id}
                        onToggle={item.isCompleted} 
                        isCompleted={item.isCompleted}                   
                      />
                    ))}
                  </List.Accordion>
                ) : null}

                {tasks.length === 0 && !loadingTasks && (
                  <Text variant='headlineSmall' style={{ textAlign: 'center', marginTop: 20 }}>
                    Sem tarefas
                  </Text>
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