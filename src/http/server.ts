import fastify from "fastify";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

//GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS

const app = fastify();

const prisma = new PrismaClient();

//cria enquete
app.post("/poll", async (req, res) => {
  const createPollBody = z.object({
    title: z.string(),
  });

  const { title } = createPollBody.parse(req.body);

  const poll = await prisma.poll.create({
    data: {
      title,
    },
  });

  return res.status(201).send({ pollId: poll.id });
});

app.get("/inicial", (req) => {
  return "rota post";
});

app.listen({ port: 3333 }).then(() => {
  console.log("server rodando http");
});
