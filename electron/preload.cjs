const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // We'll add IPC calls here later.
});
