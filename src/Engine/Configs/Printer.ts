import * as path from 'path'
import Globals, {DefaultConfig, Log } from "../Globals";
import {fs} from "../Bridge";
import {Resin} from "./Resin";
import {LogSendText} from "../UI/Notifications/Console";

export type Workspace = {
    sizeX: number;
    sizeY: number;
    height: number;
}

export type Resolution = {
    X: number;
    Y: number;
}

export type PrintSettings = {
    LayerHeight: number;
    BottomLayers: number;
    ExposureTime: number;
    BottomExposureTime: number;
    LiftingHeight: number;
    LiftingSpeed: number;
}

export interface Config {
    Resolution: Resolution;
    Workspace: Workspace;
    PrintSettings: PrintSettings;
}

export class Printer {
    name:string;

    Workspace: Workspace;
    Resolution: Resolution;
    PrintSettings: PrintSettings;

    constructor(_name?: string, _settings?: Config) {
        if(_name) {
            this.name = _name;
        }
        else {
            this.name = '';
        }

        if(!_settings) {
            this.Workspace = {
                sizeX: 0,
                sizeY: 0,
                height: 0
            }
            this.Resolution = {
                X: 0,
                Y: 0
            }
            this.PrintSettings = {
                LayerHeight: 0,
                BottomLayers: 0,
                ExposureTime: 0,
                BottomExposureTime: 0,
                LiftingHeight: 0,
                LiftingSpeed: 0,
            }
        }
        else {
            this.Workspace = _settings.Workspace;
            this.Resolution = _settings.Resolution;
            this.PrintSettings = _settings.PrintSettings;
        }
    }

    static defaultConfigName: string = 'Voxelab Proxima_6_0';

    static LoadDefaultConfigFromFile = function () {
        try {
            return new Printer(path.basename("Voxelab Proxima_6_0.json"), JSON.parse(fs.readFileSync('./src/Engine/Configs/Default/'+Printer.defaultConfigName+'.json', 'utf8')));
        }
        catch (e) {
            LogSendText("Error read config: " + e);
        }

        return null;
    }
    static LoadConfigFromFile = function (modelName) {
        try {

            let config: Config;

            try {
                config = JSON.parse(fs.readFileSync(window.bridge.userData + "/ChangedConfigsV" + DefaultConfig.defaults.versionPrinterConfigs + "/" + modelName + '.json', 'utf8'));
            } catch (e) {
                config  = JSON.parse(fs.readFileSync('./src/Engine/Configs/Default/' + modelName + '.json', 'utf8'));
            }

            return new Printer(path.basename(modelName), config);
        }
        catch (e) {
            LogSendText("Error read config: " + e);
        }

        return null;
    }
    static ParseConfigFileNames = function () {
        let files: string[] = [];

        try {
            if (fs.existsSync(window.bridge.userData + "/ChangedConfigsV")) {
                files = [...fs.readdirSync(window.bridge.userData + "/ChangedConfigsV")];
            }
            if (fs.existsSync('./src/Engine/Configs/Default')) {
                files = [...fs.readdirSync('./src/Engine/Configs/Default'), ...files];
            }

            files = files.filter(function(item, pos) {
                if(item.indexOf('.json') === -1)
                {
                    return false;
                }

                return files.indexOf(item) === pos;
            })

            files = files.map(function (t) {
                return t.replace('.json', '');
            });

            files.sort();

            return files;
        } catch (e) {
            LogSendText("Error read config files: " + e);
        }

        return files;
    }
}
