import { mockUsers } from '../data/mockData';

export const getUsers = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...mockUsers]);
    }, 200);
  });
};

export const addUser = async (user) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newUser = {
        id: `USR-${String(mockUsers.length + 1).padStart(3, '0')}`,
        ...user,
        status: 'Active',
        lastActive: 'Never',
        avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.name}`
      };
      mockUsers.push(newUser);
      resolve(newUser);
    }, 300);
  });
};

export const updateUser = async (id, updatedFields) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockUsers.findIndex((u) => u.id === id);
      if (index !== -1) {
        mockUsers[index] = { ...mockUsers[index], ...updatedFields };
        resolve(mockUsers[index]);
      } else {
        reject(new Error('User not found.'));
      }
    }, 200);
  });
};
