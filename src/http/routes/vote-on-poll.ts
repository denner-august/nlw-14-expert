import z from "zod";
import { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import { prisma } from "../../lib/prisma";
import { redis } from "../../lib/redis";
import { voting } from "../../utils/voting-pub-sub";

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

    let { sessionID } = req.cookies;

    if (sessionID) {
      const userPreviousVoteOnPoll = await prisma.vote.findUnique({
        where: {
          sessionID_pollId: {
            sessionID,
            pollId,
          },
        },
      });

      if (
        userPreviousVoteOnPoll &&
        userPreviousVoteOnPoll.pollOptionId !== pollOptionId
      ) {
        await prisma.vote.delete({
          where: {
            id: userPreviousVoteOnPoll.id,
          },
        });

        const votes = await redis.zincrby(
          pollId,
          -1,
          userPreviousVoteOnPoll.pollOptionId
        );

        voting.publish(pollId, {
          pollOptionId: userPreviousVoteOnPoll.pollOptionId,
          votes: Number(votes),
        });
      } else if (userPreviousVoteOnPoll) {
        return res.status(400).send({ message: "você já votou nessa enquete" });
      }
    }

    if (!sessionID) {
      sessionID = randomUUID();

      res.setCookie("sessionID", sessionID, {
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        signed: true,
        httpOnly: true,
      });
    }

    await prisma.vote.create({
      data: {
        sessionID,
        pollOptionId,
        pollId,
      },
    });

    const votes = await redis.zincrby(pollId, 1, pollOptionId);

    voting.publish(pollId, {
      pollOptionId,
      votes: Number(votes),
    });

    return res.status(201).send({ sessionID });
  });
}
