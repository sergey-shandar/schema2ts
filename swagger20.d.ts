export type Info = {
    readonly title: string
    readonly version: string
    readonly description?: string
    readonly termsOfService?: string
    readonly contact?: Contact
    readonly license?: License
    readonly [_:string]: VendorExtension|string|Contact|License|undefined
}
export type Contact = {
    readonly name?: string
    readonly url?: string
    readonly email?: string
    readonly [_:string]: VendorExtension|string|undefined
}
export type License = {
    readonly name: string
    readonly url?: string
    readonly [_:string]: VendorExtension|string|undefined
}
export type Paths = {
    readonly [_:string]: VendorExtension|PathItem|undefined
}
export type Definitions = {
    readonly [_:string]: Schema|undefined
}
export type ParameterDefinitions = {
    readonly [_:string]: Parameter|undefined
}
export type ResponseDefinitions = {
    readonly [_:string]: Response|undefined
}
export type ExternalDocs = {
    readonly description?: string
    readonly url: string
    readonly [_:string]: VendorExtension|string|undefined
}
export type Examples = {
    readonly [_:string]: any
}
export type MimeType = string
export type Operation = {
    readonly tags?: string[]
    readonly summary?: string
    readonly description?: string
    readonly externalDocs?: ExternalDocs
    readonly operationId?: string
    readonly produces?: MediaTypeList
    readonly consumes?: MediaTypeList
    readonly parameters?: ParametersList
    readonly responses: Responses
    readonly schemes?: SchemesList
    readonly deprecated?: boolean
    readonly security?: Security
    readonly [_:string]: VendorExtension|string[]|string|ExternalDocs|MediaTypeList|ParametersList|Responses|SchemesList|boolean|Security|undefined
}
export type PathItem = {
    readonly $ref?: string
    readonly get?: Operation
    readonly put?: Operation
    readonly post?: Operation
    readonly delete?: Operation
    readonly options?: Operation
    readonly head?: Operation
    readonly patch?: Operation
    readonly parameters?: ParametersList
    readonly [_:string]: VendorExtension|string|Operation|ParametersList|undefined
}
export type Responses = {
    readonly [_:string]: ResponseValue|VendorExtension|undefined
}
export type ResponseValue = {
    readonly [_:string]: any
}
export type Response = {
    readonly description: string
    readonly schema?: {
        readonly [_:string]: any
    }
    readonly headers?: Headers
    readonly examples?: Examples
    readonly [_:string]: VendorExtension|string|{
        readonly [_:string]: any
    }|Headers|Examples|undefined
}
export type Headers = {
    readonly [_:string]: Header|undefined
}
export type Header = {
    readonly type: "string"|"number"|"integer"|"boolean"|"array"
    readonly format?: string
    readonly items?: PrimitivesItems
    readonly collectionFormat?: CollectionFormat
    readonly default?: Default
    readonly maximum?: Maximum
    readonly exclusiveMaximum?: ExclusiveMaximum
    readonly minimum?: Minimum
    readonly exclusiveMinimum?: ExclusiveMinimum
    readonly maxLength?: MaxLength
    readonly minLength?: MinLength
    readonly pattern?: Pattern
    readonly maxItems?: MaxItems
    readonly minItems?: MinItems
    readonly uniqueItems?: UniqueItems
    readonly enum?: Enum
    readonly multipleOf?: MultipleOf
    readonly description?: string
    readonly [_:string]: VendorExtension|"string"|"number"|"integer"|"boolean"|"array"|string|PrimitivesItems|CollectionFormat|Default|Maximum|ExclusiveMaximum|Minimum|ExclusiveMinimum|MaxLength|MinLength|Pattern|MaxItems|MinItems|UniqueItems|Enum|MultipleOf|undefined
}
export type VendorExtension = {
    readonly [_:string]: any
}
export type BodyParameter = {
    readonly description?: string
    readonly name: string
    readonly in: "body"
    readonly required?: boolean
    readonly schema: Schema
    readonly [_:string]: VendorExtension|string|"body"|boolean|Schema|undefined
}
export type HeaderParameterSubSchema = {
    readonly required?: boolean
    readonly in?: "header"
    readonly description?: string
    readonly name?: string
    readonly type?: "string"|"number"|"boolean"|"integer"|"array"
    readonly format?: string
    readonly items?: PrimitivesItems
    readonly collectionFormat?: CollectionFormat
    readonly default?: Default
    readonly maximum?: Maximum
    readonly exclusiveMaximum?: ExclusiveMaximum
    readonly minimum?: Minimum
    readonly exclusiveMinimum?: ExclusiveMinimum
    readonly maxLength?: MaxLength
    readonly minLength?: MinLength
    readonly pattern?: Pattern
    readonly maxItems?: MaxItems
    readonly minItems?: MinItems
    readonly uniqueItems?: UniqueItems
    readonly enum?: Enum
    readonly multipleOf?: MultipleOf
    readonly [_:string]: VendorExtension|boolean|"header"|string|"string"|"number"|"boolean"|"integer"|"array"|PrimitivesItems|CollectionFormat|Default|Maximum|ExclusiveMaximum|Minimum|ExclusiveMinimum|MaxLength|MinLength|Pattern|MaxItems|MinItems|UniqueItems|Enum|MultipleOf|undefined
}
export type QueryParameterSubSchema = {
    readonly required?: boolean
    readonly in?: "query"
    readonly description?: string
    readonly name?: string
    readonly allowEmptyValue?: boolean
    readonly type?: "string"|"number"|"boolean"|"integer"|"array"
    readonly format?: string
    readonly items?: PrimitivesItems
    readonly collectionFormat?: CollectionFormatWithMulti
    readonly default?: Default
    readonly maximum?: Maximum
    readonly exclusiveMaximum?: ExclusiveMaximum
    readonly minimum?: Minimum
    readonly exclusiveMinimum?: ExclusiveMinimum
    readonly maxLength?: MaxLength
    readonly minLength?: MinLength
    readonly pattern?: Pattern
    readonly maxItems?: MaxItems
    readonly minItems?: MinItems
    readonly uniqueItems?: UniqueItems
    readonly enum?: Enum
    readonly multipleOf?: MultipleOf
    readonly [_:string]: VendorExtension|boolean|"query"|string|"string"|"number"|"boolean"|"integer"|"array"|PrimitivesItems|CollectionFormatWithMulti|Default|Maximum|ExclusiveMaximum|Minimum|ExclusiveMinimum|MaxLength|MinLength|Pattern|MaxItems|MinItems|UniqueItems|Enum|MultipleOf|undefined
}
export type FormDataParameterSubSchema = {
    readonly required?: boolean
    readonly in?: "formData"
    readonly description?: string
    readonly name?: string
    readonly allowEmptyValue?: boolean
    readonly type?: "string"|"number"|"boolean"|"integer"|"array"|"file"
    readonly format?: string
    readonly items?: PrimitivesItems
    readonly collectionFormat?: CollectionFormatWithMulti
    readonly default?: Default
    readonly maximum?: Maximum
    readonly exclusiveMaximum?: ExclusiveMaximum
    readonly minimum?: Minimum
    readonly exclusiveMinimum?: ExclusiveMinimum
    readonly maxLength?: MaxLength
    readonly minLength?: MinLength
    readonly pattern?: Pattern
    readonly maxItems?: MaxItems
    readonly minItems?: MinItems
    readonly uniqueItems?: UniqueItems
    readonly enum?: Enum
    readonly multipleOf?: MultipleOf
    readonly [_:string]: VendorExtension|boolean|"formData"|string|"string"|"number"|"boolean"|"integer"|"array"|"file"|PrimitivesItems|CollectionFormatWithMulti|Default|Maximum|ExclusiveMaximum|Minimum|ExclusiveMinimum|MaxLength|MinLength|Pattern|MaxItems|MinItems|UniqueItems|Enum|MultipleOf|undefined
}
export type PathParameterSubSchema = {
    readonly required: "true"
    readonly in?: "path"
    readonly description?: string
    readonly name?: string
    readonly type?: "string"|"number"|"boolean"|"integer"|"array"
    readonly format?: string
    readonly items?: PrimitivesItems
    readonly collectionFormat?: CollectionFormat
    readonly default?: Default
    readonly maximum?: Maximum
    readonly exclusiveMaximum?: ExclusiveMaximum
    readonly minimum?: Minimum
    readonly exclusiveMinimum?: ExclusiveMinimum
    readonly maxLength?: MaxLength
    readonly minLength?: MinLength
    readonly pattern?: Pattern
    readonly maxItems?: MaxItems
    readonly minItems?: MinItems
    readonly uniqueItems?: UniqueItems
    readonly enum?: Enum
    readonly multipleOf?: MultipleOf
    readonly [_:string]: VendorExtension|"true"|"path"|string|"string"|"number"|"boolean"|"integer"|"array"|PrimitivesItems|CollectionFormat|Default|Maximum|ExclusiveMaximum|Minimum|ExclusiveMinimum|MaxLength|MinLength|Pattern|MaxItems|MinItems|UniqueItems|Enum|MultipleOf|undefined
}
export type NonBodyParameter = {
    readonly [_:string]: any
}
export type Parameter = {
    readonly [_:string]: any
}
export type Schema = {
    readonly $ref?: string
    readonly format?: string
    readonly title?: any
    readonly description?: any
    readonly default?: any
    readonly multipleOf?: any
    readonly maximum?: any
    readonly exclusiveMaximum?: any
    readonly minimum?: any
    readonly exclusiveMinimum?: any
    readonly maxLength?: any
    readonly minLength?: any
    readonly pattern?: any
    readonly maxItems?: any
    readonly minItems?: any
    readonly uniqueItems?: any
    readonly maxProperties?: any
    readonly minProperties?: any
    readonly required?: any
    readonly enum?: any
    readonly additionalProperties?: Schema|boolean
    readonly type?: any
    readonly items?: Schema|Schema[]
    readonly allOf?: Schema[]
    readonly properties?: {
        readonly [_:string]: Schema|undefined
    }
    readonly discriminator?: string
    readonly readOnly?: boolean
    readonly xml?: Xml
    readonly externalDocs?: ExternalDocs
    readonly example?: {
        readonly [_:string]: any
    }
    readonly [_:string]: any
}
export type FileSchema = {
    readonly format?: string
    readonly title?: any
    readonly description?: any
    readonly default?: any
    readonly required?: any
    readonly type: "file"
    readonly readOnly?: boolean
    readonly externalDocs?: ExternalDocs
    readonly example?: {
        readonly [_:string]: any
    }
    readonly [_:string]: any
}
export type PrimitivesItems = {
    readonly type?: "string"|"number"|"integer"|"boolean"|"array"
    readonly format?: string
    readonly items?: PrimitivesItems
    readonly collectionFormat?: CollectionFormat
    readonly default?: Default
    readonly maximum?: Maximum
    readonly exclusiveMaximum?: ExclusiveMaximum
    readonly minimum?: Minimum
    readonly exclusiveMinimum?: ExclusiveMinimum
    readonly maxLength?: MaxLength
    readonly minLength?: MinLength
    readonly pattern?: Pattern
    readonly maxItems?: MaxItems
    readonly minItems?: MinItems
    readonly uniqueItems?: UniqueItems
    readonly enum?: Enum
    readonly multipleOf?: MultipleOf
    readonly [_:string]: VendorExtension|"string"|"number"|"integer"|"boolean"|"array"|string|PrimitivesItems|CollectionFormat|Default|Maximum|ExclusiveMaximum|Minimum|ExclusiveMinimum|MaxLength|MinLength|Pattern|MaxItems|MinItems|UniqueItems|Enum|MultipleOf|undefined
}
export type Security = SecurityRequirement[]
export type SecurityRequirement = {
    readonly [_:string]: string[]|undefined
}
export type Xml = {
    readonly name?: string
    readonly namespace?: string
    readonly prefix?: string
    readonly attribute?: boolean
    readonly wrapped?: boolean
    readonly [_:string]: VendorExtension|string|boolean|undefined
}
export type Tag = {
    readonly name: string
    readonly description?: string
    readonly externalDocs?: ExternalDocs
    readonly [_:string]: VendorExtension|string|ExternalDocs|undefined
}
export type SecurityDefinitions = {
    readonly [_:string]: {
        readonly [_:string]: any
    }|undefined
}
export type BasicAuthenticationSecurity = {
    readonly type: "basic"
    readonly description?: string
    readonly [_:string]: VendorExtension|"basic"|string|undefined
}
export type ApiKeySecurity = {
    readonly type: "apiKey"
    readonly name: string
    readonly in: "header"|"query"
    readonly description?: string
    readonly [_:string]: VendorExtension|"apiKey"|string|"header"|"query"|undefined
}
export type Oauth2ImplicitSecurity = {
    readonly type: "oauth2"
    readonly flow: "implicit"
    readonly scopes?: Oauth2Scopes
    readonly authorizationUrl: string
    readonly description?: string
    readonly [_:string]: VendorExtension|"oauth2"|"implicit"|Oauth2Scopes|string|undefined
}
export type Oauth2PasswordSecurity = {
    readonly type: "oauth2"
    readonly flow: "password"
    readonly scopes?: Oauth2Scopes
    readonly tokenUrl: string
    readonly description?: string
    readonly [_:string]: VendorExtension|"oauth2"|"password"|Oauth2Scopes|string|undefined
}
export type Oauth2ApplicationSecurity = {
    readonly type: "oauth2"
    readonly flow: "application"
    readonly scopes?: Oauth2Scopes
    readonly tokenUrl: string
    readonly description?: string
    readonly [_:string]: VendorExtension|"oauth2"|"application"|Oauth2Scopes|string|undefined
}
export type Oauth2AccessCodeSecurity = {
    readonly type: "oauth2"
    readonly flow: "accessCode"
    readonly scopes?: Oauth2Scopes
    readonly authorizationUrl: string
    readonly tokenUrl: string
    readonly description?: string
    readonly [_:string]: VendorExtension|"oauth2"|"accessCode"|Oauth2Scopes|string|undefined
}
export type Oauth2Scopes = {
    readonly [_:string]: string|undefined
}
export type MediaTypeList = MimeType[]
export type ParametersList = {
    readonly [_:string]: any
}[]
export type SchemesList = ("http"|"https"|"ws"|"wss")[]
export type CollectionFormat = "csv"|"ssv"|"tsv"|"pipes"
export type CollectionFormatWithMulti = "csv"|"ssv"|"tsv"|"pipes"|"multi"
export type Title = any
export type Description = any
export type Default = any
export type MultipleOf = any
export type Maximum = any
export type ExclusiveMaximum = any
export type Minimum = any
export type ExclusiveMinimum = any
export type MaxLength = any
export type MinLength = any
export type Pattern = any
export type MaxItems = any
export type MinItems = any
export type UniqueItems = any
export type Enum = any
export type JsonReference = {
    readonly $ref: string
}
export type Swagger20 = {
    readonly swagger: "2.0"
    readonly info: Info
    readonly host?: string
    readonly basePath?: string
    readonly schemes?: SchemesList
    readonly consumes?: MediaTypeList
    readonly produces?: MediaTypeList
    readonly paths: Paths
    readonly definitions?: Definitions
    readonly parameters?: ParameterDefinitions
    readonly responses?: ResponseDefinitions
    readonly security?: Security
    readonly securityDefinitions?: SecurityDefinitions
    readonly tags?: Tag[]
    readonly externalDocs?: ExternalDocs
    readonly [_:string]: VendorExtension|"2.0"|Info|string|SchemesList|MediaTypeList|Paths|Definitions|ParameterDefinitions|ResponseDefinitions|Security|SecurityDefinitions|Tag[]|ExternalDocs|undefined
}
