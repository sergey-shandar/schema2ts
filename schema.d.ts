export type schemaArray = Schema[];
export type nonNegativeInteger = number;
export type nonNegativeIntegerDefault0 = nonNegativeInteger;
export type simpleTypes = "array"|"boolean"|"integer"|"null"|"number"|"object"|"string";
export type stringArray = string[];
export type SchemaObject = {
    readonly $id?: string;
    readonly $schema?: string;
    readonly $ref?: string;
    readonly title?: string;
    readonly description?: string;
    readonly default?: {};
    readonly multipleOf?: number;
    readonly maximum?: number;
    readonly exclusiveMaximum?: number;
    readonly minimum?: number;
    readonly exclusiveMinimum?: number;
    readonly maxLength?: nonNegativeInteger;
    readonly minLength?: nonNegativeIntegerDefault0;
    readonly pattern?: string;
    readonly additionalItems?: Schema;
    readonly items?: Schema|schemaArray;
    readonly maxItems?: nonNegativeInteger;
    readonly minItems?: nonNegativeIntegerDefault0;
    readonly uniqueItems?: boolean;
    readonly contains?: Schema;
    readonly maxProperties?: nonNegativeInteger;
    readonly minProperties?: nonNegativeIntegerDefault0;
    readonly required?: stringArray;
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
        readonly [_:string]: Schema|stringArray;
    };
    readonly propertyNames?: Schema;
    readonly const?: {};
    readonly enum?: any[];
    readonly type?: simpleTypes|simpleTypes[];
    readonly format?: string;
    readonly allOf?: schemaArray;
    readonly anyOf?: schemaArray;
    readonly oneOf?: schemaArray;
    readonly not?: Schema;
};
export type Schema = boolean|SchemaObject;
