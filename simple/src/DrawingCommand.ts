import { Shape } from "./Shape.js";
import { Drawing } from "./Drawing.js";

/**
 * A command interface for modifying a drawing.
 */
export interface Command {
    /**
     * Apply this command to the given drawing.
     * @param container the drawing to modify
     */
    apply(container : Drawing) : void;

    /**
     * Undo this command on the given drawing.
     * @param container the drawing to revert the modification
     */
    undo(container: Drawing) : void;
}

/**
 * A command to add a shape to the drawing.
 * This command is legal only if the shape is defined
 * and is not in the drawing already
 */
export class AddShapeCommand implements Command {
    private readonly shape : Shape;

    constructor(shape : Shape) {
        this.shape = shape;
    }

    apply(container : Drawing) {
        if (container.contains(this.shape)) throw new Error("cannot add again");
        container.add(this.shape);
    }

    undo(container : Drawing) {
        if (!container.contains(this.shape)) throw new Error("cannot remove if not present");
        container.remove(this.shape);
 
    }
}

export class MoveShapeCommand implements Command {
    private readonly shape : Shape;
    private readonly oldCenter : Point;
    private readonly amount : Vector2D;

    constructor (shape : Shape, oldCenter : Point, amount : Vector2D) {
        this.shape = shape;
        this.oldCenter = oldCenter;
        this.amount = amount;
    }

    public apply(container : Drawing) {
        const current : Point = this.shape.center;
        if (current.x !== this.oldCenter.x || current.y !== this.oldCenter.y) {
            throw new Error("invalid: center does not match (" + current.x + "," + current.y + ") != (" + this.oldCenter.x + "," + this.oldCenter.y + ")");
        }
        this.shape.move(this.amount);
    }

    public undo(container : Drawing) {
        const current : Point = this.shape.center;
        const newCenter = this.amount.move(this.oldCenter);
        if (current.x !== newCenter.x || current.y !== newCenter.y) {
            throw new Error("invalid: center does not match (" + current.x + "," + current.y + ") != (" + newCenter.x + "," + newCenter.y + ")");
        }
        this.shape.move(this.amount.scale(-1));
    }
}
/**
 * A command to change the terrain at a given hex coordinate.
 * The command is legal only if the terrain was previously mapped.
 */
export class ChangeTerrainCommand implements Command {
    private readonly coord: HexCoordinate;
    private readonly terrain: Terrain;
    private readonly oldTerrain: Terrain;

    constructor(coord: HexCoordinate, terrain: Terrain, oldTerrain: Terrain) {
        this.coord = coord;
        this.terrain = terrain;
        this.oldTerrain = oldTerrain;
    }

    apply(container: Drawing) : void {
        if (map.get(this.coord) !== this.oldTerrain) {
            throw new Error("Cannot change terrain: current terrain does not match old terrain");
        }
        map.set(this.coord, this.terrain);
    }

    undo(container: Drawing) : void {
        if (map.get(this.coord) !== this.terrain) {
            throw new Error("Cannot undo change terrain: current terrain does not match terrain");
        }
        map.set(this.coord, this.oldTerrain);
    }
}


/** A command that has the oppostie effect of another command. */
export class UndoCommand implements Command {
    private readonly command:Command;
    constructor(c:Command) {
        this.command = c;
    }

    apply(container: Drawing) : void {
        this.command.undo(map);
    }
    undo(container: Drawing) : void {
        this.command.apply(map);
    }

    /**
     * Return the command that his command undoes.
     * @returns the command that this undo command is undoing
     */
    public getCommand() : Command {
        return this.command;
    }
}

/**
 * A sequence of commands to be done in order.
 */
export class CompoundCommand implements Command {
    private commands: Command[];
    constructor(commands: Command[] = []) {
        this.commands = [...commands];
    }

    public apply(container: Drawing) : void {
        let i = 0;
        try {
            while (i < this.commands.length) {
                const cmd = this.commands[i];
                cmd.apply(map);
                ++i;
            }
        } catch (e) {
            // if an error occurs, undo all commands that were applied
            for (let j = i - 1; j >= 0; --j) {
                const cmd = this.commands[j];
                cmd.undo(map);
            }
            throw e; // rethrow the original error
        }
    }

    public undo(map : TerrainMap) : void {
        let i=0;
        try {
            for (i = this.commands.length - 1; i >= 0; --i) {
                const cmd = this.commands[i];
                cmd.undo(map);
            }   
        } catch (e) {
            // if an error occurs, reapply all commands that were undone
            for (let j = i + 1; j < this.commands.length; ++j) {
                const cmd = this.commands[j];
                cmd.apply(map);
            }
            throw e; // rethrow the original error
        }
    }

    /**
     * Return the commands making up this compound command 
     * @returns the commands in this compound command
     */
    public getCommands() : Command[] {
        return [...this.commands];
    }
}
// #)
// TODO: Command classes

// #(# \subsection{Command factory functions}
/**
 * Create a command to do nothing.
 * @returns a command that does nothing
 */
export function nullCommand() : Command {
    return new CompoundCommand();
}

/**
 * Create a command to set the terrain at a given hex coordinate.
 * If the terrain was previously mapped, a ChangeTerrainCommand
 * will be created, otherwise an AssignTerrainCommand will be created.
 * @param coord the hex coordinate to set the terrain for
 * @param terrain the terrain that is to be set
 * @param oldTerrain the former value at that coordinate, if any
 * (if not provided, the command will be an AssignTerrainCommand)
 * @returns command to perform the change
 */
export function setTerrainCommand(coord: HexCoordinate, terrain: Terrain, oldTerrain?:Terrain) : Command {
    if (oldTerrain === undefined) {
        return new AssignTerrainCommand(coord, terrain);
    } else {
        return new ChangeTerrainCommand(coord, terrain, oldTerrain);
    }
}

/** A command to remove the terrain at a particular coordinate. */
export function removeTerrainCommand(coord: HexCoordinate, oldTerrain:Terrain) : Command {
    return new UndoCommand(new AssignTerrainCommand(coord, oldTerrain));
}

/**
 * Undo the given command.  This function
 * does not perform any command, just return a command to reverse
 * the effect of this command.
 * @param cmd the command to undo
 * @returns a command that does the opoosite of the given command
 */
export function undoCommand(cmd: Command) : Command {
    if (cmd instanceof UndoCommand) {
        return cmd.getCommand(); // undoing an undo is the original command
    } else {
        return new UndoCommand(cmd);
    }
}

/**
 * Concatenate the effects together of multiple commands
 * @param commands the commands to be executed in sequence
 * This function flattens any CompoundCommand in the list of commands
 * @returns a command to do everything in the list of commands in order
 */
export function sequenceCommand(commands: Command[]) : Command {
    const appended : Command[] = [];
    for (const cmd of commands) {
        if (cmd instanceof CompoundCommand) {
            appended.push(...cmd.getCommands());
        } else {
            appended.push(cmd);
        }
    }
    if (appended.length === 1) {
        return appended[0]; // no need for a compound command
    }
    return new CompoundCommand(appended);
}
// #)
// TODO: Command factory functions

// #(# \subsection{JSON serialization functions}
function hexCoordinateFromJSON(json : unknown) : HexCoordinate {
    if (typeof json !== 'object' || json === null) {
        throw new Error("Invalid command JSON");
    }
    const obj = json as {a:unknown, b:unknown, c?:unknown};
    if (typeof obj.a !== 'number' || typeof obj.b !== 'number') {   
        throw new Error("Invalid command JSON: coord must be a hex coordinate");
    }
    if (obj.c !== undefined && typeof obj.c !== 'number') {
        throw new Error("Invalid command JSON: coord must be a hex coordinate");
    }
    return new HexCoordinate(obj.a as number, obj.b as number);
}

function terrainFromJSON(json : unknown) : Terrain {
    if (typeof json !== 'number') {
        throw new Error("Invalid command JSON: terrain must be a number");
    }
    const t = json as number;
    if (t < 0) {
        throw new Error("Invalid command JSON: terrain out of range");
    }
    return t as Terrain;
}

/**
 * Take a JSON object and return the command object
 * that presumably was serialized to create it.
 * @param json the JSON object to parse
 * @returns a command object
 */
export function fromJSON(json : object) : Command {
    const obj = json as {commands : unknown, command: unknown, coord:unknown, terrain:unknown, oldTerrain?:unknown};

    if (obj.commands !== undefined) {
        if (!Array.isArray(obj.commands)) {
            throw new Error("Invalid command JSON: commands must be an array");
        }
        const commands = obj.commands.map((c) => fromJSON(c));
        const result = new CompoundCommand(commands);
        return result;
    }

    if (obj.command !== undefined) {
        if (typeof obj.command !== 'object' || obj.command === null) { 
            throw new Error("Invalid command JSON: command must be an object");
        }
        if (obj.coord !== undefined || obj.terrain !== undefined || obj.oldTerrain !== undefined) {
            throw new Error("Invalid command JSON");
        }
        return new UndoCommand(fromJSON(obj.command));
    }

    const hc = hexCoordinateFromJSON(obj.coord);
    if (obj.oldTerrain !== undefined) {
        const oldTerrain = terrainFromJSON(obj.oldTerrain);
        const terrain = terrainFromJSON(obj.terrain);
        return new ChangeTerrainCommand(hc, terrain, oldTerrain);
    }
    // no old terrain, so it must be a set command
    const terrain = terrainFromJSON(obj.terrain);
    return new AssignTerrainCommand(hc, terrain);
}
// #)
// TODO: add fromJSON function to convert a JSON back to a command

/**
 * The policy on what to do when there are undone commands
 * and a new command is added to the log.
 */
export enum LogUndoPolicy {
    /**
     * Reverse all undone commands 
     * (extra commands are added to the log) 
     * before adding the new command.
     */ 
    GNU,
    /**
     * Discard the undone commands and add the new command.
     */
    MICROSOFT,
}

/**
 * A log of commands to modify a TerrainMap.
 * This allows for undo and redo functionality.
 */
export class Log {
    // #( \subsection{Log properties}
    private target: TerrainMap;
    private policy: LogUndoPolicy;
    private commands: Command[] = [];
    private index: number = 0;
    private observers : ((log: Log) => void)[] = [];
    // #)
    // TODO: defined private fields

    /** Create a new empty log */
    public constructor(target: TerrainMap, policy: LogUndoPolicy = LogUndoPolicy.GNU) {
        // #(# \subsection{Log constructor}
        this.target = target;
        this.policy = policy;
        this.commands = [];
        this.index = 0;
        // #)
        // TODO
    }

    /**
     * Request that a function be called whenever the logs changes.
     * It is the responsibility of the observer to determine what has changed.
     * The observer will be called after the log has been modified.
     * @param observer a function to be called whenever the log changes
     * This function will be called with the current log as its only argument.
    */
    public addObserver(observer: (log: Log) => void) {
        // #(# \subsection{addObserver}
        this.observers.push(observer);
        // #)
        // TODO
    }

    /**
     * Remove an observer from ths log.
     * @param observer the function to remove from the list of observers
     * This function must be the same as the one passed to addObserver.
     * If the function is not found, it will be ignored.
     * @see addObserver
     */
    public removeObserver(observer: (log: Log) => void) {
        // #(# \subsection{removeObserver}
        this.observers = this.observers.filter(obs => obs !== observer);
        // #)
        // TODO
    }

    // #(# \subsection{notifyObservers}
    private notifyObservers() {
        for (const observer of this.observers) {
            observer(this);
        }
    }
    // #)
    // TODO: private method(s) as needed

    /** Start the log over at the current state. */
    public clear() {
        // #(# \subsection{clear}
        this.commands = [];
        this.index = 0;
        this.notifyObservers();
        // #)
        // TODO
    }
    
    /**
     * Get the number of commands in the log.
     */
    public get size() : number {
        // #(# \subsection{size}
        return this.commands.length;
        // #)
        // TODO
    }

    /** Return the version that the current state reflects.
     * Undoing will reduce the vresion to a previous version
     */
    public get version() : number {
        // #(# \subsection{version}
        return this.index;
        // #)
        // TODO
    }

    /**
     * Whether undo is possible at this time.
     * @returns whether there is a command that can be undoable.
     */
    public canUndo() : boolean {
        // #(# \subsection{canUndo}
        return this.index > 0;
        // #)
        // TODO
    }

    /**
     * Whether redo is possible at this time.
     * @returns whether there is a command that can be redone.
     */
    public canRedo() : boolean {
        // #(# \subsection{canRedo}
        return this.index < this.commands.length;
        // #)
        // TODO
    }

    /**
     * Add a command to the log that is assumed already done.
     * @param cmd the command to add
     */
    public log(cmd: Command) {
        // #(# \subsection{log}
        if (this.canRedo()) {
            if (this.policy === LogUndoPolicy.GNU) {
                // explicitly push all undone commands
                for (let i = this.commands.length; i > this.index; --i) {
                    const c = this.commands[i-1];
                    this.commands.push(new UndoCommand(c));
                }
                this.index = this.commands.length;
            }
            // discard undone commands
            this.commands.splice(this.index,this.commands.length);
        }
        this.commands.push(cmd);
        this.index = this.commands.length;
        this.notifyObservers();
        // #)
        // TODO
    }

    /**
     * Run a command and then log it.
     * @param cmd the command to add to the log
     */
    public add(cmd : Command) : void {
        // #(# \subsection{add}
        cmd.apply(this.target);
        this.log(cmd);
        // #)
        // TODO
    }

    /**
     * Undo the last command in the log, if possible.
     * This will revert the target to the state before the last command was applied.
     * @see canUndo
     */
    public undo() : void {
        // #(# \subsection{undo}
        if (this.canUndo()) {
            const cmd = this.commands[--this.index];
            cmd.undo(this.target);
            this.notifyObservers();
        }
        // #)
        // TODO
    }

    /**
     * Redo the last undone command in the log, if possible.
     * This will reapply the last command that was undone.
     * @see canRedo
     */
    public redo() : void {
        // #(# \subsection{redo}
        if (this.canRedo()) {
            const cmd = this.commands[this.index++];
            cmd.apply(this.target);
            this.notifyObservers();
        }
        // #)
        // TODO
    }
}

// TODO: put in own file

import { Socket } from 'socket.io-client';
import { ClientToServer, ServerToClient } from './network.js';
import { Vector2D } from "./Vector.js";
import { Point } from "./Point.js";

class ProxyLog {
    private sock : Socket<ServerToClient, ClientToServer>;
    private readonly drawing : TerrainMap;

    constructor (sock : Socket<ServerToClient, ClientToServer>) {
        this.sock = sock;
    }

    public add(com : Command) {
        this.sock.emit('request', com);
    }

    /**
     * Add a command to the log that is assumed already done.
     * @param cmd the command to add
     */
    public log(com : Command) {
        com.undo(this.drawing);
        this.add(com);
    }
}
