import { WebSocket } from "https://deno.land/std/ws/mod.ts";

export interface RoomInfo {
  hasAtlas: boolean;
  hasDragon: boolean;
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
}

export const enum ROOM_RESPONSE {
  ROOM = "Room",
  NAME = "Name",
}
