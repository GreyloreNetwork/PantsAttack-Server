import { WebSocket } from "https://deno.land/std/ws/mod.ts";
import {
  RoomInfo,
  RoomMember,
  RoomMemberDictionary,
  ROOM_MEMBER,
  ROOM_RESPONSE,
} from "./Room.d.ts";

export class Room {
  public members: RoomMemberDictionary = {};
  constructor() {}

  private getRoomInfo(): RoomInfo {
    let users: string[] = [];
    for (let rid in this.members) {
      const member = this.members[rid];
      users.push(member.name);
    }
    return {
      hasAtlas: users.includes(ROOM_MEMBER.ATLAS),
      hasDragon: users.includes(ROOM_MEMBER.DRAGON),
    };
  }

  private async broadcastRoomToGuests(): Promise<void> {
    const event = {
      type: ROOM_RESPONSE.ROOM,
      room: this.getRoomInfo(),
    };
    for (let rid in this.members) {
      const member = this.members[rid];
      if (member.name === ROOM_MEMBER.GUEST) {
        await member.socket.send(JSON.stringify(event));
      }
    }
  }

  async connect(socket: WebSocket): Promise<void> {
    const member: RoomMember = { name: ROOM_MEMBER.GUEST, socket };
    this.members[socket.conn.rid] = member;
    const event = {
      type: ROOM_RESPONSE.ROOM,
      room: this.getRoomInfo(),
    };
    socket.send(JSON.stringify(event));
  }

  async choose(rid: number, name: ROOM_MEMBER): Promise<void> {
    const member = this.members[rid];
    const room = this.getRoomInfo();
    if (name === ROOM_MEMBER.GUEST) {
      console.error(
        `${member.name} attempted to change their name to ${ROOM_MEMBER.GUEST}.`,
      );
    } else if (
      name === ROOM_MEMBER.ATLAS && room.hasAtlas ||
      name === ROOM_MEMBER.DRAGON && room.hasDragon
    ) {
      console.error(`${name} is already taken.`);
    } else {
      member.name = name;
      const nameEvent = { type: ROOM_RESPONSE.NAME, name };
      await member.socket.send(JSON.stringify(nameEvent));
      if (name !== ROOM_MEMBER.OBSERVER) {
        await this.broadcastRoomToGuests();
      }
    }
  }

  async disconnect(rid: number): Promise<void> {
    const name = this.members[rid].name;
    delete this.members[rid];
    if (name === ROOM_MEMBER.ATLAS || name === ROOM_MEMBER.DRAGON) {
      await this.broadcastRoomToGuests();
    }
  }
}
