import { Dimensions, StyleSheet, View } from 'react-native';
import React from 'react';
import { Avatar, Card, IconButton, Text } from 'react-native-paper';

interface CardEventProps {
  eventTitle: string;
  eventDetails: string;
  eventDate: string;
  eventTime: string;
  eventNumber: string;
  onPress: () => void;
}

const CardEvent: React.FC<CardEventProps> = ({ 
  eventTitle, 
  eventDetails, 
  eventDate, 
  eventTime, 
  eventNumber, 
  onPress 
}) => {
  return (
    <Card style={[styles.card, { width: '90%', minWidth: 350, maxWidth: 500, marginTop: 10 }]}>
      <Card.Title
        title={eventTitle}
        subtitle={eventDetails}
        left={(props) => (
          <Avatar.Text
            {...props}
            size={48}
            label={eventNumber}
            style={styles.avatar}
          />
        )}
        right={(props) => (
          <IconButton {...props} icon="chevron-right" onPress={onPress} />
        )}
      />
      <Card.Content>
        <View style={styles.cardContent}>
          <Text style={styles.dateText}>Data: {eventDate}</Text>
          <Text style={styles.timeText}>Hora: {eventTime}</Text>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    elevation: 4,
  },
  avatar: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    marginTop: 10,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
});

export default CardEvent;