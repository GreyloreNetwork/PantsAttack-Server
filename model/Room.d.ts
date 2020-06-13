import { WebSocket } from "https://deno.land/std/ws/mod.ts";

export interface RoomInfo {
  name: string;
  users: string[];
}

export interface RoomMember {
  name: string;
  socket: WebSocket;
}

export interface RoomMemberDictionary {
  [rid: number]: RoomMember;
}

export const enum ROOM_EVENT_TYPE {
  JOIN = "Join",
  LEAVE = "Leave",
}

export interface RoomEventRequest {
  name: string;
}

export interface RoomEventResponse {
  type: ROOM_EVENT_TYPE;
  name: string;
  room: RoomInfo;
}
