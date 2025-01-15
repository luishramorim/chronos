import React, { useState, useEffect } from 'react';
import { View, ScrollView, Platform, Dimensions, StyleSheet } from 'react-native';
import { Appbar, Button, Text, ActivityIndicator, List } from 'react-native-paper';
import styles from '@/components/Stylesheet';
import { logout } from '@/services/authService';
import { getUserData, getUserTasks, UserData, Task, getUserEvents } from '@/services/userService';
import Fab from '@/components/ui/Fab';
import CardTask from '@/components/ui/CardTask';
import { firestore, auth } from '@/config/FirebaseConfig';
import CardEvent from '@/components/ui/CardEvent';

interface HomeScreenProps {
  navigation: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loadingUserData, setLoadingUserData] = useState<boolean>(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState<boolean>(true);
  const [events, setEvents] = useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = useState<boolean>(true);
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
    const unsubscribeTasks = getUserTasks((updatedTasks: Task[]) => {
      const sortedTasks = updatedTasks.sort((a, b) => a.date.seconds - b.date.seconds);
      setTasks(sortedTasks);
      setLoadingTasks(false);
    });

    const unsubscribeEvents = getUserEvents((updatedEvents: any[]) => {
      setEvents(updatedEvents);
      setLoadingEvents(false);
    });

    return () => {
      unsubscribeTasks();
      unsubscribeEvents();
    };
  }, []);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return ''; // Verifica se timestamp é válido
    const date = timestamp.toDate();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${hours}:${minutes}, ${day}/${month}`;
  };

  const groupTasksAndEventsByDate = (tasks: Task[], events: any[]) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const grouped: { [key: string]: (Task | any)[] } = {
      ontem: [],
      hoje: [],
      amanhã: [],
      outros: [],
    };

    tasks.forEach((task) => {
      if (!task.date) return; // Verifica se a data da tarefa é válida
      const taskDate = task.date.toDate();
      const taskDateString = taskDate.toISOString().split('T')[0];

      if (taskDateString === yesterday.toISOString().split('T')[0]) {
        grouped.ontem.push(task);
      } else if (taskDateString === today.toISOString().split('T')[0]) {
        grouped.hoje.push(task);
      } else if (taskDateString === tomorrow.toISOString().split('T')[0]) {
        grouped.amanhã.push(task);
      } else {
        grouped.outros.push(task);
      }
    });

    events.forEach((event) => {
      const eventStartDate = event.startDate ? new Date(event.startDate.seconds * 1000) : null;
      const eventEndDate = event.endDate ? new Date(event.endDate.seconds * 1000) : null;

      if (!eventStartDate) return; // Verifica se a data de início do evento é válida

      const eventDateString = eventStartDate.toISOString().split('T')[0];

      if (eventDateString === yesterday.toISOString().split('T')[0]) {
        grouped.ontem.push(event);
      } else if (eventDateString === today.toISOString().split('T')[0]) {
        grouped.hoje.push(event);
      } else if (eventDateString === tomorrow.toISOString().split('T')[0]) {
        grouped.amanhã.push(event);
      } else {
        grouped.outros.push(event);
      }
    });

    return grouped;
  };

  const groupedData = groupTasksAndEventsByDate(tasks, events);

  return (
    <>
      <Appbar.Header mode='small'>
        <Appbar.Content title="Chronos" />
        <Appbar.Action icon="account" onPress={() => navigation.navigate("Profile")} />
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
            {loadingTasks || loadingEvents ? (
              <ActivityIndicator animating size="large" />
            ) : (
              <ScrollView>
                {Object.entries(groupedData).map(([key, dataGroup]) => (
                  <List.Accordion
                    style={{ width: screenWidth, justifyContent: 'center' }}
                    key={key}
                    title={key.charAt(0).toUpperCase() + key.slice(1)}
                    expanded={expandedAccordion === key}
                    onPress={() => setExpandedAccordion(expandedAccordion === key ? '' : key)}
                  >
                    <View style={{ alignItems: 'center' }}>
                      {dataGroup.map((item, index) => (
                        <View key={index}>
                          {item.startDate ? (
                            <CardEvent
                              eventNumber={new Date(item.startDate.seconds * 1000).getDate().toString()} 
                              eventTitle={item.title}
                              eventDetails={item.isAllDay ? 'Dia inteiro' : ''}
                              eventDate={new Date(item.startDate.seconds * 1000).toLocaleDateString()}
                              eventTime={new Date(item.startDate.seconds * 1000).toLocaleTimeString()}
                            />
                          ) : ( 
                            <CardTask
                              title={item.title}
                              subtitle={formatDate(item.date)}
                              taskId={item.id}
                              isCompleted={item.isCompleted}
                            />
                          )}
                        </View>
                      ))}
                    </View>
                  </List.Accordion>
                ))}
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