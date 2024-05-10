import { Globals } from "./Globals";
import * as PIXI from 'pixi.js';
import { DisplayObject } from "pixi.js";
import { config } from "./appConfig";


export const getMousePosition = () => Globals.App!.app.renderer.plugins.interaction.mouse.global;

export const utf8_to_b64 = (str : string) => window.btoa(encodeURIComponent(str));

export const clamp = (num : number, min : number, max : number) => Math.min(Math.max(num, min), max);


export const fetchGlobalPosition = (component : PIXI.DisplayObject) => {
    let point = new PIXI.Point();
    
    component.getGlobalPosition(point, false);
    return point;
};


export const lerp = (oldValue : number, newValue : number, weight : number, dt : number) => oldValue + (oldValue * (1 - weight) + newValue * weight - oldValue) * dt /50;

// globalThis.logThis = (message, color = null) => {

//     const Style = {
//         base: [
//           "color: #fff",
//           "background-color: #444",
//           "padding: 2px 4px",
//           "border-radius: 2px"
//         ],
//         red: [
//           "color: #eee",
//           "background-color: red"
//         ],
//         green: [
//           "background-color: green"
//         ],
//         blue: [
//             "background-color: #0091F7"
//           ]
//       }



//     let extra = [];

//     if(color != null)
//     {
//         extra = Style[color];
//     }
    
//     let style = Style.base.join(';') + ';';
    
//     style += extra.join(';'); // Add any additional styles
    
//     console.log(`%c${message}`, style);
// };








