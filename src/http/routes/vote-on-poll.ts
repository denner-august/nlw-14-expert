import z from "zod";
import { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";

export async function VoteOnPoll(app: FastifyInstance) {
  app.post("/polls/:pollId/votes", async (req, res) => {
    const voteOnBody = z.object({
      pollOptionId: z.string().uuid(),
    });

    const voteOnParams = z.object({
      pollId: z.string().uuid(),
    });

    const { pollId } = voteOnParams.parse(req.params);
    const { pollOptionId } = voteOnBody.parse(req.body);

    const sessionId = randomUUID();

    res.setCookie("sessionId", sessionId, {
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      signed: true,
      httpOnly: true,
    });

    return res.status(201).send();
  });
}
