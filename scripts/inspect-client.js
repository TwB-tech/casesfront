import { Client } from 'appwrite';
const client = new Client();
console.log('Client type:', typeof client);
console.log('Methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(client)));
console.log('Has setKey?', typeof client.setKey);
console.log('Has setJWT?', typeof client.setJWT);