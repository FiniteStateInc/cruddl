import { GraphQLSchema } from 'graphql';
import { OperationResolver } from '../execution/operation-resolver';
import { addOperationBasedResolvers } from '../graphql/operation-based-resolvers';
import { Model } from '../model';
import { SchemaTransformationContext } from '../schema/preparation/transformation-pipeline';
import { QueryNodeObjectTypeConverter } from './query-node-object-type';
import { RootTypesGenerator } from './root-types-generator';

export class SchemaGenerator {
    private readonly rootTypesGenerator = new RootTypesGenerator();
    private readonly queryNodeObjectTypeConverter = new QueryNodeObjectTypeConverter();
    private readonly operationResolver: OperationResolver;

    constructor(
        private context: SchemaTransformationContext
    ) {
        this.operationResolver = new OperationResolver(context);
    }

    generate(model: Model) {
        const { queryType, mutationType, dumbSchema } = this.generateTypesAndDumbSchema(model);
        return addOperationBasedResolvers(dumbSchema, async op => {
            const rootType = op.operation.operation === 'mutation' ? mutationType : queryType;
            const res = await this.operationResolver.resolveOperation(op, rootType);
            if (res.errors) {
                throw res.errors[0];
            }
            if (this.context.profileConsumer && res.profile) {
                this.context.profileConsumer(res.profile);
            }
            return res.data;
        });
    }

    generateTypesAndDumbSchema(model: Model) {
        const queryType = this.rootTypesGenerator.generateQueryType(model);
        const mutationType = this.rootTypesGenerator.generateMutationType(model);
        const dumbSchema = new GraphQLSchema({
            query: this.queryNodeObjectTypeConverter.convertToGraphQLObjectType(queryType),
            mutation: this.queryNodeObjectTypeConverter.convertToGraphQLObjectType(mutationType)
        });
        return {
            queryType, mutationType, dumbSchema
        };
    }

}
