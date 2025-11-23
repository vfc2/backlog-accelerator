import { contextBridge } from 'electron';

contextBridge.exposeInMainWorld('api', {
  // IPC endpoints will be defined here.
});
