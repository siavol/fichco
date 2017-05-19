import * as colors from "colors"

colors.setTheme({
    info: "white",
    change: "yellow",
    new: "green",
    delete: "red"    
});

export function info(message: string){
    console.log(colors.info(message));
}

export function fileChanged(file: string) {
    console.log(colors.change(`CHANGED ${file}`));
}

export function fileCreated(file: string) {
    console.log(colors.new(`CREATED ${file}`));
}

export function fileDeleted(file: string) {
    console.log(colors.delete(`DELETED ${file}`));
}