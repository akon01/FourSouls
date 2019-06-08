export = index;
declare class index {
	static CLOSED: number;
	static CLOSING: number;
	static CONNECTING: number;
	static OPEN: number;
	static defaultMaxListeners: any;
	static init(): void;
	static listenerCount(emitter: any, type: any): any;
	static usingDomains: boolean;
	constructor(address: any, protocols: any, options: any);
	readyState: any;
	protocol: any;
	addEventListener(method: any, listener: any): void;
	addListener(type: any, listener: any): any;
	close(code: any, data: any): any;
	emit(type: any, args: any): any;
	emitClose(): void;
	eventNames(): any;
	getMaxListeners(): any;
	listenerCount(type: any): any;
	listeners(type: any): any;
	off(type: any, listener: any): any;
	on(type: any, listener: any): any;
	once(type: any, listener: any): any;
	ping(data: any, mask: any, cb: any): any;
	pong(data: any, mask: any, cb: any): any;
	prependListener(type: any, listener: any): any;
	prependOnceListener(type: any, listener: any): any;
	rawListeners(type: any): any;
	removeAllListeners(type: any, ...args: any[]): any;
	removeEventListener(method: any, listener: any): void;
	removeListener(type: any, listener: any): any;
	send(data: any, options: any, cb: any): any;
	setMaxListeners(n: any): any;
	setSocket(socket: any, head: any, maxPayload: any): void;
	terminate(): any;
}
declare namespace index {
	class EventEmitter {
		// Circular reference from index.EventEmitter
		static EventEmitter: any;
		static defaultMaxListeners: any;
		static init(): void;
		static listenerCount(emitter: any, type: any): any;
		static usingDomains: boolean;
		addListener(type: any, listener: any): any;
		emit(type: any, args: any): any;
		eventNames(): any;
		getMaxListeners(): any;
		listenerCount(type: any): any;
		listeners(type: any): any;
		off(type: any, listener: any): any;
		on(type: any, listener: any): any;
		once(type: any, listener: any): any;
		prependListener(type: any, listener: any): any;
		prependOnceListener(type: any, listener: any): any;
		rawListeners(type: any): any;
		removeAllListeners(type: any, ...args: any[]): any;
		removeListener(type: any, listener: any): any;
		setMaxListeners(n: any): any;
	}
	class Receiver {
		static WritableState(options: any, stream: any, isDuplex: any): void;
		constructor(binaryType: any, extensions: any, maxPayload: any);
		addListener(type: any, listener: any): any;
		consume(n: any): any;
		controlMessage(data: any): any;
		cork(): void;
		dataMessage(): any;
		decompress(data: any, cb: any): void;
		destroy(err: any, cb: any): any;
		emit(type: any, args: any): any;
		end(chunk: any, encoding: any, cb: any): any;
		eventNames(): any;
		getData(cb: any): any;
		getInfo(): any;
		getMask(): void;
		getMaxListeners(): any;
		getPayloadLength16(): any;
		getPayloadLength64(): any;
		haveLength(): any;
		listenerCount(type: any): any;
		listeners(type: any): any;
		off(type: any, listener: any): any;
		on(type: any, listener: any): any;
		once(type: any, listener: any): any;
		pipe(): void;
		prependListener(type: any, listener: any): any;
		prependOnceListener(type: any, listener: any): any;
		rawListeners(type: any): any;
		removeAllListeners(type: any, ...args: any[]): any;
		removeListener(type: any, listener: any): any;
		setDefaultEncoding(encoding: any): any;
		setMaxListeners(n: any): any;
		startLoop(cb: any): void;
		uncork(): void;
		write(chunk: any, encoding: any, cb: any): any;
	}
	class Sender {
		static frame(data: any, options: any): any;
		constructor(socket: any, extensions: any);
		close(code: any, data: any, mask: any, cb: any): void;
		dequeue(): void;
		dispatch(data: any, compress: any, options: any, cb: any): void;
		doClose(data: any, mask: any, cb: any): void;
		doPing(data: any, mask: any, readOnly: any, cb: any): void;
		doPong(data: any, mask: any, readOnly: any, cb: any): void;
		enqueue(params: any): void;
		ping(data: any, mask: any, cb: any): void;
		pong(data: any, mask: any, cb: any): void;
		send(data: any, options: any, cb: any): void;
		sendFrame(list: any, cb: any): void;
	}
	class Server {
		static defaultMaxListeners: any;
		static init(): void;
		static listenerCount(emitter: any, type: any): any;
		static usingDomains: boolean;
		constructor(options: any, callback: any);
		clients: any;
		options: any;
		addListener(type: any, listener: any): any;
		address(): any;
		close(cb: any): void;
		completeUpgrade(key: any, extensions: any, req: any, socket: any, head: any, cb: any): any;
		emit(type: any, args: any): any;
		eventNames(): any;
		getMaxListeners(): any;
		handleUpgrade(req: any, socket: any, head: any, cb: any): any;
		listenerCount(type: any): any;
		listeners(type: any): any;
		off(type: any, listener: any): any;
		on(type: any, listener: any): any;
		once(type: any, listener: any): any;
		prependListener(type: any, listener: any): any;
		prependOnceListener(type: any, listener: any): any;
		rawListeners(type: any): any;
		removeAllListeners(type: any, ...args: any[]): any;
		removeListener(type: any, listener: any): any;
		setMaxListeners(n: any): any;
		shouldHandle(req: any): any;
	}
	namespace Server {
		class EventEmitter {
			// Circular reference from index.Server.EventEmitter
			static EventEmitter: any;
			static defaultMaxListeners: any;
			static init(): void;
			static listenerCount(emitter: any, type: any): any;
			static usingDomains: boolean;
			addListener(type: any, listener: any): any;
			emit(type: any, args: any): any;
			eventNames(): any;
			getMaxListeners(): any;
			listenerCount(type: any): any;
			listeners(type: any): any;
			off(type: any, listener: any): any;
			on(type: any, listener: any): any;
			once(type: any, listener: any): any;
			prependListener(type: any, listener: any): any;
			prependOnceListener(type: any, listener: any): any;
			rawListeners(type: any): any;
			removeAllListeners(type: any, ...args: any[]): any;
			removeListener(type: any, listener: any): any;
			setMaxListeners(n: any): any;
		}
	}
}
