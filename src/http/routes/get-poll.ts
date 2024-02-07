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

    return res.send({ poll });
  });
}
