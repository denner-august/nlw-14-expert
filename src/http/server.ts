import fastify from "fastify";
import cookie from "@fastify/cookie";

import { createPoll } from "./routes/create-poll";
import { getPoll } from "./routes/get-poll";
import { VoteOnPoll } from "./routes/vote-on-poll";

//GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS

const app = fastify();

app.register(cookie, {
  secret: "4539dbeb-e377-419a-93f9-ebb067b9ac0d",
  hook: "onRequest",
});

app.register(createPoll);
app.register(getPoll);
app.register(VoteOnPoll);

//cria enquete

app.listen({ port: 3333 }).then(() => {
  console.log("server rodando http");
});
