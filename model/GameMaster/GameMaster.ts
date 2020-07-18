import { GAME_STATE, Board, Round, Turn, TURN_ACTION, Movement } from "./GameMaster.d.ts";
import { ROOM_MEMBER } from "../Room/Room.d.ts";

export class GameMaster {
  private rounds: Round[] = [];
  state: GAME_STATE = GAME_STATE.WAIT;
  board: Board;
  constructor() {
    this.board = {
      [ROOM_MEMBER.ATLAS]: { x: -3, y: 0, z: 0 },
      [ROOM_MEMBER.DRAGON]: { x: 3, y: 0, z: 0 },
    };
  }

  private narateTurn(turn: Turn): string {
    switch (turn.action) {
      case TURN_ACTION.PASS: {
        return `${turn.agent} Passed their Turn`;
      }
      case TURN_ACTION.SURRENDER: {
        return `${turn.agent} Surrendered the Game`;
      }
      case TURN_ACTION.CHIDE: {
        const insult = turn.data as string;
        return `${turn.agent} Chided: "${insult}"`;
      }
      case TURN_ACTION.MOVE: {
        return `${turn.agent} Moved`;
      }
    }
    return "TURN ERROR";
  }

  private narateLastAction(round: Round): string {
    const turn = this.getCurrentTurn(round);
    if (round.number === 1 && turn !== null && turn.number === 1) {
      return `${round.initiative} took first initiative`;
    } else if (turn === null || turn.number === 1) {
      const lastRound = this.rounds[round.number - 2];
      const lastTurn = lastRound.turns[1];
      return this.narateTurn(lastTurn);
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

  getLastTurn(): Turn | null {
    const turns = this.rounds
      .map(round => round.turns)
      .reduce((list, turns) => {
        return [...list, ...turns];
      }, []);
    if (turns.length === 0) return null;
    const currentTurn = turns[turns.length - 1];
    if (currentTurn.action !== null) return currentTurn;
    else if (turns.length === 1) return null;
    else return turns[turns.length - 2];
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
      data: null
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
        data: null
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

  move(
    agent: ROOM_MEMBER.ATLAS | ROOM_MEMBER.DRAGON,
    move: Movement,
  ): boolean {
    // Check Round
    const round = this.getCurrentRound();
    if (round === null) return false;
    // Check Turn
    const turn = this.getCurrentTurn(round);
    if (turn === null || turn.action !== null || turn.agent !== agent) {
      return false;
    }
    // TODO: implement `isValidMove` function
    // TURN_ACTION.MOVE
    turn.action = TURN_ACTION.MOVE;
    turn.data = move;
    this.board[agent].x = move.to.x;
    this.board[agent].y = move.to.y;
    this.board[agent].z = move.to.z;
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
