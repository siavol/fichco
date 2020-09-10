import * as colors from "colors"
import * as _ from "lodash"

colors.setTheme({
    info: "white",
    change: "yellow",
    new: "green",
    delete: "red",
    verbose: "gray",
    error: "red"
});

interface IReportOptions {
    verbose: boolean
}

export class Report {
    private readonly options: IReportOptions;

    constructor(options: IReportOptions) {        
        this.options = _.defaults(options, {
            verbose: false
        });
    }

    public info(message: string){
        console.log(colors.info(message));
    }

    public fileChanged(file: string) {
        console.log(colors.change(`CHANGED ${file}`));
    }

    public fileCreated(file: string) {
        console.log(colors.new(`CREATED ${file}`));
    }

    public fileDeleted(file: string) {
        console.log(colors.delete(`DELETED ${file}`));
    }

    public error(message: string) {
        console.log(colors.delete(message));
    }

    public verbose(message: string) {
        if (this.options.verbose) {
            console.log(colors.verbose(message));
        }        
    }
}

