import * as path from 'path'
import Globals, {DefaultConfig, Log } from "../Globals";
import {fs} from "../Bridge";
import {Resin} from "./Resin";

export type Workspace = {
    sizeX: number;
    sizeY: number;
    height: number;
}

export type Resolution = {
    X: number;
    Y: number;
}

export interface Config {
    Resolution: Resolution;
    Workspace: Workspace;
}

export class Printer {
    name!:string;

    resolution!: Resolution;
    workspace!: Workspace;

    resins!: Array<Resin>;

    static LoadConfigFromFile = function (modelName) {
        try {

            let config: Config;

            try {
                config = JSON.parse(fs.readFileSync(window.bridge.userData + "/ChangedConfigsV" + DefaultConfig.defaults.versionPrinterConfigs + "/" + modelName + '.json', 'utf8'));
            } catch (e) {
                config  = JSON.parse(fs.readFileSync('./src/Engine/Configs/Default/' + modelName + '.json', 'utf8'));
            }

            let obj = new Printer();

            obj.workspace = config.Workspace;
            obj.resolution = config.Resolution;
            obj.name = path.basename(modelName);

            return obj;
        }
        catch (e) {
            Log("Error read config: " + e);
        }

        return null;
    }
}
