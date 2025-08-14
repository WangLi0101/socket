export interface User {
  id: string;
  userName: string;
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
  return Array.from(map.values());
}
