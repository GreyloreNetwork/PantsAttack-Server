import { ROOM_MEMBER } from "../Room/Room.d.ts";

export const enum GAME_STATE {
  WAIT = "Waiting for Players",
  PLAY = "Playing Game",
  DONE = "Game Over",
}

export interface Board {
  [ROOM_MEMBER.ATLAS]: Location;
  [ROOM_MEMBER.DRAGON]: Location;
}

export interface Round {
  number: number;
  initiative: null | ROOM_MEMBER.ATLAS | ROOM_MEMBER.DRAGON;
  turns: Turn[];
}

export interface Turn {
  number: number;
  agent: ROOM_MEMBER.ATLAS | ROOM_MEMBER.DRAGON;
  action: TURN_ACTION | null;
  data: null | string | Movement;
}

export const enum TURN_ACTION {
  SURRENDER = "Surrender",
  PASS = "Pass",
  CHIDE = "Chide",
  MOVE = "Move",
}

export interface Movement {
  from: Location;
  to: Location;
}

export interface Location {
  x: number;
  y: number;
  z: number;
}
