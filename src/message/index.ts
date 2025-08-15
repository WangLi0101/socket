import { generateMessageId } from '@/utils/helpers';

export interface Message {
  id: string;
  type: string;
  senderId: string;
  receiverId: string;
  data: string;
  createTime: string;
}
export type MessagePayload = Omit<Message, 'id' | 'createTime'>;

const messageMap = new Map<string, Message[]>();
export const getConversationId = (id1: string, id2: string): string => {
  // 对两个ID进行排序，确保顺序一致性
  return [id1, id2].sort().join('_');
};
export const addMessage = (message: MessagePayload) => {
  return new Promise(resolve => {
    const { senderId, receiverId } = message;
    const key = getConversationId(senderId, receiverId);
    const messages = messageMap.get(key) || [];
    const item = {
      ...message,
      id: generateMessageId(),
      createTime: new Date().toISOString(),
    };
    messages.push(item);
    messageMap.set(key, messages);
    resolve(item);
  });
};

export const getMessages = (senderId: string, receiverId: string) => {
  return new Promise<Message[]>(resolve => {
    const key = getConversationId(senderId, receiverId);
    const messages = messageMap.get(key) || [];
    resolve(messages);
  });
};

export const deleteMessage = (id: string) => {
  return new Promise(resolve => {
    for (const [key] of messageMap) {
      if (key.includes(id)) {
        messageMap.delete(key);
      }
    }
    resolve('del successe');
  });
};
