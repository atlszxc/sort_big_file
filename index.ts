import * as fs from 'fs'
import * as path from "path";
import * as readline from "readline";
import {MemoryLog} from "./utils/memoryLog";

/*
*   Сортировка файла слиянием. Наиболее эффективен для файлов с малом кол-вом повторяющихся записей или если все строки уникальны.
*   Важно отметить, что в данной реализации при малом расходе ОЗУ требует много свободного пространства на диске
*
*   @param filename - Название файла для считывания с указанием расширения файла (ВАЖНО: файл должен находится в корне проекта)
*   @param outputFilename - Название файла куда будет записан результат с указанием расширения файла (ВАЖНО: файл будет записан в корень проекта)
*   @param bufferSize - кол-во строк в частях файла, на которые разбивается файл (ВАЖНО: объем строк буффера не должен превышать кол-во строк файла)
*
*   @returns: void
* */
const mergeSortFile = (filename: string, outputFilename: string, bufferSize: number) => {
    //Логирование затрат памяти
    const memoryLogger = new MemoryLog("MERGE SORT FILE")
    memoryLogger.start(1000, ["heapUsed", "rss"])

    // Формирование интерфейса для считывание данных из входного файла
    const targetPath = path.join(process.cwd(), filename)
    const file = readline.createInterface({
        input: fs.createReadStream(targetPath, {
            encoding: 'utf-8',
        }),
        output: process.stdout,
        terminal: false,
        historySize: 0,
    })

    // Начальное состояние буффера строк для части файла
    const buffer: string[] = []

    // Считывание файла построчно и создание портиций файла
    let counter = 0
    file.on('line', line => {
        buffer.push(line.trim().toLowerCase())
        // Отчистка буфера, создание портиции и создание временного результирующего файла
        if(buffer.length === bufferSize) {
            const partialName = `partial-${++counter}.txt`
            const partialPath = path.join(process.cwd(), 'partials', partialName)
            buffer.sort()
            buffer.forEach(s => fs.appendFileSync(partialPath, s + '\n'))
                
            const tmpResultFileName = `tmp-${counter}.txt`
            const tmpResultFilePath = path.join(process.cwd(), 'tmp', tmpResultFileName)
            if(counter === 1) {
                buffer.forEach(s => fs.appendFileSync(tmpResultFilePath, s + '\n'))
            } else {
                fs.openSync(tmpResultFilePath, 'w')
            }
            
            buffer.length = 0
        }
    }).on('close', async () => {
        // Сортировка данных файла
        let tmpResultFileCounter = 1
        while (tmpResultFileCounter < counter) {
            console.log(tmpResultFileCounter, counter)

            const tmpResultFileName = `tmp-${tmpResultFileCounter}.txt`
            const tmpResultFilePath = path.join(process.cwd(), 'tmp', tmpResultFileName)
            
            const partialStrings: string[] = []
            const partialName = `partial-${tmpResultFileCounter + 1}.txt`
            const partialPath = path.join(process.cwd(), 'partials', partialName)
            const partial = readline.createInterface({
                input: fs.createReadStream(partialPath, {
                    encoding: 'utf-8',
                }),
                output: process.stdout,
                terminal: false,
                historySize: 0,
            })

            for await (const line of partial) {
                partialStrings.push(line)
            }

            console.log('tmpResultFileCounter: ', tmpResultFileCounter)
            const nextTmpResultFilename = `tmp-${tmpResultFileCounter + 1}.txt`
            console.log(nextTmpResultFilename)
            const nextTmpResultPath = path.join(process.cwd(), 'tmp', nextTmpResultFilename)

            const tmpResultFile = readline.createInterface({
                input: fs.createReadStream(tmpResultFilePath, {
                    encoding: 'utf-8'
                }),
                output: process.stdout,
                terminal: false,
                historySize: 0,
            })

            for await (const line of tmpResultFile) {
                if(partialStrings.length === 0) {
                    fs.appendFileSync(nextTmpResultPath, line + '\n')
                }

                for (const s of partialStrings) {
                    if (line.trim().toLowerCase() < s.trim().toLowerCase()) {
                        fs.appendFileSync(nextTmpResultPath, line + '\n')
                        break
                    } else if (line.trim().toLowerCase() > s.trim().toLowerCase()) {
                        fs.appendFileSync(nextTmpResultPath, s + '\n')
                        partialStrings.shift()
                    } else {
                        fs.appendFileSync(nextTmpResultPath, s + '\n')
                        fs.appendFileSync(nextTmpResultPath, line + '\n')
                        partialStrings.shift()
                        break
                    }
                }
            }
            // Закрытие потока и удаление обработанного временного файла
            tmpResultFile.close()
            fs.unlink(tmpResultFilePath, (err) => err && console.log(err))

            // Переиминование и перенос итогового результирующего файла в корень проекта
            if(tmpResultFileCounter + 1 === counter) {
                fs.rename(
                    nextTmpResultPath,
                    path.join(process.cwd(), outputFilename),
                    (err) => err && console.log(err)
                )
            }
            tmpResultFileCounter++
        }
        
        // Остановка работы логгера памяти
        memoryLogger.stop()
    })
}

/*
*   Сортировка файла счетчиком. Наиболее эффективен для файлов с большим кол-вом повторяющихся записей.
*   Важно отметить, что при большом объеме данных с малым кол-вом повторяющихся строк будет больше занимать ОЗУ чем сортировка файла слиянием
* 
*   @param filename - Название файла для считывания с указанием расширения файла (ВАЖНО: файл должен находится в корне проекта)
*   @param outFilename - Название файла куда будет записан результат с указанием расширения файла (ВАЖНО: файл будет записан в корень проекта)
*
*   @returns: void
* */
const counterSortFile = (filename: string, outFilename: string) => {
    // Логирование затрат памяти
    const memoryLogger = new MemoryLog("COUNTER SORTING FILE")
    memoryLogger.start(1000, ["heapUsed", "rss"])

    // Hash-map для сбора строк и кол-ва их повторений
    const map = new Map<string, number>()

    // Формирование интерфейса для считывание данных из входного файла
    const targetPath = path.join(process.cwd(), filename)
    const file = readline.createInterface({
        input: fs.createReadStream(targetPath, {
            encoding: 'utf-8',
            highWaterMark: 8 * 1024
        }),
        output: process.stdout,
        terminal: false,
        historySize: 0,
    })

    // Считывание строк и запись в hash-map строк и их повторений
    file.on('line', (line) => {
        const formattedLine = line.trim().toLowerCase()

        if (map.has(formattedLine)) {
            const count = map.get(formattedLine)! + 1
            map.set(formattedLine, count)
        } else {
            map.set(formattedLine, 1)
        }
    }).on('close', () => {
        // Запись в выходной файл строк (Важно: так как Map сортирует ключи процесс сортировки поумолчанию происходит при записи в hash-map)
        const targetPath = path.join(process.cwd(), outFilename)
        const writeStream = fs.createWriteStream(targetPath, {
            encoding: 'utf-8',
            highWaterMark: 16 * 1024,
        })

        map.forEach((value, key) => {
            for (let i = 0; i < value; i++) {
                writeStream.write(key + '\n')
            }
        })
        
        writeStream.close()
        memoryLogger.stop()
    })
}

mergeSortFile("merge_target.txt", "merge_result.txt", 10)
counterSortFile("target.txt", "counter_result.txt")
