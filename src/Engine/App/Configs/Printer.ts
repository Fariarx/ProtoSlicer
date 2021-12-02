import * as path from 'path'
import Globals, {  Log } from "../../Globals";
import {fs} from "../../Bridge";
import {Resin} from "./Resin";
import {LogSendText} from "../Scene/ChildrenUI/Notifications/ElementConsole";
import { DefaultConfig } from '../../DefaultConfig';

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

    workerData: any = {};

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
            return new Printer(path.basename("Voxelab Proxima 6.json"), JSON.parse(fs.readFileSync('./src/Engine/App/Configs/Default/'+Printer.defaultConfigName+'.json', 'utf8')));
        }
        catch (e) {
            LogSendText("Error read config: " + e);
        }

        return null;
    }
    static SaveToFile = function (config: Printer) {
        try {
            if (!fs.existsSync(window.bridge.userData + "/ChangedConfigsV" + DefaultConfig.versionPrinterConfigs)) {
                fs.mkdirSync(window.bridge.userData + "/ChangedConfigsV" + DefaultConfig.versionPrinterConfigs);
            }

            fs.writeFileSync(window.bridge.userData + "/ChangedConfigsV" + DefaultConfig.versionPrinterConfigs + "/" + config.name + '.json', JSON.stringify(config),{encoding:'utf8',flag:'w'});
            return true;
        }
        catch (e) {
            LogSendText("Error save config to file: " + e);
            return false;
        }
    }
    static LoadConfigFromFile = function (modelName) {
        try {

            let config: Config;

            try {
                config = JSON.parse(fs.readFileSync(window.bridge.userData + "/ChangedConfigsV" + DefaultConfig.versionPrinterConfigs + "/" + modelName + '.json', 'utf8'));
            } catch (e) {
                config  = JSON.parse(fs.readFileSync('./src/Engine/App/Configs/Default/' + modelName + '.json', 'utf8'));
            }

            let obj = new Printer(path.basename(modelName), config);

            Log("Printer '" + modelName + "' loaded.");

            return obj;
        }
        catch (e) {
            LogSendText("Error read config: " + e);
        }

        return null;
    }
    static ParseConfigFileNames = function () {
        let files: string[] = [];

        try {
            if (fs.existsSync(window.bridge.userData + "/ChangedConfigsV" + DefaultConfig.versionPrinterConfigs)) {
                files = [...fs.readdirSync(window.bridge.userData + "/ChangedConfigsV" + DefaultConfig.versionPrinterConfigs)];
            }
            if (fs.existsSync('./src/Engine/App/Configs/Default')) {
                files = [...fs.readdirSync('./src/Engine/App/Configs/Default'), ...files];
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
