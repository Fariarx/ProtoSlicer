import * as fs from 'fs';
import * as path from 'path'
import { reducer } from "../Redux/Errors";

type Workspace = {
    sizeX: number;
    sizeY: number;
    sizeZ: number;
}

type Resolution = {
    X: number;
    Y: number;
}

interface Config {
    Resolution: Resolution;
    Workspace: Workspace;
}

export class Printer {
    name!:string;

    resolution!: Resolution;
    workspace!: Workspace;

    resins!: Array<Resin>;

    static LoadConfigFromFile = function (filePath) {
        try {
            let config : Config = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            let obj = new Printer();

            obj.workspace = config.Workspace;
            obj.resolution = config.Resolution;
            obj.name = path.basename(filePath);

            return obj;
        }
        catch (e) {
            reducer.dispatch({
                type:"ReadConfig/Error",
                text:e
            });
        }

        return false;
    }
}
