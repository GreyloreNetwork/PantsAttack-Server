import { WebSocket } from "https://deno.land/std/ws/mod.ts";
import {
  RoomInfo,
  RoomMember,
  RoomMemberDictionary,
  ROOM_EVENT_TYPE,
  RoomEventResponse,
} from "./Room.d.ts";

export class Room {
  public members: RoomMemberDictionary = {};
  public name: string;
  constructor(name: string) {
    this.name = name;
  }

  getRoomInfo(): RoomInfo {
    let users: string[] = [];
    for (let rid in this.members) {
      const member = this.members[rid];
      users.push(member.name);
    }
    return {
      name: this.name,
      users: users.sort(),
    };
  }

  private async broadcast(event: RoomEventResponse): Promise<void> {
    for (let rid in this.members) {
      const member = this.members[rid];
      await member.socket.send(JSON.stringify(event));
    }
  }

  async join(name: string, socket: WebSocket): Promise<void> {
    const member: RoomMember = { name, socket };
    this.members[socket.conn.rid] = member;
    const event: RoomEventResponse = {
      type: ROOM_EVENT_TYPE.JOIN,
      name,
      room: this.getRoomInfo(),
    };
    await this.broadcast(event);
  }

  async leave(rid: number): Promise<void> {
    const name = this.members[rid].name;
    delete this.members[rid];
    const event: RoomEventResponse = {
      type: ROOM_EVENT_TYPE.LEAVE,
      name,
      room: this.getRoomInfo(),
    };
    await this.broadcast(event);
  }
}
