export interface User {
  id: string;
  userName: string;
  isOnline: boolean;
}
const map = new Map<string, User>();

export function addUser(id: string, user: User): void {
  map.set(id, user);
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
