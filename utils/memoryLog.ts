// Класс для вывода в консоль логов по затраченной памяти
export class MemoryLog {
    constructor(name: string | null = null) {
        this.name = name
    }
    
    intervalId: NodeJS.Timeout | null = null
    name: string | null = null

    start(ms: number, params: (keyof NodeJS.MemoryUsage)[]) {
        this.intervalId = setInterval(
            () => {
                params.forEach(param => console.log(`[${this.name}] ${param}:\t${(process.memoryUsage()[param] / 1024 / 1000).toFixed(2)}\tMB`))
            },
            ms
        )
    }
    
    stop() {
        this.intervalId && clearInterval(this.intervalId)
    }
}