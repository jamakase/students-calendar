"use server";

import * as XLSX from "xlsx";
import * as fs from "fs";
import ical from "ical-generator";
import { fromZonedTime } from "date-fns-tz";

import { GroupType, groupTypeLength } from "./group";

import path from "path";

const sheetPath = path.resolve(process.cwd() + "/src", "schedule2.xlsx");

function readXLSX(filePath: string) {
  const fileData = fs.readFileSync(filePath);
  const workbook = XLSX.read(fileData, { type: "buffer" });

  return workbook;
}

const workbook = readXLSX(sheetPath);
// import { getWorkbook } from "./workbook";

// Open the sheet with the specified name

function extractStudentsInfo(
  // workbook: XLSX.WorkSheet,
): {
  studentToGroupMap: Record<string, Record<string, string>>;
  courses: string[];
} {
  const STUDEN_SHEET_NAME = "2 семестр. Распределение на под";
  const worksheet = workbook.Sheets[STUDEN_SHEET_NAME];

  const studentToGroupMap: Record<string, Record<string, string>> = {};
  const courses: string[] = [];

  if (!worksheet) {
    console.error(`Sheet "${STUDEN_SHEET_NAME}" not found in the workbook.`);
    return { studentToGroupMap, courses };
  }

  console.log(`Successfully opened sheet: "${STUDEN_SHEET_NAME}"`);

  // Convert the worksheet to JSON for easier data manipulation
  const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  // Extract header row.
  // Assuming first column is 'ФИО' and last column is elective course (e.g. "Курс по выбору")
  const headerRow = sheetData[0] as string[];
  // Take only the main courses (excluding the first and last)
  courses.push(...headerRow.slice(1, headerRow.length - 1));

  // Process data rows and save elective course separately as "selectedCourse"
  sheetData.slice(1).forEach((row: unknown) => {
    if (Array.isArray(row) && row.length >= headerRow.length) {
      const student = row[0].toString().trim();
      studentToGroupMap[student] = {};

      courses.forEach((course, index) => {
        const value = row[index + 1];
        studentToGroupMap[student][course] = value.toString().trim();
      });
      // Save elective course selection as a special field
      studentToGroupMap[student].selectedCourse = row[headerRow.length - 1].toString().trim();
    }
  });

  return { studentToGroupMap, courses };
}

const { studentToGroupMap, courses } = extractStudentsInfo();

type MergeCell = {
  startAddress: string;
  endAddress: string;
  value: string;
  datetimestart: Date;
  datetimeend: Date;
  groupType: GroupType | undefined;
  group: string | undefined;
  details: string;
};

const mergedCells: MergeCell[] = extractTimetable(
  workbook.Sheets[workbook.SheetNames[0]],
);

function extractTimetable(worksheet: XLSX.WorkSheet): MergeCell[] {
  const mergedCells: MergeCell[] = [];

  const merges = worksheet["!merges"] || [];
  const relevantMerges = merges.filter((merge) => {
    const startCol = merge.s.c;
    const endCol = merge.e.c;
    return startCol >= 3 && endCol <= 19; // D is column 3, T is column 19
  });

  const timeZone = "Europe/Moscow";

  const lastRow = worksheet["!ref"]
    ? parseInt(worksheet["!ref"].split(":")[1].replace(/[A-Z]/g, ""), 10)
    : 0;
  for (let rowIndex = 0; rowIndex < lastRow; rowIndex++) {
    for (let colIndex = 3; colIndex <= 19; colIndex++) {
      const cellAddress = XLSX.utils.encode_cell({ r: rowIndex, c: colIndex });
      const cell = worksheet[cellAddress];

      if (cell) {
        const isMerged = relevantMerges.some((merge) =>
          rowIndex >= merge.s.r && rowIndex <= merge.e.r &&
          colIndex >= merge.s.c && colIndex <= merge.e.c
        );

        if (isMerged) {
          const mergeRange = relevantMerges.find((merge) =>
            rowIndex >= merge.s.r && rowIndex <= merge.e.r &&
            colIndex >= merge.s.c && colIndex <= merge.e.c
          );
          if (mergeRange) {
            const mergeLength = mergeRange.e.c - mergeRange.s.c + 1;
            let type: GroupType | undefined = undefined;

            const typeEntries = Object.entries(groupTypeLength);
            type = typeEntries.find(([key]) => parseInt(key) === mergeLength)
              ?.[1];

            const startAddress = XLSX.utils.encode_cell({
              r: mergeRange.s.r,
              c: mergeRange.s.c,
            });
            const endAddress = XLSX.utils.encode_cell({
              r: mergeRange.e.r,
              c: mergeRange.e.c,
            });

            const getGroupNumber = (type: GroupType | undefined) => {
              if (type === "TypeAll") {
                return "all";
              } else if (type === "Type2") {
                switch (true) {
                  case startAddress.startsWith("I"):
                    return "2";
                  case startAddress.startsWith("D"):
                    return "1";
                  default:
                    return "3";
                }
              } else {
                const startCol = XLSX.utils.decode_cell(startAddress).c;
                const length = ((startCol - 3) / mergeLength) + 1; // Subtracting 'D' which is column 3
                return length.toString();
              }
            };

            const group = getGroupNumber(type);

            const timeCell =
              worksheet[XLSX.utils.encode_cell({ r: rowIndex, c: 2 })]?.w;

            let timestart: string | undefined = undefined;
            let timeend: string | undefined = undefined;

            if (cell.v === "Коммерциализация R&D. Вебинар 3" && group === "2") {
              timestart = "14:00";
              timeend = "17:15";
            } else {
              [timestart, timeend] = timeCell
                ? timeCell.split("-")
                : [undefined, undefined];
            }

            const excelDate =
              worksheet[XLSX.utils.encode_cell({ r: rowIndex, c: 0 })]?.v;
            const dateStart = XLSX.SSF.parse_date_code(excelDate);

            const createMoscowDate = (
              date: { y: number; m: number; d: number },
              time: string,
            ) => {
              const [hours, minutes] = time.split(":").map(Number);
              const moscowDate = fromZonedTime(
                new Date(date.y, date.m - 1, date.d, hours, minutes),
                timeZone,
              );
              return moscowDate;
            };

            // @ts-expect-error bbb
            const start: Date = timestart
              ? createMoscowDate(dateStart, timestart)
              : null;
            const end: Date = timeend
              ? createMoscowDate(dateStart, timeend)
              : start;

            const mergedCellInfo = {
              datetimestart: start,
              datetimeend: end,
              startAddress: startAddress,
              endAddress: endAddress,
              details: worksheet[XLSX.utils.encode_cell({ r: rowIndex, c: 19 })]
                ?.v,
              value: cell.v,
              groupType: type,
              group: group,
            };
            mergedCells.push(mergedCellInfo);
          }
        }
      }
    }
  }

  return mergedCells;
}

export async function getStudentSchedule(studentName: string) {
  const studentGroups = studentToGroupMap[studentName];
  // Retrieve elective course selection from student info
  const electiveCourse = studentGroups.selectedCourse;
  
  const studentSchedule = mergedCells.filter((cell) => {
    if (cell.group === "all") {
      return true;
    }
    
    // Try finding a matching main course.
    const matchingCourse = courses.find((course) => {
      const lowerCourse = course.toLowerCase();
      const lowerValue = cell.value.toLowerCase();
      // For English course, use the short form.
      if (lowerCourse === "английский язык") {
        return lowerValue.includes("англ");
      }
      // For Тьюториал, also match the alias "разбор проектов".
      if (lowerCourse === "тьюториал") {
        return lowerValue.includes("тьюториал") || lowerValue.includes("разбор проектов");
      }
      return lowerValue.includes(lowerCourse);
    });
    
    if (matchingCourse && studentGroups[matchingCourse]) {
      // Check if the event text contains "подгруппа"
      const subgroupMatch = cell.value.match(/подгруппа\s*(\d+)/i);
      if (subgroupMatch) {
        // Compare the extracted subgroup number to the student's chosen group
        if (studentGroups[matchingCourse] === subgroupMatch[1]) {
          return true;
        }
      } else {
        // Otherwise, fall back to the existing column-based grouping logic.
        if (cell.group === studentGroups[matchingCourse]) {
          return true;
        }
      }
    }
    
    // ALSO: If the event text includes the elective course selected by the student, include it.
    if (electiveCourse && cell.value.toLowerCase().includes(electiveCourse.toLowerCase())) {
      return true;
    }
    return false;
  });

  return studentSchedule;
}

export async function generateICS(studentName: string): Promise<string> {
  const studentSchedule = await getStudentSchedule(studentName);
  const timeZone = "UTC";

  const cal = ical({ name: `${studentName}'s Schedule` });

  studentSchedule.forEach((event) => {
    if (event.datetimestart && event.datetimeend) {
      cal.createEvent({
        start: event.datetimestart,
        end: event.datetimeend,
        summary: event.value,
        description:
          `Zoom: ${event.details}, Group: ${event.group}, Type: ${event.groupType}`,
        timezone: timeZone,
      });
    }
  });

  return cal.toString();
}

export async function getStudentMap() {
  return studentToGroupMap;
}
