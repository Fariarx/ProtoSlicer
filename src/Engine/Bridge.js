import {StoreConfig} from "./DefaultConfig";

export const storeMain = window.bridge.store(JSON.stringify(StoreConfig));

export const fs =  window.bridge.fs;

export const url = window.bridge.url;

export const path = window.bridge.path;

export const dirname = window.bridge.__dirname;

export const isTheWindowWithFocus = window.bridge.checkFocus;

export const minimizeWindow = window.minimizeWindow;
export const maximizeWindow = window.maximizeWindow;
export const closeWindow = window.closeWindow;
