export interface User {
  id: string;
  userName: string;
  isOnline: boolean;
  isNewMessage: boolean;
}
export interface UserPayload {
  id: string;
  userName: string;
}
const map = new Map<string, User>();

export function addUser(id: string, user: UserPayload): void {
  map.set(id, { ...user, isOnline: true, isNewMessage: false });
}

export function removeUser(id: string): void {
  map.delete(id);
}

export function getUser(id: string): User | undefined {
  return map.get(id);
}

export function getUsers(): User[] {
  const users = Array.from(map.values());
  return users;
}

export function updateOnlineStatus(id: string, isOnline: boolean): void {
  const user = map.get(id);
  if (user) {
    user.isOnline = isOnline;
    map.set(id, user);
  }
}

export function updateNewMessageStatus(
  id: string,
  isNewMessage: boolean,
): void {
  const user = map.get(id);
  if (user) {
    user.isNewMessage = isNewMessage;
    map.set(id, user);
  }
}
