import DbType from "../DbType";

export abstract class Numeric implements DbType
{
    // Attributes
    protected readonly bits : number;

    private value : number;

    // Constructors
    constructor(value : number, bits : number){

        this.bits = bits;
        this.setValue(value);
    }

    // Getters
    public getValue() : number
    {
        return this.value;
    }

    // Setters
    public setValue(value : number) : void 
    {
        // Check that value has less bytes than the specified size for the subclass
        const bits = Numeric.getBitLength(value);
        if(bits > this.bits)
        {
            throw new Error(`Value ${value} is ${bits} bits long, which is more than the specified limit ${this.bits}`);
        }
        
        this.value = value;
    }

    // Methods
    public toType<T extends Numeric>(type : new () => T) : T
    {
        return new type();
    }

    private static getBitLength(value : number) : number
    {
        let bits = 0;

        // Convert to positive
        value = Math.abs(value);

        // Check if any bits are left
        while(value > 0){

            // Extract one bit
            value >>= 1;

            // Store bit count
            bits++;
        }

        return bits;
    }
}

export abstract class Integer extends Numeric
{
    // Attributes
    private signed : boolean;

    // Constructores
    constructor(bits : number, value? : number, signed? : boolean)
    {
        super(bits, value ?? 0);

        this.signed = signed ?? true;
    }

    // Getters

    // Setters
    public setValue(value : number) : void 
    {
        // Check that the value is positive if it's unsigned
        if(!this.signed && value < 0){
            throw new Error(`Cannot assign value ${value} to an unsigned Integer`);
        }

        super.setValue(value);
    }

    // Methods
}

export class BIT extends Integer
{
    // Attributes
    private static readonly BITS : number = 1;

    // Constructors
    constructor(value? : number | boolean)
    {
        super(BIT.BITS, Number(value), false);
    }

    // Getters

    // Setters

    // Methods
    public inverse()
    {
        const value = this.getValue();
        if(value == 0)
        {
            this.setValue(1);
        }
        else
        {
            this.setValue(0);
        }
    }
}

export class TINYINT extends Integer
{
    // Attributes
    private static readonly BITS : number = 1 * 8;

    // Constructors
    constructor(value? : number, signed? : boolean)
    {
        super(TINYINT.BITS, value, signed);
    }

    // Getters

    // Setters

    // Methods
}

export class SMALLINT extends Integer
{
    // Attributes
    private static readonly BITS : number = 2 * 8;

    // Constructors
    constructor(value? : number, signed? : boolean)
    {
        super(SMALLINT.BITS, value, signed);
    }

    // Getters

    // Setters

    // Methods
}

export class MEDIUMINT extends Integer
{
    // Attributes
    private static readonly BITS : number = 3 * 8;

    // Constructors
    constructor(value? : number, signed? : boolean)
    {
        super(MEDIUMINT.BITS, value, signed);
    }

    // Getters

    // Setters

    // Methods
}

export class INT extends Integer
{

    // Attributes
    private static readonly BITS : number = 4 * 8;

    // Constructors
    constructor(value? : number, signed? : boolean)
    {
        super(INT.BITS, value, signed);
    }

    // Getters

    // Setters

    // Methods
}

export class BIGINT extends Integer
{
    // Attributes
    private static readonly BITS : number = 8 * 8;

    // Constructors
    constructor(value? : number, signed? : boolean)
    {
        super(BIGINT.BITS, value, signed);
    }

    // Getters

    // Setters

    // Methods
}

export class Real extends Numeric
{
    // Attributes

    // Constructores
    constructor(bits : number, value? : number)
    {
        super(bits, value ?? 0.0);
    }

    // Getters

    // Setters

    // Methods
}

export class FLOAT extends Real
{
    // Attributes
    private static readonly BITS : number = 4 * 8;

    // Constructors
    constructor(value? : number)
    {
        super(value ?? 0, FLOAT.BITS);
    }

    // Getters

    // Setters

    // Methods
}

export class DOUBLE extends Real
{
    // Attributes
    private static readonly BITS : number = 8 * 8;

    // Constructors
    constructor(value? : number)
    {
        super(value ?? 0, DOUBLE.BITS);
    }

    // Getters

    // Setters

    // Methods
}

/* NOT IMPLEMENTED YET
export class DECIMAL extends Real
{
    // Attributes
    private readonly total_digits : number;
    private readonly float_digits : number;

    // Constructors
    constructor(total_digits : number, float_digits : number, value? : number)
    {
        super(DECIMAL.getDigitsBits(total_digits), value);
        this.total_digits = total_digits;
        this.float_digits = float_digits;
    }

    // Getters

    // Setters
    public setValue(value: number): void 
    {

        // Check that value is valid for this DECIMAL

        super.setValue(value);
    }

    // Methods
    private static getDigitsBits(digits : number) : number
    {
        const log2of10 = Math.log2(10);
        return Math.ceil(digits * log2of10);
    }
}
*/