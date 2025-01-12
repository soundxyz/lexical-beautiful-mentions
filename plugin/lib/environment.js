export const CAN_USE_DOM = typeof window !== "undefined" &&
    typeof window.document !== "undefined" &&
    typeof window.document.createElement !== "undefined";
export const IS_IOS = CAN_USE_DOM &&
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    // @ts-ignore
    !window.MSStream;
export const IS_MOBILE = CAN_USE_DOM && window.matchMedia("(pointer: coarse)").matches;
