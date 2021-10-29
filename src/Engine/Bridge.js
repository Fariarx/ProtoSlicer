import {StoreConfig} from "./DefaultConfig";

export const storeMain = window.bridge.store(JSON.stringify(StoreConfig));

export const fs =  window.bridge.fs;
