import { WebSocket } from "https://deno.land/std/ws/mod.ts";
import { GAME_STATE, Round, Turn, Board } from "../GameMaster/GameMaster.d.ts";

export interface RoomInfo {
  hasAtlas: boolean;
  hasDragon: boolean;
  gameState: GAME_STATE;
  board: Board;
  currentRound: Round | null;
  narration: string;
  lastTurn: Turn | null;
}

export const enum ROOM_MEMBER {
  ATLAS = "Atlas",
  DRAGON = "Dragon",
  OBSERVER = "Observer",
  GUEST = "Guest",
}

export interface RoomMember {
  name: ROOM_MEMBER;
  socket: WebSocket;
}

export interface RoomMemberDictionary {
  [rid: number]: RoomMember;
}

export const enum ROOM_REQUEST {
  CHOOSE = "Choose",
  INITIATE = "Initiate",
}

export const enum ROOM_RESPONSE {
  ROOM = "Room",
  NAME = "Name",
}
