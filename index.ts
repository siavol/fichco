import * as fs from "fs"
import * as path from "path"
import * as _ from "lodash"
import * as async from "async"
import * as yargs from "yargs"
import * as keypress from "keypress"
import * as mkdirp from "mkdirp"
import {FileInfo} from "./app/FileInfo"
import {Report} from "./app/Report"


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
    .option("verbose", {
        alias: "v",
        description: "Tells more about what happening",
        // type: "boolean"
    })
    .help()
    .argv;

const report = new Report(argv.verbose);
const sourcePath = argv.source;
report.info("File Changes Collector");
report.info(`is following the folder: ${sourcePath}`);
report.info("Press any key to finish");
report.verbose("Verbose mode on");

const files = _(fs.readdirSync(sourcePath))
    .map(file => new FileInfo(sourcePath, file, report))
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
                const fileInfo = new FileInfo(sourcePath, fileName, report, true);
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
    report.verbose("End all files...");
    _(files).values().forEach((fi: FileInfo) => fi.end());
    report.verbose("...done");

    if (argv.target) {
        report.verbose(`Collect changes to ${argv.target}`);
        mkdirp(argv.target, (err) => {
            if (err) {
                console.error(err);
                process.exit();
            }

            report.verbose("Folder created");
            async.series(
                _(files)
                .values()
                .filter((fi: FileInfo) => fi.updated)
                .map((fi: FileInfo) => {
                    return (callback) => fi.saveChanges(argv.target, callback);
                })
                .value(), (err: any) => {
                    if (err) {
                        report.error(err);
                    }
                    process.exit();
                });
        });
    } else {
        report.verbose("No target. Exit.");
    }
});