// The project's GML, imported verbatim from the GameMaker files.
import managerCreate from "./gml/obj_gameManager.Create_0.gml?raw";
import managerAlarm from "./gml/obj_gameManager.Alarm_0.gml?raw";
import managerDrawGui from "./gml/obj_gameManager.Draw_64.gml?raw";
import starCreate from "./gml/obj_star.Create_0.gml?raw";
import starStep from "./gml/obj_star.Step_0.gml?raw";
import starClick from "./gml/obj_star.Mouse_4.gml?raw";
import starGround from "./gml/obj_star.Collision_obj_ground.gml?raw";
import explosionEnd from "./gml/obj_explosion.Other_7.gml?raw";

export type GmlEvent = {
  id: string;
  object: "obj_gameManager" | "obj_star" | "obj_explosion";
  event: string;
  file: string;
  code: string;
  /** What the event does, in plain English. */
  explain: string;
  concept: "Game loop" | "Spawning" | "Object behaviour" | "Input" | "Collision" | "Animation" | "Interface";
};

export const gmlEvents: GmlEvent[] = [
  { id: "manager-create", object: "obj_gameManager", event: "Create", file: "Create_0.gml", code: managerCreate, concept: "Game loop", explain: "When the room starts, the music begins looping, the score is set to zero and a 60-step timer starts." },
  { id: "manager-alarm", object: "obj_gameManager", event: "Alarm 0", file: "Alarm_0.gml", code: managerAlarm, concept: "Spawning", explain: "When the timer reaches zero, a new star appears above the screen at a random x position, and the timer restarts." },
  { id: "star-create", object: "obj_star", event: "Create", file: "Create_0.gml", code: starCreate, concept: "Object behaviour", explain: "Each new star points down, picks its own speed between 2.5 and 7.5 pixels per step, a light random colour, and a random angle." },
  { id: "star-step", object: "obj_star", event: "Step", file: "Step_0.gml", code: starStep, concept: "Game loop", explain: "Sixty times a second, every star turns one more degree." },
  { id: "star-click", object: "obj_star", event: "Left Pressed", file: "Mouse_4.gml", code: starClick, concept: "Input", explain: "Clicking a star plays a pop, removes the star, leaves an explosion in its place and adds one point." },
  { id: "star-ground", object: "obj_star", event: "Collision with obj_ground", file: "Collision_obj_ground.gml", code: starGround, concept: "Collision", explain: "If a star's box touches the ground's box, a sad whistle plays and the star disappears. No point is lost." },
  { id: "explosion-end", object: "obj_explosion", event: "Animation End", file: "Other_7.gml", code: explosionEnd, concept: "Animation", explain: "The explosion removes itself after its last frame." },
  { id: "manager-gui", object: "obj_gameManager", event: "Draw GUI", file: "Draw_64.gml", code: managerDrawGui, concept: "Interface", explain: "The score is drawn on the interface layer, above the game, at the top-left corner." },
];
