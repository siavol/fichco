import * as fs from "fs"
import * as path from "path"

export class FileInfo {
    private size: number;
    public updated = false;

    constructor(
        private readonly sourcePath: string,
        public readonly file: string,
        isNew = false) {

        const filePath = path.join(sourcePath, file);
        const fileStat = fs.statSync(filePath);
        if (isNew) {
            this.size = 0;
            this.updated = true;
        } else {
            this.size = fileStat.size;
        }
    }

    public toString(): string {
        return `${this.file} - ${this.size}`;
    }
}