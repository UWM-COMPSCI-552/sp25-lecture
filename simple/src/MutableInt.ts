export class MutableInt {
    private value : number;
    constructor(initial = 0) {
        this.value = initial;
    }

    get() : number {
        return this.value;
    }

    set(newValue : number) {
        this.value = newValue;
    }
}
