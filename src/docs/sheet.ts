import XLSX from "xlsx";
import * as fs from 'fs';

const sheetPath = "/Users/jamakase/Downloads/Расписание - ТехПред МФТИ 2024-26.xlsx";

export function readXLSX(filePath: string) {
  const fileData = fs.readFileSync(filePath);
  const workbook = XLSX.read(fileData, { type: "buffer" });
  return workbook;
}

const workbook = readXLSX(sheetPath);
console.log(workbook);