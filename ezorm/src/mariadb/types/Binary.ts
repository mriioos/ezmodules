/* NOT IMPLEMENTED YET
export abstract class Binary
{
    // Attributes
    protected readonly size : number;

    private value : Uint8Array;

    // Constructors
    constructor(size : number, value : Uint8Array){

        this.size = size;
        this.setValue(value);
    }

    // Getters
    public getValue() : Uint8Array
    {
        return this.value;
    }

    // Setters
    public setValue(value : Uint8Array) : void 
    {
        // Check that the value has less or equal chars than specified as max
        if(value.length > this.size){
            throw new Error(`Value ${value} is ${value.length} characters long, which is more than the specified limit ${this.size}`);
        }
        
        this.value = value;
    }

    // Methods
    public toType<T extends Binary>(type : new () => T) : T
    {
        return new type();
    }
}

export class BLOB extends Binary
{
    // Attributes

    // Constructor

    // Getters

    // Setters

    // Methods
}

export class MEDIUMBLOB extends Binary
{
    // Attributes

    // Constructor

    // Getters

    // Setters

    // Methods
}

export class LONGBLOB extends Binary
{
    // Attributes

    // Constructor

    // Getters

    // Setters

    // Methods
}
*/