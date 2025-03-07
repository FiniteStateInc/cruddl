import { ID_FIELD } from '../../schema/constants';
import { ValidationContext, ValidationMessage } from '../validation';
import { Field, SystemFieldConfig } from './field';
import { ObjectTypeBase } from './object-type-base';
import { ChildEntityTypeConfig, FieldConfig, TypeKind } from '../config';
import { Model } from './model';

export class ChildEntityType extends ObjectTypeBase {
    constructor(input: ChildEntityTypeConfig, model: Model) {
        super(input, model, systemFieldInputs);
    }

    /**
     * Gets a field that is guaranteed to be unique, to be used for absolute order
     */
    get discriminatorField(): Field {
        return this.getFieldOrThrow(ID_FIELD);
    }

    readonly kind: TypeKind.CHILD_ENTITY = TypeKind.CHILD_ENTITY;
    readonly isChildEntityType: true = true;
    readonly isRootEntityType: false = false;
    readonly isEntityExtensionType: false = false;
    readonly isValueObjectType: false = false;

    validate(context: ValidationContext) {
        super.validate(context);

        if (
            this.fields.length &&
            this.fields.every((f) => f.isSystemField || f.isRootField || f.isParentField)
        ) {
            context.addMessage(
                ValidationMessage.error(
                    `There need to be fields other than parent and root fields in a child entity type.`,
                    this.nameASTNode,
                ),
            );
        }
    }
}

const systemFieldInputs: ReadonlyArray<SystemFieldConfig> = [
    {
        name: 'id',
        typeName: 'ID',
        isNonNull: true,
        description:
            'An auto-generated string that identifies this child entity uniquely within this collection of child entities',
        isFlexSearchIndexed: true,
        isFlexSearchFulltextIndexed: false,
        isIncludedInSearch: false,
    },
    {
        name: 'createdAt',
        typeName: 'DateTime',
        isNonNull: true,
        description: 'The instant this object has been created',
        isFlexSearchIndexed: true,
        isFlexSearchFulltextIndexed: false,
        isIncludedInSearch: false,
    },
    {
        name: 'updatedAt',
        typeName: 'DateTime',
        isNonNull: true,
        description: 'The instant this object has been updated the last time',
        isFlexSearchIndexed: true,
        isFlexSearchFulltextIndexed: false,
        isIncludedInSearch: false,
    },
];
