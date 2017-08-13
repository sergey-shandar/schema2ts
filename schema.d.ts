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
        readonly [_:string]: any;
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
        readonly [_:string]: Schema;
    };
    readonly properties?: {
        readonly [_:string]: Schema;
    };
    readonly patternProperties?: {
        readonly [_:string]: Schema;
    };
    readonly dependencies?: {
        readonly [_:string]: Schema|StringArray;
    };
    readonly propertyNames?: Schema;
    readonly const?: {
        readonly [_:string]: any;
    };
    readonly enum?: any[];
    readonly type?: SimpleTypes|SimpleTypes[];
    readonly format?: string;
    readonly allOf?: SchemaArray;
    readonly anyOf?: SchemaArray;
    readonly oneOf?: SchemaArray;
    readonly not?: Schema;
    readonly [_:string]: any;
};
export type Schema = boolean|SchemaObject;
