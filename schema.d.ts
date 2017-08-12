type schemaArray = SchemaObject[];
type nonNegativeInteger = number;
type nonNegativeIntegerDefault0 = nonNegativeInteger;
type simpleTypes = "array"|"boolean"|"integer"|"null"|"number"|"object"|"string";
type stringArray = string[];
type SchemaObject = {
    readonly $id?: string;
    readonly $schema?: string;
    readonly $ref?: string;
    readonly title?: string;
    readonly description?: string;
    readonly default?: {};
    readonly multipleOf?: {};
    readonly maximum?: {};
    readonly exclusiveMaximum?: {};
    readonly minimum?: {};
    readonly exclusiveMinimum?: {};
    readonly maxLength?: nonNegativeInteger;
    readonly minLength?: nonNegativeIntegerDefault0;
    readonly pattern?: string;
    readonly additionalItems?: SchemaObject;
    readonly items?: SchemaObject|schemaArray;
    readonly maxItems?: nonNegativeInteger;
    readonly minItems?: nonNegativeIntegerDefault0;
    readonly uniqueItems?: boolean;
    readonly contains?: SchemaObject;
    readonly maxProperties?: nonNegativeInteger;
    readonly minProperties?: nonNegativeIntegerDefault0;
    readonly required?: stringArray;
    readonly additionalProperties?: SchemaObject;
    readonly definitions?: {
        readonly [_:string]: SchemaObject;
    };
    readonly properties?: {
        readonly [_:string]: SchemaObject;
    };
    readonly patternProperties?: {
        readonly [_:string]: SchemaObject;
    };
    readonly dependencies?: {
        readonly [_:string]: SchemaObject|stringArray;
    };
    readonly propertyNames?: SchemaObject;
    readonly const?: {};
    readonly enum?: any[];
    readonly type?: simpleTypes|simpleTypes[];
    readonly format?: string;
    readonly allOf?: schemaArray;
    readonly anyOf?: schemaArray;
    readonly oneOf?: schemaArray;
    readonly not?: SchemaObject;
};
