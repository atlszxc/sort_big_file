"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryLog = void 0;
class MemoryLog {
    constructor(name = null) {
        this.intervalId = null;
        this.name = null;
        this.name = name;
    }
    start(ms, params) {
        this.intervalId = setInterval(() => {
            params.forEach(param => console.log(`[${this.name}] ${param}:\t${(process.memoryUsage()[param] / 1024 / 1000).toFixed(2)}\tMB`));
        }, ms);
    }
    stop() {
        this.intervalId && clearInterval(this.intervalId);
    }
}
exports.MemoryLog = MemoryLog;
//# sourceMappingURL=memoryLog.js.map