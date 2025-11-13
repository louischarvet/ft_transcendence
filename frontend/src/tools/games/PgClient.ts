// wss client for Pong
export default class GameConnection {

  ws: WebSocket | null;
  reconnectAttempts: number;
  maxReconnectAttempts: number;

  functions: any;
  beginData: any;

  constructor(functions: any, beginData: any) {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;

    this.functions = functions;
    this.beginData = beginData;
  }
  
  connect() {
    this.ws = new WebSocket(`/api/pong`);
    
    this.ws.onopen = () => {
      console.log('Connected to game server');
      this.reconnectAttempts = 0;
      this.sendReady();
    };
    
    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.handleMessage(message);
    };
    
    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    this.ws.onclose = (event) => {
      console.log('Disconnected from game server');
      
      // Reconnexion automatique
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        setTimeout(() => {
          console.log(`Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
          this.connect();
        }, 1000 * this.reconnectAttempts);
      }
    };
  }
  
  sendReady() {
    this.send({ type: 'ready', data: this.beginData });
  }
  
  send(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }
  
  handleMessage(message: any) {
    switch (message.type) {
      case 'update':
        this.functions.update(message.data);
        break;
      case 'result':
        this.functions.showResult(message.data);
        break;
      case 'restart':
        this.functions.restart(message.data);
        break;
      case 'error':
        console.error('Server error:', message.error);
        break;
    }
  }
}