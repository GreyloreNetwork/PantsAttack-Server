import { createApp, serveStatic } from "https://servestjs.org/@v1.1.0/mod.ts";
import { isWebSocketCloseEvent } from "https://deno.land/std/ws/mod.ts";
import { Room } from "./model/Room/Room.ts";
import { ROOM_REQUEST } from "./model/Room/Room.d.ts";
import { TURN_ACTION } from "./model/GameMaster/GameMaster.d.ts";

const ROOM = new Room();

const app = createApp();

// This project serves the output of sibling Vue project PantsAttack-UI
app.use(serveStatic("../PantsAttack-UI/dist"));

app.ws("/room", async (sock) => {
  const rid = sock.conn.rid;
  console.log(`[ws:room:${rid}] connection`);
  ROOM.connect(sock);
  for await (const event of sock) {
    if (typeof event === "string") {
      const message: any = JSON.parse(event);
      console.log(`[ws:room:${rid}] ${message.type}`);
      switch (message.type) {
        case ROOM_REQUEST.CHOOSE: {
          await ROOM.choose(rid, message.name);
          break;
        }
        case ROOM_REQUEST.INITIATE: {
          await ROOM.initiate(rid);
          break;
        }
        default: {
          const action: TURN_ACTION = message.type;
          await ROOM.handleTurnAction(rid, action, message.data);
        }
      }
    } else if (isWebSocketCloseEvent(event)) {
      console.log(`[ws:room:${rid}] disconnected`);
      await ROOM.disconnect(rid);
    }
  }
});

app.listen({ port: 8000 });
