import DbType from "../DbType";

export abstract class DbString implements DbType
{
    // Attributes
    protected readonly chars : number;

    private value : string;

    // Constructors
    constructor(chars : number, value : string){

        this.chars = chars;
        this.setValue(value);
    }

    // Getters
    public getValue() : string
    {
        return this.value;
    }

    // Setters
    public setValue(value : string) : void 
    {
        // Check that the value has less or equal chars than specified as max
        if(value.length > this.chars){
            throw new Error(`Value ${value} is ${value.length} characters long, which is more than the specified limit ${this.chars}`);
        }
        
        this.value = value;
    }

    // Methods
    public toType<T extends DbString>(type : new () => T) : T
    {
        return new type();
    }
}

export class CHAR extends DbString
{
    // Attributes
    public static readonly MAX_CHARS : number = 255;

    // Constructor
    constructor(chars : number, value? : string)
    {
        super(chars, ''); // Start superclass with no value

        // Check that the number of chars is less than MAX_CHARS
        if(chars > CHAR.MAX_CHARS)
        {
            throw new Error(`CHAR type instance cannot have a length of ${chars} chars, limit is ${CHAR.MAX_CHARS} chars`)
        }

        this.setValue(value);
    }

    // Getters

    // Setters
    public setValue(value : string | undefined) : void 
    {
        // Check existance of value and pad result
        const newValue : string = (value ?? '').padEnd(this.chars);

        // Update value
        super.setValue(newValue);
    }

    // Methods
}

export class VARCHAR extends DbString
{
    // Attributes
    public static readonly MAX_CHARS : number = 65535;

    // Constructor
    constructor(chars : number, value? : string)
    {
        super(chars, ''); // Start superclass with no value

        // Check that the number of chars is less than MAX_CHARS
        if(chars > VARCHAR.MAX_CHARS)
        {
            throw new Error(`VARCHAR type instance cannot have a length of ${chars} chars, limit is ${VARCHAR.MAX_CHARS} chars`)
        }

        super.setValue(value ?? '');
    }

    // Getters

    // Setters

    // Methods
}

export class TEXT extends DbString
{
    // Attributes
    public static readonly CHARS : number = 65535;

    // Constructor
    constructor(value : string)
    {
        super(TEXT.CHARS, value);
    }

    // Getters

    // Setters

    // Methods
}

export class MEDIUMTEXT extends DbString
{
    // Attributes
    public static readonly CHARS : number = 16777215;

    // Constructor
    constructor(value : string)
    {
        super(MEDIUMTEXT.CHARS, value);
    }

    // Getters

    // Setters

    // Methods
}

export class LONGTEXT extends DbString
{
    // Attributes
    public static readonly CHARS : number = 4294967295;

    // Constructor
    constructor(value : string)
    {
        super(LONGTEXT.CHARS, value);
    }

    // Getters

    // Setters

    // Methods
}