// Configuration exports for tree-shaking
export {
    defaultConfig,
    configSchema,
    validateConfig,
    mergeConfig,
    loadConfigFromJSON
} from './schema'

export type {
    ValidationResult,
    ValidationError
} from './schema'

export {
    deepMerge,
    mergeConfigurations,
    loadConfiguration,
    createConfigPreset,
    getConfigurationErrors,
    generateTypeDefinitions,
    configToCSSProperties,
    diffConfigurations
} from './utils'