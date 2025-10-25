
export interface User {
  id: string;
  name: string;
  email: string;
  company: string;
  country: string;
}

export interface Citation {
  uri: string;
  title: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  citations?: Citation[];
  timestamp: number;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  userId: string;
  createdAt: number;
}
