import {slice, SliceResult} from "../../Utils/Slice";
import {Printer} from "../../Configs/Printer";

import { expose } from 'comlink';

export default {} as typeof Worker & { new (): Worker };

const api: any = {};

api.sliceLayer = async (printer: string, numLayer: number) => {
    //return slice(JSON.parse(printer) as Printer, numLayer);
};

expose(api);