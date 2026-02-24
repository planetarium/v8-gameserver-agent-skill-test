// 이 파일이 GameServer 모듈보다 먼저 로드되어야 함
const { WebSocket } = require('ws');

const store = {};
global.localStorage = {
  getItem: (k) => store[k] ?? null,
  setItem: (k, v) => { store[k] = v; },
  removeItem: (k) => { delete store[k]; }
};

// Mock document with event listeners
const eventListeners = {};
global.document = {
  addEventListener: (event, handler) => {
    if (!eventListeners[event]) eventListeners[event] = [];
    eventListeners[event].push(handler);
  },
  removeEventListener: (event, handler) => {
    if (eventListeners[event]) {
      eventListeners[event] = eventListeners[event].filter(h => h !== handler);
    }
  },
  hidden: false,
  visibilityState: 'visible'
};

global.window = {
  location: { search: '', hostname: 'localhost' },
  WebSocket: WebSocket,
  addEventListener: (event, handler) => {
    if (!eventListeners[event]) eventListeners[event] = [];
    eventListeners[event].push(handler);
  },
  removeEventListener: (event, handler) => {
    if (eventListeners[event]) {
      eventListeners[event] = eventListeners[event].filter(h => h !== handler);
    }
  }
};

global.WebSocket = WebSocket;
global.URLSearchParams = URLSearchParams;
