import { GAME_STATE, Round, Turn, TURN_ACTION } from "./GameMaster.d.ts";
import { ROOM_MEMBER } from "../Room/Room.d.ts";

export class GameMaster {
  private rounds: Round[] = [];
  state: GAME_STATE = GAME_STATE.WAIT;
  constructor() {}

  private narateTurn(turn: Turn): string {
    switch (turn.action) {
      case TURN_ACTION.PASS: {
        return `${turn.agent} Passed their Turn`;
      }
      case TURN_ACTION.SURRENDER: {
        return `${turn.agent} Surrendered the Game`;
      }
      case TURN_ACTION.CHIDE: {
        const insult: string = turn.data;
        return `${turn.agent} Chided: "${insult}"`;
      }
    }
    return "TURN ERROR";
  }

  private narateLastAction(round: Round): string {
    const turn = this.getCurrentTurn(round);
    if (turn === null) {
      const lastRound = this.rounds[round.number - 2];
      const lastTurn = lastRound.turns[1];
      return this.narateTurn(lastTurn);
    } else if (turn.number === 1) {
      return `${round.initiative} took initiative`;
    } else {
      return this.narateTurn(round.turns[0]);
    }
  }

  getNarration(hasAtlas: boolean, hasDragon: boolean): string {
    switch (this.state) {
      case GAME_STATE.WAIT: {
        if (!hasAtlas && !hasDragon) {
          return "Waiting for both players";
        } else if (!hasAtlas) {
          return "Waiting for Atlas";
        } else if (!hasDragon) {
          return "Waiting for Dragon";
        }
        break;
      }
      case GAME_STATE.PLAY: {
        const round = this.getCurrentRound();
        if (round !== null) {
          if (round.number === 1 && round.initiative === null) {
            return "Game Start!";
          } else {
            return this.narateLastAction(round);
          }
        }
        break;
      }
      case GAME_STATE.DONE: {
        const round = this.getCurrentRound();
        if (round === null) break;
        const turn = this.getCurrentTurn(round);
        if (turn === null) break;
        return this.narateTurn(turn);
      }
    }
    return "ERROR";
  }

  getCurrentRound(): Round | null {
    const roundNumber = this.rounds.length;
    return roundNumber > 0 ? this.rounds[roundNumber - 1] : null;
  }

  private getCurrentTurn(round: Round): Turn | null {
    const turnNumber = round.turns.length;
    return turnNumber > 0 ? round.turns[turnNumber - 1] : null;
  }

  private startGame(): void {
    const newRound: Round = {
      number: 1,
      initiative: null,
      turns: [],
    };
    this.rounds.push(newRound);
  }

  resumeGame(): void {
    this.state = GAME_STATE.PLAY;
    // If the game has not begun, start the game
    const round = this.getCurrentRound();
    if (round === null) {
      this.startGame();
    }
  }

  pauseGame(): void {
    if (this.state !== GAME_STATE.DONE) {
      this.state = GAME_STATE.WAIT;
    }
  }

  initiate(agent: ROOM_MEMBER.ATLAS | ROOM_MEMBER.DRAGON): boolean {
    // Check Round
    const round = this.getCurrentRound();
    if (round === null || round.initiative !== null) {
      return false;
    }
    // TURN_ACTION.INITIATE
    round.initiative = agent;
    const newTurn: Turn = {
      number: 1,
      agent,
      action: null,
    };
    round.turns.push(newTurn);
    return true;
  }

  private setupNextTurn(
    round: Round,
    turn: Turn,
    currentAgent: ROOM_MEMBER.ATLAS | ROOM_MEMBER.DRAGON,
  ): void {
    if (turn.number === 1) {
      const newTurn: Turn = {
        number: 2,
        agent: currentAgent === ROOM_MEMBER.ATLAS
          ? ROOM_MEMBER.DRAGON
          : ROOM_MEMBER.ATLAS,
        action: null,
      };
      round.turns.push(newTurn);
    } else {
      const newRound: Round = {
        number: round.number + 1,
        initiative: null,
        turns: [],
      };
      this.rounds.push(newRound);
    }
  }

  pass(agent: ROOM_MEMBER.ATLAS | ROOM_MEMBER.DRAGON): boolean {
    // Check Round
    const round = this.getCurrentRound();
    if (round === null) return false;
    // Check Turn
    const turn = this.getCurrentTurn(round);
    if (turn === null || turn.action !== null || turn.agent !== agent) {
      return false;
    }
    // TURN_ACTION.PASS
    turn.action = TURN_ACTION.PASS;
    this.setupNextTurn(round, turn, agent);
    return true;
  }

  chide(
    agent: ROOM_MEMBER.ATLAS | ROOM_MEMBER.DRAGON,
    message: string,
  ): boolean {
    // Check Round
    const round = this.getCurrentRound();
    if (round === null) return false;
    // Check Turn
    const turn = this.getCurrentTurn(round);
    if (turn === null || turn.action !== null || turn.agent !== agent) {
      return false;
    }
    // TURN_ACTION.CHIDE
    turn.action = TURN_ACTION.CHIDE;
    turn.data = message;
    this.setupNextTurn(round, turn, agent);
    return true;
  }

  surrender(agent: ROOM_MEMBER.ATLAS | ROOM_MEMBER.DRAGON): boolean {
    // Check Round
    const round = this.getCurrentRound();
    if (round === null) return false;
    // Check Turn
    const turn = this.getCurrentTurn(round);
    if (turn === null || turn.action !== null || turn.agent !== agent) {
      return false;
    }
    // TURN_ACTION.SURRENDER
    turn.action = TURN_ACTION.SURRENDER;
    this.state = GAME_STATE.DONE;
    return true;
  }
}
