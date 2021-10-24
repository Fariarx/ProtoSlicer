import {DefaultConfig} from "./Globals";

export const fs =  window.bridge.fs;

export const store = window.bridge.store(JSON.stringify(DefaultConfig));
