import { firestore, storage } from '../config/FirebaseConfig';
import { auth } from '../config/FirebaseConfig';
import { serverTimestamp, Timestamp, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export interface UserData {
  id: string;
  name?: string;
  email?: string;
}

export interface Task {
  id: string;
  title: string;
  date: Timestamp;
  createdAt: Timestamp;
  isCompleted: boolean;
  note?: string;
  attachmentUrl?: string;
}

interface Event {
  id: string;
  title: string;
  startDate: Timestamp;
  endDate: Timestamp | null;
  isAllDay: boolean;
  createdAt: Timestamp;
}

export const getUserData = async (): Promise<UserData> => {
  try {
    const user = auth.currentUser;

    if (!user) {
      throw new Error('Nenhum usuário autenticado');
    }

    const userDoc = await firestore.collection('users').doc(user.uid).get();

    if (!userDoc.exists) {
      throw new Error('Usuário não encontrado no Firestore');
    }

    return userDoc.data() as UserData;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Erro ao obter dados do usuário: ${error.message}`);
    } else {
      throw new Error('Erro desconhecido ao obter dados do usuário');
    }
  }
};

export const uploadFileToFirebase = async (fileUri: string, fileName: string, userId: string): Promise<string> => {
  try {
    const fileRef = ref(storage, `users/${userId}/data/${fileName}`);
    const fileBlob = await fetch(fileUri).then(res => res.blob());
    await uploadBytes(fileRef, fileBlob);
    const downloadURL = await getDownloadURL(fileRef);
    return downloadURL;
  } catch (error) {
    console.error('Erro ao fazer upload do arquivo:', error);
    throw error;
  }
};

export const createTask = async (
  title: string, 
  date: Date, 
  selectedTime: Date | undefined, 
  note: string, 
  attachment: { uri: string; name: string; type: string } | null
): Promise<void> => {
  try {
    const user = auth.currentUser;

    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    const combinedDate = new Date(date);
    if (selectedTime) {
      combinedDate.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0, 0);
    }

    let attachmentUrl: string | undefined = undefined;
    if (attachment) {
      attachmentUrl = await uploadFileToFirebase(attachment.uri, attachment.name, user.uid);
    }

    const taskData = {
      title,
      date: Timestamp.fromDate(combinedDate),
      createdAt: serverTimestamp(),
      isCompleted: false,
      note,
      attachmentUrl: attachmentUrl || null,
    };

    await firestore
      .collection('users')
      .doc(user.uid)
      .collection('tasks')
      .add(taskData);
  } catch (error) {
    console.error('Erro ao criar a tarefa:', error);
    throw error;
  }
};

export const createEvent = async (
  title: string, 
  startDate: Date, 
  endDate: Date | undefined, 
  isAllDay: boolean
): Promise<void> => {
  try {
    const user = auth.currentUser;

    if (!user) {
      throw new Error('Usuário não autenticado.');
    }

    const startTimestamp = Timestamp.fromDate(startDate);
    const endTimestamp = endDate ? Timestamp.fromDate(endDate) : null;

    await firestore
      .collection('users')
      .doc(user.uid)
      .collection('events')
      .add({
        title,
        startDate: startTimestamp,
        endDate: endTimestamp,
        isAllDay,
        createdAt: serverTimestamp(),
      });
  } catch (error) {
    console.error('Erro ao criar o evento:', error);
    throw error;
  }
};

export const getUserTasks = (onUpdate: (tasks: Task[]) => void): (() => void) => {
  try {
    const user = auth.currentUser;

    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    const tasksRef = firestore
      .collection('users')
      .doc(user.uid)
      .collection('tasks');

    const unsubscribe = onSnapshot(tasksRef, (snapshot) => {
      const tasks: Task[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Task));

      onUpdate(tasks);
    });

    return unsubscribe;
  } catch (error) {
    console.error('Erro ao obter tarefas:', error);
    throw error;
  }
};

export const getUserEvents = (onUpdate: (events: Event[]) => void): (() => void) => {
  try {
    const user = auth.currentUser;

    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    const eventsRef = firestore
      .collection('users')
      .doc(user.uid)
      .collection('events');

    const unsubscribe = onSnapshot(eventsRef, (snapshot) => {
      const events: Event[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Event));

      onUpdate(events);
    });

    return unsubscribe;
  } catch (error) {
    console.error('Erro ao obter eventos:', error);
    throw error;
  }
};