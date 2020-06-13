import { createApp, serveStatic } from "https://servestjs.org/@v1.1.0/mod.ts";
import { isWebSocketCloseEvent } from "https://deno.land/std/ws/mod.ts";
import { Room } from "./model/Room.ts";
import { RoomEventRequest } from "./model/Room.d.ts";

const ROOM = new Room("The Room");

const app = createApp();

// This project serves the output of sibling Vue project PantsAttack-UI
app.use(serveStatic("../PantsAttack-UI/dist"));

app.ws("/room", async (sock) => {
  const rid = sock.conn.rid;
  console.log(`[ws:room:${rid}] connection`);
  for await (const event of sock) {
    if (typeof event === "string") {
      const roomEvent: RoomEventRequest = JSON.parse(event);
      console.log(`[ws:room:${rid}] ${roomEvent.name} joined ${ROOM.name}`);
      await ROOM.join(roomEvent.name, sock);
    } else if (isWebSocketCloseEvent(event)) {
      console.log(
        `[ws:room:${rid}] ${ROOM.members[rid].name} left ${ROOM.name}`,
      );
      await ROOM.leave(rid);
    }
  }
});

app.listen({ port: 8000 });
