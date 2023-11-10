"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IS_MOBILE = exports.IS_IOS = exports.CAN_USE_DOM = void 0;
exports.CAN_USE_DOM = typeof window !== "undefined" &&
    typeof window.document !== "undefined" &&
    typeof window.document.createElement !== "undefined";
exports.IS_IOS = exports.CAN_USE_DOM &&
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    // @ts-ignore
    !window.MSStream;
exports.IS_MOBILE = exports.CAN_USE_DOM && window.matchMedia("(pointer: coarse)").matches;
