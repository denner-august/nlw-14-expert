import { redis } from "./../../lib/redis";
import z from "zod";
import { prisma } from "../../lib/prisma";
import { FastifyInstance } from "fastify";

export async function getPoll(app: FastifyInstance) {
  app.get("/polls/:pollid", async (req, res) => {
    const getPollParams = z.object({
      pollid: z.string().uuid(),
    });

    const { pollid } = getPollParams.parse(req.params);

    const poll = await prisma.poll.findUnique({
      where: {
        id: pollid,
      },

      include: {
        options: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!poll) {
      return res.status(400).send({ message: "não encontrado" });
    }

    const result = await redis.zrange(pollid, 0, -1, "WITHSCORES");

    const votes = result.reduce((prev, next, index) => {
      if (index % 2 === 0) {
        const score = result[index + 1];
        Object.assign(prev, { [next]: Number(score) });
      }

      return prev;
    }, {} as Record<string, number>);

    console.log(votes);

    return res.send({
      poll: {
        id: poll.id,
        title: poll.title,
        options: poll.options.map((option) => {
          return {
            id: option.id,
            title: option.title,
            score: option.id in votes ? votes[option.id] : 0,
          };
        }),
      },
    });
  });
}
