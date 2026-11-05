// The project's GML (version 2.0, saved Nov 2), imported verbatim from the GameMaker files.
import managerCreate from "./gml/obj_gameManager.Create_0.gml?raw";
import managerStep from "./gml/obj_gameManager.Step_0.gml?raw";
import managerAlarm from "./gml/obj_gameManager.Alarm_0.gml?raw";
import managerKeyR from "./gml/obj_gameManager.KeyPress_82.gml?raw";
import managerDrawGui from "./gml/obj_gameManager.Draw_64.gml?raw";
import starCreate from "./gml/obj_star.Create_0.gml?raw";
import starStep from "./gml/obj_star.Step_0.gml?raw";
import starClick from "./gml/obj_star.Mouse_4.gml?raw";
import starGround from "./gml/obj_star.Collision_obj_ground.gml?raw";
import explosionEnd from "./gml/obj_explosion.Other_7.gml?raw";
import gameOverClick from "./gml/obj_gameOver.Mouse_4.gml?raw";

export type GmlEvent = {
  id: string;
  object: "obj_gameManager" | "obj_star" | "obj_explosion" | "obj_gameOver";
  event: string;
  file: string;
  code: string;
  /** What the event does, in plain English. */
  explain: string;
  concept: "Game loop" | "Spawning" | "Object behaviour" | "Input" | "Collision" | "Animation" | "Interface" | "Game over";
  /** Added or changed in version 2.0 (Nov 2). */
  v2?: "new" | "changed" | "off";
};

export const gmlEvents: GmlEvent[] = [
  { id: "manager-create", object: "obj_gameManager", event: "Create", file: "Create_0.gml", code: managerCreate, concept: "Game loop", v2: "changed", explain: "When the room starts, the random seed changes (so every game is different), the music starts if it is not already playing, and the score, lost stars, Game Over flag and wave are set." },
  { id: "manager-step", object: "obj_gameManager", event: "Step", file: "Step_0.gml", code: managerStep, concept: "Spawning", v2: "new", explain: "Every step it checks two things. When no star is left, it sends a wave with as many stars as the wave number, and the next wave is one bigger. When three stars have been lost, it shows Game Over, plays its sound and stops the music." },
  { id: "manager-alarm", object: "obj_gameManager", event: "Alarm 0", file: "Alarm_0.gml", code: managerAlarm, concept: "Spawning", v2: "off", explain: "In version 1 this timer created one star every 60 steps. In version 2.0 both lines are commented out: waves replaced the timer." },
  { id: "manager-key-r", object: "obj_gameManager", event: "Key Press R", file: "KeyPress_82.gml", code: managerKeyR, concept: "Game over", v2: "new", explain: "After Game Over, pressing R also restarts the room." },
  { id: "manager-gui", object: "obj_gameManager", event: "Draw GUI", file: "Draw_64.gml", code: managerDrawGui, concept: "Interface", v2: "changed", explain: "The wave and the score are drawn on the interface layer, above the game, at the top-left corner." },
  { id: "star-create", object: "obj_star", event: "Create", file: "Create_0.gml", code: starCreate, concept: "Object behaviour", explain: "Each new star points down, picks its own speed between 2.5 and 7.5 pixels per step, a light random colour, and a random angle." },
  { id: "star-step", object: "obj_star", event: "Step", file: "Step_0.gml", code: starStep, concept: "Game loop", explain: "Sixty times a second, every star turns one more degree." },
  { id: "star-click", object: "obj_star", event: "Left Pressed", file: "Mouse_4.gml", code: starClick, concept: "Input", v2: "changed", explain: "While the game is on, clicking a star plays a pop, removes the star, leaves an explosion in its place and adds one point. After Game Over, stars ignore clicks." },
  { id: "star-ground", object: "obj_star", event: "Collision with obj_ground", file: "Collision_obj_ground.gml", code: starGround, concept: "Collision", v2: "changed", explain: "If a star's box touches the ground's box, a sad whistle plays (only while the game is on), one star is counted as lost and the star disappears." },
  { id: "explosion-end", object: "obj_explosion", event: "Animation End", file: "Other_7.gml", code: explosionEnd, concept: "Animation", explain: "The explosion removes itself after its last frame." },
  { id: "gameover-click", object: "obj_gameOver", event: "Left Pressed", file: "Mouse_4.gml", code: gameOverClick, concept: "Game over", v2: "new", explain: "Clicking the Game Over sign restarts the room, so a new game begins." },
];
