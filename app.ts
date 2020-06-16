import { createApp, serveStatic } from "https://servestjs.org/@v1.1.0/mod.ts";
import { isWebSocketCloseEvent } from "https://deno.land/std/ws/mod.ts";
import { Room } from "./model/Room.ts";
import { ROOM_REQUEST } from "./model/Room.d.ts";

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
      switch (message.type) {
        case ROOM_REQUEST.CHOOSE: {
          console.log(`[ws:room:${rid}] ${message.name} was chosen`);
          ROOM.choose(rid, message.name);
          break;
        }
      }
    } else if (isWebSocketCloseEvent(event)) {
      console.log(`[ws:room:${rid}] ${ROOM.members[rid].name} disconnected`);
      await ROOM.disconnect(rid);
    }
  }
});

app.listen({ port: 8000 });
