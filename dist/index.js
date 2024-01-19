"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const readline = __importStar(require("readline"));
const memoryLog_1 = require("./utils/memoryLog");
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
const mergeSortFile = (filename, outputFilename, bufferSize) => {
    //Логирование затрат памяти
    const memoryLogger = new memoryLog_1.MemoryLog("MERGE SORT FILE");
    memoryLogger.start(1000, ["heapUsed", "rss"]);
    // Формирование интерфейса для считывание данных из входного файла
    const targetPath = path.join(process.cwd(), filename);
    const file = readline.createInterface({
        input: fs.createReadStream(targetPath, {
            encoding: 'utf-8',
        }),
        output: process.stdout,
        terminal: false,
        historySize: 0,
    });
    // Начальное состояние буффера строк для части файла
    const buffer = [];
    // Считывание файла построчно и создание портиций файла
    let counter = 0;
    file.on('line', line => {
        buffer.push(line.trim().toLowerCase());
        // Отчистка буфера, создание портиции и создание временного результирующего файла
        if (buffer.length === bufferSize) {
            const partialName = `partial-${++counter}.txt`;
            const partialPath = path.join(process.cwd(), 'partials', partialName);
            buffer.sort();
            buffer.forEach(s => fs.appendFileSync(partialPath, s + '\n'));
            const tmpResultFileName = `tmp-${counter}.txt`;
            const tmpResultFilePath = path.join(process.cwd(), 'tmp', tmpResultFileName);
            if (counter === 1) {
                buffer.forEach(s => fs.appendFileSync(tmpResultFilePath, s + '\n'));
            }
            else {
                fs.openSync(tmpResultFilePath, 'w');
            }
            buffer.length = 0;
        }
    }).on('close', () => __awaiter(void 0, void 0, void 0, function* () {
        var _a, e_1, _b, _c, _d, e_2, _e, _f;
        // Сортировка данных файла
        let tmpResultFileCounter = 1;
        while (tmpResultFileCounter < counter) {
            console.log(tmpResultFileCounter, counter);
            const tmpResultFileName = `tmp-${tmpResultFileCounter}.txt`;
            const tmpResultFilePath = path.join(process.cwd(), 'tmp', tmpResultFileName);
            const partialStrings = [];
            const partialName = `partial-${tmpResultFileCounter + 1}.txt`;
            const partialPath = path.join(process.cwd(), 'partials', partialName);
            const partial = readline.createInterface({
                input: fs.createReadStream(partialPath, {
                    encoding: 'utf-8',
                }),
                output: process.stdout,
                terminal: false,
                historySize: 0,
            });
            try {
                for (var _g = true, partial_1 = (e_1 = void 0, __asyncValues(partial)), partial_1_1; partial_1_1 = yield partial_1.next(), _a = partial_1_1.done, !_a; _g = true) {
                    _c = partial_1_1.value;
                    _g = false;
                    const line = _c;
                    partialStrings.push(line);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (!_g && !_a && (_b = partial_1.return)) yield _b.call(partial_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            console.log('tmpResultFileCounter: ', tmpResultFileCounter);
            const nextTmpResultFilename = `tmp-${tmpResultFileCounter + 1}.txt`;
            console.log(nextTmpResultFilename);
            const nextTmpResultPath = path.join(process.cwd(), 'tmp', nextTmpResultFilename);
            const tmpResultFile = readline.createInterface({
                input: fs.createReadStream(tmpResultFilePath, {
                    encoding: 'utf-8'
                }),
                output: process.stdout,
                terminal: false,
                historySize: 0,
            });
            try {
                for (var _h = true, tmpResultFile_1 = (e_2 = void 0, __asyncValues(tmpResultFile)), tmpResultFile_1_1; tmpResultFile_1_1 = yield tmpResultFile_1.next(), _d = tmpResultFile_1_1.done, !_d; _h = true) {
                    _f = tmpResultFile_1_1.value;
                    _h = false;
                    const line = _f;
                    if (partialStrings.length === 0) {
                        fs.appendFileSync(nextTmpResultPath, line + '\n');
                    }
                    for (const s of partialStrings) {
                        if (line.trim().toLowerCase() < s.trim().toLowerCase()) {
                            fs.appendFileSync(nextTmpResultPath, line + '\n');
                            break;
                        }
                        else if (line.trim().toLowerCase() > s.trim().toLowerCase()) {
                            fs.appendFileSync(nextTmpResultPath, s + '\n');
                            //fs.appendFileSync(nextTmpResultPath, line + '\n')
                            partialStrings.shift();
                        }
                        else {
                            fs.appendFileSync(nextTmpResultPath, s + '\n');
                            fs.appendFileSync(nextTmpResultPath, line + '\n');
                            partialStrings.shift();
                            break;
                        }
                    }
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (!_h && !_d && (_e = tmpResultFile_1.return)) yield _e.call(tmpResultFile_1);
                }
                finally { if (e_2) throw e_2.error; }
            }
            // Закрытие потока и удаление обработанного временного файла
            tmpResultFile.close();
            fs.unlink(tmpResultFilePath, (err) => err && console.log(err));
            // Переиминование и перенос итогового результирующего файла в корень проекта
            if (tmpResultFileCounter + 1 === counter) {
                fs.rename(nextTmpResultPath, path.join(process.cwd(), outputFilename), (err) => err && console.log(err));
            }
            tmpResultFileCounter++;
        }
        // Остановка работы логгера памяти
        memoryLogger.stop();
    }));
};
/*
*   Сортировка файла счетчиком. Наиболее эффективен для файлов с большим кол-вом повторяющихся записей.
*   Важно отметить, что при большом объеме данных с малым кол-вом повторяющихся строк будет больше занимать ОЗУ чем сортировка файла слиянием
*
*   @param filename - Название файла для считывания с указанием расширения файла (ВАЖНО: файл должен находится в корне проекта)
*   @param outFilename - Название файла куда будет записан результат с указанием расширения файла (ВАЖНО: файл будет записан в корень проекта)
*
*   @returns: void
* */
const counterSortFile = (filename, outFilename) => {
    // Логирование затрат памяти
    const memoryLogger = new memoryLog_1.MemoryLog("COUNTER SORTING FILE");
    memoryLogger.start(1000, ["heapUsed", "rss"]);
    // Hash-map для сбора строк и кол-ва их повторений
    const map = new Map();
    // Формирование интерфейса для считывание данных из входного файла
    const targetPath = path.join(process.cwd(), filename);
    const file = readline.createInterface({
        input: fs.createReadStream(targetPath, {
            encoding: 'utf-8',
            highWaterMark: 8 * 1024
        }),
        output: process.stdout,
        terminal: false,
        historySize: 0,
    });
    // Считывание строк и запись в hash-map строк и их повторений
    file.on('line', (line) => {
        const formattedLine = line.trim().toLowerCase();
        if (map.has(formattedLine)) {
            const count = map.get(formattedLine) + 1;
            map.set(formattedLine, count);
        }
        else {
            map.set(formattedLine, 1);
        }
    }).on('close', () => {
        // Запись в выходной файл строк (Важно: так как Map сортирует ключи процесс сортировки поумолчанию происходит при записи в hash-map)
        const targetPath = path.join(process.cwd(), outFilename);
        const writeStream = fs.createWriteStream(targetPath, {
            encoding: 'utf-8',
            highWaterMark: 16 * 1024,
        });
        map.forEach((value, key) => {
            for (let i = 0; i < value; i++) {
                writeStream.write(key + '\n');
            }
        });
        writeStream.close();
        memoryLogger.stop();
    });
};
//mergeSortFile("merge_target.txt", "merge_result.txt", 10)
counterSortFile("target.txt", "counter_result.txt");
//# sourceMappingURL=index.js.map