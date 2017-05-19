import * as fs from "fs"
import * as path from "path"
import {Report} from "./Report"

export class FileInfo {
    private startSize: number;
    private endSize: number = null;
    public updated = false;

    constructor(
        private readonly sourcePath: string,
        public readonly file: string,
        private readonly report: Report,
        isNew = false) {

        if (isNew) {
            this.startSize = 0;
            this.updated = true;
        } else {
            const filePath = path.join(sourcePath, file);
            const fileStat = fs.statSync(filePath);
            this.startSize = fileStat.size;
        }
    }

    public end() {
        const filePath = path.join(this.sourcePath, this.file);
        const fileStat = fs.statSync(filePath);
        this.endSize = fileStat.size;
    }

    public saveChanges(targetFolder: string, callback: () => any) {
        const maxChunk = 1024;
        this.report.verbose(`Saving ${this.file} from ${this.startSize} to ${this.endSize}`);

        const sourceFile = path.join(this.sourcePath, this.file);
        const targetFile = path.join(targetFolder, this.file);        
        
        const sourceStream = fs.createReadStream(sourceFile, {
            start: this.startSize,
            end: this.endSize
        });        
        sourceStream.on("open", () => {
            this.report.verbose("  opening source stream");
        });
        sourceStream.on("end", () => {
            this.report.verbose(`  ${sourceStream.bytesRead} bytes copied.`);
            this.report.verbose("...done");
            callback();
        });
        
        const targetStream = fs.createWriteStream(targetFile);
        targetStream.on("open", () => {
            this.report.verbose("  opening target stream");
        });

        sourceStream.pipe(targetStream);
    }

    public toString(): string {
        return `${this.file} - ${this.startSize}`;
    }
}