type CallbackFunction = (...args: any[]) => any;

export class EventEmitter {
  _events: Record<string, CallbackFunction[]>;
  
  constructor() {
    this._events = {};
  }

  on(key: string, callback: CallbackFunction) {
    this._events[key] = this._events[key] || [];
    this._events[key].push(callback);
  }

  emit(key: string, ...args: any[]) {
    if (this._events[key]) {
      this._events[key].forEach(callback => callback(...args));
    }
  }
}