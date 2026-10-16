import type {BroDocTopic}   from './docs/topics.js';
import type {BroSetupStep}  from './generate/setup.js';
import type {BroJsonSchema} from './spec/schema.js';
import type {BroSpecIssues} from './spec/validate-spec.js';

/**
 * The part of the MCP that a paid module of the scope @table-bro-extended brings: the default export of the file named by the field
 * table-bro.mcp of its manifest. Without the module the free MCP does not know its fields.
 */
export interface BroMcpExtension {
  /** The npm package of the module, as @table-bro-extended/island-details. */
  package: string;
  /**
   * The fields of the config of the spec that the module adds, each with its check, which also sees the whole config;
   * the generator writes them as they are.
   */
  config?: Record<string, (value: unknown, path: string, issues: BroSpecIssues, config: Record<string, unknown>) => void>;
  /** The JSON Schema of these fields for the strict answer of the model on the site, as {"rowDetailsIsland": {...}}. */
  configSchema?: Record<string, BroJsonSchema>;
  /** The topics of the reference. */
  topics?: BroDocTopic[];
  /** The setup of a project for the module, added when a spec uses one of its fields. */
  setup?: BroSetupStep[];
}
