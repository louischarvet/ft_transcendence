// tools/network/socket.ts
class SocketManager {
    ws = null;
    eventHandlers = new Map();
    reconnectAttempts = 0;
    maxReconnectAttempts = 5;
    reconnectDelay = 1000;
    reconnectTimeout = null;
    connect(url = 'wss://localhost/blackjack') {
        return new Promise((resolve, reject) => {
            try {
                this.ws = new WebSocket(url);
                this.ws.onopen = () => {
                    console.log('✅ WebSocket connected to', url);
                    this.reconnectAttempts = 0;
                    this.trigger('connect', {});
                    resolve();
                };
                this.ws.onmessage = (event) => {
                    try {
                        const { event: eventName, data } = JSON.parse(event.data);
                        console.log('📨 Received:', eventName, data);
                        this.trigger(eventName, data);
                    }
                    catch (error) {
                        console.error('Error parsing message:', error);
                    }
                };
                this.ws.onerror = (error) => {
                    console.error('❌ WebSocket error:', error);
                    this.trigger('error', error);
                };
                this.ws.onclose = () => {
                    console.log('🔌 WebSocket disconnected');
                    this.trigger('disconnect', {});
                    this.attemptReconnect(url);
                };
            }
            catch (error) {
                console.error('Connection error:', error);
                reject(error);
            }
        });
    }
    attemptReconnect(url) {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = this.reconnectDelay * this.reconnectAttempts;
            console.log(`🔄 Reconnecting in ${delay}ms (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
            this.reconnectTimeout = window.setTimeout(() => {
                this.connect(url).catch(() => {
                    // Will retry in next attempt
                });
            }, delay);
        }
        else {
            console.error('❌ Max reconnection attempts reached');
            this.trigger('reconnectFailed', {});
        }
    }
    emit(event, data) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            const message = JSON.stringify({ event, data });
            console.log('📤 Sending:', event, data);
            this.ws.send(message);
        }
        else {
            console.error('❌ Cannot send, WebSocket not connected (state:', this.ws?.readyState, ')');
        }
    }
    on(event, handler) {
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, []);
        }
        this.eventHandlers.get(event).push(handler);
    }
    off(event, handler) {
        if (!handler) {
            this.eventHandlers.delete(event);
        }
        else {
            const handlers = this.eventHandlers.get(event);
            if (handlers) {
                const index = handlers.indexOf(handler);
                if (index > -1) {
                    handlers.splice(index, 1);
                }
            }
        }
    }
    trigger(event, data) {
        const handlers = this.eventHandlers.get(event);
        if (handlers) {
            handlers.forEach(handler => {
                try {
                    handler(data);
                }
                catch (error) {
                    console.error(`Error in handler for ${event}:`, error);
                }
            });
        }
    }
    disconnect() {
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.eventHandlers.clear();
        this.reconnectAttempts = 0;
    }
    isConnected() {
        return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
    }
}
// Export singleton
export const socket = new SocketManager();
