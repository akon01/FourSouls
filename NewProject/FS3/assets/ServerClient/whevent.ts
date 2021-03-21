//@ts-nocheck
export class whevent {

    // debug mode, the call will be printed by the logger
    static debugMode = false
    // the logger object, used for debug mode, if not assigned, use console.log instead
    static logger = null
    // the last event object that called
    static lastEvent = null

    static _callStacks = {}

    // bind the event object
    static on(signal, func, self?) {
        if (!this._callStacks[signal]) {
            this._callStacks[signal] = [];
        }
        this._callStacks[signal].push({
            func: func,
            self: self,
            once: false
        });
    }

    // make sure this is the first one get called
    static onPriority(signal, func, self) {
        if (!this._callStacks[signal]) {
            this._callStacks[signal] = [];
        }
        this._callStacks[signal].splice(0, 0, {
            func: func,
            self: self,
            once: false
        });
    }

    // destory the bind after it get called
    static onOnce(signal, func, self?) {
        if (!this._callStacks[signal]) {
            this._callStacks[signal] = [];
        }
        this._callStacks[signal].push({
            func: func,
            self: self,
            once: true
        });
    }

    // make sure this is the first one get called destory the bind after it get called
    static onOncePriority(signal, func, self) {
        if (!this._callStacks[signal]) {
            this._callStacks[signal] = [];
        }
        this._callStacks[signal].splice(0, 0, {
            func: func,
            self: self,
            once: true
        });
    }

    // unbind the event
    static off(signal, func, self?) {
        if (!this._callStacks[signal]) {
            return;
        }
        for (var i = 0; i < this._callStacks[signal].length; i++) {
            if (this._callStacks[signal][i].func === func && (!self || this._callStacks[signal][i].self === self)) {
                this._callStacks[signal].splice(i, 1);
                return;
            }
        }

        if (this._callStacks[signal].length <= 0) {
            this._callStacks[signal] = undefined;
        }
    }

    // destroy a signal
    static destroy(signal) {
        this._callStacks[signal] = undefined;
    }

    // dispatch the event
    static emit(signal, data?) {
        if (this.debugMode) {
            if (!this.logger) {
                this.logger = console.log;
            }
            this.logger('CALL: ' + signal, data);
        }
        if (this.lastEvent) {
            this.lastEvent.signal = signal;
            this.lastEvent.data = data;
        } else {
            this.lastEvent = {
                signal: signal,
                data: data
            };
        }

        if (!this._callStacks[signal]) {
            return;
        }
        var eves = this._callStacks[signal];
        for (var i = 0; i < eves.length; i++) {
            if (eves[i].func) {
                eves[i].func.call(eves[i].self, data);
                if (eves[i]) {
                    eves[i]._processed = true;
                }
            }
            if (eves[i].once) {
                eves.splice(i, 1);
                i--;
            }
        }

        if (eves.length <= 0) {
            this.destroy(signal);
        }
    }
}