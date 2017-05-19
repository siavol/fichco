import * as _ from "lodash"
import * as yargs from "yargs"
import * as keypress from "keypress"
import * as fs from "fs"
import * as path from "path"

import {FileInfo} from "./app/FileInfo"
import * as report from "./app/Report"


const argv = yargs
    .option("source", {
        alias: "s",
        description: "Folder to follow",
        demandOption: true
    })
    .option("target", {
        alias: "t",
        description: "Target folder for file to collect changes from the source folder"
    })
    .help()
    .argv;

const sourcePath = argv.source;
report.info("File Changes Collector")
report.info(`is following the folder: ${sourcePath}`)

const files = _(fs.readdirSync(sourcePath))
    .map(file => new FileInfo(sourcePath, file))
    .keyBy(fi => fi.file)
    .value();

fs.watch(sourcePath, (eventType, fileName) => {
    switch (eventType) {
        case "change":
            files[fileName].updated = true;
            report.fileChanged(fileName);
            break;
        case "rename":
            const filePath = path.join(sourcePath, fileName);
            if (fs.existsSync(filePath)) {
                const fileInfo = new FileInfo(sourcePath, fileName, true);
                files[fileName] = fileInfo;
                report.fileCreated(fileName);
            } else {
                delete files[fileName];
                report.fileDeleted(fileName);
            }
            break;
        default:
            break;
    }
});

keypress(process.stdin);
process.stdin.on("keypress", (str, key) => {
    report.info("Changed files:");
    _(files)
        .values()
        .filter((fi: FileInfo) => fi.updated)
        .forEach((fi: FileInfo) => {
            report.info(fi.file);
        });

    process.exit();
});