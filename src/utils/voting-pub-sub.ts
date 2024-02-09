type Message = { pollOptionId: string; votes: number };
type Subscriber = (message: Message) => void;

class VotingPuSub {
  private channels: Record<string, Subscriber[]> = {};

  subscriber(pollid: string, subscriber: Subscriber) {
    if (!this.channels[pollid]) {
      this.channels[pollid] = [];
    }

    this.channels[pollid].push(subscriber);
  }

  publish(pollId: string, message: Message) {
    if (!this.channels[pollId]) {
      return;
    }

    for (const subscriber of this.channels[pollId]) {
      subscriber(message);
    }
  }
}

export const voting = new VotingPuSub();
