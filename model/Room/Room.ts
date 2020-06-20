import { WebSocket } from "https://deno.land/std/ws/mod.ts";
import {
  RoomInfo,
  RoomMember,
  RoomMemberDictionary,
  ROOM_MEMBER,
  ROOM_RESPONSE,
} from "./Room.d.ts";
import { GameMaster } from "../GameMaster/GameMaster.ts";
import { TURN_ACTION } from "../GameMaster/GameMaster.d.ts";

export class Room {
  private members: RoomMemberDictionary = {};
  private GM: GameMaster;
  constructor() {
    this.GM = new GameMaster();
  }

  private getRoomInfo(): RoomInfo {
    let users: string[] = [];
    for (let rid in this.members) {
      const member = this.members[rid];
      users.push(member.name);
    }
    const hasAtlas = users.includes(ROOM_MEMBER.ATLAS);
    const hasDragon = users.includes(ROOM_MEMBER.DRAGON);
    return {
      hasAtlas,
      hasDragon,
      gameState: this.GM.state,
      currentRound: this.GM.getCurrentRound(),
      narration: this.GM.getNarration(hasAtlas, hasDragon),
    };
  }

  private async broadcastRoom(): Promise<void> {
    const event = {
      type: ROOM_RESPONSE.ROOM,
      room: this.getRoomInfo(),
    };
    for (let rid in this.members) {
      const member = this.members[rid];
      if (member.socket.isClosed) {
        delete this.members[rid];
      } else {
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
    await socket.send(JSON.stringify(event));
  }

  async disconnect(rid: number): Promise<void> {
    const name = this.members[rid].name;
    delete this.members[rid];
    if (name === ROOM_MEMBER.ATLAS || name === ROOM_MEMBER.DRAGON) {
      this.GM.pauseGame();
      await this.broadcastRoom();
    }
  }

  async choose(rid: number, name: ROOM_MEMBER): Promise<void> {
    let room = this.getRoomInfo();
    if (
      name !== ROOM_MEMBER.GUEST &&
      !(name === ROOM_MEMBER.ATLAS && room.hasAtlas ||
        name === ROOM_MEMBER.DRAGON && room.hasDragon)
    ) {
      // give member the selected `name`
      const member = this.members[rid];
      member.name = name;
      const nameEvent = { type: ROOM_RESPONSE.NAME, name };
      await member.socket.send(JSON.stringify(nameEvent));

      // resume game if both Atlas and Dragon are present
      room = this.getRoomInfo();
      if (room.hasAtlas && room.hasDragon) {
        this.GM.resumeGame();
      }

      // broadcast room info to everyone
      await this.broadcastRoom();
    }
  }

  async initiate(rid: number): Promise<void> {
    const member = this.members[rid];
    if (
      member.name === ROOM_MEMBER.ATLAS || member.name === ROOM_MEMBER.DRAGON
    ) {
      if (this.GM.initiate(member.name)) {
        await this.broadcastRoom();
      }
    }
  }

  async handleTurnAction(
    rid: number,
    action: TURN_ACTION,
    data: any,
  ): Promise<void> {
    const agent = this.members[rid].name;
    if (
      agent === ROOM_MEMBER.ATLAS || agent === ROOM_MEMBER.DRAGON
    ) {
      let isValidAction = false;
      switch (action) {
        case TURN_ACTION.PASS: {
          isValidAction = this.GM.pass(agent);
          break;
        }
        case TURN_ACTION.CHIDE: {
          if (typeof data === "string") {
            const message: string = data;
            isValidAction = this.GM.chide(agent, message);
          }
          break;
        }
        case TURN_ACTION.SURRENDER: {
          isValidAction = this.GM.surrender(agent);
          break;
        }
      }
      if (isValidAction) {
        await this.broadcastRoom();
      }
    }
  }
}
