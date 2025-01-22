export interface Vector2D {
    dx : number;
    dy : number;
    magnitude : number;
    angle : number
    add(other : Vector2D) : Vector2D;
    dot(other : Vector2D) : number
    scale(amt : number) : Vector2D;
}