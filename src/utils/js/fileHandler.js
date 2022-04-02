"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFileData = exports.writeToFile = void 0;
const fs_1 = __importDefault(require("fs"));
const util_1 = require("util");
function writeToFile(fileData) {
    fs_1.default.writeFile(fileData.fileName, JSON.stringify(fileData.data), (err) => {
        if (err)
            throw err;
    });
}
exports.writeToFile = writeToFile;
async function getFileData(fileName) {
    const readFile = (0, util_1.promisify)(fs_1.default.readFile);
    const jsonString = await readFile("./datasets/" + fileName);
    const fileData = JSON.parse(jsonString.toString("utf8"));
    return fileData;
}
exports.getFileData = getFileData;
