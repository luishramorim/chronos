import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { Card, IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

interface CardTaskProps {
  title: string;
  subtitle: string;
  taskId: string;
  isCompleted: boolean;
  onToggle: (taskId: string) => void;
}

const CardTask: React.FC<CardTaskProps> = ({ title, subtitle, taskId, isCompleted, onToggle }) => {
  const [isChecked, setIsChecked] = useState<boolean>(isCompleted);
  const navigation = useNavigation();

  const toggleCheck = () => {
    setIsChecked((prevState) => !prevState);
    if (onToggle) {
      onToggle(taskId);
    }
  };

  useEffect(() => {
    setIsChecked(isCompleted);
  }, [isCompleted]);

  const navigateToTaskView = (taskId: string) => {
    navigation.navigate('TaskView', { taskId });
  };

  return (
    <View>
      <Card
        style={{ width: '80%', minWidth: 350, maxWidth: 500, marginTop: 10 }}
        onPress={toggleCheck}
      >
        <Card.Title
          title={title}
          subtitle={subtitle}
          titleStyle={{
            textDecorationLine: isChecked ? 'line-through' : 'none',
          }}
          subtitleStyle={{
            textDecorationLine: isChecked ? 'line-through' : 'none',
          }}
          left={(props) => (
            <View style={{ marginLeft: -10 }}>
              <IconButton
                {...props}
                icon={isChecked ? 'check-circle-outline' : 'circle-outline'}
                onPress={toggleCheck}
              />
            </View>
          )}
          right={(props) => (
            <IconButton {...props} icon="chevron-right" onPress={() => navigateToTaskView(taskId)} />
          )}
        />
      </Card>
    </View>
  );
};

export default CardTask;