import { ROOM_MEMBER } from "../Room/Room.d.ts";

export const enum GAME_STATE {
  WAIT = "Waiting for Players",
  PLAY = "Playing Game",
  DONE = "Game Over",
}

export interface Round {
  number: number;
  initiative: null | ROOM_MEMBER.ATLAS | ROOM_MEMBER.DRAGON;
  turns: Turn[];
}

export const enum TURN_ACTION {
  SURRENDER = "Surrender",
  PASS = "Pass",
  CHIDE = "Chide",
}

export interface Turn {
  number: number;
  agent: ROOM_MEMBER.ATLAS | ROOM_MEMBER.DRAGON;
  action: TURN_ACTION | null;
  data?: any;
}
