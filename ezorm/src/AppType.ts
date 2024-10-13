import DbType from "./DbType";

export default abstract class AppType<MapToClass extends DbType>
{
    protected abstract readonly value : MapToClass;

    /**
     * Map current type to it's Data Base type (MapToClass).
     */
    abstract map() : MapToClass;
}