export type SchemaArray = Schema[];
export type NonNegativeInteger = number;
export type NonNegativeIntegerDefault0 = NonNegativeInteger;
export type SimpleTypes = "array"|"boolean"|"integer"|"null"|"number"|"object"|"string";
export type StringArray = string[];
export type SchemaObject = {
    readonly $id?: string;
    readonly $schema?: string;
    readonly $ref?: string;
    readonly title?: string;
    readonly description?: string;
    readonly default?: {
        readonly [_:string]: any|undefined;
    };
    readonly multipleOf?: number;
    readonly maximum?: number;
    readonly exclusiveMaximum?: number;
    readonly minimum?: number;
    readonly exclusiveMinimum?: number;
    readonly maxLength?: NonNegativeInteger;
    readonly minLength?: NonNegativeIntegerDefault0;
    readonly pattern?: string;
    readonly additionalItems?: Schema;
    readonly items?: Schema|SchemaArray;
    readonly maxItems?: NonNegativeInteger;
    readonly minItems?: NonNegativeIntegerDefault0;
    readonly uniqueItems?: boolean;
    readonly contains?: Schema;
    readonly maxProperties?: NonNegativeInteger;
    readonly minProperties?: NonNegativeIntegerDefault0;
    readonly required?: StringArray;
    readonly additionalProperties?: Schema;
    readonly definitions?: {
        readonly [_:string]: Schema|undefined;
    };
    readonly properties?: {
        readonly [_:string]: Schema|undefined;
    };
    readonly patternProperties?: {
        readonly [_:string]: Schema|undefined;
    };
    readonly dependencies?: {
        readonly [_:string]: Schema|StringArray|undefined;
    };
    readonly propertyNames?: Schema;
    readonly const?: {
        readonly [_:string]: any|undefined;
    };
    readonly enum?: any[];
    readonly type?: SimpleTypes|SimpleTypes[];
    readonly format?: string;
    readonly allOf?: SchemaArray;
    readonly anyOf?: SchemaArray;
    readonly oneOf?: SchemaArray;
    readonly not?: Schema;
    readonly [_:string]: any|string|{
        readonly [_:string]: any|undefined;
    }|number|NonNegativeInteger|NonNegativeIntegerDefault0|Schema|SchemaArray|boolean|StringArray|{
        readonly [_:string]: Schema|undefined;
    }|{
        readonly [_:string]: Schema|StringArray|undefined;
    }|any[]|SimpleTypes|SimpleTypes[]|undefined;
};
export type Schema = boolean|SchemaObject;
