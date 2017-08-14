export type Info = {
    readonly title: string
    readonly version: string
    readonly description?: string
    readonly termsOfService?: string
    readonly contact?: Contact
    readonly license?: License
    readonly x_ms_code_generation_settings?: XmsCodeGenerationSettings
    readonly [_:string]: VendorExtension|string|Contact|License|XmsCodeGenerationSettings|undefined
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
    readonly security?: any
    readonly x_ms_odata?: XmsOData
    readonly x_ms_pageable?: XmsPageable
    readonly x_ms_long_running_operation?: XmsLongRunningOperation
    readonly x_ms_request_id?: XmsRequestId
    readonly x_ms_examples?: XmsExamples
    readonly [_:string]: any
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
    readonly x_ms_enum?: XmsEnum
    readonly multipleOf?: MultipleOf
    readonly description?: string
    readonly [_:string]: VendorExtension|string|PrimitivesItems|CollectionFormat|Default|Maximum|ExclusiveMaximum|Minimum|ExclusiveMinimum|MaxLength|MinLength|Pattern|MaxItems|MinItems|UniqueItems|Enum|XmsEnum|MultipleOf|undefined
}
export type VendorExtension = {
    readonly [_:string]: any
}
export type BodyParameter = {
    readonly description?: string
    readonly name: string
    readonly in: "body"
    readonly required?: boolean
    readonly x_ms_parameter_grouping?: XmsParameterGrouping
    readonly x_ms_parameter_location?: XmsParameterLocation
    readonly x_ms_client_name?: string
    readonly schema: Schema
    readonly x_ms_client_flatten?: XmsClientFlatten
    readonly [_:string]: VendorExtension|string|boolean|XmsParameterGrouping|XmsParameterLocation|Schema|XmsClientFlatten|undefined
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
    readonly x_ms_enum?: XmsEnum
    readonly x_ms_parameter_grouping?: XmsParameterGrouping
    readonly x_ms_parameter_location?: XmsParameterLocation
    readonly x_ms_client_name?: string
    readonly x_ms_client_request_id?: XmsClientRequestId
    readonly multipleOf?: MultipleOf
    readonly [_:string]: VendorExtension|boolean|string|PrimitivesItems|CollectionFormat|Default|Maximum|ExclusiveMaximum|Minimum|ExclusiveMinimum|MaxLength|MinLength|Pattern|MaxItems|MinItems|UniqueItems|Enum|XmsEnum|XmsParameterGrouping|XmsParameterLocation|XmsClientRequestId|MultipleOf|undefined
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
    readonly x_ms_parameter_grouping?: XmsParameterGrouping
    readonly x_ms_parameter_location?: XmsParameterLocation
    readonly x_ms_client_name?: string
    readonly x_ms_enum?: XmsEnum
    readonly x_ms_skip_url_encoding?: XmsSkipUrlEncoding
    readonly multipleOf?: MultipleOf
    readonly [_:string]: VendorExtension|boolean|string|PrimitivesItems|CollectionFormatWithMulti|Default|Maximum|ExclusiveMaximum|Minimum|ExclusiveMinimum|MaxLength|MinLength|Pattern|MaxItems|MinItems|UniqueItems|Enum|XmsParameterGrouping|XmsParameterLocation|XmsEnum|XmsSkipUrlEncoding|MultipleOf|undefined
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
    readonly x_ms_parameter_grouping?: XmsParameterGrouping
    readonly x_ms_parameter_location?: XmsParameterLocation
    readonly x_ms_client_name?: string
    readonly x_ms_enum?: XmsEnum
    readonly multipleOf?: MultipleOf
    readonly [_:string]: VendorExtension|boolean|string|PrimitivesItems|CollectionFormatWithMulti|Default|Maximum|ExclusiveMaximum|Minimum|ExclusiveMinimum|MaxLength|MinLength|Pattern|MaxItems|MinItems|UniqueItems|Enum|XmsParameterGrouping|XmsParameterLocation|XmsEnum|MultipleOf|undefined
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
    readonly x_ms_parameter_grouping?: XmsParameterGrouping
    readonly x_ms_parameter_location?: XmsParameterLocation
    readonly x_ms_client_name?: string
    readonly x_ms_enum?: XmsEnum
    readonly multipleOf?: MultipleOf
    readonly x_ms_skip_url_encoding?: XmsSkipUrlEncoding
    readonly [_:string]: VendorExtension|string|PrimitivesItems|CollectionFormat|Default|Maximum|ExclusiveMaximum|Minimum|ExclusiveMinimum|MaxLength|MinLength|Pattern|MaxItems|MinItems|UniqueItems|Enum|XmsParameterGrouping|XmsParameterLocation|XmsEnum|MultipleOf|XmsSkipUrlEncoding|undefined
}
export type NonBodyParameter = {
    readonly [_:string]: any
}
export type Parameter = {
    readonly x_ms_client_flatten?: XmsClientFlatten
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
    readonly x_ms_enum?: XmsEnum
    readonly additionalProperties?: Schema|boolean
    readonly type?: any
    readonly items?: Schema|Schema[]
    readonly allOf?: Schema[]
    readonly properties?: {
        readonly [_:string]: Schema|undefined
    }
    readonly discriminator?: string
    readonly readOnly?: boolean
    readonly x_ms_discriminator_value?: XmsDiscriminatorValue
    readonly x_ms_azure_resource?: XmsAzureResource
    readonly x_ms_external?: XmsExternal
    readonly xml?: Xml
    readonly externalDocs?: ExternalDocs
    readonly example?: {
        readonly [_:string]: any
    }
    readonly x_ms_client_flatten?: XmsClientFlatten
    readonly x_ms_client_name?: string
    readonly x_ms_mutability?: XmsMutability
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
    readonly x_ms_enum?: XmsEnum
    readonly multipleOf?: MultipleOf
    readonly [_:string]: VendorExtension|string|PrimitivesItems|CollectionFormat|Default|Maximum|ExclusiveMaximum|Minimum|ExclusiveMinimum|MaxLength|MinLength|Pattern|MaxItems|MinItems|UniqueItems|Enum|XmsEnum|MultipleOf|undefined
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
export type XmsSkipUrlEncoding = boolean
export type XmsEnum = {
    readonly name: string
    readonly modelAsString?: boolean
}
export type XmsParameterGrouping = {
    readonly [_:string]: any
}
export type XmsPaths = Paths
export type XmsExternal = boolean
export type XmsDiscriminatorValue = string
export type XmsOData = string
export type XmsPageable = {
    readonly nextLinkName?: string|{
        readonly [_:string]: any
    }
    readonly itemName?: string|{
        readonly [_:string]: any
    }
    readonly operationName?: string|{
        readonly [_:string]: any
    }
}
export type XmsLongRunningOperation = boolean
export type XmsAzureResource = boolean
export type XmsRequestId = string
export type XmsClientRequestId = boolean
export type XmsCodeGenerationSettings = {
    readonly [_:string]: any
}
export type XmsHostParametersList = {
    readonly [_:string]: any
}[]
export type XmsParameterizedHost = {
    readonly hostTemplate?: string
    readonly useSchemePrefix?: boolean
    readonly positionInOperation?: string
    readonly parameters?: XmsHostParametersList
    readonly [_:string]: VendorExtension|string|boolean|XmsHostParametersList|undefined
}
export type XmsClientFlatten = boolean
export type XmsParameterLocation = "client"|"method"
export type XmsMutability = ("create"|"read"|"update")[]
export type XmsExamples = {
    readonly [_:string]: {
        readonly [_:string]: any
    }|undefined
}
export type Swagger_autorest = {
    readonly swagger: "2.0"
    readonly info: Info
    readonly host?: string
    readonly basePath?: string
    readonly schemes?: any
    readonly consumes?: any
    readonly produces?: any
    readonly paths: Paths
    readonly x_ms_paths?: XmsPaths
    readonly x_ms_parameterized_host?: XmsParameterizedHost
    readonly definitions?: Definitions
    readonly parameters?: ParameterDefinitions
    readonly responses?: ResponseDefinitions
    readonly security?: any
    readonly securityDefinitions?: any
    readonly tags?: Tag[]
    readonly externalDocs?: ExternalDocs
    readonly [_:string]: any
}
